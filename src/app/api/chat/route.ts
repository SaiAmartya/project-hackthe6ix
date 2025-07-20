import { NextRequest, NextResponse } from 'next/server';
import { Handler } from '../../../lib/vellum/controller/route';
import { CONFIG } from '../../../config';

// Helper function to extract clean message content from Vellum response
function extractMessageFromVellumResponse(responseData: string): string | null {
  try {
    const parsed = JSON.parse(responseData);
    
    // Handle Vellum response structure: data.outputs is an array
    if (parsed?.data?.outputs && Array.isArray(parsed.data.outputs)) {
      interface VellumOutput {
        type?: string;
        name?: string;
        value?: string;
      }
      
      // First, look for STRING type outputs (these are usually messages)
      const stringOutput = parsed.data.outputs.find((output: VellumOutput) => 
        output.type === 'STRING' && output.value && typeof output.value === 'string'
      );
      if (stringOutput?.value) {
        return stringOutput.value;
      }
      
      // If no STRING output found, look for any output with a string value
      const anyOutput = parsed.data.outputs.find((output: VellumOutput) => 
        output.value && typeof output.value === 'string' && output.type !== 'JSON'
      );
      if (anyOutput?.value) {
        return anyOutput.value;
      }
    }
    
    // Legacy fallback: check if outputs is a single object
    if (parsed?.data?.outputs?.value && typeof parsed.data.outputs.value === 'string') {
      return parsed.data.outputs.value;
    }
    
    // Check for outputs object with named properties (legacy format)
    if (parsed?.data?.outputs && typeof parsed.data.outputs === 'object' && !Array.isArray(parsed.data.outputs)) {
      interface VellumOutputValue {
        type?: string;
        value?: string;
      }
      
      const outputValues = Object.values(parsed.data.outputs);
      const messageOutput = outputValues.find((output: unknown): output is VellumOutputValue => 
        typeof output === 'object' && 
        output !== null && 
        'type' in output && 
        'value' in output &&
        (output as VellumOutputValue).type === 'STRING' && 
        typeof (output as VellumOutputValue).value === 'string'
      );
      if (messageOutput?.value) {
        return messageOutput.value;
      }
    }
    
    // Fallback: if it's a simple string response
    if (typeof parsed === 'string') {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse Vellum response:', error);
    // If parsing fails, check if the original data is already a clean string
    if (typeof responseData === 'string' && !responseData.startsWith('{')) {
      return responseData;
    }
    return null;
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = CONFIG.VELLUM_API_KEY;
    const workflowID = CONFIG.WORKFLOWID || CONFIG.ALTWORKFLOWID;

    if (!apiKey || !workflowID) {
      return NextResponse.json(
        { error: 'Missing Vellum API configuration' },
        { status: 500 }
      );
    }

    const handler = new Handler(apiKey, workflowID);
    
    // Convert location to city name or use default
    let locationString = 'Toronto';
    if (body.location) {
      // For now, use Toronto as default. In future, you could implement reverse geocoding
      locationString = 'Toronto';
    }

    const result = await handler.MessageHandler(
      body.message.trim(), 
      locationString,
      body.chatHistory
    );

    if (result.status === 'success' && result.data) {
      console.log('Raw Vellum response:', result.data);
      
      // Try to parse as JSON first (for location decisions)
      try {
        const jsonData = JSON.parse(result.data);
        console.log('Parsed Vellum response:', JSON.stringify(jsonData, null, 2));
        
        // Check if this is a Vellum response wrapper
        if (jsonData?.data?.outputs && Array.isArray(jsonData.data.outputs)) {
          // Look for JSON outputs that might contain location data
          for (const output of jsonData.data.outputs) {
            if (output.type === 'JSON' && output.value) {
              try {
                const locationData = typeof output.value === 'string' ? JSON.parse(output.value) : output.value;
                console.log('Found JSON output:', JSON.stringify(locationData, null, 2));
                
                // Check if it contains location data
                if (locationData && locationData.locations && Array.isArray(locationData.locations)) {
                  console.log('Detected location response');
                  return NextResponse.json({
                    type: 'locations',
                    data: locationData,
                    message: body.message
                  });
                }
              } catch (e) {
                console.log('Failed to parse JSON output value:', e);
              }
            }
          }
          
          // If no location data found, extract the message content
          const cleanMessage = extractMessageFromVellumResponse(result.data);
          if (cleanMessage) {
            console.log('Extracted clean message:', cleanMessage);
            return NextResponse.json({
              type: 'message',
              data: cleanMessage,
              message: body.message
            });
          }
        }
        
        // Fallback: check if the top-level JSON contains locations directly
        if (jsonData && jsonData.locations && Array.isArray(jsonData.locations)) {
          console.log('Found direct location data');
          return NextResponse.json({
            type: 'locations',
            data: jsonData,
            message: body.message
          });
        }
        
        // Extract clean message as fallback
        const cleanMessage = extractMessageFromVellumResponse(result.data);
        if (cleanMessage) {
          console.log('Extracted clean message (fallback):', cleanMessage);
          return NextResponse.json({
            type: 'message',
            data: cleanMessage,
            message: body.message
          });
        } else {
          // Fallback to raw data if extraction fails
          console.warn('Failed to extract clean message from Vellum response, using raw data');
          return NextResponse.json({
            type: 'message',
            data: result.data,
            message: body.message
          });
        }
      } catch {
        // Not JSON, treat as regular text response
        console.log('Response is not JSON, using as-is');
        return NextResponse.json({
          type: 'message',
          data: result.data,
          message: body.message
        });
      }
    } else {
      return NextResponse.json(
        { 
          error: result.message || 'Failed to process message',
          originalMessage: body.message
        },
        { status: 500 }
      );
    }
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