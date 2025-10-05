import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import PandalGrid from './PandalGrid';

function ExplorePanel() {
  const [pandals, setPandals] = useState([]);
  const [filteredPandals, setFilteredPandals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const searchTimeoutRef = useRef(null);

  const fetchPandals = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pandals');
      const data = await response.json();
      setPandals(data);
      setFilteredPandals(data);
    } catch (error) {
      console.error('Error fetching pandals:', error);
    }
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredPandals(pandals);
      return;
    }
    
    const filtered = pandals.filter(p => 
      p.name.toLowerCase().includes(value.toLowerCase()) ||
      p.location.toLowerCase().includes(value.toLowerCase()) ||
      p.theme?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPandals(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchPandals();
  }, [fetchPandals]);

  return (
    <div>
      <div className="bg-light py-4 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col md={12}>
              <Form.Control
                type="search"
                placeholder="Search pandals by name, location, or theme..."
                value={searchTerm}
                onChange={(e) => {
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  searchTimeoutRef.current = setTimeout(() => {
                    handleSearch(e.target.value);
                  }, 300);
                  setSearchTerm(e.target.value);
                }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4>All Pandals ({filteredPandals.length})</h4>
        </div>

        <PandalGrid 
          pandals={filteredPandals}
          userLocation={null}
          calculateDistance={() => 0}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </Container>
    </div>
  );
}

export default ExplorePanel;