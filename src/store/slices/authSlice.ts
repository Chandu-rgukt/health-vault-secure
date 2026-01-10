import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; email: string } | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setProfile, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
