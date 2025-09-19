// src/layouts/AuthLayout.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetMeQuery
} from '../features/api/user.api';
import {
  setCredentials,
  logout
} from '../features/auth/authSlice';
import {
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';
import Loader from '../components/Loader';

export default function AuthLayout({ children, authentication = true, roles=[] }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector((s) => s.auth);
  const { data, isLoading, error } = useGetMeQuery(undefined, {
    skip: !token, // Only fetch if we have a token
    refetchOnMountOrArgChange: true,
  });


  const navigate = useNavigate();
  const location = useLocation();

  // Hydrate Redux when query succeeds
  useEffect(() => {
    if (data) {
      dispatch(setCredentials({ user: data, access_token: token }));
    }
  }, [data, dispatch, token]);

  // When authentication is required...
  if (authentication) {
    // 1) still checking the cookie? show loader
    if (isLoading) {
      return <Loader fullScreen />;
    }
    // 2) check error or no user => force login
    if (error || !data) {
      dispatch(logout());
      return (
        <Navigate
          to="/login"
          state={{ from: location.pathname }}
          replace
        />
      );
    }

    // Enforce roles if provided
    if (roles.length > 0 && !roles.includes(data.role)) {
      return <Navigate to="/home" replace />;
    }

    // else we have a valid user
    
    return <>{children}</>;
  }

  // For public pages (login/signup):
  // If we're done loading and already authenticated, send home
  if (!authentication && !isLoading && isAuthenticated) {
    const from = location.state?.from || "/home";
    return <Navigate to={from} replace />;
  }
  // Otherwise render the public page immediately
  return <>{children}</>;
}
