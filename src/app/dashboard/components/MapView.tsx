'use client';
import React from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { LocationData, DecisionLocation } from './types';
import { validateCoordinates, getValidLocations, getDirectionsUrl } from './utils';

interface MapViewProps {
  locations: DecisionLocation[];
  userLocation: LocationData | null;
  isUpdating?: boolean;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Error boundary for map rendering
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500 stroke-2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6"/>
                <path d="M9 9l6 6"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
            <p className="text-gray-600 mb-4">There was an issue loading the map. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Map markers component
function MapMarkers({ locations, userLocation }: { locations: DecisionLocation[], userLocation: LocationData | null }) {
  const validLocations = getValidLocations(locations);
  
  const handleMarkerClick = (location: DecisionLocation) => {
    console.log('Marker clicked:', location);
    const directionsUrl = getDirectionsUrl(location, userLocation || undefined);
    window.open(directionsUrl, '_blank');
  };

  return (
    <>
      {validLocations.map((location, index) => {
        const coords = validateCoordinates(location.latitude, location.longitude);
        if (!coords) return null;
        
        const isShelter = location.resource_type === 'shelter';
        return (
          <Marker
            key={`${location.location_name}-${index}`}
            position={coords}
            title={location.location_name}
            onClick={() => handleMarkerClick(location)}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="${isShelter ? '#EA4335' : '#4285F4'}" stroke="white" stroke-width="2"/>
                  <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${isShelter ? 'S' : 'F'}</text>
                </svg>`
              )}`,
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12),
            }}
          />
        );
      })}
    </>
  );
}

// Map overlays component
function MapOverlays({ userLocation, locationsCount, isUpdating }: {
  userLocation: LocationData | null;
  locationsCount: number;
  isUpdating?: boolean;
}) {
  return (
    <>
      {/* User location indicator */}
      {userLocation && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-emerald-200">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-700 font-medium">Your Location</span>
          </div>
        </div>
      )}
      
      {/* Location counter */}
      {locationsCount > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-emerald-200">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-700 font-medium">
              {locationsCount} location{locationsCount !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isUpdating && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 animate-spin text-blue-600">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            <span className="text-blue-700 font-medium">Updating...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default function MapView({ locations, userLocation, isUpdating }: MapViewProps) {
  const defaultCenter = { lat: 43.71837, lng: -79.54286 }; // Toronto
  const position = userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : defaultCenter;
  const validLocations = getValidLocations(locations);

  console.log('MapView render:', {
    totalLocations: locations.length,
    validLocations: validLocations.length,
  });

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <MapErrorBoundary>
          <Map
            defaultCenter={position}
            defaultZoom={12}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapId="your-map-id"
            clickableIcons={false}
          >
            <MapMarkers locations={validLocations} userLocation={userLocation} />
          </Map>
          <MapOverlays 
            userLocation={userLocation} 
            locationsCount={validLocations.length}
            isUpdating={isUpdating}
          />
        </MapErrorBoundary>
      </APIProvider>
    </div>
  );
} 