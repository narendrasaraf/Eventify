import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import './i18n';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';





const root = ReactDOM.createRoot(document.getElementById('root'));
// const router = createBrowserRouter([
//   // {
//   //   path: '/meeting',
//   //   element: <Meeting payload={payload} />
//   // }
// ]);
root.render(
  <GoogleOAuthProvider clientId="294215027727-0pg1fdjv8hen09ikhtf61c5t0tp6mr6p.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);


reportWebVitals();