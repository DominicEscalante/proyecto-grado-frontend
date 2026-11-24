import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { router } from './app/router.js';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import './index.css';

if (import.meta.env.PROD && window.isSecureContext && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
    console.warn('No se pudo registrar el servicio de la aplicación instalada.', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" theme="light" />
    </AuthProvider>
  </React.StrictMode>
);
