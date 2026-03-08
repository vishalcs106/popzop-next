import { Product, ProductBadge } from '@/types';

export async function getProducts(merchantId: string): Promise<Product[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

export async function getActiveProducts(merchantId: string): Promise<Product[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), where('active', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProductsByCategory(merchantId: string, categoryId: string): Promise<Product[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), where('categoryId', '==', categoryId), where('active', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProduct(productId: string): Promise<Product | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const snap = await getDoc(doc(db, 'products', productId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function createProduct(params: {
  merchantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  quantityAvailable: number;
  images: string[];
  featuredImage: string;
  badge: ProductBadge;
}): Promise<Product> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const data = { ...params, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(collection(db, 'products'), data);
  return { id: ref.id, ...data } as unknown as Product;
}

export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'merchantId' | 'createdAt'>>
): Promise<void> {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'products', productId), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteProduct(productId: string): Promise<void> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await deleteDoc(doc(db, 'products', productId));
}

export async function decrementInventory(items: Array<{ productId: string; quantity: number }>): Promise<void> {
  const { doc, getDoc, writeBatch, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const batch = writeBatch(db);
  for (const item of items) {
    const ref = doc(db, 'products', item.productId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      batch.update(ref, {
        quantityAvailable: Math.max(0, (snap.data().quantityAvailable as number) - item.quantity),
        updatedAt: serverTimestamp(),
      });
    }
  }
  await batch.commit();
}
