import React, { useState, useEffect } from 'react';
import { Card, Button, Col, Row, Pagination, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PandalGrid = ({ 
  pandals, 
  userLocation, 
  calculateDistance, 
  currentPage, 
  setCurrentPage, 
  itemsPerPage,
  setItemsPerPage
}) => {
  const [favorites, setFavorites] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated and fetch their favorites
  useEffect(() => {
    const checkAuthAndFetchFavorites = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch('http://localhost:5000/api/current-user', {
          credentials: 'include'
        });
        const userData = await response.json();
        console.log('User data:', userData);

        if (response.ok && userData) {
          console.log('User is authenticated');
          setIsAuthenticated(true);
          
          // Fetch user's favorites
          console.log('Fetching user favorites...');
          const favResponse = await fetch('http://localhost:5000/api/user/favorites', {
            credentials: 'include'
          });
          
          if (favResponse.ok) {
            const favPandals = await favResponse.json();
            console.log('User favorites:', favPandals);
            setFavorites(favPandals.map(p => p.id));
          } else {
            console.error('Failed to fetch favorites:', await favResponse.text());
          }
        } else {
          console.log('User is not authenticated');
          setIsAuthenticated(false);
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error in authentication check:', error);
        setIsAuthenticated(false);
        setFavorites([]);
      }
    };

    checkAuthAndFetchFavorites();
  }, []);

  const handleFavoriteClick = async (pandalId) => {
    console.log('Favorite button clicked for pandal:', pandalId);
    console.log('Current authentication status:', isAuthenticated);

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }

    try {
      const isFavorited = favorites.includes(pandalId);
      console.log('Current favorite status:', isFavorited);
      const action = isFavorited ? 'remove' : 'add';
      
      // Optimistic update
      if (isFavorited) {
        setFavorites(favorites.filter(id => id !== pandalId));
      } else {
        setFavorites([...favorites, pandalId]);
      }

      console.log('Sending request to server:', {
        url: `http://localhost:5000/api/pandals/${pandalId}/favorite`,
        method: 'POST',
        action: action
      });

      const response = await fetch(`http://localhost:5000/api/pandals/${pandalId}/favorite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        console.error('Server error:', data);
        // Revert if the server request failed
        if (isFavorited) {
          setFavorites([...favorites, pandalId]);
        } else {
          setFavorites(favorites.filter(id => id !== pandalId));
        }
        alert('Failed to update favorite status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('An error occurred while updating favorite status.');
    }
  };
  const indexOfLastPandal = currentPage * itemsPerPage;
  const indexOfFirstPandal = indexOfLastPandal - itemsPerPage;
  const currentPandals = pandals.slice(indexOfFirstPandal, indexOfLastPandal);
  const totalPages = Math.ceil(pandals.length / itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    const maxButtons = 5;
    const halfButtons = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - halfButtons);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => setCurrentPage(1)} 
        disabled={currentPage === 1} 
      />
    );
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => setCurrentPage(prev => prev - 1)}
        disabled={currentPage === 1}
      />
    );

    if (start > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" />);
    }

    for (let number = start; number <= end; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (end < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" />);
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => setCurrentPage(prev => prev + 1)}
        disabled={currentPage === totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
      />
    );

    return <Pagination>{items}</Pagination>;
  };

  return (
    <>
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">Found {pandals.length} pandals</p>
            <Form.Select
              style={{ width: 'auto' }}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              value={itemsPerPage}
            >
              <option value="12">Show 12</option>
              <option value="24">Show 24</option>
              <option value="48">Show 48</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      <Row>
        {currentPandals.map(pandal => (
          <Col key={pandal.id} md={4} className="mb-4">
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={pandal.imageUrl || '/images/placeholder.jpg'} 
                className="pandal-image"
                alt={pandal.name}
                style={{ height: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  if (e.currentTarget.src.endsWith('/images/placeholder.jpg')) return;
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5 mb-2">{pandal.name}</Card.Title>
                <Card.Text className="text-muted mb-2">
                  📍 {pandal.location}
                </Card.Text>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <span className="text-warning me-1">⭐</span>
                      <span>{pandal.rating}/5</span>
                    </div>
                    <Button 
                      variant="link" 
                      className="p-0 favorite-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          window.location.href = '/login';
                          return;
                        }
                        handleFavoriteClick(pandal.id);
                      }}
                      style={{ fontSize: '1.2rem' }}
                    >
                      <i 
                        className={`bi ${favorites.includes(pandal.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}
                        style={{ pointerEvents: 'none' }}
                        aria-label={favorites.includes(pandal.id) ? 'Remove from favorites' : 'Add to favorites'}
                      ></i>
                    </Button>
                  </div>
                  <Button 
                    as={Link} 
                    to={`/pandal/${pandal.id}`} 
                    variant="outline-primary" 
                    className="w-100"
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            {renderPagination()}
          </Col>
        </Row>
      )}
    </>
  );
};

// Add hover effects with CSS
const styles = `
  .card {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    border: none;
    box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    border-radius: 14px;
  }
  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(228,0,75,0.12);
  }
  .pandal-image {
    transition: transform 0.3s ease-in-out;
    border-radius: 14px 14px 0 0;
  }
  .card:hover .pandal-image { transform: scale(1.04); }
  .card-body { padding: 1.25rem; }
  .card-title { font-weight: 700; color: #2c3e50; }
  .favorite-btn { transition: transform 0.2s; }
  .favorite-btn:hover { transform: scale(1.15); }
  .favorite-btn i { font-size: 1.2rem; }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default PandalGrid;