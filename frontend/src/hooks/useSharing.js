import { useCallback } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSharedByMe,
  setSharedWithMe,
  addSharedReport,
  removeSharedReport,
  setLoading,
} from "@/store/slices/sharingSlice";
import { toast } from "sonner";

export const useSharing = () => {
  const dispatch = useAppDispatch();
  const { sharedByMe, sharedWithMe, isLoading } = useAppSelector(
    (state) => state.sharing
  );
  const { user } = useAppSelector((state) => state.auth);

  const fetchSharedByMe = useCallback(async () => {
    if (!user) return;

    dispatch(setLoading(true));
    try {
      const response = await api.get("/sharing/shared-by-me");
      dispatch(setSharedByMe(response.data.data || []));
    } catch (error) {
      console.error("Error fetching shared reports:", error);
      toast.error("Failed to fetch shared reports");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user]);

  const fetchSharedWithMe = useCallback(async () => {
    if (!user) return;

    dispatch(setLoading(true));
    try {
      const response = await api.get("/sharing/shared-with-me");
      dispatch(setSharedWithMe(response.data.data || []));
    } catch (error) {
      console.error("Error fetching shared with me:", error);
      toast.error("Failed to fetch shared reports");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user]);

  const shareReport = async (reportId, email) => {
    if (!user) {
      return { error: { message: "Not authenticated" } };
    }

    try {
      const response = await api.post("/sharing", {
        report_id: reportId,
        email,
      });

      dispatch(addSharedReport(response.data.data));
      toast.success(`Report shared with ${email}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error("Error sharing report:", error);
      toast.error(error?.response?.data?.error || "Failed to share report");
      return { data: null, error };
    }
  };

  const revokeAccess = async (shareId) => {
    if (!user) return;

    try {
      await api.delete(`/sharing/${shareId}`);
      dispatch(removeSharedReport(shareId));
      toast.success("Access revoked successfully");
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error(error?.response?.data?.error || "Failed to revoke access");
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
