export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface DecisionLocation {
  location_name: string;
  location_address: string;
  location_postal_code: string;
  longitude: number;
  latitude: number;
  reasoning?: string;
  resource_type: 'shelter' | 'food_bank';
  hours?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  locations?: DecisionLocation[];
}

export interface ChatRequest {
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  chatHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unknown'; 