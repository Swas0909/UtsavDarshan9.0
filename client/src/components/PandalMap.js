import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function PandalMap() {
  const [pandals, setPandals] = React.useState([]);
  const mumbaiCenter = [19.0760, 72.8777];

  React.useEffect(() => {
    // Fetch pandals from API
    fetch('http://localhost:5000/api/pandals')
      .then(res => res.json())
      .then(data => setPandals(data))
      .catch(err => console.error('Error fetching pandals:', err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Ganpati Pandal Map</h2>
      <div className="map-container">
        <MapContainer 
          center={mumbaiCenter} 
          zoom={12} 
          style={{ height: '70vh', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {pandals.map(pandal => (
            <Marker 
              key={pandal.id} 
              position={[pandal.coordinates.lat, pandal.coordinates.lng]}
            >
              <Popup>
                <div>
                  <h5>{pandal.name}</h5>
                  <p>{pandal.location}</p>
                  <p>Rating: {pandal.rating}/5.0</p>
                  <p>Crowd Level: {pandal.crowdLevel}</p>
                  <p>Visiting Hours: {pandal.visitingHours}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default PandalMap;