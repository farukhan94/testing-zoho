import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobOrder, bearerToken } = body;

    if (!jobOrder || !bearerToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Use items as-is, they already have IDs from the frontend
    const itemsWithIds = jobOrder.items;

    // Build the TailorJet job order payload
    const tailorjetPayload = {
      initialType: 'create',
      order_date: jobOrder.order_date,
      trial_date: jobOrder.trial_date,
      due_date: jobOrder.due_date,
      id: '',
      is_locked: false,
      order_number: '',
      customer: jobOrder.customer,
      customer_name: jobOrder.customer_name,
      phone_number: jobOrder.phone_number || '-',
      vat_number: jobOrder.vat_number || '-',
      is_domestic: jobOrder.is_domestic,
      address1: jobOrder.address1 || [],
      address2: jobOrder.address2 || '',
      country: jobOrder.country,
      location: jobOrder.location,
      customer_location: jobOrder.customer_location,
      vat_group: jobOrder.vat_group,
      branch: jobOrder.branch,
      items: itemsWithIds,
      order_detail_info: jobOrder.order_detail_info || '',
      discount_percentage: jobOrder.discount_percentage || '',
      discount_amount: jobOrder.discount_amount || '0.000',
      gross_total: jobOrder.gross_total,
      sub_total: jobOrder.sub_total,
      vat_amount: jobOrder.vat_amount,
      is_advance_job: jobOrder.is_advance_job || false,
      net_total: jobOrder.net_total,
      advance_payment: jobOrder.advance_payment || '0.000',
      balance: jobOrder.balance,
      payment: jobOrder.payment || '0.000',
      payment_type: jobOrder.payment_type || '',
      payment_date: jobOrder.payment_date,
      payment_amount: jobOrder.payment_amount || '',
      payment_reference: jobOrder.payment_reference || '',
      payments: jobOrder.payments || [],
      trouser: jobOrder.trouser || {
        id: '',
        waist_measurement: '1',
        hip_measurement: '1',
        waist_line_to_heel: 0,
        thigh_measurement: 0,
        knee_measurement: 0,
        bottom_measurement: 0,
        waist_to_crotch: 0,
        back_condition: 'round_back',
      },
      jacket: jobOrder.jacket || {
        id: '',
        shoulder_seam_to_first_bone: 0,
        around_chest: 0,
        around_waist: 0,
        around_hip: 0,
        tip_to_tip_shoulder: 0,
        center_back_sleeve_seam: 0,
        shoulder_tip_to_below_wrist: 0,
        color_seam_natural_waist: 0,
        shoulder_seam_mid_rise: 0,
        sleeve_length: 0,
        neck_around: 0,
        shoulder_type: '',
        chest_type: '',
      },
    };

    // Create job order in TailorJet
    const tailorjetUrl = 'https://stage.tailorjet.com/api/job_orders';

    const response = await fetch(tailorjetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tailorjetPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('TailorJet API error:', data);
      return NextResponse.json(
        { 
          error: data.message || 'Failed to create job order in TailorJet',
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      jobOrder: data.data,
      orderNumber: data.data.order_number,
    });
  } catch (error) {
    console.error('Job order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
