import React from 'react';
import { Container, Button } from 'react-bootstrap';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <Container className="mt-5 text-center">
      <h2 className="mb-4">Welcome to UtsavDarshan</h2>
      <p className="mb-4">Please sign in to continue</p>
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