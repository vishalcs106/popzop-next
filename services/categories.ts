import { Category } from '@/types';

export async function getCategories(merchantId: string): Promise<Category[]> {
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
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'categories', categoryId), updates);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await deleteDoc(doc(db, 'categories', categoryId));
}
