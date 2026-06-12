import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import { unwrapApi } from '../../utils/api';
import { clearAuthTokens, getAccessToken } from '../../utils/authStorage';

/** Invalidate server session and clear client tokens. */
export const logoutSession = createAsyncThunk('auth/logout', async () => {
  try {
    if (getAccessToken()) await authApi.logout();
  } catch {
    /* proceed even if API fails (offline / expired token) */
  }
  clearAuthTokens();
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.me();
    const data = unwrapApi(res);
    return data?.user ?? data;
  } catch (err) {
    return rejectWithValue({
      message: err.response?.data?.message || 'Failed',
      status: err.response?.status,
    });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearAuth: (state) => { state.user = null; state.error = null; state.loading = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 401) {
          state.user = null;
          clearAuthTokens();
        }
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
