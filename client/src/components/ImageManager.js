import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Modal } from 'react-bootstrap';

const ImageManager = () => {
  const [pandals, setPandals] = useState([]);
  const [selectedPandal, setSelectedPandal] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPandals();
  }, []);

  const fetchPandals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pandals');
      const data = await response.json();
      setPandals(data);
    } catch (error) {
      console.error('Error fetching pandals:', error);
      setMessage({ type: 'danger', text: 'Failed to load pandals' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'warning', text: 'Image must be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'warning', text: 'Please select an image file' });
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImage = async (pandalId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare the data
      let updateData = {};
      
      if (imageFile) {
        // File upload not implemented yet - use URL method
        setMessage({ type: 'warning', text: 'File upload feature coming soon! Please use URL for now.' });
        setLoading(false);
        return;
      } else if (imageUrl) {
        updateData.image_url = imageUrl;
      } else {
        setMessage({ type: 'warning', text: 'Please provide an image URL' });
        setLoading(false);
        return;
      }

      // Update pandal with image URL
      const response = await fetch(`http://localhost:5000/api/admin/pandals/${pandalId}/image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Image updated successfully!' });
        fetchPandals();
        setShowModal(false);
        setImageUrl('');
        setImageFile(null);
        setImagePreview(null);
      } else {
        const error = await response.json();
        setMessage({ type: 'danger', text: error.message || 'Failed to update image' });
      }
    } catch (error) {
      console.error('Error updating image:', error);
      setMessage({ type: 'danger', text: 'An error occurred while updating the image' });
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (pandal) => {
    setSelectedPandal(pandal);
    setImageUrl(pandal.imageUrl || '');
    setImagePreview(pandal.imageUrl || null);
    setShowModal(true);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Pandal Image Manager</h2>
      
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
          {message.text}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Current Image</th>
                <th>Image URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pandals.map(pandal => (
                <tr key={pandal.id}>
                  <td>{pandal.id}</td>
                  <td>{pandal.name}</td>
                  <td>
                    {pandal.imageUrl ? (
                      <img 
                        src={pandal.imageUrl} 
                        alt={pandal.name}
                        style={{ width: '100px', height: '75px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td>
                    <small className="text-break">
                      {pandal.imageUrl || 'Not set'}
                    </small>
                  </td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => openImageModal(pandal)}
                    >
                      Update Image
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Image Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Image for {selectedPandal?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://example.com/image.jpg or /images/pandals/image.jpg"
              />
              <Form.Text className="text-muted">
                Enter the image URL (can be external URL or local path)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Or Upload Image (Coming Soon)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled
              />
              <Form.Text className="text-muted">
                File upload feature will be available soon. Use URL method for now.
              </Form.Text>
            </Form.Group>

            {imagePreview && (
              <div className="mb-3">
                <Form.Label>Preview:</Form.Label>
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              </div>
            )}
          </Form>

          <Alert variant="info">
            <strong>Image Options:</strong>
            <ul className="mb-0 mt-2">
              <li><strong>Local images:</strong> Place in <code>client/public/images/pandals/</code> and use path: <code>/images/pandals/your-image.jpg</code></li>
              <li><strong>External URLs:</strong> Upload to Imgur, Cloudinary, etc. and paste the direct image URL</li>
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleUpdateImage(selectedPandal.id)}
            disabled={loading || !imageUrl}
          >
            {loading ? 'Updating...' : 'Update Image'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Quick Guide */}
      <Card className="mt-4">
        <Card.Header>
          <strong>Quick Guide: Adding Images</strong>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Method 1: Local Images</h6>
              <ol>
                <li>Place image in: <code>client/public/images/pandals/</code></li>
                <li>Use path: <code>/images/pandals/your-image.jpg</code></li>
              </ol>
            </Col>
            <Col md={6}>
              <h6>Method 2: External URLs</h6>
              <ol>
                <li>Upload to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer">Imgur</a> or similar</li>
                <li>Copy direct image URL</li>
                <li>Paste in the Image URL field</li>
              </ol>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ImageManager;
