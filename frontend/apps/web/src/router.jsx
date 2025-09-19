// src/router.js
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import {
  HomePage,
  LoginPage,
  SignupPage,
  ProfilePage,
} from './pages';
import { NotFound } from './components';
import { IssueDetailsPanel } from './components/IssueDetailsPanel';
import AllIssuesPage from './pages/AllIssuesPage';
import ReportsPage from './pages/ReportsPage';
import HelpSettingsPage from './pages/HelpSettingsPage';

export default createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      {/* ✅ FIX: The index route now redirects to /home. 
          AuthLayout will then correctly handle routing to /login if the user is not authenticated. */}
      <Route index element={<Navigate to="/home" replace />} />

      {/* login/signup (public but redirect away if already authed) */}
      <Route
        path="login"
        element={
          <AuthLayout authentication={false} both> 
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="signup"
        element={
          <AuthLayout authentication={false}>
            <SignupPage />
          </AuthLayout>
        }
      />
  
      <Route
        path="/home"
        element={
          <AuthLayout authentication={true}>
            <HomePage />
          </AuthLayout>
        }
      />

      {/* New Navigation */}
      <Route
        path="issues"
        element={
          <AuthLayout authentication={true}>
            <AllIssuesPage />
          </AuthLayout>
        }
      />
      <Route
        path="reports"
        element={
          <AuthLayout authentication={true}>
            <ReportsPage />
          </AuthLayout>
        }
      />
      <Route
        path="help-settings"
        element={
          <AuthLayout authentication={true}>
            <HelpSettingsPage />
          </AuthLayout>
        }
      />
  
      <Route
        path="profile"
        element={
          <AuthLayout authentication={true}>
            <ProfilePage />
          </AuthLayout>
        }
      />

      <Route
        path="issueDetailsPanel/:id"
        element={
          <AuthLayout authentication={true}>
            <IssueDetailsPanel />
          </AuthLayout>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);