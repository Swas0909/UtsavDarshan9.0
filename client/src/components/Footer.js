import React from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

function Footer() {
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
            <Button variant="outline-primary">Register Now</Button>
          </Col>

          <Col md={4}>
            <h5>Feedback</h5>
            <Form className="feedback-form">
              <Form.Group className="mb-3">
                <Form.Control type="email" placeholder="Your email" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control as="textarea" rows={3} placeholder="Your feedback" />
              </Form.Group>
              <Button variant="primary" type="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;