// src/features/api/analytics.api.js
import { apiSlice } from "./apiSlice";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsStats: builder.query({
      query: () => '/analytics/stats',
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