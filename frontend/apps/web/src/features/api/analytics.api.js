// src/features/api/analytics.api.js
import { apiSlice } from "./apiSlice";
import { isDemoMode, getMockAnalytics } from "@/utils/demoMode";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsStats: builder.query({
      queryFn: async (arg, api) => {
        // Check for demo mode
        if (isDemoMode()) {
          const mockData = await getMockAnalytics();
          return { data: mockData };
        }
        // Get token from store
        const state = api.getState();
        const token = state?.auth?.token;
        
        // Make authenticated request
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8585'}/analytics/stats`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return { error: { status: 401, data: 'Unauthorized' } };
          }
          throw new Error('Failed to fetch analytics');
        }
        return { data: await response.json() };
      },
      providesTags: ['Analytics'],
    }),

    getAnalyticsHeatmap: builder.query({
      query: () => '/analytics/heatmap',
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetAnalyticsStatsQuery,
  useGetAnalyticsHeatmapQuery,
} = analyticsApi;