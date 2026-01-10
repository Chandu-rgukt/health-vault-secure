import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SharedReport {
  id: string;
  report_id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_user_id: string | null;
  access_type: string;
  created_at: string;
  expires_at: string | null;
}

interface SharingState {
  sharedByMe: SharedReport[];
  sharedWithMe: SharedReport[];
  isLoading: boolean;
}

const initialState: SharingState = {
  sharedByMe: [],
  sharedWithMe: [],
  isLoading: false,
};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    setSharedByMe: (state, action: PayloadAction<SharedReport[]>) => {
      state.sharedByMe = action.payload;
    },
    setSharedWithMe: (state, action: PayloadAction<SharedReport[]>) => {
      state.sharedWithMe = action.payload;
    },
    addSharedReport: (state, action: PayloadAction<SharedReport>) => {
      state.sharedByMe.unshift(action.payload);
    },
    removeSharedReport: (state, action: PayloadAction<string>) => {
      state.sharedByMe = state.sharedByMe.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSharedByMe, setSharedWithMe, addSharedReport, removeSharedReport, setLoading } = sharingSlice.actions;
export default sharingSlice.reducer;
