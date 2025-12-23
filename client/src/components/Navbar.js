import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function NavigationBar({ user }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 88); // Hero section is 88vh
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Header Navigation */}
      <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            UtsavDarshan
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop-menu">
            <Link to="/" className="navbar-link">Home</Link>
            <Link to="/map" className="navbar-link">Routes</Link>
            <Link to="/explore" className="navbar-link">About</Link>
          </div>

          {/* Desktop Right Side */}
          <div className="navbar-right">
            <Link to="/explore" className="navbar-btn">
              Explore Pandals
            </Link>
            
            {user ? (
              <Link to="/profile" className="user-avatar" title="View profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            ) : (
              <Link to="/login" className="navbar-link-signin">Sign In</Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="mobile-toggle">
            <button
              className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <div className="mobile-menu">
              <Link to="/" className="mobile-menu-link" onClick={closeMobileMenu}>Home</Link>
              <Link to="/map" className="mobile-menu-link" onClick={closeMobileMenu}>Routes</Link>
              <Link to="/explore" className="mobile-menu-link" onClick={closeMobileMenu}>About</Link>
              
              <Link to="/explore" className="mobile-menu-cta" onClick={closeMobileMenu}>
                Explore Pandals
              </Link>

              {user && (
                <Link to="/profile" className="mobile-menu-link" onClick={closeMobileMenu}>
                  Profile
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default NavigationBar;