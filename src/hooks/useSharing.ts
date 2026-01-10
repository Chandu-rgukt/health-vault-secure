import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSharedByMe, setSharedWithMe, addSharedReport, removeSharedReport, setLoading } from '@/store/slices/sharingSlice';
import { toast } from 'sonner';

export const useSharing = () => {
  const dispatch = useAppDispatch();
  const { sharedByMe, sharedWithMe, isLoading } = useAppSelector((state) => state.sharing);
  const { user } = useAppSelector((state) => state.auth);

  const fetchSharedByMe = useCallback(async () => {
    if (!user) return;
    
    dispatch(setLoading(true));
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch(setSharedByMe(data || []));
    } catch (error) {
      console.error('Error fetching shared reports:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user]);

  const fetchSharedWithMe = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select('*')
        .eq('shared_with_user_id', user.id);

      if (error) throw error;
      dispatch(setSharedWithMe(data || []));
    } catch (error) {
      console.error('Error fetching shared with me:', error);
    }
  }, [dispatch, user]);

  const shareReport = async (reportId: string, email: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Check if user exists
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      const { data, error } = await supabase
        .from('shared_reports')
        .insert({
          report_id: reportId,
          owner_id: user.id,
          shared_with_email: email,
          shared_with_user_id: profileData?.user_id || null,
          access_type: 'read',
        })
        .select()
        .single();

      if (error) throw error;

      dispatch(addSharedReport(data));
      toast.success(`Report shared with ${email}`);
      return { data };
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Failed to share report');
      return { error };
    }
  };

  const revokeAccess = async (shareId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shared_reports')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      dispatch(removeSharedReport(shareId));
      toast.success('Access revoked successfully');
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke access');
    }
  };

  return {
    sharedByMe,
    sharedWithMe,
    isLoading,
    fetchSharedByMe,
    fetchSharedWithMe,
    shareReport,
    revokeAccess,
  };
};
