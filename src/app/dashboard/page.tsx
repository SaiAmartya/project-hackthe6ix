'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface MessageData {
  message: string;
  location: LocationData | null;
  locationError?: string;
  timestamp: number;
  id: string;
}

interface ServiceLocation {
  LOCATION_NAME: string;
  LOCATION_ADDRESS: string;
  LOCATION_POSTAL_CODE: string;
  REASONING: string;
  latitude?: number;
  longitude?: number;
}

interface LocationsData {
  locations: ServiceLocation[];
}

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null);
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d184552.2245834942!2d-79.5428656837306!3d43.71837093300166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cb90d7c63ba5%3A0x323555502ab4c477!2sToronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sus!4v1703825432123!5m2!1sen!2sus');

  const generateMapUrlFallback = (latitude: number, longitude: number) => {
    // Generate a Google Maps embed URL centered on the user's location
    const zoom = 15;
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d11547.0!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${zoom}.1!5e0!3m2!1sen!2sus`;
  };

  // Function to geocode an address using a public API
  const geocodeAddress = async (address: string, postalCode: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const fullAddress = `${address}, ${postalCode}, Toronto, ON, Canada`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Function to generate map URL with multiple markers
  const generateMapUrlWithMarkers = (locations: ServiceLocation[], centerLat?: number, centerLon?: number) => {
    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
    if (validLocations.length === 0) return mapUrl;

    // Use provided center or center on first location
    const centerLatitude = centerLat || validLocations[0].latitude!;
    const centerLongitude = centerLon || validLocations[0].longitude!;
    
    // Create markers string for Google Maps
    let markersString = '';
    validLocations.forEach((location, index) => {
      if (location.latitude && location.longitude) {
        markersString += `&markers=color:green%7Clabel:${index + 1}%7C${location.latitude},${location.longitude}`;
      }
    });

    const zoom = validLocations.length > 1 ? 12 : 15;
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d11547.0!2d${centerLongitude}!3d${centerLatitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${zoom}.1!5e0!3m2!1sen!2sus${markersString}`;
  };

  // Function to center map on specific location
  const centerMapOnLocation = (location: ServiceLocation) => {
    if (location.latitude && location.longitude) {
      const newMapUrl = generateMapUrlWithMarkers(serviceLocations, location.latitude, location.longitude);
      setMapUrl(newMapUrl);
      setSelectedLocation(location);
    }
  };

  // Function to display locations on the map
  const displayLocationsOnMap = async (locationsData: LocationsData) => {
    const locationsWithCoords: ServiceLocation[] = [];
    
    // Geocode all locations
    for (const location of locationsData.locations) {
      const coords = await geocodeAddress(location.LOCATION_ADDRESS, location.LOCATION_POSTAL_CODE);
      locationsWithCoords.push({
        ...location,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
    }
    
    setServiceLocations(locationsWithCoords);
    
    // Generate map URL with all markers
    const newMapUrl = generateMapUrlWithMarkers(locationsWithCoords);
    setMapUrl(newMapUrl);
  };

  // Function to add locations (can be called from outside)
  const addServiceLocations = async (locationsData: LocationsData) => {
    await displayLocationsOnMap(locationsData);
  };

  // Example usage function for testing
  const loadSampleLocations = async () => {
    const sampleData: LocationsData = {
      locations: [
        {
          "LOCATION_NAME": "COSTI Immigrant Services",
          "LOCATION_ADDRESS": "640 Dixon Rd.",
          "LOCATION_POSTAL_CODE": "M9W 1J1",
          "REASONING": "this is some sample reasoning… hopefully it's displayed properly."
        },
        {
          "LOCATION_NAME": "351 Lakeshore Respite Services",
          "LOCATION_ADDRESS": "195 Princes' Blvd",
          "LOCATION_POSTAL_CODE": "M6K 3C3",
          "REASONING": "this is some sample reasoning… hopefully it's displayed properly."
        }
      ]
    };
    
    await addServiceLocations(sampleData);
  };

  // Check location permission status on component mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setLocationPermission(result.state);
          
          // Listen for permission changes
          result.onchange = () => {
            setLocationPermission(result.state);
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
          const newMapUrl = generateMapUrlFallback(location.latitude, location.longitude);
          setMapUrl(newMapUrl);
          console.log('Map centered on user location:', {
            latitude: location.latitude,
            longitude: location.longitude,
            mapUrl: newMapUrl
          });
        })
        .catch((error) => {
          console.log('Could not get initial location for map:', error.message);
        });
    }
  }, [locationPermission, currentLocation]);

  // Debug: Add function to view stored messages (can be removed in production)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      interface WindowWithDebug extends Window {
        viewStoredMessages?: () => MessageData[];
        clearStoredMessages?: () => void;
        addServiceLocations?: (data: LocationsData) => Promise<void>;
        loadSampleLocations?: () => Promise<void>;
      }
      const windowWithDebug = window as WindowWithDebug;
      
      windowWithDebug.viewStoredMessages = () => {
        console.log('Stored messages:', messages);
        return messages;
      };
      windowWithDebug.clearStoredMessages = () => {
        setMessages([]);
        console.log('Messages cleared');
      };
      windowWithDebug.addServiceLocations = addServiceLocations;
      windowWithDebug.loadSampleLocations = loadSampleLocations;
    }
  }, [messages]);

  const getCurrentLocation = (): Promise<LocationData> => {
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

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsGettingLocation(true);
    
    const messageData: MessageData = {
      message: message.trim(),
      location: null,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    try {
      // Attempt to get current location
      const location = await getCurrentLocation();
      messageData.location = location;
      
      // Update current location state and map if it's different
      if (!currentLocation || 
          Math.abs(currentLocation.latitude - location.latitude) > 0.001 ||
          Math.abs(currentLocation.longitude - location.longitude) > 0.001) {
        setCurrentLocation(location);
        const newMapUrl = generateMapUrlFallback(location.latitude, location.longitude);
        setMapUrl(newMapUrl);
      }
      
      console.log('Message sent with location:', {
        message: messageData.message,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: `${location.accuracy}m`,
          timestamp: new Date(location.timestamp).toISOString()
        },
        sentAt: new Date(messageData.timestamp).toISOString()
      });
      
    } catch (error) {
      messageData.locationError = error instanceof Error ? error.message : 'Failed to get location';
      
      console.log('Message sent without location:', {
        message: messageData.message,
        locationError: messageData.locationError,
        sentAt: new Date(messageData.timestamp).toISOString()
      });
    } finally {
      setIsGettingLocation(false);
    }

    // Store the message data
    setMessages(prev => [...prev, messageData]);
    
    // TODO: Implement Vellum integration here
    // You can now send messageData to your backend/API
    
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background elements - similar to main page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-green-600/5"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-green-400/10 to-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-50 p-4 md:p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              LIVE.LY
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={loadSampleLocations}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Load Sample Locations
            </button>
            <div className="flex items-center space-x-2 text-sm text-emerald-700/80">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Live Support</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex flex-1 mx-4 md:mx-6 mb-4 space-x-4">
          {/* Map Container */}
          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl border border-emerald-100">
            {/* Map iframe */}
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Interactive Map"
            ></iframe>
            
            {/* Location indicators overlay */}
            {serviceLocations.length > 0 && (
              <div className="absolute top-4 left-4 space-y-2 max-h-[50%] overflow-y-auto">
                {serviceLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => centerMapOnLocation(location)}
                    className="block bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-emerald-700 transition-colors text-sm font-medium max-w-xs"
                  >
                    📍 {location.LOCATION_NAME}
                  </button>
                ))}
              </div>
            )}
            
            {/* Current location indicator overlay */}
            {currentLocation && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-emerald-200">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 font-medium">Your Location</span>
                </div>
              </div>
            )}
            
            {/* Loading indicator for map updates */}
            {isGettingLocation && (
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 animate-spin text-blue-600">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  <span className="text-blue-700 font-medium">Updating...</span>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel for Location Details */}
          {selectedLocation && (
            <div className="w-80 bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-2xl p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-emerald-600">
                  {selectedLocation.LOCATION_NAME}
                </h2>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Address</h3>
                  <p className="text-gray-800">
                    {selectedLocation.LOCATION_ADDRESS}
                    <br />
                    {selectedLocation.LOCATION_POSTAL_CODE}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Why This Location</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedLocation.REASONING}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button 
                    onClick={() => centerMapOnLocation(selectedLocation)}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Center on Map
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedLocation.latitude && selectedLocation.longitude) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`, '_blank');
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Chat Interface */}
        <div className="mx-4 md:mx-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-2xl p-3 md:p-6">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white md:w-6 md:h-6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5c1.1 0 2-.9 2-2v-7c0-5.52-4.48-10-10-10zm-1 17h-1c-1.1 0-2-.9-2-2s.9-2 2-2h1v4zm0-6H9c-1.1 0-2-.9-2-2s.9-2 2-2h2V9zm2-4h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2V9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-800 text-base md:text-lg">Lively AI</h3>
                    <p className="text-xs md:text-sm text-gray-600">Ask me about resources, locations, or support services</p>
                  </div>
                </div>
                
                {/* Location Status Indicator */}
                <div className="flex items-center space-x-1 text-xs">
                  {locationPermission === 'granted' ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="hidden sm:inline">Location</span>
                    </div>
                  ) : locationPermission === 'denied' ? (
                    <div className="flex items-center space-x-1 text-red-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
                        <path d="m3 3 18 18M21 10c0 2.4-.8 4.7-2.3 6.5l-2-2A7 7 0 0 0 19 10c0-3.9-3.1-7-7-7-1.5 0-2.9.5-4.1 1.3L5.6 2"/>
                      </svg>
                      <span className="hidden sm:inline">No Location</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                      </svg>
                      <span className="hidden sm:inline">Location?</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex items-end space-x-3 bg-gray-50/80 rounded-2xl border-2 border-emerald-100 p-3 hover:border-emerald-200 transition-colors">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Where can I sleep tonight..?"
                    className="w-full bg-transparent px-2 py-2 text-gray-700 placeholder-gray-500 focus:outline-none text-base md:text-lg resize-none overflow-hidden"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '40px',
                      lineHeight: '1.5'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      const scrollHeight = target.scrollHeight;
                      const maxHeight = 100; // Reduced max height
                      target.style.height = Math.min(scrollHeight, maxHeight) + 'px';
                      target.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isGettingLocation}
                  className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-4 py-2.5 md:px-6 md:py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex-shrink-0"
                >
                  <span className="flex items-center space-x-1 md:space-x-2">
                    {isGettingLocation ? (
                      <>
                        <span className="hidden sm:inline text-sm md:text-base">SENDING...</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 animate-spin">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline text-sm md:text-base">SEND</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
                          <path d="M22 2L11 13"/>
                          <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3 justify-center sm:justify-start">
                <button 
                  onClick={() => setMessage("Where can I stay tonight?")}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  Find Shelters
                </button>
                <button 
                  onClick={() => setMessage("Where can I eat for lunch?")}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Food Banks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Navigation */}
        <div className="mx-4 md:mx-6 mb-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-4 shadow-2xl">
              <div className="flex justify-center items-center space-x-12">
                {/* Resources Icon */}
                <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform">
                    <path d="M21 8v13H3V8"/>
                    <path d="M1 3h22l-2 5H3l-2-5z"/>
                    <path d="M10 12v6"/>
                    <path d="M14 12v6"/>
                  </svg>
                </button>

                {/* Home Icon - Active */}
                <div className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>

                {/* Info Icon */}
                <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}