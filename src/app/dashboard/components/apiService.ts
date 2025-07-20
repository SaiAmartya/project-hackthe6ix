import { ChatRequest, ChatMessage, LocationData, DecisionLocation } from './types';

interface RawLocationResponse {
  location_name: string;
  location_address: string;
  location_postal_code: string;
  longitude: number | string;
  latitude?: number | string;
  lattitude?: number | string; // API typo handling
  reasoning?: string;
  resource_type: 'shelter' | 'food_bank';
  hours?: string;
}

interface ApiResponse {
  type: 'message' | 'locations';
  data: string | { locations: DecisionLocation[] };
  message: string;
}

// Process raw location data and fix API typos
const processLocationData = (rawLocations: RawLocationResponse[]): DecisionLocation[] => {
  return rawLocations.map((loc): DecisionLocation => {
    // Fix the API typo: 'lattitude' should be 'latitude'
    const latitude = loc.latitude || loc.lattitude;
    const longitude = loc.longitude;
    
    return {
      ...loc,
      latitude: typeof latitude === 'string' ? parseFloat(latitude) : (latitude as number),
      longitude: typeof longitude === 'string' ? parseFloat(longitude) : longitude,
    };
  }).filter((loc) => {
    // Basic validation - could be moved to utils if needed elsewhere
    const lat = loc.latitude;
    const lng = loc.longitude;
    const isValid = !isNaN(lat) && !isNaN(lng) && 
                   lat >= -90 && lat <= 90 && 
                   lng >= -180 && lng <= 180;
    
    if (!isValid) {
      console.warn(`Filtering out location with invalid coordinates: ${loc.location_name}`, {
        latitude: lat,
        longitude: lng
      });
    }
    return isValid;
  });
};

export const sendMessageToAPI = async (
  messageText: string, 
  location: LocationData | null,
  chatHistory: ChatMessage[]
): Promise<ApiResponse> => {
  // Convert chat messages to API format
  const apiChatHistory = [
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user' as const,
      content: messageText
    }
  ];

  const requestBody: ChatRequest = {
    message: messageText,
    location: location ? {
      latitude: location.latitude,
      longitude: location.longitude
    } : undefined,
    chatHistory: apiChatHistory
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

  const responseData: ApiResponse = await response.json();
  
  // Process location data if present
  if (responseData.type === 'locations' && 
      typeof responseData.data === 'object' && 
      responseData.data !== null && 
      'locations' in responseData.data && 
      Array.isArray(responseData.data.locations)) {
    responseData.data.locations = processLocationData(responseData.data.locations);
    console.log('Processed locations:', responseData.data.locations.length, responseData.data.locations);
  }

  return responseData;
}; 