// src/features/api/issues.api.js
import { apiSlice } from "./apiSlice";

export const issuesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiateUpload: builder.mutation({
      query: (filename) => ({
        url: `/issues/initiate-upload?filename=${encodeURIComponent(filename)}`,
        method: 'POST',
      }),
    }),

    createIssue: builder.mutation({
      query: (issueData) => ({
        url: '/issues',
        method: 'POST',
        body: issueData,
      }),
      invalidatesTags: ['Issue'],
    }),

    getIssues: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.lat) searchParams.append('lat', params.lat);
        if (params.lng) searchParams.append('lng', params.lng);
        if (params.radius) searchParams.append('radius', params.radius);
        if (params.category) searchParams.append('category', params.category);
        if (params.status) searchParams.append('status', params.status);
        if (params.ward) searchParams.append('ward', params.ward);
        if (params.search) searchParams.append('search', params.search);
        if (params.sort) searchParams.append('sort', params.sort);
        
        const queryString = searchParams.toString();
        return `/issues${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Issue'],
    }),

    getUserIssues: builder.query({
      query: () => '/issues/my-issues',
      providesTags: ['Issue'],
    }),

    searchIssues: builder.query({
      query: (q='') => `/issues?search=${encodeURIComponent(q)}`,
      providesTags: ['Issue'],
    }),

    getIssue: builder.query({
      query: (issueId) => `/issues/${issueId}`,
      providesTags: (result, error, issueId) => [{ type: 'Issue', id: issueId }],
    }),

    upvoteIssue: builder.mutation({
      query: (issueId) => ({
        url: `/issues/${issueId}/upvote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, issueId) => [{ type: 'Issue', id: issueId }],
    }),

    updateIssueStatus: builder.mutation({
      query: ({ issueId, status }) => ({
        url: `/issues/${issueId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, issueId) => [{ type: 'Issue', id: issueId }],
    }),
  }),
});

export const {
  useInitiateUploadMutation,
  useCreateIssueMutation,
  useGetIssuesQuery,
  useGetUserIssuesQuery,
  useSearchIssuesQuery,
  useGetIssueQuery,
  useUpvoteIssueMutation,
  useUpdateIssueStatusMutation,
} = issuesApi;
