// services/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || `http://localhost:8585`,
  credentials: 'include', // This sends cookies automatically
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state if available
    const token = getState()?.auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Update token in auth state
      api.dispatch({ type: 'auth/tokenReceived', payload: refreshResult.data });
      // retry original
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Issue', 'Auth', 'Admin', 'Analytics', 'Notification'],
  endpoints: () => ({})
});