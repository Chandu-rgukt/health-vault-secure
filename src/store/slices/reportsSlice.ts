import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HealthReport {
  id: string;
  user_id: string;
  title: string;
  report_type: string;
  report_date: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportsState {
  reports: HealthReport[];
  sharedReports: HealthReport[];
  isLoading: boolean;
  filters: {
    reportType: string;
    startDate: string;
    endDate: string;
    searchQuery: string;
  };
}

const initialState: ReportsState = {
  reports: [],
  sharedReports: [],
  isLoading: false,
  filters: {
    reportType: 'all',
    startDate: '',
    endDate: '',
    searchQuery: '',
  },
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<HealthReport[]>) => {
      state.reports = action.payload;
    },
    setSharedReports: (state, action: PayloadAction<HealthReport[]>) => {
      state.sharedReports = action.payload;
    },
    addReport: (state, action: PayloadAction<HealthReport>) => {
      state.reports.unshift(action.payload);
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ReportsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setReports, setSharedReports, addReport, removeReport, setLoading, setFilters, clearFilters } = reportsSlice.actions;
export default reportsSlice.reducer;
