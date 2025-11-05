import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, ListGroup, Form } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

const RoutePlanner = ({ pandals }) => {
  const [selectedPandals, setSelectedPandals] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritePandals, setFavoritePandals] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/current-user', {
          credentials: 'include'
        });
        const userData = await response.json();

        if (response.ok && userData) {
          setIsAuthenticated(true);
          const favResponse = await fetch('http://localhost:5000/api/user/favorites', {
            credentials: 'include'
          });
          if (favResponse.ok) {
            const favPandals = await favResponse.json();
            setFavorites(favPandals.map(p => p.id));
            setFavoritePandals(favPandals);
          }
        } else {
          setIsAuthenticated(false);
          setFavorites([]);
          setFavoritePandals([]);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setFavorites([]);
        setFavoritePandals([]);
      }
    };

    checkAuthAndFetchFavorites();
  }, []);

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

  const displayedPandals = showFavorites ? favoritePandals : pandals;

  const handleAddAllFavorites = () => {
    const favoriteIds = favoritePandals.map(p => p.id);
    setSelectedPandals([...new Set([...selectedPandals, ...favoriteIds])]);
  };

  return (
    <>
      <div className="ud-hero py-4 mb-4">
        <Container>
          <h2 className="mb-0 fw-bold" style={{ color: 'var(--ud-primary)' }}>
            <i className="bi bi-map me-2"></i>
            Plan Your Pandal Route
          </h2>
          <p className="text-muted mb-0 mt-2">Select your starting point and favorite pandals to create an optimized route</p>
        </Container>
      </div>
      <Container className="mb-4">
      <Row>
        <Col md={4}>
          <Card className="mb-4 ud-card">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center">
                <i className="bi bi-geo-fill me-2" style={{ color: 'var(--ud-primary)' }}></i>
                Starting Point
              </Card.Title>
              <Button 
                variant="primary" 
                onClick={handleDetectLocation}
                className="w-100 mb-3"
              >
                <i className="bi bi-crosshair me-2"></i>
                Detect My Location
              </Button>
              {startPoint && (
                <div className="alert alert-success mb-0 py-2 px-3">
                  <small className="d-block">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Location set: {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="ud-card">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-list-check me-2" style={{ color: 'var(--ud-primary)' }}></i>
                  Select Pandals
                </span>
              </Card.Title>
              {isAuthenticated && favoritePandals.length > 0 && (
                <div className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="show-favorites-switch"
                    label={<span><i className="bi bi-heart-fill text-danger me-1"></i>Show My Favorites ({favoritePandals.length})</span>}
                    checked={showFavorites}
                    onChange={(e) => setShowFavorites(e.target.checked)}
                    className="mb-2"
                  />
                  {showFavorites && (
                    <Button variant="primary" size="sm" className="w-100 mb-2" onClick={handleAddAllFavorites}>
                      <i className="bi bi-heart-fill me-2"></i>
                      Add All Favorites to Route
                    </Button>
                  )}
                </div>
              )}
              <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '8px' }}>
                <ListGroup>
                  {displayedPandals.map(pandal => {
                    const isSelected = selectedPandals.includes(pandal.id);
                    return (
                      <ListGroup.Item 
                        key={pandal.id}
                        action
                        onClick={() => handleSelectPandal(pandal.id)}
                        className="d-flex justify-content-between align-items-center"
                        style={{ 
                          background: isSelected ? 'rgba(228,0,75,0.08)' : 'transparent',
                          color: isSelected ? 'rgba(0,0,0,0.8)' : 'inherit',
                          borderLeft: isSelected ? '3px solid var(--ud-primary)' : 'none', 
                          transition: 'all 0.2s ease' 
                        }}
                      >
                        <span>
                          {favorites.includes(pandal.id) && <i className="bi bi-heart-fill text-danger me-2"></i>}
                          {pandal.name}
                        </span>
                        {isSelected && <i className="bi bi-check-circle-fill" style={{ color: 'var(--ud-primary)' }}></i>}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </div>
              {selectedPandals.length > 0 && (
                <div className="mt-3 d-flex flex-wrap gap-1">
                  {selectedPandals.map(id => {
                    const p = displayedPandals.find(x => x.id === id);
                    if (!p) return null;
                    return (
                      <span key={id} className="badge ud-badge d-inline-flex align-items-center" style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', cursor: 'pointer' }}>
                        {p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name}
                        <i className="bi bi-x-circle ms-1" onClick={(e) => { e.stopPropagation(); handleSelectPandal(id); }}></i>
                      </span>
                    );
                  })}
                </div>
              )}
              <Button variant="primary" className="w-100 mt-3" onClick={planRoute} disabled={!startPoint || selectedPandals.length === 0}>
                <i className="bi bi-diagram-3 me-2"></i>
                Generate Optimized Route
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="ud-card">
            <Card.Body>
              <Card.Title className="fw-bold mb-3 d-flex align-items-center">
                <i className="bi bi-map-fill me-2" style={{ color: 'var(--ud-primary)' }}></i>
                Route Map & Navigation
              </Card.Title>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                  {startPoint && <Marker position={[startPoint.lat, startPoint.lng]}><Popup>Starting Point</Popup></Marker>}
                  {route && route.route.map((stop, index) => (
                    <React.Fragment key={stop.pandal.id}>
                      <Marker position={[stop.pandal.coordinates.lat, stop.pandal.coordinates.lng]}>
                        <Popup>{index + 1}. {stop.pandal.name}<br />Distance: {stop.distance.toFixed(2)} km</Popup>
                      </Marker>
                      {index < route.route.length - 1 && (
                        <Polyline positions={[ [stop.pandal.coordinates.lat, stop.pandal.coordinates.lng], [route.route[index + 1].pandal.coordinates.lat, route.route[index + 1].pandal.coordinates.lng] ]} color="blue" />
                      )}
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>

              {route && (
                <div className="mt-3">
                  <h5 className="fw-bold">Route Summary</h5>
                  <div className="d-flex gap-3 mb-3">
                    <div className="ud-chip"><i className="bi bi-signpost me-1"></i>{route.totalDistance.toFixed(2)} km total</div>
                    <div className="ud-chip"><i className="bi bi-clock me-1"></i>~{Math.round(route.estimatedTime / 60)} hrs {route.estimatedTime % 60} min</div>
                  </div>
                  <div className="route-stops">
                    {route.route.map((stop, index) => (
                      <div key={stop.pandal.id} className="mb-2 d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(228,0,75,0.05)' }}>
                        <div>
                          <span className="badge" style={{ background: 'var(--ud-primary)' }}>{index + 1}</span>
                          <span className="ms-2 fw-semibold">{stop.pandal.name}</span>
                          {index < route.route.length - 1 && <small className="text-muted ms-2">({stop.distance.toFixed(2)} km to next)</small>}
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={() => {
                          if (!startPoint) return;
                          const origin = `${startPoint.lat},${startPoint.lng}`;
                          const destination = `${stop.pandal.coordinates.lat},${stop.pandal.coordinates.lng}`;
                          window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
                        }}>
                          <i className="bi bi-geo-alt-fill"></i> Navigate
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" size="lg" className="w-100 mt-3" onClick={() => {
                    if (!startPoint || !route.route.length) return;
                    const waypoints = route.route.map(stop => `${stop.pandal.coordinates.lat},${stop.pandal.coordinates.lng}`).join('/');
                    window.open(`https://www.google.com/maps/dir/${startPoint.lat},${startPoint.lng}/${waypoints}`, '_blank');
                  }}>
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    Open Full Route in Google Maps
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>
    </>
  );
};

export default RoutePlanner;
