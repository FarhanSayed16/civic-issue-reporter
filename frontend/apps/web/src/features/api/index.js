// src/features/api/index.js
export { apiSlice } from './apiSlice';
export { authApi, useRegisterMutation, useLoginMutation, useRefreshMutation } from './auth.api';
export { userApi, useGetMeQuery, useGetMyIssuesQuery } from './user.api';
export { 
  issuesApi, 
  useInitiateUploadMutation, 
  useCreateIssueMutation, 
  useGetIssuesQuery, 
  useGetIssueQuery, 
  useUpvoteIssueMutation, 
  useUpdateIssueStatusMutation 
} from './issues.api';
export { 
  adminApi, 
  useGetAdminIssuesQuery, 
  useUpdateIssueMutation, 
  useDeleteIssueMutation, 
  useGetAdminUsersQuery 
} from './admin.api';
export { 
  analyticsApi, 
  useGetAnalyticsStatsQuery, 
  useGetAnalyticsHeatmapQuery 
} from './analytics.api';
export { 
  notificationsApi, 
  useConnectUserUpdatesQuery, 
  useConnectIssueUpdatesQuery 
} from './notifications.api';
