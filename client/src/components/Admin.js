import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert, Badge, Nav, Tab } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [pendingPandals, setPendingPandals] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [newPandal, setNewPandal] = useState({
    name: '',
    location: '',
    theme: '',
    lat: '',
    lng: '',
    description: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchPendingPandals();
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/feedbacks', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (err) {
      setError('Failed to fetch feedbacks');
    }
  };

  const fetchPendingPandals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pandals/pending', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setPendingPandals(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch pending pandals');
        console.error('Server error:', data.error);
      }
    } catch (err) {
      setError('Network error: Failed to fetch pending pandals');
      console.error('Network error:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pandals/${id}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Animate removal by filtering out the approved pandal
        setPendingPandals(prev => prev.filter(p => p.id !== id));
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (err) {
      setError('Failed to approve pandal');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pandals/${id}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Animate removal by filtering out the rejected pandal
        setPendingPandals(prev => prev.filter(p => p.id !== id));
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (err) {
      setError('Failed to reject pandal');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handlePandalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/pandals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newPandal)
      });

      if (response.ok) {
        setNewPandal({
          name: '',
          location: '',
          theme: '',
          lat: '',
          lng: '',
          description: ''
        });
        alert('Pandal added successfully!');
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (err) {
      setError('Failed to add pandal');
    }
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
          <br />
          {error.includes('admin privileges') && (
            <small>Please make sure you are logged in with an admin account.</small>
          )}
        </Alert>
        <Button variant="primary" onClick={() => setError('')}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <Tab.Container id="admin-tabs" defaultActiveKey="pendingPandals">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="pendingPandals">Pending Pandals</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="users">Users</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="addPandal">Add New Pandal</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="feedbacks">Feedbacks</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="pendingPandals">
            <h3 className="mb-3">Pending Pandal Registrations</h3>
            {pendingPandals.length === 0 ? (
              <p>No pending registrations</p>
            ) : (
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Amenities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {pendingPandals.map((pandal) => (
                      <motion.tr
                        key={pandal.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                        layout
                      >
                        <td>
                          <strong>{pandal.name}</strong>
                          <br />
                          <small className="text-muted">{pandal.description}</small>
                        </td>
                        <td>
                          {pandal.address}
                          <br />
                          <small className="text-muted">
                            {pandal.latitude}, {pandal.longitude}
                          </small>
                        </td>
                        <td>
                          {pandal.contact_number}
                          <br />
                          {pandal.email}
                        </td>
                        <td>
                          {pandal.wheelchair_accessible && (
                            <Badge bg="info" className="me-1">Wheelchair</Badge>
                          )}
                          {pandal.parking_available && (
                            <Badge bg="info" className="me-1">Parking</Badge>
                          )}
                          {pandal.food_available && (
                            <Badge bg="info" className="me-1">Food</Badge>
                          )}
                          {pandal.restroom_available && (
                            <Badge bg="info">Restroom</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApprove(pandal.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(pandal.id)}
                          >
                            Reject
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </Table>
            )}
          </Tab.Pane>
          
          <Tab.Pane eventKey="users">
            <h3 className="mb-3">Users</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Admin</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.display_name}</td>
                    <td>{user.email}</td>
                    <td>{user.is_admin ? 'Yes' : 'No'}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab.Pane>

          <Tab.Pane eventKey="addPandal">
            <h3 className="mb-3">Add New Pandal</h3>
            <Form onSubmit={handlePandalSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newPandal.name}
                  onChange={(e) => setNewPandal({...newPandal, name: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={newPandal.location}
                  onChange={(e) => setNewPandal({...newPandal, location: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Theme</Form.Label>
                <Form.Control
                  type="text"
                  value={newPandal.theme}
                  onChange={(e) => setNewPandal({...newPandal, theme: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  value={newPandal.lat}
                  onChange={(e) => setNewPandal({...newPandal, lat: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  value={newPandal.lng}
                  onChange={(e) => setNewPandal({...newPandal, lng: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newPandal.description}
                  onChange={(e) => setNewPandal({...newPandal, description: e.target.value})}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Add Pandal
              </Button>
            </Form>
          </Tab.Pane>

          <Tab.Pane eventKey="feedbacks">
            <h3 className="mb-3">User Feedbacks</h3>
            {feedbacks.length === 0 ? (
              <p>No feedbacks yet</p>
            ) : (
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>{feedback.email}</td>
                      <td>{feedback.message}</td>
                      <td>{new Date(feedback.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default Admin;
