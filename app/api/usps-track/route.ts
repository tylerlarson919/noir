import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function POST(req: NextRequest) {
  try {
    const { trackingNumber } = await req.json();
    if (!trackingNumber) {
      return NextResponse.json({ error: 'Missing trackingNumber' }, { status: 400 });
    }

    const USERID = process.env.USPS_USER_ID;
    if (!USERID) {
      return NextResponse.json({ error: 'USPS_USER_ID not configured' }, { status: 500 });
    }

    const xmlRequest =
      `<TrackFieldRequest USERID="${USERID}">` +
      `<TrackID ID="${trackingNumber}"></TrackID>` +
      `</TrackFieldRequest>`;

    const apiUrl =
      'https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=' +
      encodeURIComponent(xmlRequest);

    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      return NextResponse.json(
        { error: 'USPS API error' },
        { status: apiRes.status }
      );
    }

    const xml = await apiRes.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const json = parser.parse(xml);
    const info = json?.TrackFieldResponse?.TrackInfo;
    if (!info) {
      return NextResponse.json({ error: 'Invalid USPS response' }, { status: 500 });
    }

    // map USPS categories to UI steps
    const cat = info.StatusCategory;
    let statusIndex = 2; // default to Shipping
    switch (cat) {
      case 'Pre-Shipment':
        statusIndex = 0;
        break;
      case 'Label Created':
      case 'Accepted':
      case 'Processed':
        statusIndex = 1;
        break;
      case 'In-Transit':
      case 'Out for Delivery':
        statusIndex = 2;
        break;
      case 'Delivered':
        statusIndex = 3;
        break;
    }

    const summary = info.TrackSummary;
    const date = summary?.EventDate;
    const time = summary?.EventTime;
    const lastUpdate = date && time
      ? new Date(`${date} ${time}`).toISOString()
      : new Date().toISOString();

    const details = summary?.Event || summary?.Status || '';

    return NextResponse.json({ statusIndex, lastUpdate, details });
  } catch (err) {
    console.error('USPS track error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
