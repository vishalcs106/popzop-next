import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayInstance } from '@/lib/razorpay/server';
import { amountToRazorpay } from '@/utils/currency';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, merchantId, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amountToRazorpay(amount),
      currency: 'INR',
      notes: {
        merchantId,
        ...notes,
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
