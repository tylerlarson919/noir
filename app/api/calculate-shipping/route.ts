import { NextResponse } from 'next/server';
import { getShippingFee } from '@/lib/shipping';

export async function POST(req: Request) {
  const { address, items, amount } = await req.json();
  
  // Extract country and region from address
  const country = address?.country || '';
  const region = address?.region || null;
  
  // Convert amount from cents to decimal for shipping calculation
  // (assuming amount is in cents)
  const subtotal = amount / 100;
  
  // Calculate shipping fee using the shipping.ts logic
  const { fee, currency } = getShippingFee(country, region, subtotal);
  
  // Convert fee back to cents for consistency
  const shippingFeeInCents = Math.round(fee * 100);
  
  const shippingOptions = [
    {
      id: 'standard',
      label: 'Standard Shipping',
      detail: fee === 0 ? 'Free Shipping' : '3-5 business days',
      amount: shippingFeeInCents
    }
  ];
  
  // Calculate the total with shipping
  const total = amount + shippingFeeInCents;
  
  return NextResponse.json({
    shippingOptions: shippingOptions,
    total: total,
    currency: currency
  });
}