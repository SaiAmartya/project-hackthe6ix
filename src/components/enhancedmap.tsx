'use client';
import React, { useEffect, useRef } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface ServiceLocation {
  LOCATION_NAME: string;
  LOCATION_ADDRESS: string;
  LOCATION_POSTAL_CODE: string;
  REASONING: string;
  latitude?: number;
  longitude?: number;
}

interface MapProps {
  serviceLocations: ServiceLocation[];
  currentLocation: LocationData | null;
  selectedLocation: ServiceLocation | null;
  onLocationSelect: (location: ServiceLocation) => void;
  apiKey: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const EnhancedMap: React.FC<MapProps> = ({
  serviceLocations,
  currentLocation,
  selectedLocation,
  onLocationSelect,
  apiKey
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const scriptLoadedRef = useRef(false);

  // Helper function to create custom marker icons
  const createMarkerIcon = (number: number, isSelected: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 50;
    const ctx = canvas.getContext('2d')!;

    // Draw marker shape
    ctx.fillStyle = isSelected ? '#059669' : '#10B981'; // emerald colors
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(20, 38);
    ctx.lineTo(12, 32);
    ctx.lineTo(28, 32);
    ctx.closePath();
    ctx.fill();

    // Add white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 38);
    ctx.lineTo(12, 32);
    ctx.lineTo(28, 32);
    ctx.closePath();
    ctx.stroke();

    // Add number text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 20, 20);

    return canvas.toDataURL();
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.7184, lng: -79.3776 }, // Toronto default
      styles: [
        // Custom map styling for better appearance
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ weight: '2.00' }]
        },
        {
          featureType: 'all',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#9c9c9c' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 45 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [{ visibility: 'simplified' }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#10b981' }, { visibility: 'on' }]
        }
      ]
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
  };

  // Load Google Maps script
  useEffect(() => {
    if (scriptLoadedRef.current || window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      initializeMap();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [apiKey]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Create custom user location marker
    const userMarker = new window.google.maps.Marker({
      position: {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      },
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      },
      zIndex: 1000
    });

    userMarkerRef.current = userMarker;

    // Center map on user location if it's the first time
    if (!markersRef.current.length) {
      mapInstanceRef.current.setCenter({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      });
      mapInstanceRef.current.setZoom(14);
    }
  }, [currentLocation]);

  // Update service location markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for service locations
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    serviceLocations.forEach((location, index) => {
      if (!location.latitude || !location.longitude) return;

      hasValidLocations = true;
      const position = { lat: location.latitude, lng: location.longitude };
      
      // Create custom marker with numbered icon
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: location.LOCATION_NAME,
        icon: {
          url: createMarkerIcon(index + 1, selectedLocation === location),
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        },
        zIndex: selectedLocation === location ? 999 : 100
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        onLocationSelect(location);
        
        // Show info window
        if (infoWindowRef.current) {
          const content = `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #059669; font-size: 16px; font-weight: bold;">
                ${location.LOCATION_NAME}
              </h3>
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
                <strong>Address:</strong><br>
                ${location.LOCATION_ADDRESS}<br>
                ${location.LOCATION_POSTAL_CODE}
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 13px;">
                ${location.REASONING}
              </p>
            </div>
          `;
          
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Include user location in bounds if available
    if (currentLocation) {
      bounds.extend({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      });
    }

    // Fit map to show all markers if we have valid locations
    if (hasValidLocations && (markersRef.current.length > 1 || currentLocation)) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [serviceLocations, selectedLocation]);

  // Center map on selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation || !selectedLocation.latitude || !selectedLocation.longitude) return;

    mapInstanceRef.current.setCenter({
      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude
    });
    mapInstanceRef.current.setZoom(16);
  }, [selectedLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};

export default EnhancedMap;