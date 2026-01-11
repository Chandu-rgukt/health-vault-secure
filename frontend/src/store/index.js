import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import reportsReducer from './slices/reportsSlice.js';
import vitalsReducer from './slices/vitalsSlice.js';
import sharingReducer from './slices/sharingSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportsReducer,
    vitals: vitalsReducer,
    sharing: sharingReducer,
  },
});


