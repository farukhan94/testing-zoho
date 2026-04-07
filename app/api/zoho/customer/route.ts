import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, accessToken, organizationId } = body;

    if (!customerName || !accessToken || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First, search for existing customer by name
    const searchUrl = `https://www.zohoapis.com/books/v3/contacts?organization_id=${organizationId}&contact_name=${encodeURIComponent(customerName)}`;
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const searchData = await searchResponse.json();

    // If customer exists, return the first match
    if (searchData.contacts && searchData.contacts.length > 0) {
      return NextResponse.json({
        success: true,
        customer: searchData.contacts[0],
        customerId: searchData.contacts[0].contact_id,
        existing: true,
      });
    }

    // If customer doesn't exist, create new customer
    const createUrl = `https://www.zohoapis.com/books/v3/contacts?organization_id=${organizationId}`;
    
    const customerData: any = {
      contact_name: customerName,
      contact_type: 'customer',
    };

    // Add email if provided
    if (customerEmail) {
      customerData.contact_persons = [{
        email: customerEmail,
        is_primary_contact: true,
      }];
    }

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error('Zoho API error creating customer:', createData);
      return NextResponse.json(
        { 
          error: createData.message || 'Failed to create customer in Zoho Books',
          details: createData 
        },
        { status: createResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      customer: createData.contact,
      customerId: createData.contact.contact_id,
      existing: false,
    });
  } catch (error) {
    console.error('Customer operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
