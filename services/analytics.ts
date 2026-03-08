import { AnalyticsSummary, Order, SalesDataPoint, TopProduct } from '@/types';
import { getOrdersByMerchant } from './orders';

export async function getMerchantAnalytics(merchantId: string): Promise<{
  summary: AnalyticsSummary;
  salesData: SalesDataPoint[];
  topProducts: TopProduct[];
}> {
  const orders = await getOrdersByMerchant(merchantId);
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');

  // Summary
  const totalOrders = paidOrders.length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const productsSold = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const summary: AnalyticsSummary = {
    totalOrders,
    totalRevenue,
    productsSold,
    averageOrderValue,
  };

  // Sales data (last 30 days)
  const salesMap = new Map<string, { revenue: number; orders: number }>();
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    salesMap.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of paidOrders) {
    const d =
      order.createdAt instanceof Date
        ? order.createdAt
        : (order.createdAt as { toDate: () => Date }).toDate?.() ??
          new Date(order.createdAt as unknown as string);
    const key = d.toISOString().split('T')[0];
    if (salesMap.has(key)) {
      const existing = salesMap.get(key)!;
      salesMap.set(key, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1,
      });
    }
  }

  const salesData: SalesDataPoint[] = Array.from(salesMap.entries()).map(
    ([date, data]) => ({ date, ...data })
  );

  // Top products
  const productMap = new Map<string, TopProduct>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        productMap.set(item.productId, {
          ...existing,
          totalSold: existing.totalSold + item.quantity,
          totalRevenue: existing.totalRevenue + item.price * item.quantity,
        });
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalSold: item.quantity,
          totalRevenue: item.price * item.quantity,
        });
      }
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  return { summary, salesData, topProducts };
}
