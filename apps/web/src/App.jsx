import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ErrorBoundary } from './components';
import { store, persistor } from './store/store';
import AuthInitializer from './AuthInitializer';

export default function App() {
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
