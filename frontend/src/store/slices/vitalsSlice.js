import { createSlice } from '@reduxjs/toolkit';

export const VITAL_TYPES = [
  { value: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', color: 'vital-bp' },
  { value: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', color: 'vital-bp' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', color: 'vital-heart' },
  { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', color: 'vital-sugar' },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', color: 'vital-oxygen' },
  { value: 'temperature', label: 'Body Temperature', unit: '°F', color: 'vital-temp' },
  { value: 'weight', label: 'Weight', unit: 'kg', color: 'vital-weight' },
];

const initialState = {
  vitals: [],
  isLoading: false,
  selectedVitalType: 'all',
  dateRange: {
    startDate: '',
    endDate: '',
  },
};

const vitalsSlice = createSlice({
  name: 'vitals',
  initialState,
  reducers: {
    setVitals: (state, action) => {
      state.vitals = action.payload;
    },
    addVital: (state, action) => {
      state.vitals.unshift(action.payload);
    },
    removeVital: (state, action) => {
      state.vitals = state.vitals.filter(v => v.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSelectedVitalType: (state, action) => {
      state.selectedVitalType = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
  },
});

export const {
  setVitals,
  addVital,
  removeVital,
  setLoading,
  setSelectedVitalType,
  setDateRange,
} = vitalsSlice.actions;

export default vitalsSlice.reducer;
