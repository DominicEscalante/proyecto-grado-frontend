import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { router } from './app/router.js';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" theme="light" />
    </AuthProvider>
  </React.StrictMode>
);
