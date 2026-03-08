import { Order, OrderStatus, PaymentStatus, ShippingAddress, OrderItem } from '@/types';

export async function createOrder(params: {
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  total: number;
  razorpayOrderId: string;
}): Promise<Order> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const data = {
    ...params,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    razorpayPaymentId: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'orders'), data);
  return { id: ref.id, ...data } as unknown as Order;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrdersByMerchant(merchantId: string, status?: OrderStatus): Promise<Order[]> {
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = status
    ? query(collection(db, 'orders'), where('merchantId', '==', merchantId), where('orderStatus', '==', status), orderBy('createdAt', 'desc'))
    : query(collection(db, 'orders'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order);
}

export async function getRecentOrders(merchantId: string, count = 5): Promise<Order[]> {
  const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'orders'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order);
}

export async function updateOrderPayment(
  orderId: string,
  params: { razorpayPaymentId: string; paymentStatus: PaymentStatus; orderStatus: OrderStatus }
): Promise<void> {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'orders', orderId), { ...params, updatedAt: serverTimestamp() });
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'orders', orderId), { orderStatus, updatedAt: serverTimestamp() });
}

export async function trackOrder(phone: string, orderId?: string): Promise<Order[]> {
  const { collection, query, where, orderBy, limit, getDocs, doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  if (orderId) {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (snap.exists() && snap.data().customerPhone === phone) return [{ id: snap.id, ...snap.data() } as Order];
    return [];
  }
  const q = query(collection(db, 'orders'), where('customerPhone', '==', phone), orderBy('createdAt', 'desc'), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order);
}
