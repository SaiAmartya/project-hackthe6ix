import { NextRequest, NextResponse } from 'next/server';
import { Handler } from '../../lib/controller/route.js';

const apiKey = process.env.VELLUM_API_KEY || ""
const workflowID = process.env.WORKFLOWID || process.env.ALTWORKFLOWID || "";
const handler = new Handler(apiKey, workflowID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        {
          data: null,
          status: 'error',
          error: 'userInput is required and must be a string'
        },
        { status: 400 }
      );
    }

    const location = "Toronto"; // Default 
    const result = await handler.MessageHandler(userInput, location);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      {
        data: null,
        status: 'error',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'API is working' });
}