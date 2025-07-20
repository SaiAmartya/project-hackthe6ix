import { NextRequest, NextResponse } from 'next/server';
import { Handler } from '../../../lib/vellum/controller/route';
import { CONFIG } from '../../../config';

// Types for better type safety
interface ChatRequest {
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

interface VellumOutput {
  type?: string;
  name?: string;
  value?: string | Record<string, unknown>;
}

interface LocationData {
  locations: Array<{
    location_name: string;
    location_address: string;
    location_postal_code: string;
    longitude: number;
    latitude?: number;
    lattitude?: number; // API typo handling
    reasoning?: string;
    resource_type: 'shelter' | 'food_bank';
    hours?: string;
  }>;
}

// Clean utility functions
const parseJSONSafely = (data: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(data) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const extractStringOutput = (outputs: VellumOutput[]): string | null => {
  const stringOutput = outputs.find(output => 
    output.type === 'STRING' && output.value && typeof output.value === 'string'
  );
  return stringOutput?.value as string || null;
};

const extractLocationOutput = (outputs: VellumOutput[]): LocationData | null => {
  for (const output of outputs) {
    if (output.type === 'JSON' && output.value) {
      try {
        const locationData = typeof output.value === 'string' 
          ? JSON.parse(output.value) 
          : output.value;
        
        if (locationData && typeof locationData === 'object' && 'locations' in locationData && Array.isArray(locationData.locations)) {
          return locationData as LocationData;
        }
      } catch {
        continue;
      }
    }
  }
  return null;
};

const processVellumResponse = (responseData: string) => {
  const parsed = parseJSONSafely(responseData);
  if (!parsed?.data || typeof parsed.data !== 'object' || !('outputs' in parsed.data) || !Array.isArray(parsed.data.outputs)) {
    return { type: 'message', data: responseData };
  }

  // Check for location data first
  const locationData = extractLocationOutput(parsed.data.outputs as VellumOutput[]);
  if (locationData) {
    console.log('Detected location response');
    return { type: 'locations', data: locationData };
  }

  // Extract message content
  const messageContent = extractStringOutput(parsed.data.outputs as VellumOutput[]);
  if (messageContent) {
    console.log('Extracted message content');
    return { type: 'message', data: messageContent };
  }

  // Fallback to raw data
  console.warn('Using raw data as fallback');
  return { type: 'message', data: responseData };
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const { VELLUM_API_KEY: apiKey, WORKFLOWID, ALTWORKFLOWID } = CONFIG;
    const workflowID = WORKFLOWID || ALTWORKFLOWID;

    if (!apiKey || !workflowID) {
      return NextResponse.json(
        { error: 'Missing Vellum API configuration' },
        { status: 500 }
      );
    }

    const handler = new Handler(apiKey, workflowID);
    const locationString = body.location ? 'Toronto' : 'Toronto'; // Can be enhanced for actual geocoding
    
    const result = await handler.MessageHandler(
      body.message.trim(), 
      locationString,
      body.chatHistory
    );

    if (result.status !== 'success' || !result.data) {
      return NextResponse.json(
        { 
          error: result.message || 'Failed to process message',
          originalMessage: body.message
        },
        { status: 500 }
      );
    }

    console.log('Raw Vellum response:', result.data);
    const processedResponse = processVellumResponse(result.data);
    
    return NextResponse.json({
      ...processedResponse,
      message: body.message
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chat API is running' },
    { status: 200 }
  );
} 