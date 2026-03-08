import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
function getAdminDb() {
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
  try {
    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = body;

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order in Firestore
    try {
      const db = getAdminDb();
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'paid',
        orderStatus: 'paid',
        razorpayPaymentId,
        razorpayOrderId,
        updatedAt: new Date(),
      });
    } catch (dbError) {
      console.error('DB update failed:', dbError);
      // Still return success — payment was verified
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
