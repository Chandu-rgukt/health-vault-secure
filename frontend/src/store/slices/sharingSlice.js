import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sharedByMe: [],
  sharedWithMe: [],
  isLoading: false,
};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    setSharedByMe: (state, action) => {
      state.sharedByMe = action.payload;
    },
    setSharedWithMe: (state, action) => {
      state.sharedWithMe = action.payload;
    },
    addSharedReport: (state, action) => {
      state.sharedByMe.unshift(action.payload);
    },
    removeSharedReport: (state, action) => {
      state.sharedByMe = state.sharedByMe.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSharedByMe, setSharedWithMe, addSharedReport, removeSharedReport, setLoading } = sharingSlice.actions;
export default sharingSlice.reducer;


