import { Order, OrderStatus, PaymentStatus, ShippingAddress, OrderItem } from '@/types';
import { MOCK_ORDERS } from '@/lib/mock/data';

const IS_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';
const KEY = 'dev_orders';

function load(): Order[] {
  if (typeof window === 'undefined') return MOCK_ORDERS;
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : MOCK_ORDERS; }
  catch { return MOCK_ORDERS; }
}
function save(o: Order[]) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(o));
}

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
  const order: Order = {
    id: `order-${Date.now()}`,
    ...params,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    razorpayPaymentId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (IS_BYPASS) { save([order, ...load()]); return order; }

  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const data = { ...params, paymentStatus: 'pending', orderStatus: 'pending', razorpayPaymentId: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(collection(db, 'orders'), data);
  return { id: ref.id, ...data } as unknown as Order;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (IS_BYPASS) return load().find(o => o.id === orderId) ?? null;
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrdersByMerchant(merchantId: string, status?: OrderStatus): Promise<Order[]> {
  if (IS_BYPASS) {
    const orders = load().sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime());
    return status ? orders.filter(o => o.orderStatus === status) : orders;
  }
  const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  let q = status
    ? query(collection(db, 'orders'), where('merchantId', '==', merchantId), where('orderStatus', '==', status), orderBy('createdAt', 'desc'))
    : query(collection(db, 'orders'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order);
}

export async function getRecentOrders(merchantId: string, count = 5): Promise<Order[]> {
  if (IS_BYPASS) return load().slice(0, count);
  const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  const q = query(collection(db, 'orders'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order);
}

export async function updateOrderPayment(orderId: string, params: { razorpayPaymentId: string; paymentStatus: PaymentStatus; orderStatus: OrderStatus }): Promise<void> {
  if (IS_BYPASS) { save(load().map(o => o.id === orderId ? { ...o, ...params, updatedAt: new Date() } : o)); return; }
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'orders', orderId), { ...params, updatedAt: serverTimestamp() });
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
  if (IS_BYPASS) { save(load().map(o => o.id === orderId ? { ...o, orderStatus, updatedAt: new Date() } : o)); return; }
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/client');
  await updateDoc(doc(db, 'orders', orderId), { orderStatus, updatedAt: serverTimestamp() });
}

export async function trackOrder(phone: string, orderId?: string): Promise<Order[]> {
  if (IS_BYPASS) {
    const orders = load();
    if (orderId) {
      const o = orders.find(x => x.id === orderId && x.customerPhone === phone);
      return o ? [o] : [];
    }
    return orders.filter(o => o.customerPhone === phone);
  }
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
