import { Product, ProductBadge } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mock/data';

const IS_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';
const KEY = 'dev_products';

function load(): Product[] {
  if (typeof window === 'undefined') return MOCK_PRODUCTS;
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : MOCK_PRODUCTS; }
  catch { return MOCK_PRODUCTS; }
}
function save(p: Product[]) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(p));
}

export async function getProducts(merchantId: string): Promise<Product[]> {
  if (IS_BYPASS) return load();

  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

export async function getActiveProducts(merchantId: string): Promise<Product[]> {
  if (IS_BYPASS) return load().filter(p => p.active);

  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), where('active', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProductsByCategory(merchantId: string, categoryId: string): Promise<Product[]> {
  if (IS_BYPASS) return load().filter(p => p.categoryId === categoryId && p.active);

  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'products'), where('merchantId', '==', merchantId), where('categoryId', '==', categoryId), where('active', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProduct(productId: string): Promise<Product | null> {
  if (IS_BYPASS) return load().find(p => p.id === productId) ?? null;

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
  const product: Product = {
    id: `prod-${Date.now()}`,
    ...params,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (IS_BYPASS) { save([product, ...load()]); return product; }

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
  if (IS_BYPASS) { save(load().map(p => p.id === productId ? { ...p, ...updates, updatedAt: new Date() } : p)); return; }
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'products', productId), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteProduct(productId: string): Promise<void> {
  if (IS_BYPASS) { save(load().filter(p => p.id !== productId)); return; }
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await deleteDoc(doc(db, 'products', productId));
}

export async function decrementInventory(items: Array<{ productId: string; quantity: number }>): Promise<void> {
  if (IS_BYPASS) {
    save(load().map(p => {
      const item = items.find(i => i.productId === p.id);
      return item ? { ...p, quantityAvailable: Math.max(0, p.quantityAvailable - item.quantity) } : p;
    }));
    return;
  }
  const { doc, getDoc, writeBatch, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const batch = writeBatch(db);
  for (const item of items) {
    const ref = doc(db, 'products', item.productId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      batch.update(ref, { quantityAvailable: Math.max(0, (snap.data().quantityAvailable as number) - item.quantity), updatedAt: serverTimestamp() });
    }
  }
  await batch.commit();
}
