import { apiSlice } from './apiSlice';

export const helpApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query({ query: () => '/help/faqs' }),
    getUserManual: builder.query({ query: () => '/help/user-manual' }),
  }),
});

export const { useGetFaqsQuery, useGetUserManualQuery } = helpApi;


