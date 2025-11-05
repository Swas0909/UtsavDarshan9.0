import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <Navbar expand="lg" className="ud-navbar sticky-top shadow-sm" variant="light">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-gradient">UtsavDarshan</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/map">View All Pandals</Nav.Link>
            <Nav.Link as={Link} to="/plan-route">Plan Route</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
              <div className="rounded-circle overflow-hidden" style={{ width: '32px', height: '32px', backgroundColor: '#e9ecef' }}>
                <img 
                  src="/images/default-profile.svg" 
                  alt="Profile" 
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/32';
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