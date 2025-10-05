import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, ListGroup } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

const RoutePlanner = ({ pandals }) => {
  const [selectedPandals, setSelectedPandals] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [route, setRoute] = useState(null);

  const handleSelectPandal = (pandalId) => {
    if (selectedPandals.includes(pandalId)) {
      setSelectedPandals(selectedPandals.filter(id => id !== pandalId));
    } else {
      setSelectedPandals([...selectedPandals, pandalId]);
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStartPoint({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const planRoute = async () => {
    if (!startPoint || selectedPandals.length === 0) {
      alert('Please select your starting point and at least one pandal.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/route-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pandals: selectedPandals,
          startPoint
        })
      });
      const data = await response.json();
      setRoute(data);
    } catch (error) {
      console.error('Error planning route:', error);
    }
  };

  return (
    <Container className="my-4">
      <h2>Plan Your Pandal Visit</h2>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Starting Point</Card.Title>
              <Button 
                variant="primary" 
                onClick={handleDetectLocation}
                className="w-100 mb-3"
              >
                Use My Location
              </Button>
              {startPoint && (
                <p className="mb-0">
                  Starting from: ({startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)})
                </p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Select Pandals</Card.Title>
              <ListGroup>
                {pandals.map(pandal => (
                  <ListGroup.Item 
                    key={pandal.id}
                    action
                    active={selectedPandals.includes(pandal.id)}
                    onClick={() => handleSelectPandal(pandal.id)}
                  >
                    {pandal.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button 
                variant="primary" 
                className="w-100 mt-3"
                onClick={planRoute}
                disabled={!startPoint || selectedPandals.length === 0}
              >
                Plan Route
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Body>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer 
                  center={[19.0760, 72.8777]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {startPoint && (
                    <Marker position={[startPoint.lat, startPoint.lng]}>
                      <Popup>Starting Point</Popup>
                    </Marker>
                  )}

                  {route && route.route.map((stop, index) => (
                    <React.Fragment key={stop.pandal.id}>
                      <Marker position={[stop.pandal.coordinates.lat, stop.pandal.coordinates.lng]}>
                        <Popup>
                          {index + 1}. {stop.pandal.name}
                          <br />
                          Distance: {stop.distance.toFixed(2)} km
                        </Popup>
                      </Marker>
                      {index < route.route.length - 1 && (
                        <Polyline 
                          positions={[
                            [stop.pandal.coordinates.lat, stop.pandal.coordinates.lng],
                            [route.route[index + 1].pandal.coordinates.lat, route.route[index + 1].pandal.coordinates.lng]
                          ]}
                          color="blue"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>

              {route && (
                <div className="mt-3">
                  <h5>Route Summary</h5>
                  <p>Total Distance: {route.totalDistance.toFixed(2)} km</p>
                  <p>Estimated Time: {Math.round(route.estimatedTime / 60)} hours {route.estimatedTime % 60} minutes</p>
                  <div className="route-stops">
                    {route.route.map((stop, index) => (
                      <div key={stop.pandal.id} className="mb-2 d-flex justify-content-between align-items-center">
                        <div>
                          {index + 1}. {stop.pandal.name}
                          {index < route.route.length - 1 && (
                            <small className="text-muted ms-2">
                              ({stop.distance.toFixed(2)} km to next)
                            </small>
                          )}
                        </div>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => {
                            if (!startPoint) return;
                            const origin = `${startPoint.lat},${startPoint.lng}`;
                            const destination = `${stop.pandal.coordinates.lat},${stop.pandal.coordinates.lng}`;
                            window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
                          }}
                        >
                          <i className="bi bi-geo-alt-fill"></i> Navigate
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-100 mt-3"
                    onClick={() => {
                      if (!startPoint || !route.route.length) return;
                      const waypoints = route.route.map(stop => 
                        `${stop.pandal.coordinates.lat},${stop.pandal.coordinates.lng}`
                      ).join('/');
                      window.open(`https://www.google.com/maps/dir/${startPoint.lat},${startPoint.lng}/${waypoints}`, '_blank');
                    }}
                  >
                    <i className="bi bi-map-fill me-2"></i>
                    Start Full Route in Google Maps
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RoutePlanner;