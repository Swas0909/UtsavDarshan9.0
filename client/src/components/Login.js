import React, { useState, useEffect } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check for error in URL parameters
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, [location]);

  const handleGoogleLogin = () => {
    try {
      window.location.href = 'http://localhost:5000/auth/google';
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
    }
  };

  return (
    <Container className="mt-5 text-center">
      <h2 className="mb-4">Welcome to UtsavDarshan</h2>
      <p className="mb-4">Please sign in to continue</p>
      
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Button 
        variant="light" 
        className="d-flex align-items-center mx-auto" 
        onClick={handleGoogleLogin}
      >
        <img 
          src="/google-logo.svg" 
          alt="Google" 
          style={{ width: '20px', marginRight: '10px' }} 
        />
        Sign in with Google
      </Button>
    </Container>
  );
};

export default Login;