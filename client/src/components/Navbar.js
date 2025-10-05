import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Navbar 
      className={`navbar-modern ${scrolled ? 'scrolled' : ''}`} 
      expand="lg" 
      fixed="top"
      style={{ 
        background: scrolled 
          ? 'rgba(255, 255, 255, 0.98)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--neutral-100)',
        boxShadow: scrolled ? 'var(--shadow-lg)' : 'none',
        transition: 'all 0.3s ease',
        padding: 'var(--space-4) 0'
      }}
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="navbar-brand-modern"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-500), var(--gold-500))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textDecoration: 'none'
          }}
        >
          UtsavDarshan
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav"
          style={{
            border: 'none',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)'
          }}
        />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`nav-link-modern ${location.pathname === '/' ? 'active' : ''}`}
              style={{
                fontWeight: '500',
                color: location.pathname === '/' ? 'var(--primary-600)' : 'var(--neutral-700)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.2s ease',
                margin: '0 var(--space-1)',
                background: location.pathname === '/' ? 'var(--primary-100)' : 'transparent'
              }}
            >
              <i className="bi bi-house-door me-2"></i>
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/map" 
              className={`nav-link-modern ${location.pathname === '/map' ? 'active' : ''}`}
              style={{
                fontWeight: '500',
                color: location.pathname === '/map' ? 'var(--primary-600)' : 'var(--neutral-700)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.2s ease',
                margin: '0 var(--space-1)',
                background: location.pathname === '/map' ? 'var(--primary-100)' : 'transparent'
              }}
            >
              <i className="bi bi-map me-2"></i>
              View All Pandals
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/plan-route" 
              className={`nav-link-modern ${location.pathname === '/plan-route' ? 'active' : ''}`}
              style={{
                fontWeight: '500',
                color: location.pathname === '/plan-route' ? 'var(--primary-600)' : 'var(--neutral-700)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.2s ease',
                margin: '0 var(--space-1)',
                background: location.pathname === '/plan-route' ? 'var(--primary-100)' : 'transparent'
              }}
            >
              <i className="bi bi-route me-2"></i>
              Plan Route
            </Nav.Link>
          </Nav>
          
          <Nav>
            <Nav.Link 
              as={Link} 
              to="/profile" 
              className="d-flex align-items-center nav-link-modern"
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(135deg, var(--primary-100), var(--secondary-100))',
                  border: '2px solid var(--neutral-200)',
                  transition: 'all 0.2s ease'
                }}
              >
                <img 
                  src="/images/default-profile.svg" 
                  alt="Profile" 
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<i class="bi bi-person-fill" style="color: var(--primary-600); font-size: 1.2rem;"></i>';
                  }}
                />
              </div>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;