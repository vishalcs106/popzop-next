import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay/server';
import { getFirestore, doc, query, collection, where, getDocs, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

async function getDb() {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function POST(req: NextRequest) {
  console.log('[webhook] Received request');

  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  console.log('[webhook] Signature present:', !!signature);

  if (!verifyWebhookSignature(body, signature)) {
    console.error('[webhook] Signature verification FAILED');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[webhook] Signature verified OK');

  const event = JSON.parse(body);
  const { event: eventName, payload } = event;

  console.log('[webhook] Event:', eventName);

  const sub = payload?.subscription?.entity;
  if (!sub) {
    console.warn('[webhook] No subscription entity in payload, skipping');
    return NextResponse.json({ ok: true });
  }

  const razorpaySubscriptionId: string = sub.id;
  const merchantId: string = sub.notes?.merchantId;

  console.log('[webhook] razorpaySubscriptionId:', razorpaySubscriptionId);
  console.log('[webhook] merchantId from notes:', merchantId);

  if (!merchantId) {
    console.warn('[webhook] No merchantId in subscription notes, skipping');
    return NextResponse.json({ ok: true });
  }

  try {
    console.log('[webhook] Initializing Firebase Admin...');
    const db = await getDb();
    console.log('[webhook] Firebase Admin ready');

    const subRef = db.collection('subscriptions').doc(merchantId);

    if (eventName === 'subscription.activated' || eventName === 'subscription.charged') {
      const currentPeriodEnd = sub.current_end
        ? new Date(sub.current_end * 1000)
        : (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })();

      console.log('[webhook] Updating status → active, currentPeriodEnd:', currentPeriodEnd);
      await subRef.update({
        status: 'active',
        razorpaySubscriptionId,
        currentPeriodEnd,
        updatedAt: new Date(),
      });
      console.log('[webhook] Firestore updated → active');
    } else if (eventName === 'subscription.cancelled' || eventName === 'subscription.completed') {
      console.log('[webhook] Updating status → cancelled');
      await subRef.update({
        status: 'cancelled',
        updatedAt: new Date(),
      });
      console.log('[webhook] Firestore updated → cancelled');
    } else if (eventName === 'subscription.halted') {
      console.log('[webhook] Updating status → expired');
      await subRef.update({
        status: 'expired',
        updatedAt: new Date(),
      });
      console.log('[webhook] Firestore updated → expired');
    } else {
      console.log('[webhook] Unhandled event type, no Firestore update');
    }
  } catch (err) {
    console.error('[webhook] Firestore update FAILED:', err);
  }

  return NextResponse.json({ ok: true });
}
