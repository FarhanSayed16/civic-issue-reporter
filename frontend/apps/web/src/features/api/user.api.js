// src/features/api/user.api.js
import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    getMyIssues: builder.query({
      query: () => '/users/me/issues',
      providesTags: ['Issue'],
    }),

    updateMe: builder.mutation({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetMyIssuesQuery,
  useUpdateMeMutation,
} = userApi;
