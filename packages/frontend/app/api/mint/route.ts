import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for the Relayer service URL. 
// In a real deployment, this should be an environment variable.
const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3001/relayer'; 

export async function POST(req: NextRequest) {
  try {
    const mintData = await req.json();

    // 1. Validate the incoming data (basic check)
    if (!mintData.to || !mintData.quantity || !mintData.eventId || !mintData.ticketType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: to, quantity, eventId, or ticketType' 
      }, { status: 400 });
    }

    // 2. Forward the request to the Relayer's new /mint endpoint
    const relayerResponse = await fetch(`${RELAYER_URL}/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mintData),
    });

    const relayerResult = await relayerResponse.json();

    // 3. Return the Relayer's response to the client
    if (relayerResponse.ok) {
      return NextResponse.json(relayerResult, { status: 200 });
    } else {
      // Handle errors from the Relayer service
      return NextResponse.json(relayerResult, { status: relayerResponse.status });
    }

  } catch (error) {
    console.error('API Mint Proxy Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
