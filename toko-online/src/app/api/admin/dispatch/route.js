import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    const response = await fetch('https://api.biteship.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BITESHIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "shipper_contact_name": "Admin Toko Hanata",
        "shipper_contact_phone": "08123456789",
        "origin_address": "Surabaya, Jawa Timur",
        "destination_contact_name": "Pelanggan Setia",
        "destination_contact_phone": "08123456789",
        "destination_address": "Alamat tujuan pelanggan...",
        "courier_company": "gosend",
        "courier_type": "instant",
        "items": [
          {
            "name": "Box Container / Keranjang Industri Rapat Hanata 3101",
            "value": 175000,
            "quantity": 1
          }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data.error || 'Gagal memanggil kurir' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      courierResi: data.waybill_id || data.order_id || 'GS-INSTANT-SUCCESS' 
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}