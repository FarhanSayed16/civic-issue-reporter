// File: src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// 👇 Only import the single, base apiSlice
import { apiSlice } from '../features/api/apiSlice';
import authReducer from '../features/auth/authSlice';
import customizationReducer from '../features/CustomizationSlice';
import uiReducer from './slices/uiSlice';

// Persist config for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    customization: customizationReducer,
    ui: uiReducer,
    // 👇 Only include the reducer from the base apiSlice
    [apiSlice.reducerPath]: apiSlice.reducer,
    // REMOVED: [issuesApi.reducerPath]: issuesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      // 👇 Only concat the middleware from the base apiSlice
    }).concat(apiSlice.middleware),
    // REMOVED: issuesApi.middleware
});

export const persistor = persistStore(store);