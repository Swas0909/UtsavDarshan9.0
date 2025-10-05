import React, { useCallback, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal } from 'react-bootstrap';
import Reviews from './Reviews';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import NavigationMap from './NavigationMap';

const PandalDetail = () => {
  const { id } = useParams();
  const [pandal, setPandal] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);

  const fetchPandalDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pandals/${id}`);
      const data = await response.json();
      setPandal(data);
    } catch (error) {
      console.error('Error fetching pandal details:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchPandalDetails();
  }, [fetchPandalDetails]);

  if (!pandal) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Img 
              variant="top" 
              src={pandal.imageUrl} 
              alt={pandal.name}
              style={{ height: '400px', objectFit: 'cover' }}
            />
            <Card.Body>
              <Card.Title className="h2">{pandal.name}</Card.Title>
              <div className="mb-3">
                <Badge bg="primary" className="me-2">{pandal.theme}</Badge>
                <Badge bg={pandal.crowdLevel === 'High' ? 'danger' : pandal.crowdLevel === 'Medium' ? 'warning' : 'success'}>
                  {pandal.crowdLevel} Crowd
                </Badge>
              </div>
              <Card.Text>
                <h5>About</h5>
                <p>{pandal.description}</p>
                
                <h5>History</h5>
                <p>{pandal.history}</p>
                
                <h5>Location</h5>
                <p>{pandal.location}</p>
                
                <h5>Visiting Hours</h5>
                <p>{pandal.visitingHours}</p>
                
                <h5>Established</h5>
                <p>{pandal.established}</p>
                
                <h5>Special Features</h5>
                <ul>
                  {pandal.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <Reviews pandalId={pandal.id} />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Quick Info</Card.Title>
              <p><strong>Rating:</strong> {pandal.rating}/5</p>
              <p><strong>Best Time to Visit:</strong> {pandal.bestTimeToVisit}</p>
              <p><strong>Wheelchair Accessible:</strong> {pandal.wheelchairAccessible ? 'Yes' : 'No'}</p>
              <p><strong>Parking Available:</strong> {pandal.parkingAvailable ? 'Yes' : 'No'}</p>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Location Map</Card.Title>
              <div style={{ height: '300px', width: '100%' }}>
                <MapContainer 
                  center={[pandal.coordinates.lat, pandal.coordinates.lng]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[pandal.coordinates.lat, pandal.coordinates.lng]}>
                    <Popup>
                      {pandal.name}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Card.Body>
          </Card>

          {/* Navigation Button */}
          <Button 
            variant="success" 
            size="lg" 
            className="mt-3 w-100"
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    // Updated URL with navigation mode and necessary parameters
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${position.coords.latitude},${position.coords.longitude}&destination=${pandal.coordinates.lat},${pandal.coordinates.lng}&travelmode=driving&dir_action=navigate`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  },
                  (error) => {
                    alert('Please enable location services to use navigation. Error: ' + error.message);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                  }
                );
              } else {
                alert('Geolocation is not supported by your browser');
              }
            }}
          >
            <i className="bi bi-google me-2"></i> Navigate with Google Maps
          </Button>

        </Col>
      </Row>
    </Container>
  );
};

export default PandalDetail;