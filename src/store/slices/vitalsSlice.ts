import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Vital {
  id: string;
  user_id: string;
  vital_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes: string | null;
  created_at: string;
}

export const VITAL_TYPES = [
  { value: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', color: 'vital-bp' },
  { value: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', color: 'vital-bp' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', color: 'vital-heart' },
  { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', color: 'vital-sugar' },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', color: 'vital-oxygen' },
  { value: 'temperature', label: 'Body Temperature', unit: '°F', color: 'vital-temp' },
  { value: 'weight', label: 'Weight', unit: 'kg', color: 'vital-weight' },
] as const;

interface VitalsState {
  vitals: Vital[];
  isLoading: boolean;
  selectedVitalType: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const initialState: VitalsState = {
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
    setVitals: (state, action: PayloadAction<Vital[]>) => {
      state.vitals = action.payload;
    },
    addVital: (state, action: PayloadAction<Vital>) => {
      state.vitals.unshift(action.payload);
    },
    removeVital: (state, action: PayloadAction<string>) => {
      state.vitals = state.vitals.filter(v => v.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSelectedVitalType: (state, action: PayloadAction<string>) => {
      state.selectedVitalType = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
  },
});

export const { setVitals, addVital, removeVital, setLoading, setSelectedVitalType, setDateRange } = vitalsSlice.actions;
export default vitalsSlice.reducer;
