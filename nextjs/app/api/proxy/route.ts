import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://main-api:8080';

export async function GET(
  request: NextRequest
) {
  return handleRequest(request, 'GET');
}

export async function POST(
  request: NextRequest
) {
  return handleRequest(request, 'POST');
}

export async function PUT(
  request: NextRequest
) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(
  request: NextRequest
) {
  return handleRequest(request, 'DELETE');
}

export async function PATCH(
  request: NextRequest
) {
  return handleRequest(request, 'PATCH');
}

async function handleRequest(request: NextRequest, method: string) {
  try {
    // Get the path from the request URL - add /api prefix since main-api routes are under /api
    const url = new URL(request.url);
    const path = '/api' + url.pathname.replace('/api/proxy', '');
    const searchParams = url.searchParams.toString();
    const fullPath = `${path}${searchParams ? `?${searchParams}` : ''}`;

    // Get headers (excluding host and connection)
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'connection' &&
        key.toLowerCase() !== 'content-length'
      ) {
        headers[key] = value;
      }
    });

    // Get body for POST, PUT, PATCH
    let body: BodyInit | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (e) {
        // No body
      }
    }

    // Forward request to main-api
    const response = await fetch(`${API_BASE_URL}${fullPath}`, {
      method,
      headers,
      body,
    });

    // Get response data
    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        } else {
          data = { error: 'Empty response' };
        }
      } catch (e) {
        // If JSON parsing fails, return error
        data = { error: 'Invalid JSON response', message: await response.text() };
      }
    } else {
      const text = await response.text();
      // Try to parse as JSON even if content-type is not set
      try {
        data = JSON.parse(text);
      } catch (e) {
        // If not JSON, return as text
        data = { error: text || 'Unknown error', status: response.status };
      }
    }

    // Return response with same status and headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
