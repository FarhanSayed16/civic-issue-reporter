import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ErrorBoundary } from './components';
import { store, persistor } from './store/store';
import AuthInitializer from './AuthInitializer';
import { loadEncryptionConfig } from './lib/crypto';
import { apiSlice } from './features/api/apiSlice';

export default function App() {
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8585';
    loadEncryptionConfig(apiBase);
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ErrorBoundary>
          <AuthInitializer>
            <RouterProvider router={router} />
          </AuthInitializer>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}
