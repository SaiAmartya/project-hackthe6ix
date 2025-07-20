'use client';
import { useState, useEffect } from 'react';
import { LocationData, LocationPermission } from './types';
import { getCurrentLocation } from './utils';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>('unknown');

  // Check location permission status on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setLocationPermission(result.state as LocationPermission);
          
          // Listen for permission changes
          result.onchange = () => {
            setLocationPermission(result.state as LocationPermission);
          };
        })
        .catch(() => {
          setLocationPermission('unknown');
        });
    }
  }, []);

  // Get user location when permission is granted
  useEffect(() => {
    if (locationPermission === 'granted' && !currentLocation) {
      getCurrentLocation()
        .then((location) => {
          setCurrentLocation(location);
        })
        .catch((error) => {
          console.log('Could not get initial location for map:', error.message);
        });
    }
  }, [locationPermission, currentLocation]);

  const refreshLocation = async (): Promise<LocationData | null> => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.log('Could not refresh location:', error);
      return null;
    }
  };

  return {
    currentLocation,
    locationPermission,
    refreshLocation,
  };
} 