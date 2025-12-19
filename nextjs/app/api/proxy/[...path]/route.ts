import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://main-api:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, 'GET', resolvedParams.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, 'POST', resolvedParams.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, 'PUT', resolvedParams.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, 'DELETE', resolvedParams.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, 'PATCH', resolvedParams.path);
}

async function handleRequest(
  request: NextRequest,
  method: string,
  pathSegments: string[]
) {
  try {
    // Reconstruct the path - add /api prefix since main-api routes are under /api
    const path = '/api/' + pathSegments.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const fullPath = `${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`[Proxy] ${method} ${fullPath} -> ${API_BASE_URL}${fullPath}`);

    // Get headers (excluding host and connection, but preserve Content-Type)
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'host' &&
        lowerKey !== 'connection' &&
        lowerKey !== 'content-length'
      ) {
        headers[key] = value;
      }
    });

    // Ensure Content-Type is set for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Get body for POST, PUT, PATCH
    let body: BodyInit | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const bodyText = await request.text();
        body = bodyText || undefined;
      } catch (e) {
        // No body or error reading body
        body = undefined;
      }
    }

    // Forward request to main-api
    console.log(`[Proxy] Forwarding ${method} to ${API_BASE_URL}${fullPath}`, {
      hasBody: !!body,
      bodyLength: body ? (typeof body === 'string' ? body.length : 'unknown') : 0,
      headers: Object.keys(headers),
    });

    const response = await fetch(`${API_BASE_URL}${fullPath}`, {
      method,
      headers,
      body,
    });

    // Get response data - read only once
    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json') || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      try {
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          data = { error: 'Empty response' };
        }
      } catch (e) {
        // If JSON parsing fails, return error
        console.error('[Proxy] JSON parse error:', e, 'Response text:', responseText);
        data = { error: 'Invalid JSON response', message: responseText, status: response.status };
      }
    } else {
      // If not JSON, return as text
      data = { error: responseText || 'Unknown error', status: response.status };
    }

    console.log(`[Proxy] Response status: ${response.status}`, { dataKeys: Object.keys(data) });

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
