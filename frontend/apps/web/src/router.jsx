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
import AllIssuesAdminPage from './pages/AllIssuesAdminPage';
import ReportsPage from './pages/ReportsPage';
import HelpSettingsPage from './pages/HelpSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';

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
          <AuthLayout authentication={true} roles={['admin']}>
            <HomePage />
          </AuthLayout>
        }
      />

      {/* New Navigation */}
      <Route
        path="issues"
        element={
          <AuthLayout authentication={true} roles={['admin']}>
            <AllIssuesAdminPage />
          </AuthLayout>
        }
      />
      <Route
        path="help-settings"
        element={
          <AuthLayout authentication={true} roles={['admin']}>
            <HelpSettingsPage />
          </AuthLayout>
        }
      />
        <Route
          path="admin"
          element={
            <AuthLayout authentication={true} roles={['admin']}>
              <AdminDashboardPage />
            </AuthLayout>
          }
        />
        <Route
          path="my-issues"
          element={
            <AuthLayout authentication={true} roles={['admin']}>
              <UserDashboardPage />
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