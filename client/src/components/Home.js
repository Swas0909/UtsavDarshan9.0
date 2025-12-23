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
        <div className="hero-content">
          <h1 className="hero-headline">
            Discover Mumbai's Ganpati Pandals, Effortlessly.
          </h1>
          <p className="hero-subheading">
            Explore iconic pandals, plan smarter routes, and experience Ganesh Chaturthi with clarity and devotion.
          </p>
          <div className="hero-buttons">
            <Button 
              className="btn-primary-saffron"
              onClick={() => featuredRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Exploring
            </Button>
          </div>
        </div>
      </div>

      {/* About Ganesh Chaturthi Section */}
      <section ref={aboutRef} className="py-5 fade-in-on-scroll" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="about-image-wrapper">
                <div className="gradient-border">
                  <img 
                    src="https://lalbaugcharaja.com/wp-content/uploads/2023/11/DSC07008-scaled.jpg" 
                    alt="Ganesh Chaturthi celebration"
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ objectFit: 'cover', width: '100%', height: '400px' }}
                  />
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <h2 className="display-5 fw-bold mb-4" style={{ color: 'var(--text-on-light-primary)' }}>
                <i className="bi bi-star-fill me-3" style={{ color: '#D9480F' }}></i>
                The Significance of Ganesh Chaturthi
              </h2>
              <p className="fs-5 text-muted mb-4" style={{ color: 'var(--text-on-light-secondary)' }}>
                Ganesh Chaturthi, also known as Vinayaka Chaturthi, is one of the most revered Hindu festivals 
                celebrating the birth of Lord Ganesha - the elephant-headed deity of wisdom, prosperity, and good fortune.
              </p>
              <p className="fs-6 mb-4" style={{ color: 'var(--text-on-light-secondary)' }}>
                Celebrated with immense fervor across India, especially in Maharashtra, this 10-day festival brings 
                communities together in devotion, creativity, and cultural expression. From elaborate pandal decorations 
                to daily aartis and the grand visarjan (immersion) ceremony, every moment is filled with spiritual energy 
                and collective joy.
              </p>
              <div className="d-flex gap-4 flex-wrap">
                <div className="stat-card">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--color-saffron)' }}>10</h3>
                  <p className="text-muted mb-0" style={{ color: 'var(--text-on-light-secondary)' }}>Days of Celebration</p>
                </div>
                <div className="stat-card">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--color-saffron)' }}>1000+</h3>
                  <p className="text-muted mb-0" style={{ color: 'var(--text-on-light-secondary)' }}>Pandals in Mumbai</p>
                </div>
                <div className="stat-card">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--color-saffron)' }}>Millions</h3>
                  <p className="text-muted mb-0">Devotees Visit</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How UtsavDarshan Helps Section */}
      <section ref={featuresRef} className="py-5 fade-in-on-scroll" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-on-light-primary)' }}>
              <span className="brand-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #D9480F, #CFAE70)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>How UtsavDarshan Helps You</span>
            </h2>
            <p className="lead" style={{ color: 'var(--text-on-light-secondary)' }}>Your intelligent companion for a seamless Ganpati darshan experience</p>
          </div>
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4 text-center">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-map-fill" style={{ fontSize: '3rem', color: '#D9480F' }}></i>
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
                    <i className="bi bi-funnel-fill" style={{ fontSize: '3rem', color: '#CFAE70' }}></i>
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
                    <i className="bi bi-camera-fill" style={{ fontSize: '3rem', color: '#D9480F' }}></i>
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
                    <i className="bi bi-star-fill" style={{ fontSize: '3rem', color: '#D9480F' }}></i>
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
                    <i className="bi bi-bookmark-fill" style={{ fontSize: '3rem', color: '#CFAE70' }}></i>
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
      <section ref={featuredRef} className="py-5 fade-in-on-scroll" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-on-light-primary)' }}>
              <span className="brand-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #D9480F, #CFAE70)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Featured Pandals</span>
            </h2>
            <p className="lead" style={{ color: 'var(--text-on-light-secondary)' }}>Discover Mumbai's most iconic and beloved Ganpati pandals</p>
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
                    <Card.Title className="h5 mb-3 fw-bold" style={{ color: 'var(--text-on-light-primary)' }}>{pandal.name}</Card.Title>
                    <Card.Text className="text-muted mb-3" style={{ color: 'var(--text-on-light-secondary)' }}>
                      <i className="bi bi-geo-alt-fill me-2" style={{ color: '#D9480F' }}></i>
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
  /* Import Premium Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500&display=swap');

  /* Hero Section - Premium Devotional Design */
  .hero-section {
    min-height: 100vh;
    width: 100vw;
    position: relative;
    background: url('/images/ganesh-hero.jpg') center top / cover fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding-top: var(--navbar-height);
  }

  /* Radial Gradient Overlay */
  .hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.35) 0%,
      rgba(0, 0, 0, 0.55) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
    z-index: 1;
  }

  /* Fade Gradient at Bottom */
  .hero-section::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(
      to bottom,
      rgba(11, 11, 11, 0),
      #0B0B0B
    );
    z-index: 2;
    pointer-events: none;
  }

  /* Hero Content Container */
  .hero-content {
    position: relative;
    z-index: 3;
    max-width: var(--max-width-container);
    margin: 0 auto;
    padding: 0 var(--padding-container-desktop);
    text-align: center;
    transform: translateY(-60px);
  }

  /* Hero Headline */
  .hero-headline {
    font-family: var(--font-display);
    font-weight: var(--text-h1-weight);
    font-size: var(--text-h1-size);
    line-height: var(--text-h1-line-height);
    color: var(--color-ivory);
    letter-spacing: var(--letter-spacing-tight);
    margin: 0 0 16px 0;
    animation: fadeInUp 0.8s ease-out;
  }

  /* Hero Subheading */
  .hero-subheading {
    font-family: var(--font-body);
    font-size: var(--text-body-regular-size);
    line-height: var(--text-body-regular-line-height);
    color: rgba(255, 240, 220, 0.85);
    max-width: 680px;
    margin: 16px auto 28px;
    font-weight: var(--text-body-regular-weight);
    animation: fadeInUp 0.8s ease-out 0.15s backwards;
  }

  /* Hero Buttons Container */
  .hero-buttons {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
    flex-wrap: wrap;
    animation: fadeInUp 0.8s ease-out 0.3s backwards;
  }

  /* Primary CTA - Saffron Button */
  .btn-primary-saffron {
    background-color: var(--color-saffron);
    color: white;
    border: none;
    padding: var(--button-padding-y) var(--button-padding-x);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 15px;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    min-height: var(--button-min-height);
  }

  .btn-primary-saffron:hover {
    background-color: #c23d0c;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    color: white;
    text-decoration: none;
  }

  .btn-primary-saffron:active {
    transform: translateY(0);
  }

  /* Secondary CTA - Outline Button */
  .btn-secondary-outline {
    background-color: transparent;
    color: var(--color-ivory);
    border: 1px solid var(--color-border-strong);
    padding: var(--button-padding-y) var(--button-padding-x);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 15px;
    transition: all var(--transition-fast);
    cursor: pointer;
    position: relative;
    min-height: var(--button-min-height);
  }

  .btn-secondary-outline:hover {
    background-color: rgba(246, 231, 193, 0.1);
    border-color: rgba(246, 231, 193, 0.9);
    color: var(--color-ivory);
    text-decoration: none;
    transform: translateY(-1px);
  }

  .btn-secondary-outline:active {
    transform: translateY(0);
  }

  /* Fade in animations */
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

  .fade-in-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }

  .fade-in-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }

  /* Feature Cards - Inspired by reactbits.dev */
  .feature-card {
    transition: all var(--transition-normal);
    border-radius: var(--radius-lg);
    background: var(--color-surface-dark);
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border-light);
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--color-saffron), var(--color-gold-muted));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--transition-normal);
  }

  .feature-card:hover::before {
    transform: scaleX(1);
  }

  .feature-card:hover {
    transform: translateY(-8px);
    border-color: var(--color-border-medium);
    box-shadow: var(--shadow-md);
  }

  .feature-icon {
    transition: transform var(--transition-normal);
  }

  .feature-card:hover .feature-icon {
    transform: scale(1.1) rotate(5deg);
  }

  /* Pandal Cards with Hover Effects */
  .pandal-card {
    border-radius: var(--radius-lg);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
    background: var(--color-surface-dark);
    border: 1px solid var(--color-border-light);
  }

  .hover-lift:hover {
    transform: translateY(-12px);
    border-color: var(--color-border-medium);
    box-shadow: var(--shadow-lg);
  }

  .card-image-wrapper {
    position: relative;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    overflow: hidden;
  }

  .pandal-image {
    transition: transform var(--transition-slow);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    display: block;
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .pandal-card:hover .pandal-image {
    transform: scale(1.15);
  }

  .card-overlay {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    z-index: 10;
    opacity: 0;
    transform: translateY(-10px);
    transition: all var(--transition-normal);
  }

  .pandal-card:hover .card-overlay {
    opacity: 1;
    transform: translateY(0);
  }

  /* Gradient Border Effect */
  .gradient-border {
    padding: 4px;
    background: linear-gradient(135deg, var(--color-saffron), var(--color-gold-muted));
    border-radius: var(--radius-xl);
    transition: transform var(--transition-normal);
  }

  .gradient-border:hover {
    transform: scale(1.02);
  }

  .gradient-border img {
    display: block;
    border-radius: var(--radius-xl);
  }

  /* Stat Cards */
  .stat-card {
    padding: var(--space-sm);
    border-left: 3px solid var(--color-saffron);
    transition: transform var(--transition-normal);
  }

  .stat-card:hover {
    transform: translateX(10px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero-section {
      min-height: calc(100vh - 56px);
      padding-top: 0;
    }

    .hero-content {
      transform: translateY(-40px);
      padding: 0 var(--padding-container-mobile);
    }

    .hero-headline {
      font-size: clamp(28px, 5vw, 42px);
    }

    .hero-buttons {
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
    }

    .btn-primary-saffron,
    .btn-secondary-outline {
      width: 100%;
      max-width: 280px;
    }

    .stat-card {
      margin-bottom: var(--space-md);
    }

    .about-image-wrapper {
      margin-bottom: var(--space-md);
    }
  }

  /* Prefers Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
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