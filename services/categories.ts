import { Category } from '@/types';
import { MOCK_CATEGORIES } from '@/lib/mock/data';

const IS_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

const KEY = 'dev_categories';

function load(): Category[] {
  if (typeof window === 'undefined') return MOCK_CATEGORIES;
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : MOCK_CATEGORIES;
  } catch { return MOCK_CATEGORIES; }
}
function save(cats: Category[]) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(cats));
}

export async function getCategories(merchantId: string): Promise<Category[]> {
  if (IS_BYPASS) return load().filter(c => c.merchantId === merchantId || true);

  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'categories'), where('merchantId', '==', merchantId), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Category);
}

export async function createCategory(params: {
  merchantId: string;
  name: string;
  imageUrl?: string;
  sortOrder: number;
}): Promise<Category> {
  const cat: Category = {
    id: `cat-${Date.now()}`,
    merchantId: params.merchantId,
    name: params.name,
    imageUrl: params.imageUrl || '',
    active: true,
    sortOrder: params.sortOrder,
    createdAt: new Date(),
  };

  if (IS_BYPASS) { save([...load(), cat]); return cat; }

  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const data = { ...params, imageUrl: params.imageUrl || '', active: true, createdAt: serverTimestamp() };
  const ref = await addDoc(collection(db, 'categories'), data);
  return { id: ref.id, ...data } as unknown as Category;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Pick<Category, 'name' | 'imageUrl' | 'active' | 'sortOrder'>>
): Promise<void> {
  if (IS_BYPASS) { save(load().map(c => c.id === categoryId ? { ...c, ...updates } : c)); return; }
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'categories', categoryId), updates);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  if (IS_BYPASS) { save(load().filter(c => c.id !== categoryId)); return; }
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await deleteDoc(doc(db, 'categories', categoryId));
}
