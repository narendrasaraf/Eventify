import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import './i18n';
import App from './App';
import axios from 'axios';
import reportWebVitals from './reportWebVitals';

// Suppress MetaMask and other extension-injected errors from triggering React Dev overlay
window.addEventListener('error', (e) => {
  if (
    e.message?.includes('MetaMask') || 
    e.filename?.startsWith('chrome-extension://') ||
    e.message?.includes('extension')
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  if (
    e.reason?.message?.includes('MetaMask') || 
    e.reason?.stack?.includes('chrome-extension://')
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

// Dynamic API URL rewriting for axios and fetch
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', API_URL);
  }
  return config;
});

const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('http://localhost:5000')) {
    url = url.replace('http://localhost:5000', API_URL);
  }
  return originalFetch(url, options);
};

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