import { Merchant, BankDetails, ThemePreset } from '@/types';

export async function createMerchant(params: {
  uid: string;
  shopName: string;
  logoUrl: string;
  bannerUrl: string;
  theme: ThemePreset;
  bankDetails?: BankDetails;
  bio?: string;
}): Promise<Merchant> {
  const { generateHandle } = await import('@/utils/helpers');
  const handle = generateHandle(params.shopName) || 'my-shop';

  const {
    doc, setDoc, collection, query, where, getDocs, serverTimestamp,
  } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');

  // Ensure unique handle
  let finalHandle = handle;
  let attempt = 0;
  while (attempt < 10) {
    const q = query(collection(db, 'merchants'), where('handle', '==', finalHandle));
    const snap = await getDocs(q);
    if (snap.empty) break;
    attempt++;
    finalHandle = `${handle}-${attempt}`;
  }

  const data: Record<string, unknown> = {
    uid: params.uid,
    shopName: params.shopName,
    handle: finalHandle,
    logoUrl: params.logoUrl,
    bannerUrl: params.bannerUrl,
    theme: params.theme,
    bio: params.bio || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (params.bankDetails !== undefined) data.bankDetails = params.bankDetails;

  await setDoc(doc(db, 'merchants', params.uid), data);

  // Create free trial subscription
  const { createSubscription } = await import('./subscriptions');
  await createSubscription(params.uid);

  return { id: params.uid, ...data } as unknown as Merchant;
}

export async function getMerchantByUid(uid: string): Promise<Merchant | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const snap = await getDoc(doc(db, 'merchants', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as Merchant;
}

export async function getMerchantByHandle(handle: string): Promise<Merchant | null> {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'merchants'), where('handle', '==', handle));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as unknown as Merchant;
}

export async function updateMerchant(
  merchantId: string,
  updates: Partial<Omit<Merchant, 'id' | 'uid' | 'createdAt'>>
): Promise<void> {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'merchants', merchantId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
