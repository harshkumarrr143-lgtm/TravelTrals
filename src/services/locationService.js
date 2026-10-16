// Location Service: Geolocation, Haversine Distance, and Nearby Attraction Sorting
import { travelData } from '../data/travelData.js';

const LOCATION_STORAGE_KEY = 'traveltales_user_location';

// App state for location
let locationState = {
  isRequested: false,
  isAllowed: false,
  latitude: null,
  longitude: null,
  nearestCity: null,
  locationName: null,
  error: null,
  isLocating: false
};

// Calculate Haversine distance in km between two GPS coordinates
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 10 ? Math.round(d * 10) / 10 : Math.round(d);
}

// Load saved location on startup if available
export function loadSavedLocation() {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
      locationState = { ...locationState, ...JSON.parse(saved), isRequested: true };
    }
  } catch (e) {
    console.error(e);
  }
  return locationState;
}

export function getLocationState() {
  return locationState;
}

// Request browser location permission and find attractions
export function requestBrowserLocation(onSuccess, onError) {
  locationState.isLocating = true;
  locationState.isRequested = true;

  if (!navigator.geolocation) {
    locationState.isLocating = false;
    locationState.error = 'Geolocation is not supported by your browser.';
    if (onError) onError(locationState.error);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      applyCoordinates(lat, lng, 'Your Current Location');

      if (onSuccess) onSuccess(locationState);
    },
    (err) => {
      locationState.isLocating = false;
      locationState.isAllowed = false;
      locationState.error = err.message || 'Location access was denied.';
      if (onError) onError(locationState.error);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

// Apply GPS coordinates, find nearest city and calculate distance to all attractions
export function applyCoordinates(lat, lng, label = null) {
  locationState.isLocating = false;
  locationState.isAllowed = true;
  locationState.latitude = lat;
  locationState.longitude = lng;
  locationState.error = null;

  // Find closest attraction and city
  let closestAttraction = null;
  let minDistance = Infinity;

  travelData.attractions.forEach(att => {
    if (att.coordinates) {
      const dist = calculateDistanceKm(lat, lng, att.coordinates.lat, att.coordinates.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestAttraction = att;
      }
    }
  });

  locationState.nearestCity = closestAttraction ? closestAttraction.cityName : 'Agra';
  locationState.locationName = label || (closestAttraction ? `${closestAttraction.cityName} Area` : 'Nearby');

  // Save in localStorage
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
      isAllowed: true,
      latitude: lat,
      longitude: lng,
      nearestCity: locationState.nearestCity,
      locationName: locationState.locationName
    }));
  } catch (e) {
    console.error(e);
  }

  return locationState;
}

// Set simulated location for testing or when GPS is not granted
export function setPresetLocation(cityId) {
  const cityCoordinates = {
    agra: { lat: 27.1767, lng: 78.0081, name: 'Agra, UP' },
    mathura: { lat: 27.4924, lng: 77.6737, name: 'Mathura, UP' },
    vrindavan: { lat: 27.5806, lng: 77.7006, name: 'Vrindavan, UP' },
    delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi / NCR' }
  };

  const coord = cityCoordinates[cityId] || cityCoordinates.agra;
  return applyCoordinates(coord.lat, coord.lng, coord.name);
}

// Get attractions sorted by proximity to user
export function getNearbyAttractions() {
  if (!locationState.isAllowed || !locationState.latitude) {
    return travelData.attractions;
  }

  return travelData.attractions.map(att => {
    let distance = null;
    if (att.coordinates) {
      distance = calculateDistanceKm(
        locationState.latitude,
        locationState.longitude,
        att.coordinates.lat,
        att.coordinates.lng
      );
    }
    return { ...att, distance };
  }).sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
}
