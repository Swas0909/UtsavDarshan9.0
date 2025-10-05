import React, { useEffect, useState, useCallback } from 'react';
import { Container, Card, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Login from './Login';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritePandals, setFavoritePandals] = useState([]);
  const navigate = useNavigate();

  const fetchFavoritePandals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/user/favorites', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch favorites');
      }

      const data = await response.json();
      console.log('Fetched favorite pandals:', data);
      setFavoritePandals(data);
    } catch (err) {
      console.error('Failed to fetch favorite pandals:', err);
      setError('Failed to load your favorite pandals. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []); // No external dependencies needed

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/current-user', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          console.log('User authenticated:', data);
          window.localStorage.setItem('isAuthenticated', 'true');
          setUser(data);
        } else {
          console.log('No user data received');
          window.localStorage.removeItem('isAuthenticated');
          navigate('/login');
        }
      } else {
        console.log('Failed to fetch user profile');
        window.localStorage.removeItem('isAuthenticated');
        navigate('/login');
      }
    } catch (err) {
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Add navigate as dependency since it's used in the callback

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUser(null);
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to logout');
      }
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // fetchUserProfile is stable through useCallback

  useEffect(() => {
    if (user) {
      fetchFavoritePandals();
    }
  }, [user, fetchFavoritePandals]); // Both dependencies are stable

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Profile</h2>
        <Button variant="outline-danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <div 
              className="rounded-circle overflow-hidden me-3" 
              style={{ width: '100px', height: '100px' }}
            >
              <img 
                src={user.profile_picture || '/images/default-profile.svg'} 
                alt={user.display_name}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <div>
              <h3 className="mb-2">{user.display_name}</h3>
              <p className="text-muted mb-0">
                <i className="bi bi-envelope me-2"></i>
                {user.email}
              </p>
              {user.is_admin && (
                <Badge bg="primary" className="mt-2">Admin</Badge>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {user.is_admin && (
        <div className="mb-4">
          <Button as={Link} to="/admin" variant="primary">
            Go to Admin Dashboard
          </Button>
        </div>
      )}

      <h3 className="mb-4">Favorite Pandals</h3>
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {!error && favoritePandals.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-heart text-muted mb-3" style={{ fontSize: '2rem' }}></i>
            <p className="mb-3">You haven't added any pandals to your favorites yet.</p>
            <div className="d-flex justify-content-center gap-2">
              <Button as={Link} to="/explore" variant="primary">
                Explore Pandals
              </Button>
              <Button variant="outline-secondary" onClick={fetchFavoritePandals}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {favoritePandals.map(pandal => (
            <Col key={pandal.id} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Img 
                  variant="top" 
                  src={pandal.imageUrl || '/images/placeholder.jpg'} 
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
          ))}
        </Row>
      )}
    </Container>
  );
}

export default UserProfile;
