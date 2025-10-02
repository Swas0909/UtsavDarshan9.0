import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import PandalGrid from './PandalGrid';

const ExplorePanel = () => {
  const [pandals, setPandals] = useState([]);
  const [filteredPandals, setFilteredPandals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    location: '',
    theme: '',
    distance: '',
    area: '',
    crowdLevel: ''
  });
  const [userLocation, setUserLocation] = useState(null);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const sortPandalsByDistance = useCallback((userLat, userLng) => {
    const sortedPandals = [...filteredPandals].sort((a, b) => {
      const distanceA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
      const distanceB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
      return distanceA - distanceB;
    });
    setFilteredPandals(sortedPandals);
  }, [filteredPandals, calculateDistance]);

  const detectLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          sortPandalsByDistance(newLocation.lat, newLocation.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [sortPandalsByDistance]);

  const fetchPandals = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pandals');
      const data = await response.json();
      setPandals(data);
      setFilteredPandals(data); // Show all pandals by default
    } catch (error) {
      console.error('Error fetching pandals:', error);
    }
  }, []);

  // Initial fetch of pandals
  useEffect(() => {
    fetchPandals();
  }, [fetchPandals]);

  // Apply filters only when user makes changes
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...pandals];
    
    // Only apply filters if any filter is active
    const hasActiveFilters = searchTerm || 
                           filters.area || 
                           filters.theme || 
                           filters.crowdLevel || 
                           (filters.distance && userLocation);

    if (!hasActiveFilters) {
      setFilteredPandals(filtered);
      return;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.theme?.toLowerCase().includes(searchLower) ||
        p.area?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.area) {
      filtered = filtered.filter(p => 
        p.area?.toLowerCase() === filters.area.toLowerCase()
      );
    }

    if (filters.theme) {
      filtered = filtered.filter(p => 
        p.theme?.toLowerCase() === filters.theme.toLowerCase()
      );
    }

    if (filters.crowdLevel) {
      filtered = filtered.filter(p => 
        p.crowdLevel === filters.crowdLevel
      );
    }

    if (filters.distance && userLocation) {
      filtered = filtered.filter(p => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          p.coordinates.lat,
          p.coordinates.lng
        );
        return distance <= parseInt(filters.distance);
      });
    }

    setFilteredPandals(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, pandals, userLocation, calculateDistance]);

  // Only apply filters when user actively changes them
  useEffect(() => {
    // Always show all pandals initially
    setFilteredPandals(pandals);
  }, [pandals]);

  return (
    <>
      <div className="bg-light py-3 mb-4 border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Search pandals by name, location, or theme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-0"
                />
                <Button variant="primary" onClick={() => applyFiltersAndSearch()}>
                  <i className="bi bi-search"></i>
                </Button>
              </div>
            </Col>
            <Col md={4}>
              <Button 
                variant="primary" 
                onClick={detectLocation}
                className="w-100"
              >
                <i className="bi bi-geo-alt"></i> Detect My Location
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        <div className="d-flex align-items-center mb-4">
          <h4 className="mb-0 me-4">All Pandals</h4>
          <div className="d-flex gap-2 flex-wrap">
            <Form.Select
              size="sm"
              value={filters.area}
              onChange={(e) => setFilters({...filters, area: e.target.value})}
              style={{ width: 'auto' }}
            >
              <option value="">All Areas</option>
              <option value="South Mumbai">South Mumbai</option>
              <option value="Central Mumbai">Central Mumbai</option>
              <option value="Western Suburbs">Western Suburbs</option>
              <option value="Eastern Suburbs">Eastern Suburbs</option>
              <option value="Navi Mumbai">Navi Mumbai</option>
              <option value="Thane">Thane</option>
            </Form.Select>

            <Form.Select
              size="sm"
              value={filters.theme}
              onChange={(e) => setFilters({...filters, theme: e.target.value})}
              style={{ width: 'auto' }}
            >
              <option value="">All Themes</option>
              <option value="Traditional">Traditional</option>
              <option value="Eco-Friendly">Eco-Friendly</option>
              <option value="Modern">Modern</option>
            </Form.Select>

            <Form.Select
              size="sm"
              value={filters.crowdLevel}
              onChange={(e) => setFilters({...filters, crowdLevel: e.target.value})}
              style={{ width: 'auto' }}
            >
              <option value="">Any Crowd Level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>

            <Form.Select
              size="sm"
              value={filters.distance}
              onChange={(e) => setFilters({...filters, distance: e.target.value})}
              style={{ width: 'auto' }}
              disabled={!userLocation}
            >
              <option value="">Any Distance</option>
              <option value="1">Within 1 km</option>
              <option value="3">Within 3 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
            </Form.Select>
          </div>
        </div>

        <PandalGrid 
          pandals={filteredPandals}
          userLocation={userLocation}
          calculateDistance={calculateDistance}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Container>
    </>
  );
};

export default ExplorePanel;