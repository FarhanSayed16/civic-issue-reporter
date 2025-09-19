// src/features/api/notifications.api.js
import { apiSlice } from "./apiSlice";

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // WebSocket connection endpoints
    connectUserUpdates: builder.query({
      query: (userId) => ({
        url: `/notifications/ws/updates/${userId}`,
        method: 'GET',
      }),
      // This is for WebSocket connection, not a typical HTTP request
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          
          const ws = new WebSocket(`ws://localhost:8000/notifications/ws/updates/${arg}`);
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateCachedData((draft) => {
              draft.push(data);
            });
          };
          
          ws.onclose = () => {
            console.log('WebSocket connection closed');
          };
          
          await cacheEntryRemoved;
          ws.close();
        } catch (error) {
          console.error('WebSocket error:', error);
        }
      },
    }),

    connectIssueUpdates: builder.query({
      query: (issueId) => ({
        url: `/notifications/updates/${issueId}`,
        method: 'GET',
      }),
      // This is for WebSocket connection, not a typical HTTP request
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          
          const ws = new WebSocket(`ws://localhost:8000/notifications/updates/${arg}`);
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateCachedData((draft) => {
              draft.push(data);
            });
          };
          
          ws.onclose = () => {
            console.log('WebSocket connection closed');
          };
          
          await cacheEntryRemoved;
          ws.close();
        } catch (error) {
          console.error('WebSocket error:', error);
        }
      },
    }),
  }),
});

export const {
  useConnectUserUpdatesQuery,
  useConnectIssueUpdatesQuery,
} = notificationsApi;
