import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bearerToken = searchParams.get('token');
    const searchQuery = searchParams.get('search');
    const perPage = searchParams.get('per_page') || '10';

    if (!bearerToken) {
      return NextResponse.json(
        { error: 'Missing bearer token' },
        { status: 400 }
      );
    }

    // Build TailorJet API URL
    let tailorjetUrl = `https://stage.tailorjet.com/api/items?per_page=${perPage}&sort_field=created_at&sort_direction=desc`;
    
    if (searchQuery) {
      tailorjetUrl += `&search=${encodeURIComponent(searchQuery)}`;
    }

    const response = await fetch(tailorjetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('TailorJet API error:', data);
      return NextResponse.json(
        { 
          error: data.message || 'Failed to fetch items from TailorJet',
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      items: data.data,
      meta: data.meta,
    });
  } catch (error) {
    console.error('Item search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
