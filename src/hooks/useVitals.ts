import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setVitals, addVital, removeVital, setLoading } from '@/store/slices/vitalsSlice';
import { toast } from 'sonner';

export const useVitals = () => {
  const dispatch = useAppDispatch();
  const { vitals, isLoading, selectedVitalType, dateRange } = useAppSelector((state) => state.vitals);
  const { user } = useAppSelector((state) => state.auth);

  const fetchVitals = useCallback(async () => {
    if (!user) return;
    
    dispatch(setLoading(true));
    try {
      let query = supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (selectedVitalType && selectedVitalType !== 'all') {
        query = query.eq('vital_type', selectedVitalType);
      }
      if (dateRange.startDate) {
        query = query.gte('recorded_at', dateRange.startDate);
      }
      if (dateRange.endDate) {
        query = query.lte('recorded_at', dateRange.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch(setVitals(data || []));
    } catch (error) {
      console.error('Error fetching vitals:', error);
      toast.error('Failed to fetch vitals');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user, selectedVitalType, dateRange]);

  const recordVital = async (
    vitalType: string,
    value: number,
    unit: string,
    recordedAt: string,
    notes?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('vitals')
        .insert({
          user_id: user.id,
          vital_type: vitalType,
          value,
          unit,
          recorded_at: recordedAt,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      dispatch(addVital(data));
      toast.success('Vital recorded successfully');
      return { data };
    } catch (error) {
      console.error('Error recording vital:', error);
      toast.error('Failed to record vital');
      return { error };
    }
  };

  const deleteVital = async (vitalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('vitals')
        .delete()
        .eq('id', vitalId);

      if (error) throw error;

      dispatch(removeVital(vitalId));
      toast.success('Vital deleted successfully');
    } catch (error) {
      console.error('Error deleting vital:', error);
      toast.error('Failed to delete vital');
    }
  };

  return {
    vitals,
    isLoading,
    selectedVitalType,
    dateRange,
    fetchVitals,
    recordVital,
    deleteVital,
  };
};
