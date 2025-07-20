'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  locations?: DecisionLocation[];
}

interface DecisionLocation {
  location_name: string;
  location_address: string;
  location_postal_code: string;
  longitude: number;
  latitude: number;
  reasoning?: string;
  resource_type: 'shelter' | 'food_bank';
  hours?: string;
}

// Raw API response that might have typos
interface RawLocationResponse {
  location_name: string;
  location_address: string;
  location_postal_code: string;
  longitude: number | string;
  latitude?: number | string;
  lattitude?: number | string; // API typo
  reasoning?: string;
  resource_type: 'shelter' | 'food_bank';
  hours?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Helper function to validate and convert coordinates
const validateCoordinates = (lat: unknown, lng: unknown): { lat: number; lng: number } | null => {
  // Convert to numbers if they're strings
  const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  // Check if they're valid numbers
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
      isNaN(latitude) || isNaN(longitude) || 
      !isFinite(latitude) || !isFinite(longitude)) {
    return null;
  }
  
  // Check if they're within valid coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  
  return { lat: latitude, lng: longitude };
};

// Helper function to filter and validate locations
const getValidLocations = (locations: DecisionLocation[]): DecisionLocation[] => {
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

const MapComponent = ({ locations, userLocation }: { locations: DecisionLocation[], userLocation: LocationData | null }) => {
  const defaultCenter = { lat: 43.71837, lng: -79.54286 }; // Toronto
  const position = userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : defaultCenter;

  // Filter out locations with invalid coordinates
  const validLocations = getValidLocations(locations);

  console.log('MapComponent render:', {
    totalLocations: locations.length,
    validLocations: validLocations.length,
    locations: validLocations
  });

  const handleMarkerClick = (location: DecisionLocation) => {
    console.log('Marker clicked:', location);
    const destination = encodeURIComponent(`${location.location_address}, ${location.location_postal_code}`);
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    
    if (userLocation) {
      const origin = encodeURIComponent(`${userLocation.latitude},${userLocation.longitude}`);
      mapsUrl += `&origin=${origin}`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={position}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapId="your-map-id"
        clickableIcons={false}
      >
        {validLocations.map((loc, index) => {
          const coords = validateCoordinates(loc.latitude, loc.longitude);
          if (!coords) {
            console.warn('Invalid coordinates for marker:', loc);
            return null;
          }
          
          console.log(`Rendering marker ${index + 1}:`, {
            name: loc.location_name,
            coords,
            type: loc.resource_type
          });
          
          const isShelter = loc.resource_type === 'shelter';
          return (
            <Marker
              key={`${loc.location_name}-${index}`}
              position={coords}
              title={loc.location_name}
              onClick={() => handleMarkerClick(loc)}
              // Simplified icon to ensure rendering works
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
      </Map>
      
      {/* Location counter overlay */}
      {validLocations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-emerald-200">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-700 font-medium">
              {validLocations.length} location{validLocations.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Error boundary component for map rendering
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

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [currentLocations, setCurrentLocations] = useState<DecisionLocation[]>([]);

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
        })
        .catch((error) => {
          console.log('Could not get initial location for map:', error.message);
        });
    }
  }, [locationPermission, currentLocation]);

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

  const sendMessageToAPI = async (messageText: string, location?: LocationData) => {
    // Include the current user message in chat history
    const chatHistory = [
      ...chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: messageText
      }
    ];

    const requestBody = {
      message: messageText,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude
      } : undefined,
      chatHistory
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    const responseData = await response.json();
    
    // Validate and sanitize location data if present
    if (responseData.type === 'locations' && responseData.data?.locations) {
      responseData.data.locations = responseData.data.locations.map((loc: RawLocationResponse): DecisionLocation => {
        // Fix the API typo: 'lattitude' should be 'latitude'
        const latitude = loc.latitude || loc.lattitude;
        const longitude = loc.longitude;
        
        return {
          ...loc,
          latitude: typeof latitude === 'string' ? parseFloat(latitude) : (latitude as number),
          longitude: typeof longitude === 'string' ? parseFloat(longitude) : longitude,
        };
      }).filter((loc: DecisionLocation) => {
        const coords = validateCoordinates(loc.latitude, loc.longitude);
        if (!coords) {
          console.warn(`Filtering out location with invalid coordinates: ${loc.location_name}`, {
            latitude: loc.latitude,
            longitude: loc.longitude
          });
          return false;
        }
        return true;
      });
      
      console.log('Processed locations:', responseData.data.locations.length, responseData.data.locations);
    }

    return responseData;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setIsGettingLocation(true);
    
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message.trim(),
      timestamp: Date.now()
    };

    // Add user message immediately
    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      // Attempt to get current location
      let location = currentLocation;
      if (!location) {
        try {
          location = await getCurrentLocation();
          setCurrentLocation(location);
        } catch (error) {
          console.log('Could not get location:', error);
        }
      }

      // Send message to API
      const response = await sendMessageToAPI(userMessage.content, location || undefined);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.type === 'locations' ? 'Here are some recommended locations for you:' : response.data,
        timestamp: Date.now(),
        locations: response.type === 'locations' ? response.data.locations : undefined
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Update map with new locations if provided
      if (response.type === 'locations' && response.data.locations) {
        setCurrentLocations(response.data.locations);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGettingLocation(false);
      setIsSending(false);
    }
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
            <div className="flex items-center space-x-2 text-sm text-emerald-700/80">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Live Support</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-[calc(100vh-80px)]">
        {/* Map Container */}
        <div className="flex-1 relative mx-4 md:mx-6 mb-4 rounded-2xl overflow-hidden shadow-2xl border border-emerald-100">
          <APIProvider apiKey={API_KEY}>
            <MapErrorBoundary>
              <MapComponent locations={currentLocations} userLocation={currentLocation} />
            </MapErrorBoundary>
          </APIProvider>
          
          {/* Location indicator overlay */}
          {currentLocation && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-emerald-200">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-medium">Your Location</span>
              </div>
            </div>
          )}
          
          {/* Loading indicator for map updates */}
          {isGettingLocation && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 animate-spin text-blue-600">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <span className="text-blue-700 font-medium">Updating...</span>
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

              {/* Chat Messages Display */}
              {chatMessages.length > 0 && (
                <div className="mb-4 max-h-60 overflow-y-auto space-y-3 p-4 bg-gray-50/50 rounded-xl">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        {msg.locations && (
                          <div className="mt-2 text-xs">
                            <p className="font-medium">Showing {msg.locations.length} locations on map</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="flex items-end space-x-3 bg-gray-50/80 rounded-2xl border-2 border-emerald-100 p-3 hover:border-emerald-200 transition-colors">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Where can I sleep tonight..?"
                    disabled={isSending}
                    className="w-full bg-transparent px-2 py-2 text-gray-700 placeholder-gray-500 focus:outline-none text-base md:text-lg resize-none overflow-hidden disabled:opacity-50"
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
                  disabled={!message.trim() || isSending}
                  className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-4 py-2.5 md:px-6 md:py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex-shrink-0"
                >
                  <span className="flex items-center space-x-1 md:space-x-2">
                    {isSending ? (
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
                  disabled={isSending}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm font-medium hover:bg-emerald-200 transition-colors disabled:opacity-50"
                >
                  Find Shelters
                </button>
                <button 
                  onClick={() => setMessage("Where can I eat for lunch?")}
                  disabled={isSending}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  Food Banks
                </button>
                <button 
                  onClick={() => setMessage("I need help finding mental health resources")}
                  disabled={isSending}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  Mental Health
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