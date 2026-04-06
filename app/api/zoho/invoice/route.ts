import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice, accessToken, organizationId } = body;

    if (!invoice || !accessToken || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Transform our invoice format to Zoho Books format
    const zohoInvoice = {
      customer_name: invoice.customerName,
      ...(invoice.customerEmail && { 
        contact_persons: [{ email: invoice.customerEmail }] 
      }),
      date: invoice.date,
      due_date: invoice.dueDate,
      ...(invoice.invoiceNumber && { invoice_number: invoice.invoiceNumber }),
      line_items: invoice.items.map((item: any) => ({
        name: item.name,
        description: item.description || '',
        rate: item.rate,
        quantity: item.quantity,
        ...(item.tax && { tax_percentage: item.tax }),
      })),
      notes: invoice.notes || '',
    };

    // Create invoice in Zoho Books
    const zohoUrl = `https://www.zohoapis.com/books/v3/invoices?organization_id=${organizationId}`;
    
    const response = await fetch(zohoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zohoInvoice),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Zoho API error:', data);
      return NextResponse.json(
        { 
          error: data.message || 'Failed to create invoice in Zoho Books',
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: data.invoice,
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
