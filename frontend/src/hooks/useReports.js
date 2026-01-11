import { useCallback } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setReports,
  setSharedReports,
  addReport,
  removeReport,
  setLoading,
} from "@/store/slices/reportsSlice";
import { toast } from "sonner";

export const REPORT_TYPES = [
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Ultrasound",
  "ECG",
  "Prescription",
  "Lab Report",
  "Vaccination",
  "Other",
];

export const useReports = () => {
  const dispatch = useAppDispatch();
  const { reports, sharedReports, isLoading, filters } = useAppSelector(
    (state) => state.reports
  );
  const { user } = useAppSelector((state) => state.auth);

  const fetchReports = useCallback(async () => {
    if (!user) return;

    dispatch(setLoading(true));

    try {
      const params = {};

      if (filters?.reportType && filters.reportType !== "all") {
        params.report_type = filters.reportType;
      }
      if (filters?.startDate) {
        params.start_date = filters.startDate;
      }
      if (filters?.endDate) {
        params.end_date = filters.endDate;
      }
      if (filters?.searchQuery) {
        params.search = filters.searchQuery;
      }

      const response = await api.get("/reports", { params });
      dispatch(setReports(response.data?.data || []));
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user, filters]);

  const fetchSharedReports = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get("/reports/shared");
      dispatch(setSharedReports(response.data?.data || []));
    } catch (error) {
      console.error("Error fetching shared reports:", error);
      toast.error("Failed to fetch shared reports");
    }
  }, [dispatch, user]);

  const uploadReport = async (file, title, reportType, reportDate, notes) => {
    if (!user) {
      return { data: null, error: { message: "Not authenticated" } };
    }

    dispatch(setLoading(true));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("report_type", reportType);
      formData.append("report_date", reportDate);
      if (notes) {
        formData.append("notes", notes);
      }

      const response = await api.post("/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(addReport(response.data.data));
      toast.success("Report uploaded successfully");

      return { data: response.data.data, error: null };
    } catch (error) {
      console.error("Error uploading report:", error);
      toast.error(error?.response?.data?.error || "Failed to upload report");
      return { data: null, error };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteReport = async (reportId) => {
    if (!user) return;

    try {
      await api.delete(`/reports/${reportId}`);
      dispatch(removeReport(reportId));
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error(error?.response?.data?.error || "Failed to delete report");
    }
  };

  const downloadReport = async (reportId, fileName) => {
    try {
      const response = await api.get(`/reports/download/${reportId}`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let finalName = fileName;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/i);
        if (match) finalName = match[1];
      }

      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error(error?.response?.data?.error || "Failed to download report");
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
