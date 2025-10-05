import React, { useEffect } from 'react';
import { Container, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Login from './Login';

function UserProfile() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const response = await fetch('http://localhost:5000/api/current-user', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }

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
        // Clear any local user data
        setUser(null);
        // Redirect to login page
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to logout');
      }
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <p>Loading...</p>
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
    </Container>
  );
}

export default UserProfile;