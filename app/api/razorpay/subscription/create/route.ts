import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayInstance } from '@/lib/razorpay/server';

export async function POST(req: NextRequest) {
  try {
    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId required' }, { status: 400 });
    }

    const planId = process.env.RAZORPAY_SUBSCRIPTION_PLAN_ID;
    if (!planId) {
      return NextResponse.json({ error: 'Subscription plan not configured' }, { status: 500 });
    }

    const rzp = getRazorpayInstance();

    const subscription = await rzp.subscriptions.create({
      plan_id: planId,
      total_count: 120, // 10 years of monthly billing
      quantity: 1,
      customer_notify: 1,
      notes: { merchantId },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[subscription/create]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
