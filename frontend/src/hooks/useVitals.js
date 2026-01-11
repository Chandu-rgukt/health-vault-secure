import { useCallback } from 'react';
import api from '@/lib/api';
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
      const params = {};
      if (selectedVitalType && selectedVitalType !== 'all') {
        params.vital_type = selectedVitalType;
      }
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      const response = await api.get('/vitals', { params });
      dispatch(setVitals(response.data.data || []));
    } catch (error) {
      console.error('Error fetching vitals:', error);
      toast.error('Failed to fetch vitals');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user, selectedVitalType, dateRange]);

  const recordVital = async (vitalType, value, unit, recordedAt, notes) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const response = await api.post('/vitals', {
        vital_type: vitalType,
        value,
        unit,
        recorded_at: recordedAt,
        notes,
      });

      dispatch(addVital(response.data.data));
      toast.success('Vital recorded successfully');
      return { data: response.data.data };
    } catch (error) {
      console.error('Error recording vital:', error);
      toast.error(error.response?.data?.error || 'Failed to record vital');
      return { error };
    }
  };

  const deleteVital = async (vitalId) => {
    if (!user) return;

    try {
      await api.delete(`/vitals/${vitalId}`);
      dispatch(removeVital(vitalId));
      toast.success('Vital deleted successfully');
    } catch (error) {
      console.error('Error deleting vital:', error);
      toast.error(error.response?.data?.error || 'Failed to delete vital');
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


