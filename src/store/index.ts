import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import reportsReducer from './slices/reportsSlice';
import vitalsReducer from './slices/vitalsSlice';
import sharingReducer from './slices/sharingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportsReducer,
    vitals: vitalsReducer,
    sharing: sharingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
