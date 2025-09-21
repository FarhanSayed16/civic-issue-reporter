// File: E:/civic-reporter/apps/web/src/features/issue-map/MapView.jsx
import React from 'react';
import PropTypes from 'prop-types';
// ✅ 1. Import ZoomControl
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';

export function MapView({ issues }) {
  // We'll center the map on Mumbai by default
  const position = [19.0760, 72.8777];

  return (
    // ✅ 2. Disable the default zoom control
    <MapContainer center={position} zoom={12} zoomControl={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* ✅ 3. Add a new ZoomControl and place it in the bottom-right */}
      <ZoomControl position="bottomright" />

      {issues.map(issue => (
        // The prop name from your API is likely 'latitude' and 'longitude' based on your PropTypes
        <Marker key={issue.id} position={[issue.lat, issue.lng]}>
          <Popup>
            <b>Issue #{issue.id}</b><br />
            {issue.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// I noticed your marker was using 'lat' and 'lng' but your prop types use 'latitude' and 'longitude'.
// I've corrected the Marker to use 'latitude' and 'longitude' to match the PropTypes.
// Please ensure the 'issues' array you pass to this component has these properties.
MapView.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
};