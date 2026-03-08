'use client';

import { useEffect, useState } from 'react';
import { useMerchant } from '@/hooks/useMerchant';
import { getMerchantAnalytics } from '@/services/analytics';
import { getRecentOrders } from '@/services/orders';
import { AnalyticsSummary, SalesDataPoint, TopProduct, Order } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatRelativeTime } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import { Badge, OrderStatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  IndianRupee,
  BarChart3,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { merchant, loading: merchantLoading } = useMerchant();
  const router = useRouter();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const shopUrl = merchant
    ? `${process.env.NEXT_PUBLIC_APP_URL}/shop/${merchant.handle}`
    : '';

  function copyShopLink() {
    if (!shopUrl) return;
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (!merchantLoading && !merchant) {
      router.replace('/dashboard/onboarding');
    }
  }, [merchant, merchantLoading, router]);

  useEffect(() => {
    if (!merchant) return;
    async function load() {
      try {
        const [analytics, orders] = await Promise.all([
          getMerchantAnalytics(merchant!.id),
          getRecentOrders(merchant!.id, 5),
        ]);
        setSummary(analytics.summary);
        setSalesData(analytics.salesData);
        setTopProducts(analytics.topProducts);
        setRecentOrders(orders);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [merchant]);

  if (merchantLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary?.totalRevenue ?? 0),
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: String(summary?.totalOrders ?? 0),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Products Sold',
      value: String(summary?.productsSold ?? 0),
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Avg. Order Value',
      value: formatCurrency(summary?.averageOrderValue ?? 0),
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  // Format sales data for chart (last 14 days)
  const chartData = salesData.slice(-14).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    }),
    Revenue: d.revenue,
    Orders: d.orders,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Overview of your shop performance
        </p>
      </div>

      {/* Shop link banner */}
      {merchant && (
        <div className="bg-gray-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 mb-1">Your shop link</p>
            <p className="text-sm font-medium text-white truncate">{shopUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyShopLink}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <Link
              href={`/shop/${merchant.handle}`}
              target="_blank"
              className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ExternalLink size={13} />
              Open shop
            </Link>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} variant="default" padding="md">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Revenue (last 14 days)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Daily revenue trend</p>
          </div>
          <BarChart3 size={18} className="text-gray-400" />
        </div>
        {chartData.some((d) => d.Revenue > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                  fontFamily: 'Sora, sans-serif',
                }}
                formatter={(val) => [`₹${val}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            title="No sales data yet"
            description="Sales will appear here as orders come in"
            className="py-10"
          />
        )}
      </Card>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Top Products
            </h2>
            <Link
              href="/dashboard/catalog"
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs font-bold text-gray-300 w-5 text-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.totalSold} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(p.totalRevenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No data yet" className="py-8" />
          )}
        </Card>

        {/* Recent Orders */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders yet" className="py-8" />
          )}
        </Card>
      </div>
    </div>
  );
}
