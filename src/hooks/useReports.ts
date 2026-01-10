import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setReports, setSharedReports, addReport, removeReport, setLoading } from '@/store/slices/reportsSlice';
import { toast } from 'sonner';

export const REPORT_TYPES = [
  'Blood Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'ECG',
  'Prescription',
  'Lab Report',
  'Vaccination',
  'Other',
] as const;

export const useReports = () => {
  const dispatch = useAppDispatch();
  const { reports, sharedReports, isLoading, filters } = useAppSelector((state) => state.reports);
  const { user } = useAppSelector((state) => state.auth);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    
    dispatch(setLoading(true));
    try {
      let query = supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false });

      if (filters.reportType && filters.reportType !== 'all') {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters.startDate) {
        query = query.gte('report_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('report_date', filters.endDate);
      }
      if (filters.searchQuery) {
        query = query.ilike('title', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      dispatch(setReports(data || []));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user, filters]);

  const fetchSharedReports = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: sharedData } = await supabase
        .from('shared_reports')
        .select('report_id')
        .eq('shared_with_user_id', user.id);

      if (sharedData && sharedData.length > 0) {
        const reportIds = sharedData.map(s => s.report_id);
        const { data: reports } = await supabase
          .from('health_reports')
          .select('*')
          .in('id', reportIds)
          .order('report_date', { ascending: false });

        dispatch(setSharedReports(reports || []));
      }
    } catch (error) {
      console.error('Error fetching shared reports:', error);
    }
  }, [dispatch, user]);

  const uploadReport = async (
    file: File,
    title: string,
    reportType: string,
    reportDate: string,
    notes?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    dispatch(setLoading(true));
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('health-reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create report record
      const { data, error } = await supabase
        .from('health_reports')
        .insert({
          user_id: user.id,
          title,
          report_type: reportType,
          report_date: reportDate,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      dispatch(addReport(data));
      toast.success('Report uploaded successfully');
      return { data };
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload report');
      return { error };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteReport = async (reportId: string, filePath: string) => {
    if (!user) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('health-reports')
        .remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('health_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      dispatch(removeReport(reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const downloadReport = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('health-reports')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  return {
    reports,
    sharedReports,
    isLoading,
    filters,
    fetchReports,
    fetchSharedReports,
    uploadReport,
    deleteReport,
    downloadReport,
  };
};
