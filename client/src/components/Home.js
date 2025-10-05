import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PandalRegistrationModal from './PandalRegistrationModal';
import HeroExperience from './HeroExperience';
import { Link } from 'react-router-dom';

function Home() {
  const [featuredPandals, setFeaturedPandals] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    const fetchFeaturedPandals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pandals');
        const data = await response.json();
        // Get top 3 highest rated pandals
        const topPandals = data
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setFeaturedPandals(topPandals);
      } catch (error) {
        console.error('Error fetching featured pandals:', error);
      }
    };

    fetchFeaturedPandals();
  }, []);

  return (
    <Container className="home-container">
      <HeroExperience />

      {/* Featured Pandals */}
      <h2 className="mb-4">Featured Pandals</h2>
      <Row>
        {featuredPandals.map(pandal => {
          const imageName = pandal.name.toLowerCase().replace(/ /g, '-').replace(/cha/g, '').replace(/icha/g, '').replace(/licha/g, 'li') + '.jpg';
          return (
            <Col key={pandal.id} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={`/images/pandals/${imageName}`}
                  className="pandal-image"
                  alt={pandal.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5 mb-2">{pandal.name}</Card.Title>
                <Card.Text className="text-muted mb-2">
                  📍 {pandal.location}
                </Card.Text>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <span className="text-warning me-1">⭐</span>
                      <span>{pandal.rating}/5</span>
                    </div>
                  </div>
                  <Button 
                    as={Link} 
                    to={`/pandal/${pandal.id}`} 
                    variant="outline-primary" 
                    className="w-100"
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          );
        })}
      </Row>

      {/* Explore More Button */}
      <Row className="text-center">
        <Col>
          <Button 
            as={Link} 
            to="/explore" 
            variant="primary" 
            size="lg" 
            className="explore-more-btn"
          >
            Explore More Pandals
          </Button>
        </Col>
      </Row>

      {/* Registration Modal */}
      <PandalRegistrationModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      />
    </Container>
  );
}

// Add hover effects with CSS
const styles = `
  .card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  .pandal-image {
    transition: transform 0.3s ease-in-out;
    border-radius: 8px 8px 0 0;
  }

  .card:hover .pandal-image {
    transform: scale(1.05);
  }

  .card-body {
    padding: 1.25rem;
  }

  .card-title {
    font-weight: 600;
    color: #2c3e50;
  }

  .text-muted {
    color: #6c757d !important;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Home;
