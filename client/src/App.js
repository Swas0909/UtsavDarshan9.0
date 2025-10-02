import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PandalMap from './components/PandalMap';
import UserProfile from './components/UserProfile';
import ExplorePanel from './components/ExplorePanel';
import PandalDetail from './components/PandalDetail';
import RoutePlanner from './components/RoutePlanner';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  const [pandals, setPandals] = useState([]);

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
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<PandalMap />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/explore" element={<ExplorePanel />} />
          <Route path="/pandal/:id" element={<PandalDetail />} />
          <Route path="/plan-route" element={<RoutePlanner pandals={pandals} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;