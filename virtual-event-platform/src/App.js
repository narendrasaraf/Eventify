import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Webinars from './pages/Webinars';
import Conferences from './pages/Conferences';
import Meetups from './pages/Meetups';
import ListYourEvent from './pages/ListYourEvent';
import Offers from './pages/Offers';
import GiftCards from './pages/GiftCards';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import MyEvents from './pages/MyEvents';
import RecordedVideos from './pages/RecordedVideo';

import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AllEvents from './pages/AllEvents';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/webinars" element={<ProtectedRoute><Webinars /></ProtectedRoute>} />
          <Route path="/conferences" element={<ProtectedRoute><Conferences /></ProtectedRoute>} />
          <Route path="/meetups" element={<ProtectedRoute><Meetups /></ProtectedRoute>} />
          <Route path="/listyourevent" element={<ProtectedRoute><ListYourEvent /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
          <Route path="/giftcards" element={<ProtectedRoute><GiftCards /></ProtectedRoute>} />
          <Route path="/myevents" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/allevents" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
          <Route path="/recorded-videos" element={<ProtectedRoute><RecordedVideos /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
