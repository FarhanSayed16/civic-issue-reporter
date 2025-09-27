// src/features/api/messages.api.js
import { apiSlice } from "./apiSlice";

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIssueMessages: builder.query({
      query: (issueId) => `/messages/issues/${issueId}/messages`,
      providesTags: (result, error, issueId) => [{ type: 'Message', id: issueId }],
    }),

    sendMessage: builder.mutation({
      query: ({ issueId, message }) => ({
        url: `/messages/issues/${issueId}/messages`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { issueId }) => [{ type: 'Message', id: issueId }],
    }),

    markMessagesAsRead: builder.mutation({
      query: (issueId) => ({
        url: `/messages/issues/${issueId}/read`,
        method: 'PATCH',
      }),
    }),
  }),
});

export const {
  useGetIssueMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
} = messagesApi;
