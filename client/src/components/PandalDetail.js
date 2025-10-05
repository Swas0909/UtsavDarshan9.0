import React, { useCallback, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import Reviews from './Reviews';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const PandalDetail = () => {
  const { id } = useParams();
  const [pandal, setPandal] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchPandalDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pandals/${id}`);
      const data = await response.json();
      setPandal(data);
    } catch (error) {
      console.error('Error fetching pandal details:', error);
    }
  }, [id]);

  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,        // 10 second timeout
        maximumAge: 0         // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords); // Debug log
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);

          // Format coordinates to 6 decimal places for accuracy
          const userLat = position.coords.latitude.toFixed(6);
          const userLng = position.coords.longitude.toFixed(6);
          const pandalLat = parseFloat(pandal.lat || 19.0760).toFixed(6);
          const pandalLng = parseFloat(pandal.lng || 72.8777).toFixed(6);

          // Open Google Maps with navigation directions
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${pandalLat},${pandalLng}&travelmode=driving`;
          console.log('Navigation URL:', url); // Debug log
          window.open(url, '_blank');
        },
        (error) => {
          setIsLoadingLocation(false);
          console.error('Geolocation error:', error);
          
          // Provide specific error messages
          switch(error.code) {
            case error.PERMISSION_DENIED:
              alert('Location permission denied. Please enable location services in your browser settings.');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('Location information is unavailable. Please try again or check your device\'s GPS settings.');
              break;
            case error.TIMEOUT:
              alert('Location request timed out. Please check your internet connection and try again.');
              break;
            default:
              alert('An unknown error occurred while getting your location. Please try again.');
          }
        },
        geolocationOptions
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolocation is not supported by your browser. Please use a modern browser with GPS support.');
    }
  }, [pandal]);

  useEffect(() => {
    fetchPandalDetails();
    
    // Check auth status and favorite status
    const checkAuthAndFavorite = async () => {
      try {
        const authResponse = await fetch('http://localhost:5000/api/current-user', {
          credentials: 'include'
        });
        if (authResponse.ok) {
          setIsAuthenticated(true);
          const favoriteResponse = await fetch(`http://localhost:5000/api/pandals/${id}/favorite`, {
            credentials: 'include'
          });
          if (favoriteResponse.ok) {
            const { isFavorite } = await favoriteResponse.json();
            setIsFavorite(isFavorite);
          }
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkAuthAndFavorite();
  }, [fetchPandalDetails, id]);

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
              <Card.Title className="h2">{pandal.name || 'Pandal Details'}</Card.Title>
              <div className="mb-3">
                {pandal.theme && (
                  <Badge bg="primary" className="me-2">{pandal.theme}</Badge>
                )}
                {pandal.crowdLevel && (
                  <Badge bg={pandal.crowdLevel === 'High' ? 'danger' : pandal.crowdLevel === 'Medium' ? 'warning' : 'success'}>
                    {pandal.crowdLevel} Crowd
                  </Badge>
                )}
              </div>
              <Card.Text>
                <h5>About</h5>
                <p>{pandal.description}</p>
                
                {pandal.history && (
                  <>
                    <h5>History</h5>
                    <p>{pandal.history}</p>
                  </>
                )}
                
                {pandal.location && (
                  <>
                    <h5>Location</h5>
                    <p>{pandal.location}</p>
                  </>
                )}
                
                {pandal.visitingHours && (
                  <>
                    <h5>Visiting Hours</h5>
                    <p>{pandal.visitingHours}</p>
                  </>
                )}
                
                {pandal.established && (
                  <>
                    <h5>Established</h5>
                    <p>{pandal.established}</p>
                  </>
                )}
                
                {pandal.features && pandal.features.length > 0 && (
                  <>
                    <h5>Special Features</h5>
                    <ul>
                      {pandal.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}

                <Reviews pandalId={pandal.id} />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                Quick Info
                <Button
                  variant="link"
                  className="p-0 favorite-btn"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      window.location.href = '/login';
                      return;
                    }
                    try {
                      const response = await fetch(`http://localhost:5000/api/pandals/${id}/favorite`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ action: isFavorite ? 'remove' : 'add' })
                      });
                      if (response.ok) {
                        setIsFavorite(!isFavorite);
                      }
                    } catch (error) {
                      console.error('Error updating favorite:', error);
                    }
                  }}
                >
                  <i className={`bi bi-heart${isFavorite ? '-fill text-danger' : ''}`} style={{ fontSize: '1.5rem' }}></i>
                </Button>
              </Card.Title>
              <p><strong>Rating:</strong> {pandal.rating || 'N/A'}{pandal.rating ? '/5' : ''}</p>
              {pandal.bestTimeToVisit && (
                <p><strong>Best Time to Visit:</strong> {pandal.bestTimeToVisit}</p>
              )}
              <p><strong>Wheelchair Accessible:</strong> {pandal.wheelchairAccessible === true ? 'Yes' : pandal.wheelchairAccessible === false ? 'No' : 'Unknown'}</p>
              <p><strong>Parking Available:</strong> {pandal.parkingAvailable === true ? 'Yes' : pandal.parkingAvailable === false ? 'No' : 'Unknown'}</p>
              <button 
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="btn btn-primary w-100 mt-3"
              >
                {isLoadingLocation ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Getting Precise Location...
                  </>
                ) : (
                  <>
                    <i className="bi bi-compass-fill me-2"></i>
                    Start Navigation
                  </>
                )}
              </button>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Location Map</Card.Title>
              <div style={{ height: '300px', width: '100%' }}>
                <MapContainer 
                  center={[pandal.lat || 19.0760, pandal.lng || 72.8777]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[pandal.lat || 19.0760, pandal.lng || 72.8777]}>
                    <Popup>
                      {pandal.name}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PandalDetail;