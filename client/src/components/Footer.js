import React, { useState } from 'react';

import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PandalRegistrationModal from './PandalRegistrationModal';

function Footer({ user }) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      setShowRegisterModal(true);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: feedbackEmail,
          message: feedbackText
        })
      });

      if (response.ok) {
        setFeedbackEmail('');
        setFeedbackText('');
        alert('Thank you for your feedback!');
      } else {
        const error = await response.json();
        alert('Failed to submit feedback: ' + error.error);
      }
    } catch (err) {
      alert('Error submitting feedback. Please try again.');
    }
  };

  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Contact Us</h5>
            <p>Email: contact@utsavdarshan.com</p>
            <p>Phone: +91 XXXXXXXXXX</p>
          </Col>
          
          <Col md={4}>
            <h5>Register Your Pandal</h5>
            <Button 
              variant="success" 
              onClick={handleRegisterClick}
              className="register-pandal-btn"
            >
              {user ? 'Register Your Pandal' : 'Login to Register'}
            </Button>
          </Col>

          <Col md={4}>
            <h5>Feedback</h5>
            <Form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <Form.Group className="mb-3">
                <Form.Control 
                  type="email" 
                  placeholder="Your email" 
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  placeholder="Your feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>

      <PandalRegistrationModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      />

      <style jsx="true">{`
        .footer {
          padding: 2rem 0;
          background-color: #f8f9fa;
          margin-top: 3rem;
        }
        .register-pandal-btn {
          padding: 0.5rem 1.5rem;
          font-weight: 500;
        }
        .feedback-form {
          max-width: 100%;
        }
      `}</style>
    </footer>
  );
}

export default Footer;