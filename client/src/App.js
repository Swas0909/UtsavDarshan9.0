import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PandalMap from './components/PandalMap';
import UserProfile from './components/UserProfile';
import ExplorePanel from './components/ExplorePanel';
import PandalDetail from './components/PandalDetail';
import RoutePlanner from './components/RoutePlanner';
import Login from './components/Login';
import Admin from './components/Admin';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [pandals, setPandals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPandals();
    fetchUser();
  }, []);

  // Refresh user state when navigating to home (after OAuth redirect)
  useEffect(() => {
    if (location.pathname === '/' && user === null && !loading) {
      console.log('Checking for auth after navigation to home...');
      fetchUser();
    }
  }, [location.pathname, user, loading]);

  const fetchPandals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pandals');
      const data = await response.json();
      setPandals(data);
    } catch (error) {
      console.error('Error fetching pandals:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/current-user', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          console.log('User authenticated:', data.id);
        }
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<PandalMap />} />
          <Route 
            path="/profile" 
            element={
              loading ? (
                <Container className="py-4">
                  <p>Loading...</p>
                </Container>
              ) : user ? (
                <UserProfile user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="/explore" element={<ExplorePanel />} />
          <Route path="/pandal/:id" element={<PandalDetail />} />
          <Route 
            path="/plan-route" 
            element={<RoutePlanner pandals={pandals} />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/admin" 
            element={
              user?.is_admin ? <Admin /> : <Navigate to="/" />
            } 
          />
        </Routes>
        <Footer user={user} />
      </div>
    </Router>
  );
}

// Wrapper component to provide Router context for useLocation
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;