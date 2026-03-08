import { Merchant, BankDetails, ThemePreset } from '@/types';
import { generateHandle } from '@/utils/helpers';

const IS_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

// ─── Bypass helpers ───────────────────────────────────────────────────────────
function bypassSaveMerchant(merchant: Merchant) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dev_merchant', JSON.stringify(merchant));
  }
}

function bypassGetMerchant(): Merchant | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('dev_merchant');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function createMerchant(params: {
  uid: string;
  shopName: string;
  logoUrl: string;
  bannerUrl: string;
  theme: ThemePreset;
  bankDetails?: BankDetails;
  bio?: string;
}): Promise<Merchant> {
  const handle = generateHandle(params.shopName) || 'my-shop';

  const merchant: Merchant = {
    id: params.uid,
    uid: params.uid,
    shopName: params.shopName,
    handle,
    logoUrl: params.logoUrl,
    bannerUrl: params.bannerUrl,
    theme: params.theme,
    bankDetails: params.bankDetails,
    bio: params.bio || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (IS_BYPASS) {
    bypassSaveMerchant(merchant);
    return merchant;
  }

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

  const data = {
    uid: params.uid,
    shopName: params.shopName,
    handle: finalHandle,
    logoUrl: params.logoUrl,
    bannerUrl: params.bannerUrl,
    theme: params.theme,
    bankDetails: params.bankDetails,
    bio: params.bio || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'merchants', params.uid), data);
  return { id: params.uid, ...data } as unknown as Merchant;
}

export async function getMerchantByUid(uid: string): Promise<Merchant | null> {
  if (IS_BYPASS) return bypassGetMerchant();

  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const ref = doc(db, 'merchants', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as Merchant;
}

export async function getMerchantByHandle(handle: string): Promise<Merchant | null> {
  if (IS_BYPASS) {
    const m = bypassGetMerchant();
    return m?.handle === handle ? m : null;
  }

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
  if (IS_BYPASS) {
    const existing = bypassGetMerchant();
    if (existing) bypassSaveMerchant({ ...existing, ...updates, updatedAt: new Date() });
    return;
  }

  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'merchants', merchantId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
