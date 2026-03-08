import { Subscription, SubscriptionStatus } from '@/types';

export async function createSubscription(merchantId: string): Promise<Subscription> {
  const { doc, setDoc, serverTimestamp, Timestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');

  const trialEndsAt = new Date();
  trialEndsAt.setMonth(trialEndsAt.getMonth() + 1);

  const data = {
    merchantId,
    status: 'trial' as SubscriptionStatus,
    trialEndsAt: Timestamp.fromDate(trialEndsAt),
    planAmount: 39900, // ₹399 in paise
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'subscriptions', merchantId), data);
  return { id: merchantId, ...data, trialEndsAt } as unknown as Subscription;
}

export async function getSubscription(merchantId: string): Promise<Subscription | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const snap = await getDoc(doc(db, 'subscriptions', merchantId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as Subscription;
}

export async function updateSubscription(
  merchantId: string,
  updates: Partial<Omit<Subscription, 'id' | 'merchantId' | 'createdAt'>>
): Promise<void> {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'subscriptions', merchantId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
