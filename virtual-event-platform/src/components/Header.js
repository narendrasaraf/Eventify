import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './HeaderStyles.css';
import logo from '../logo.png';

function Header() {
  const [city, setCity] = useState('City');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Completely hide header on Landing Page ('/')
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header>
      <div className="site-header">
        <div className="logo-container">
          <Link to={localStorage.getItem('user') ? "/home" : "/"}>
            <img src={logo} alt="BookMyEvent Logo" className="logo" />
          </Link>
        </div>

        {localStorage.getItem('user') && (
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search for Webinars, Conferences and Meetups"
            />
            <select
              className="city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="City">City</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
        )}

        <div className="auth-buttons">
          {localStorage.getItem('user') ? (
            <>
              <button
                className="auth-button"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="auth-button"
                onClick={() => {
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="auth-button"
              onClick={() => navigate('/signup')}
            >
              Sign Up / Login
            </button>
          )}
        </div>

        <div className="hamburger-menu" onClick={toggleMobileMenu}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>
      </div>

      {localStorage.getItem('user') && !['/login', '/signup', '/'].includes(window.location.pathname) && (
        <nav className="main-nav">
          <div className="nav-container">
            <ul className="primary-nav">
              <li><Link to="/home">HOME</Link></li>
              <li><Link to="/webinars">WEBINARS</Link></li>
              <li><Link to="/conferences">CONFERENCES</Link></li>
              <li><Link to="/meetups">MEETUPS</Link></li>
              <li><Link to="/recorded-videos">RECORDED SESSIONS</Link></li>
            </ul>

            <ul className="secondary-nav">
              <li><Link to="/listyourevent">ListYourEvent</Link></li>
              <li><Link to="/offers">Offers</Link></li>
              <li><Link to="/giftcards">Gift Cards</Link></li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;