import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

function PandalRegistrationModal({ show, onHide, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    contact_number: '',
    email: '',
    website: '',
    opening_hours: '',
    closing_hours: '',
    wheelchair_accessible: false,
    parking_available: false,
    food_available: false,
    restroom_available: false,
    photo_url: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Check if user is authenticated
    const isAuthenticated = window.localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      setError('Please log in to register a pandal');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/pandal-registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        if (typeof onRegistrationSuccess === 'function') {
          onRegistrationSuccess();
        }
        onHide();
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          window.localStorage.removeItem('isAuthenticated');
          setError('Please log in to register a pandal');
        } else {
          setError(errorData.message || 'Failed to register pandal');
        }
      }
    } catch (error) {
      console.error('Error submitting pandal registration:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Register New Pandal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Registration submitted successfully! Awaiting admin approval.</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Pandal Name*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address*</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="row">
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Latitude*</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Longitude*</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="row">
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Opening Hours*</Form.Label>
                <Form.Control
                  type="time"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Closing Hours*</Form.Label>
                <Form.Control
                  type="time"
                  name="closing_hours"
                  value={formData.closing_hours}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Photo URL</Form.Label>
            <Form.Control
              type="url"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="row mb-3">
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Wheelchair Accessible"
                name="wheelchair_accessible"
                checked={formData.wheelchair_accessible}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Parking Available"
                name="parking_available"
                checked={formData.parking_available}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Food Available"
                name="food_available"
                checked={formData.food_available}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Restroom Available"
                name="restroom_available"
                checked={formData.restroom_available}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PandalRegistrationModal;