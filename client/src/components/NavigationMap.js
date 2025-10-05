import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css';

// Function to open the location in Google Maps
const openInGoogleMaps = (userLat, userLng, destLat, destLng) => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
  window.open(url, '_blank');
};

// Component to handle map bounds
function SetBounds({ userLocation, destination }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation && destination) {
      const bounds = [
        [userLocation[0], userLocation[1]],
        [destination[0], destination[1]]
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, userLocation, destination]);

  return null;
}

const NavigationMap = ({ pandalLocation, pandalName }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Location Error</h4>
        <p>{error}</p>
        <Button 
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <div style={{ height: '70vh' }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
          <Marker position={pandalLocation}>
            <Popup>{pandalName}</Popup>
          </Marker>
          <SetBounds userLocation={userLocation} destination={pandalLocation} />
        </MapContainer>
      </div>
      
      <div className="p-3">
        <Button
          variant="success"
          size="lg"
          className="w-100"
          onClick={() => openInGoogleMaps(
            userLocation[0],
            userLocation[1],
            pandalLocation[0],
            pandalLocation[1]
          )}
        >
          <i className="bi bi-google me-2"></i>
          Open in Google Maps for Navigation
        </Button>
      </div>
    </div>
  );
};

export default NavigationMap;