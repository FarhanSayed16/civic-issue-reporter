// src/features/api/admin.api.js
import { apiSlice } from "./apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminIssues: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.ward) searchParams.append('ward', params.ward);
        if (params.category) searchParams.append('category', params.category);
        if (params.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params.sort_order) searchParams.append('sort_order', params.sort_order);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);
        
        const queryString = searchParams.toString();
        return `/admin/issues${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Issue'],
    }),

    updateIssue: builder.mutation({
      query: ({ issueId, issueUpdate }) => ({
        url: `/admin/issues/${issueId}`,
        method: 'PATCH',
        body: issueUpdate,
      }),
      invalidatesTags: (result, error, issueId) => [{ type: 'Issue', id: issueId }],
    }),

    deleteIssue: builder.mutation({
      query: (issueId) => ({
        url: `/admin/issues/${issueId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Issue'],
    }),

    getAdminUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.role) searchParams.append('role', params.role);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);
        
        const queryString = searchParams.toString();
        return `/admin/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetAdminIssuesQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useGetAdminUsersQuery,
} = adminApi;
