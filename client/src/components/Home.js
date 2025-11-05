import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import PandalRegistrationModal from './PandalRegistrationModal';
import { Link } from 'react-router-dom';

function Home() {
  const [featuredPandals, setFeaturedPandals] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const featuredRef = useRef(null);

  // Scroll effect handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Intersection observer for fade-in animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      }, observerOptions);

      // Observe all fade-in elements
      document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFeaturedPandals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pandals');
        const data = await response.json();
        
        // Define our featured pandal IDs (Lalbaugcha Raja, GSB Seva Mandal, and Chinchpokli Chintamani)
        const featuredIds = [1, 2, 3]; // These should match your database IDs
        
        // Filter pandals by these IDs and ensure they exist
        const selectedPandals = featuredIds
          .map(id => data.find(p => p.id === id))
          .filter(p => p !== undefined);
        
        // If we don't have exactly 3 pandals, fall back to top rated ones
        if (selectedPandals.length !== 3) {
          console.log('Falling back to top rated pandals');
          // Remove duplicates and sort by rating
          const uniquePandals = Array.from(new Map(data.map(item => [item.id, item])).values());
          const sortedPandals = uniquePandals
            .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
            .filter(p => 
              // Ensure pandals are different by checking name and location
              !selectedPandals.some(sp => 
                sp.name === p.name || 
                sp.location === p.location
              )
            )
            .slice(0, 3 - selectedPandals.length);
            
          selectedPandals.push(...sortedPandals);
        }
        
        // Sort by rating to show highest rated first
        selectedPandals.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        setFeaturedPandals(selectedPandals);
      } catch (error) {
        console.error('Error fetching featured pandals:', error);
      }
    };

    fetchFeaturedPandals();
  }, []);

  return (
    <>
      {/* Hero Section with Parallax */}
      <div 
        className="hero-section" 
        style={{ 
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - scrollY / 500 
        }}
      >
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-3 fw-bold mb-4 hero-title">
                <span className="brand-gradient">Welcome to UtsavDarshan</span>
              </h1>
              <p className="lead fs-4 mb-5 hero-subtitle">
                Experience the Divine Spirit of Ganesh Chaturthi like never before. 
                Navigate Mumbai's most magnificent pandals with ease and devotion.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  as={Link} 
                  to="/explore" 
                  variant="primary" 
                  size="lg"
                  className="px-5 py-3"
                >
                  <i className="bi bi-compass me-2"></i>
                  Start Exploring
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg"
                  className="px-5 py-3"
                  onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="bi bi-info-circle me-2"></i>
                  Learn More
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* About Ganesh Chaturthi Section */}
      <section ref={aboutRef} className="py-5 bg-light fade-in-on-scroll">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="about-image-wrapper">
                <div className="gradient-border">
                  <img 
                    src="https://www.shutterstock.com/image-photo/mumbai-india-august-052017-thousands-260nw-714183676.jpg" 
                    alt="Ganesh Chaturthi celebration"
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ objectFit: 'cover', width: '100%', height: '400px' }}
                  />
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <h2 className="display-5 fw-bold mb-4" style={{ color: 'var(--ud-primary)' }}>
                <i className="bi bi-star-fill me-3"></i>
                The Significance of Ganesh Chaturthi
              </h2>
              <p className="fs-5 text-muted mb-4">
                Ganesh Chaturthi, also known as Vinayaka Chaturthi, is one of the most revered Hindu festivals 
                celebrating the birth of Lord Ganesha - the elephant-headed deity of wisdom, prosperity, and good fortune.
              </p>
              <p className="fs-6 mb-4">
                Celebrated with immense fervor across India, especially in Maharashtra, this 10-day festival brings 
                communities together in devotion, creativity, and cultural expression. From elaborate pandal decorations 
                to daily aartis and the grand visarjan (immersion) ceremony, every moment is filled with spiritual energy 
                and collective joy.
              </p>
              <div className="d-flex gap-4 flex-wrap">
                <div className="stat-card">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--ud-primary)' }}>10</h3>
                  <p className="text-muted mb-0">Days of Celebration</p>
                </div>
                <div className="stat-card">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--ud-secondary)' }}>1000+</h3>
                  <p className="text-muted mb-0">Pandals in Mumbai</p>
                </div>
                <div className="stat-card">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--ud-accent)' }}>Millions</h3>
                  <p className="text-muted mb-0">Devotees Visit</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How UtsavDarshan Helps Section */}
      <section ref={featuresRef} className="py-5 fade-in-on-scroll">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              <span className="brand-gradient">How UtsavDarshan Helps You</span>
            </h2>
            <p className="lead text-muted">Your intelligent companion for a seamless Ganpati darshan experience</p>
          </div>
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-map-fill" style={{ fontSize: '3rem', color: 'var(--ud-primary)' }}></i>
                  </div>
                  <h4 className="fw-bold mb-3">Smart Route Planning</h4>
                  <p className="text-muted">
                    Plan your visits efficiently with our intelligent route optimizer. Visit multiple pandals 
                    without the hassle of navigation, saving time and energy for more darshan.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-funnel-fill" style={{ fontSize: '3rem', color: 'var(--ud-secondary)' }}></i>
                  </div>
                  <h4 className="fw-bold mb-3">Sort by Crowd Levels</h4>
                  <p className="text-muted">
                    Filter and sort pandals based on current crowd levels to plan your visits strategically. 
                    Choose quieter times for a more peaceful darshan experience.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-heart-fill" style={{ fontSize: '3rem', color: '#E4004B' }}></i>
                  </div>
                  <h4 className="fw-bold mb-3">Curated Recommendations</h4>
                  <p className="text-muted">
                    Discover hidden gems and famous pandals based on ratings, themes, and proximity. 
                    Save your favorites and share them with friends and family.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-camera-fill" style={{ fontSize: '3rem', color: 'var(--ud-accent)' }}></i>
                  </div>
                  <h4 className="fw-bold mb-3">Visual Gallery</h4>
                  <p className="text-muted">
                    Browse stunning photos of pandal decorations and Ganesh idols before your visit. 
                    Get inspired and decide which pandals resonate with your spiritual journey.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-star-fill" style={{ fontSize: '3rem', color: 'var(--ud-primary)' }}></i>
                  </div>
                  <h4 className="fw-bold mb-3">Community Reviews</h4>
                  <p className="text-muted">
                    Read authentic reviews from fellow devotees to make informed decisions. 
                    Share your own experiences and help others discover amazing pandals.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-bookmark-fill" style={{ fontSize: '3rem', color: 'var(--ud-secondary)' }}></i>
                  </div>
                  <h4 className="fw-bold mb-3">Personalized Experience</h4>
                  <p className="text-muted">
                    Create your account to save your favorite pandals and 
                    share them with friends and family for a personalized darshan journey.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Pandals */}
      <section ref={featuredRef} className="py-5 bg-light fade-in-on-scroll">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              <span className="brand-gradient">Featured Pandals</span>
            </h2>
            <p className="lead text-muted">Discover Mumbai's most iconic and beloved Ganpati pandals</p>
          </div>
          <Row>
            {featuredPandals.map(pandal => (
              <Col key={pandal.id} md={4} className="mb-4">
                <Card className="pandal-card h-100 border-0 shadow-lg hover-lift">
                  <div className="card-image-wrapper overflow-hidden">
                    <Card.Img 
                      variant="top" 
                      src={pandal.imageUrl || '/images/placeholder.jpg'} 
                      className="pandal-image"
                      alt={pandal.name}
                      style={{ height: '250px', objectFit: 'cover' }}
                    />
                    <div className="card-overlay">
                      <span className="badge bg-primary">
                        <i className="bi bi-star-fill me-1"></i>
                        {pandal.rating}/5
                      </span>
                    </div>
                  </div>
                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title className="h5 mb-3 fw-bold">{pandal.name}</Card.Title>
                    <Card.Text className="text-muted mb-3">
                      <i className="bi bi-geo-alt-fill me-2" style={{ color: 'var(--ud-primary)' }}></i>
                      {pandal.location}
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        as={Link} 
                        to={`/pandal/${pandal.id}`} 
                        variant="primary" 
                        className="w-100"
                      >
                        <i className="bi bi-eye me-2"></i>
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Explore More Button */}
          <Row className="text-center mt-4">
            <Col>
              <Button 
                as={Link} 
                to="/explore" 
                variant="outline-primary" 
                size="lg" 
                className="px-5 py-3"
              >
                <i className="bi bi-compass me-2"></i>
                Explore All Pandals
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Registration Modal */}
      <PandalRegistrationModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      />
    </>
  );
}

// Enhanced CSS with scroll animations and hover effects
const styles = `
  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, rgba(228,0,75,0.05) 0%, rgba(237,119,90,0.05) 50%, rgba(250,214,145,0.05) 100%);
    padding: 80px 0;
    min-height: 75vh;
    display: flex;
    align-items: center;
  }

  .min-vh-75 {
    min-height: 75vh;
  }

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    animation: fadeInUp 0.8s ease-out;
  }

  .hero-subtitle {
    animation: fadeInUp 1s ease-out 0.2s backwards;
  }

  .brand-gradient {
    background: linear-gradient(135deg, #E4004B 0%, #ED775A 35%, #FAD691 70%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Fade in animations */
  .fade-in-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }

  .fade-in-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Stat Cards */
  .stat-card {
    padding: 1rem;
    border-left: 3px solid var(--ud-primary);
    transition: transform 0.3s ease;
  }

  .stat-card:hover {
    transform: translateX(10px);
  }

  /* Feature Cards - Inspired by reactbits.dev */
  .feature-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
    background: white;
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--ud-primary), var(--ud-secondary), var(--ud-accent));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  .feature-card:hover::before {
    transform: scaleX(1);
  }

  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(228, 0, 75, 0.15) !important;
  }

  .feature-icon {
    transition: transform 0.3s ease;
  }

  .feature-card:hover .feature-icon {
    transform: scale(1.1) rotate(5deg);
  }

  /* Pandal Cards with Hover Effects */
  .pandal-card {
    border-radius: 16px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .hover-lift:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 25px 50px rgba(228, 0, 75, 0.2) !important;
  }

  .card-image-wrapper {
    position: relative;
    border-radius: 16px 16px 0 0;
  }

  .pandal-image {
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px 16px 0 0;
  }

  .pandal-card:hover .pandal-image {
    transform: scale(1.15);
  }

  .card-overlay {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
  }

  .pandal-card:hover .card-overlay {
    opacity: 1;
    transform: translateY(0);
  }

  /* Gradient Border Effect */
  .gradient-border {
    padding: 4px;
    background: linear-gradient(135deg, var(--ud-primary), var(--ud-secondary), var(--ud-accent));
    border-radius: 20px;
    transition: transform 0.3s ease;
  }

  .gradient-border:hover {
    transform: scale(1.02);
  }

  .gradient-border img {
    display: block;
  }

  /* Button Enhancements */
  .btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .btn:hover::before {
    width: 300px;
    height: 300px;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(228, 0, 75, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero-section {
      padding: 60px 0;
    }
    
    .stat-card {
      margin-bottom: 1rem;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
if (!document.getElementById('home-styles')) {
  styleSheet.id = 'home-styles';
  document.head.appendChild(styleSheet);
}

export default Home;