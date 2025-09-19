import { apiSlice } from './apiSlice';

// Single analyticsApi with both existing and new endpoints
export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Existing
    getStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.start_date) searchParams.append('start_date', params.start_date);
        if (params.end_date) searchParams.append('end_date', params.end_date);
        const queryString = searchParams.toString();
        return `/analytics/stats${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Analytics'],
    }),
    getHeatmapData: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.category) searchParams.append('category', params.category);
        const queryString = searchParams.toString();
        return `/analytics/heatmap${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Analytics'],
    }),

    // New for this UI
    getCategoriesRatio: builder.query({ query: () => '/analytics/categories-ratio' }),
    getStatusRatio: builder.query({ query: () => '/analytics/status-ratio' }),
    getIssuesOverTime: builder.query({ query: () => '/analytics/issues-over-time' }),
    getIssuesByWard: builder.query({ query: () => '/analytics/issues-by-ward' }),
  }),
});

export const {
  useGetStatsQuery,
  useGetHeatmapDataQuery,
  useGetCategoriesRatioQuery,
  useGetStatusRatioQuery,
  useGetIssuesOverTimeQuery,
  useGetIssuesByWardQuery,
} = analyticsApi;
