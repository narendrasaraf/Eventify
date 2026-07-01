import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import AllEvents from './pages/AllEvents';
import CoCreator from './pages/CoCreator';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* AI-OS Premium Workspaces */}
          <Route path="/discover" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
          <Route path="/co-creator" element={<ProtectedRoute><CoCreator /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />

          {/* Legacy fallback */}
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
