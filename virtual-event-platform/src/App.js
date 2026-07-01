import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import AllEvents from './pages/AllEvents';
import CoCreator from './pages/CoCreator';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';

import LandingPage from './pages/LandingPage';
import Conferences from './pages/Conferences';
import Meetups from './pages/Meetups';
import MyEvents from './pages/MyEvents';
import UserDashboard from './pages/UserDashboard';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Community from './pages/Community';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Global axios interceptor to handle token refresh automatically
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasUserSession = localStorage.getItem('user');

    // Only attempt to refresh tokens if user session is expected to exist,
    // avoiding infinite redirect/refresh loops for guest users.
    if (
      error.response?.status === 401 &&
      hasUserSession &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh')
    ) {
      originalRequest._retry = true;
      try {
        await axios.post('http://localhost:5000/api/v1/auth/refresh', {}, { withCredentials: true });
        originalRequest.withCredentials = true;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Guest Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />

          {/* Core Business Modules - First Class Navigation Routes */}
          <Route path="/conferences" element={<Conferences />} />
          <Route path="/meetups" element={<Meetups />} />

          {/* AI-OS Premium Workspaces (Authenticated Only) */}
          <Route path="/discover" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
          <Route path="/co-creator" element={<ProtectedRoute><CoCreator /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
          
          <Route path="/tickets" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* Legacy fallback */}
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
