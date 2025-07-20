import { LocationData, DecisionLocation } from './types';

// Coordinate validation utility
export const validateCoordinates = (lat: unknown, lng: unknown): { lat: number; lng: number } | null => {
  const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
      isNaN(latitude) || isNaN(longitude) || 
      !isFinite(latitude) || !isFinite(longitude)) {
    return null;
  }
  
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  
  return { lat: latitude, lng: longitude };
};

// Filter locations with valid coordinates
export const getValidLocations = (locations: DecisionLocation[]): DecisionLocation[] => {
  if (!locations || !Array.isArray(locations)) {
    console.warn('Invalid locations array:', locations);
    return [];
  }
  
  return locations.filter(location => {
    if (!location) {
      console.warn('Null/undefined location found');
      return false;
    }
    
    const coords = validateCoordinates(location.latitude, location.longitude);
    if (!coords) {
      console.warn(`Invalid coordinates for location "${location.location_name}":`, {
        latitude: location.latitude,
        longitude: location.longitude,
        location
      });
      return false;
    }
    return true;
  });
};

// Get user's current location
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Unknown location error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Reverse geocoding function to convert lat/lng to street address
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
      console.warn('Google Maps API key not found for reverse geocoding');
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Get the most specific address (usually the first result)
      const address = data.results[0].formatted_address;
      console.log('Reverse geocoded address:', address);
      return address;
    } else {
      console.warn('No geocoding results found:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};

// Generate Google Maps directions URL
export const getDirectionsUrl = (destination: DecisionLocation, userLocation?: LocationData): string => {
  const destinationQuery = encodeURIComponent(`${destination.location_address}, ${destination.location_postal_code}`);
  let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;
  
  if (userLocation) {
    const origin = encodeURIComponent(`${userLocation.latitude},${userLocation.longitude}`);
    mapsUrl += `&origin=${origin}`;
  }
  
  return mapsUrl;
}; 