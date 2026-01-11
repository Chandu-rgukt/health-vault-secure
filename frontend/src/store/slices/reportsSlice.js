import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    setReports: (state, action) => {
      state.reports = action.payload;
    },
    setSharedReports: (state, action) => {
      state.sharedReports = action.payload;
    },
    addReport: (state, action) => {
      state.reports.unshift(action.payload);
    },
    removeReport: (state, action) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setReports, setSharedReports, addReport, removeReport, setLoading, setFilters, clearFilters } = reportsSlice.actions;
export default reportsSlice.reducer;


