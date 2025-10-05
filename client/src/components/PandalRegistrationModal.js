import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

function PandalRegistrationModal({ show, onHide }) {
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
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/pandals/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit pandal registration. Please ensure you are logged in.');
      }

      setSuccess(true);
      setTimeout(() => {
        onHide();
        setSuccess(false);
        setFormData({
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
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="warm-modal">
      <Modal.Header closeButton className="warm-modal-header">
        <Modal.Title>Register New Pandal</Modal.Title>
      </Modal.Header>
      <Modal.Body className="warm-modal-body">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Registration submitted successfully! Awaiting admin approval.</Alert>}
        
        <Form onSubmit={handleSubmit} className="warm-form">
          <Form.Group className="mb-3">
            <Form.Label>Pandal Name*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="warm-input"
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
              className="warm-input"
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
              className="warm-input"
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
                  className="warm-input"
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
                  className="warm-input"
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
                  className="warm-input"
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
                  className="warm-input"
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
              className="warm-input"
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
                  className="warm-input"
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
                  className="warm-input"
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
              className="warm-input"
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
                className="warm-checkbox"
              />
            </div>
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Parking Available"
                name="parking_available"
                checked={formData.parking_available}
                onChange={handleChange}
                className="warm-checkbox"
              />
            </div>
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Food Available"
                name="food_available"
                checked={formData.food_available}
                onChange={handleChange}
                className="warm-checkbox"
              />
            </div>
            <div className="col">
              <Form.Check
                type="checkbox"
                label="Restroom Available"
                name="restroom_available"
                checked={formData.restroom_available}
                onChange={handleChange}
                className="warm-checkbox"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2 warm-btn-cancel">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={submitting}
              className="warm-btn-submit"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Warm color styles and effects
const styles = `
  .warm-modal .modal-content {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(253, 160, 133, 0.4);
  }
  .warm-modal-header {
    background-color: #fda085;
    color: white;
    font-weight: bold;
    border-bottom: none;
  }
  .warm-modal-body {
    background-color: #fff5f0;
  }
  .warm-form .form-control {
    border: 2px solid #f6d365;
    border-radius: 8px;
    padding: 10px;
    transition: border-color 0.3s ease;
  }
  .warm-form .form-control:focus {
    border-color: #fda085;
    box-shadow: 0 0 8px #fda085;
  }
  .warm-input {
    background-color: #fff8f5;
  }
  .warm-checkbox .form-check-input:checked {
    background-color: #fda085;
    border-color: #fda085;
  }
  .warm-btn-cancel {
    background-color: #f6d365;
    border: none;
    color: #fff;
    transition: background-color 0.3s ease;
  }
  .warm-btn-cancel:hover {
    background-color: #fda085;
  }
  .warm-btn-submit {
    background-color: #fda085;
    border: none;
    color: #fff;
    transition: background-color 0.3s ease;
  }
  .warm-btn-submit:hover {
    background-color: #f6d365;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default PandalRegistrationModal;
