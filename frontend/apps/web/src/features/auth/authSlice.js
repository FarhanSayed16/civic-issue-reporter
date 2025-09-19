// features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, access_token, refresh_token } = action.payload;
      state.user = user;
      state.token = access_token;
      state.refreshToken = refresh_token;
      state.isAuthenticated = true;
    },
    tokenReceived: (state, action) => {
      const { access_token, refresh_token } = action.payload;
      state.token = access_token;
      state.refreshToken = refresh_token;
    },
    // features/authSlice.js
// ...
  logout: (state) => {
  state.user = null;
  state.token = null;
  state.refreshToken = null;
  state.isAuthenticated = false;

  // Clear both tokens from storage, just in case
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken'); // If you store this separately
}
//...
  },
});

export const { logout, setCredentials, tokenReceived } = authSlice.actions;
export default authSlice.reducer;