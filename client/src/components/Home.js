import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PandalRegistrationModal from './PandalRegistrationModal';
import { Link } from 'react-router-dom';

function Home() {
  const [featuredPandals, setFeaturedPandals] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    const fetchFeaturedPandals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pandals');
        const data = await response.json();
        // Remove duplicates by ID first
        const uniquePandals = Array.from(new Map(data.map(item => [item.id, item])).values());
        // Get top rated pandals but ensure they are different by comparing more properties
        const sortedPandals = uniquePandals.sort((a, b) => b.rating - a.rating);
        const selectedPandals = [];
        let index = 0;
        
        // Select 3 different pandals by checking multiple properties to ensure diversity
        while (selectedPandals.length < 3 && index < sortedPandals.length) {
          const currentPandal = sortedPandals[index];
          const isDuplicate = selectedPandals.some(p => 
            p.id === currentPandal.id ||
            p.name === currentPandal.name ||
            (p.location === currentPandal.location && p.area === currentPandal.area)
          );
          
          if (!isDuplicate) {
            selectedPandals.push(currentPandal);
          }
          index++;
        }
        
        setFeaturedPandals(selectedPandals);
      } catch (error) {
        console.error('Error fetching featured pandals:', error);
      }
    };

    fetchFeaturedPandals();
  }, []);

  return (
    <>
      {/* Modern Hero Section */}
      <section className="hero-section">
        <Container>
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in-up">
              Welcome to <span className="gradient-text">UtsavDarshan</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Your ultimate guide to exploring Ganpati Pandals across Mumbai during Ganesh Chaturthi.
              Discover the most beautiful and famous pandals, get real-time crowd updates, and plan your
              darshan efficiently.
            </p>
            <div className="d-flex gap-3 justify-content-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button 
                as={Link} 
                to="/map"
                className="btn-modern btn-primary-modern"
                size="lg"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4) var(--space-8)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <i className="bi bi-map"></i>
                Explore Pandals
              </Button>
              <Button 
                as={Link} 
                to="/plan-route"
                className="btn-modern btn-outline-modern"
                size="lg"
                variant="outline-primary"
                style={{
                  background: 'transparent',
                  border: '2px solid var(--primary-500)',
                  color: 'var(--primary-600)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4) var(--space-8)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <i className="bi bi-route"></i>
                Plan Route
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Pandals Section */}
      <Container style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-16)' }}>
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 
            className="heading-2 mb-3"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--neutral-900)',
              fontSize: '2.5rem',
              fontWeight: '600'
            }}
          >
            Featured Pandals
          </h2>
          <p 
            className="body-large text-muted-modern"
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              color: 'var(--neutral-600)'
            }}
          >
            Discover the most celebrated and highest-rated Ganpati Pandals across Mumbai
          </p>
        </div>

        {/* Featured Cards Grid */}
        <Row>
          {featuredPandals.map(pandal => (
            <Col key={pandal.id} md={4} className="mb-4">
              <Card className="card-modern pandal-card h-100">
                <Card.Img 
                  variant="top" 
                  src={pandal.imageUrl || '/images/placeholder.jpg'} 
                  className="pandal-image"
                  alt={pandal.name}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="card-title">{pandal.name}</Card.Title>
                  <div className="location-badge mb-3">
                    <i className="bi bi-geo-alt text-primary-modern"></i>
                    <span>{pandal.location}</span>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="rating-modern">
                        <i className="bi bi-star-fill star-modern"></i>
                        <span className="ms-1 fw-semibold">{pandal.rating}/5</span>
                      </div>
                      <span 
                        className="badge-modern badge-primary-modern"
                        style={{
                          background: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          padding: 'var(--space-1) var(--space-3)',
                          borderRadius: 'var(--radius-xl)',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        Featured
                      </span>
                    </div>
                    <Button 
                      as={Link} 
                      to={`/pandal/${pandal.id}`} 
                      className="btn-modern btn-outline-modern w-100"
                      style={{
                        background: 'transparent',
                        border: '2px solid var(--primary-500)',
                        color: 'var(--primary-600)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Explore More Section */}
        <div className="text-center mt-5">
          <Button 
            as={Link} 
            to="/map" 
            className="btn-explore"
            style={{
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4) var(--space-8)',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--shadow)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <i className="bi bi-compass"></i>
            Explore All Pandals
          </Button>
        </div>

        {/* Registration Modal */}
        <PandalRegistrationModal
          show={showRegisterModal}
          onHide={() => setShowRegisterModal(false)}
        />
      </Container>
    </>
  );
}

export default Home;