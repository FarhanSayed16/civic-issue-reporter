// src/AuthInitializer.jsx
import React, { useEffect } from 'react';
import { useGetMeQuery } from './features/api/user.api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from './features/auth/authSlice';
import Loader from './components/Loader';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  
  // Only fetch user data if we have a token
  const { data, isLoading, error } = useGetMeQuery(undefined, {
    skip: !token
  });

  useEffect(() => {
    if (data) {
      // Update user data in auth state
      dispatch(setCredentials({ user: data, access_token: token }));
    }
  }, [data, dispatch, token]);

  // If we have a token but no user data yet, show loading
  if (token && isLoading) {
    return <Loader fullScreen />;
  }

  return <>{children}</>;
}

