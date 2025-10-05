import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import PandalGrid from './PandalGrid';

const ExplorePanel = () => {
  const [pandals, setPandals] = useState([]);
  const [filteredPandals, setFilteredPandals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [areaData, setAreaData] = useState([]);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);
  const [isCrowdLevelDropdownOpen, setIsCrowdLevelDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    theme: '',
    distance: '',
    area: '',
    crowdLevel: ''
  });
  const [userLocation, setUserLocation] = useState(null);
  const searchTimeoutRef = useRef(null);

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
      const distanceA = calculateDistance(userLat, userLng, parseFloat(a.lat), parseFloat(a.lng));
      const distanceB = calculateDistance(userLat, userLng, parseFloat(b.lat), parseFloat(b.lng));
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
    if (isLoading) return; // Prevent multiple simultaneous fetches
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/pandals');
      if (!response.ok) {
        throw new Error('Failed to fetch pandals');
      }
      const data = await response.json();
      
      // Remove duplicates based on id
      const uniquePandals = data.filter((pandal, index, self) => 
        index === self.findIndex(p => p.id === pandal.id)
      );
      
      setPandals(uniquePandals);
      setFilteredPandals(uniquePandals); // Show all pandals by default
    } catch (error) {
      console.error('Error fetching pandals:', error);
      setError(error.message || 'Failed to load pandals');
      setPandals([]);
      setFilteredPandals([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Fetch areas with counts and regions
  const fetchAreas = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/areas');
      if (!response.ok) {
        return; // Silently fail and let the UI derive areas from pandals
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setAreaData(data);
      } else {
        // Fallback: derive areas from pandal list
        const areaMap = new Map();
        pandals.forEach(p => {
          // Extract area from location (first part before comma)
          const name = p.location ? p.location.split(',')[0].trim() : '';
          if (!name) return;
          areaMap.set(name, (areaMap.get(name) || 0) + 1);
        });

        const derived = [{
          region: 'All Regions',
          areas: Array.from(areaMap.entries())
            .sort((a,b) => a[0].localeCompare(b[0]))
            .map(([name, count]) => ({ name, count }))
        }];
        setAreaData(derived);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      // Fallback on error as well
      const areaMap = new Map();
      pandals.forEach(p => {
        // Extract area from location (first part before comma)
        const name = p.location ? p.location.split(',')[0].trim() : '';
        if (!name) return;
        areaMap.set(name, (areaMap.get(name) || 0) + 1);
      });
      const derived = [{
        region: 'All Regions',
        areas: Array.from(areaMap.entries())
          .sort((a,b) => a[0].localeCompare(b[0]))
          .map(([name, count]) => ({ name, count }))
      }];
      setAreaData(derived);
    }
  }, [pandals]);

  // Filter areas based on search (not implemented UI for area-specific search yet)

  // Initial fetch of pandals and areas
  useEffect(() => {
    let mounted = true;
    
    const initializePandals = async () => {
      if (!mounted) return;
      await fetchPandals();
      if (mounted) {
        fetchAreas();
      }
    };

    initializePandals();
    return () => {
      mounted = false;
    };
  }, []);

  // Only fetch areas once when pandals are loaded
  useEffect(() => {
    if (pandals.length > 0 && (!Array.isArray(areaData) || areaData.length === 0)) {
      const deriveAreas = () => {
        const areaMap = new Map();
        pandals.forEach(p => {
          const name = p.location ? p.location.split(',')[0].trim() : '';
          if (!name) return;
          areaMap.set(name, (areaMap.get(name) || 0) + 1);
        });
        
        const derived = [{
          region: 'All Regions',
          areas: Array.from(areaMap.entries())
            .sort((a,b) => a[0].localeCompare(b[0]))
            .map(([name, count]) => ({ name, count }))
        }];
        setAreaData(derived);
      };
      deriveAreas();
    }
  }, [pandals]);

  // Auto-apply filters when search term or filters change
  // (moved down to after applyFiltersAndSearch definition)

  // Handle click outside area dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close any open dropdowns when clicking outside their containers
      if (isAreaDropdownOpen && !event.target.closest('.area-dropdown-container')) {
        setIsAreaDropdownOpen(false);
      }
      if (isThemeDropdownOpen && !event.target.closest('.theme-dropdown-container')) {
        setIsThemeDropdownOpen(false);
      }
      if (isCrowdLevelDropdownOpen && !event.target.closest('.crowd-dropdown-container')) {
        setIsCrowdLevelDropdownOpen(false);
      }
      if (isDistanceDropdownOpen && !event.target.closest('.distance-dropdown-container')) {
        setIsDistanceDropdownOpen(false);
      }
      if (showSearchSuggestions && !event.target.closest('.search-container')) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAreaDropdownOpen, isThemeDropdownOpen, isCrowdLevelDropdownOpen, isDistanceDropdownOpen, showSearchSuggestions]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  // Apply filters only when user makes changes
  // applyFiltersAndSearch accepts optional overrides to avoid stale state issues when
  // calling it immediately after setState. Pass { overrideFilters, overrideSearchTerm }
  // to evaluate against the new values.
  const applyFiltersAndSearch = useCallback((overrides = {}) => {
    const currentFilters = overrides.overrideFilters ?? filters;
    const currentSearchTerm = overrides.overrideSearchTerm ?? searchTerm;
    const currentUserLocation = overrides.overrideUserLocation ?? userLocation;

    // Make sure we're working with the latest pandals data
    let filtered = [...pandals];

    // Reset to show all pandals when clearing filters
    if (!currentSearchTerm && 
        (!currentFilters.area || currentFilters.area === '') && 
        (!currentFilters.theme || currentFilters.theme === '') && 
        (!currentFilters.crowdLevel || currentFilters.crowdLevel === '') && 
        (!currentFilters.distance || currentFilters.distance === '')) {
      setFilteredPandals([...pandals]);
      setCurrentPage(1);
      return;
    }

    if (currentSearchTerm) {
      const searchLower = currentSearchTerm.toLowerCase().trim();
      if (searchLower) {
        filtered = filtered.filter(p => {
          const locationArea = p.location ? p.location.split(',')[0].trim() : '';
          return (
            (p.name && p.name.toLowerCase().includes(searchLower)) ||
            (p.location && p.location.toLowerCase().includes(searchLower)) ||
            (p.theme && p.theme.toLowerCase().includes(searchLower)) ||
            (locationArea && locationArea.toLowerCase().includes(searchLower)) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
          );
        });
      }
    }

    if (currentFilters.area && currentFilters.area !== '') {
      filtered = filtered.filter(p => {
        // Extract area from location since area field is null
        const locationArea = p.location ? p.location.split(',')[0].trim() : '';
        return locationArea.toLowerCase() === currentFilters.area.toLowerCase();
      });
    }

    if (currentFilters.theme && currentFilters.theme !== '') {
      filtered = filtered.filter(p => 
        p.theme?.toLowerCase() === currentFilters.theme.toLowerCase()
      );
    }

    if (currentFilters.crowdLevel && currentFilters.crowdLevel !== '') {
      filtered = filtered.filter(p => 
        p.crowdLevel === currentFilters.crowdLevel
      );
    }

    if (currentFilters.distance && currentFilters.distance !== '' && currentUserLocation) {
      filtered = filtered.filter(p => {
        if (!p.lat || !p.lng) {
          return false;
        }
        const distance = calculateDistance(
          currentUserLocation.lat,
          currentUserLocation.lng,
          parseFloat(p.lat),
          parseFloat(p.lng)
        );
        return distance <= parseInt(currentFilters.distance);
      });
    }

    setFilteredPandals(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, pandals, userLocation, calculateDistance]);

  // Auto-apply filters removed - now handled manually in onChange handlers to avoid conflicts

  // Initialize filtered pandals when pandals data loads
  useEffect(() => {
    if (pandals.length > 0 && filteredPandals.length === 0) {
      // Only set initial data if we don't have filtered data yet
      setFilteredPandals(pandals);
    }
  }, [pandals, filteredPandals.length]);

  return (
    <>
      <div className="bg-light py-3 mb-4 border-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex gap-2 position-relative search-container">
                <div className="flex-grow-1">
                  <Form.Control
                    type="search"
                    placeholder="Search pandals by name, location, theme, or area..."
                      value={searchTerm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchTerm(val);
                        setShowSearchSuggestions(val.length > 0);
                        // Debounced auto-search using ref
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                        }
                        searchTimeoutRef.current = setTimeout(() => {
                          applyFiltersAndSearch({ overrideSearchTerm: val });
                        }, 300);
                      }}
                    onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setShowSearchSuggestions(false);
                        applyFiltersAndSearch();
                      }
                    }}
                    className="mb-0"
                  />
                  {showSearchSuggestions && searchTerm && searchTerm.length > 0 && (
                    <div 
                      className="position-absolute start-0 w-100 mt-1 shadow-sm bg-white rounded border"
                      style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                    >
                      {(() => {
                        const matchingPandals = pandals.filter(p => {
                          const search = searchTerm.toLowerCase().trim();
                          const locationArea = p.location ? p.location.split(',')[0].trim() : '';
                          return search && (
                            (p.name && p.name.toLowerCase().includes(search)) ||
                            (p.location && p.location.toLowerCase().includes(search)) ||
                            (p.theme && p.theme.toLowerCase().includes(search)) ||
                            (locationArea && locationArea.toLowerCase().includes(search))
                          );
                        });
                        
                        if (matchingPandals.length === 0) {
                          return (
                            <div className="dropdown-item py-2 px-3 text-muted">
                              No pandals found matching "{searchTerm}"
                            </div>
                          );
                        }
                        
                        return matchingPandals.slice(0, 6).map(p => (
                          <div
                            key={p.id}
                            className="dropdown-item py-2 px-3"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSearchTerm(p.name);
                              setShowSearchSuggestions(false);
                              applyFiltersAndSearch({ overrideSearchTerm: p.name });
                            }}
                          >
                            <div className="fw-bold">{p.name}</div>
                            <div className="small text-muted">{p.location ? p.location.split(',')[0].trim() : p.location} • {p.theme}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
                <Button variant="primary" onClick={() => {
                  setShowSearchSuggestions(false);
                  // Force apply filters with current search term
                  applyFiltersAndSearch({overrideSearchTerm: searchTerm});
                }}>
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
          <div className="d-flex gap-2 flex-wrap align-items-start" style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
            <div className="d-flex gap-2 flex-wrap">
              <div className="position-relative area-dropdown-container" style={{ minWidth: '200px' }}>
                <div 
                  className="form-control form-control-sm d-flex align-items-center justify-content-between dropdown-toggle"
                  onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{filters.area || 'All Areas'}</span>
                  <i className={`bi bi-chevron-${isAreaDropdownOpen ? 'up' : 'down'}`}></i>
                </div>
                
                {isAreaDropdownOpen && (
                  <div className="position-absolute start-0 w-100 mt-1 shadow-sm bg-white rounded border" 
                       style={{ zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="py-1">
                      <div
                        className="dropdown-item fw-bold"
                      onClick={() => {
                        const newFilters = {...filters, area: ''};
                        setFilters(newFilters);
                        setIsAreaDropdownOpen(false);
                        // Apply using override to avoid stale state
                        applyFiltersAndSearch({ overrideFilters: newFilters });
                      }}
                      >
                        All Areas
                      </div>
                      
                      {areaData.map(region => (
                        <div key={region.region}>
                          <div className="dropdown-header text-primary fw-bold border-top pt-2 pb-1">
                            {region.region}
                          </div>
                          {region.areas.map(area => (
                            <div
                              key={area.name}
                              className="dropdown-item d-flex justify-content-between align-items-center px-3"
                              onClick={() => {
                                  const newFilters = {...filters, area: area.name};
                                  setFilters(newFilters);
                                  setIsAreaDropdownOpen(false);
                                  applyFiltersAndSearch({ overrideFilters: newFilters });
                                }}
                            >
                              <span>{area.name}</span>
                              <span className="badge bg-secondary rounded-pill ms-2">
                                {area.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="position-relative theme-dropdown-container">
                <div 
                  className="form-control form-control-sm d-flex align-items-center justify-content-between dropdown-toggle"
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  style={{ cursor: 'pointer', minWidth: '150px' }}
                >
                  <span>{filters.theme || 'All Themes'}</span>
                  <i className={`bi bi-chevron-${isThemeDropdownOpen ? 'up' : 'down'}`}></i>
                </div>
                {isThemeDropdownOpen && (
                  <div className="position-absolute start-0 w-100 mt-1 shadow-sm bg-white rounded border" style={{ zIndex: 1000 }}>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                          const newFilters = {...filters, theme: ''};
                          setFilters(newFilters);
                          setIsThemeDropdownOpen(false);
                          applyFiltersAndSearch({ overrideFilters: newFilters });
                        }}
                    >
                      All Themes
                    </div>
                    {['Traditional', 'Eco-Friendly', 'Modern'].map(theme => (
                      <div
                        key={theme}
                        className="dropdown-item"
                        onClick={() => {
                          const newFilters = {...filters, theme};
                          setFilters(newFilters);
                          setIsThemeDropdownOpen(false);
                          applyFiltersAndSearch({ overrideFilters: newFilters });
                        }}
                      >
                        {theme}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="position-relative crowd-dropdown-container">
                <div 
                  className="form-control form-control-sm d-flex align-items-center justify-content-between dropdown-toggle"
                  onClick={() => setIsCrowdLevelDropdownOpen(!isCrowdLevelDropdownOpen)}
                  style={{ cursor: 'pointer', minWidth: '150px' }}
                >
                  <span>{filters.crowdLevel || 'Any Crowd Level'}</span>
                  <i className={`bi bi-chevron-${isCrowdLevelDropdownOpen ? 'up' : 'down'}`}></i>
                </div>
                {isCrowdLevelDropdownOpen && (
                  <div className="position-absolute start-0 w-100 mt-1 shadow-sm bg-white rounded border" style={{ zIndex: 1000 }}>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                          const newFilters = {...filters, crowdLevel: ''};
                          setFilters(newFilters);
                          setIsCrowdLevelDropdownOpen(false);
                          applyFiltersAndSearch({ overrideFilters: newFilters });
                        }}
                    >
                      Any Crowd Level
                    </div>
                    {['Low', 'Medium', 'High'].map(level => (
                      <div
                        key={level}
                        className="dropdown-item"
                        onClick={() => {
                          const newFilters = {...filters, crowdLevel: level};
                          setFilters(newFilters);
                          setIsCrowdLevelDropdownOpen(false);
                          applyFiltersAndSearch({ overrideFilters: newFilters });
                        }}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="position-relative distance-dropdown-container">
                <div 
                  className="form-control form-control-sm d-flex align-items-center justify-content-between dropdown-toggle"
                  onClick={() => userLocation && setIsDistanceDropdownOpen(!isDistanceDropdownOpen)}
                  style={{ cursor: userLocation ? 'pointer' : 'not-allowed', minWidth: '150px', opacity: userLocation ? 1 : 0.65 }}
                >
                  <span>{filters.distance ? `Within ${filters.distance} km` : 'Any Distance'}</span>
                  <i className={`bi bi-chevron-${isDistanceDropdownOpen ? 'up' : 'down'}`}></i>
                </div>
                {isDistanceDropdownOpen && userLocation && (
                  <div className="position-absolute start-0 w-100 mt-1 shadow-sm bg-white rounded border" style={{ zIndex: 1000 }}>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                          const newFilters = {...filters, distance: ''};
                          setFilters(newFilters);
                          setIsDistanceDropdownOpen(false);
                          applyFiltersAndSearch({ overrideFilters: newFilters, overrideUserLocation: userLocation });
                        }}
                    >
                      Any Distance
                    </div>
                    {[1, 3, 5, 10].map(dist => (
                      <div
                        key={dist}
                        className="dropdown-item"
                        onClick={() => {
                          const newFilters = {...filters, distance: dist.toString()};
                          setFilters(newFilters);
                          setIsDistanceDropdownOpen(false);
                          applyFiltersAndSearch({ overrideFilters: newFilters, overrideUserLocation: userLocation });
                        }}
                      >
                        Within {dist} km
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Button 
                size="sm"
                variant="primary"
                onClick={() => {
                  // Force apply all current filters
                  applyFiltersAndSearch({
                    overrideFilters: filters,
                    overrideSearchTerm: searchTerm,
                    overrideUserLocation: userLocation
                  });
                }}
              >
                <i className="bi bi-funnel-fill me-1"></i>
                Apply Filters
              </Button>
              <Button 
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  const newFilters = {
                    location: '',
                    theme: '',
                    distance: '',
                    area: '',
                    crowdLevel: ''
                  };
                  setFilters(newFilters);
                  setSearchTerm('');
                  // Force reset all filters and search
                  setFilteredPandals([...pandals]);
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading pandals...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <PandalGrid 
          pandals={filteredPandals}
          userLocation={userLocation}
          calculateDistance={calculateDistance}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      )}
      </Container>
    </>
  );
};

export default ExplorePanel;