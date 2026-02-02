import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PagesStyles.css';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="page-container dashboard-layout">

            {/* Hero Section */}
            <div className="hero-section">
                <h1 className="hero-title">
                    Welcome to Eventify
                </h1>
                <p className="hero-subtitle">
                    The ultimate platform to streamline your virtual and physical events.
                    Connect, Engage, and Grow with our all-in-one solution.
                </p>

                <div className="hero-buttons">
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="btn-secondary"
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <h2>Why Choose Eventify?</h2>
                <div className="events-grid">
                    <div className="feature-card">
                        <h3>Seamless Ticketing</h3>
                        <p>Create and manage tickets effortlessly with our robust booking system. Instant confirmations and QR code check-ins.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Virtual & Live</h3>
                        <p>Support for both in-person conferences and Google Meet integrated virtual events. Hybrid events made easy.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Real-time Analytics</h3>
                        <p>Track registrations, attendance, and engagement with our comprehensive dashboard. Make data-driven decisions.</p>
                    </div>
                </div>
            </div>

            {/* Industries Section */}
            <div className="features-section industries-section">
                <h2>Industries We Serve</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', maxWidth: '800px', margin: '0 auto' }}>
                    {['Technology', 'Education', 'Healthcare', 'Finance', 'Entertainment', 'Non-Profit', 'Corporate', 'Small Business'].map((industry) => (
                        <span key={industry} className="industry-badge">
                            {industry}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default LandingPage;
