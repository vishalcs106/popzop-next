'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trackOrder } from '@/services/orders';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/helpers';
import Link from 'next/link';
import { Package, ArrowLeft, Search, CheckCircle, Clock, Truck, Home } from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit number'),
  orderId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const STATUS_TIMELINE: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  paid: <CheckCircle size={14} />,
  processing: <Package size={14} />,
  shipped: <Truck size={14} />,
  delivered: <Home size={14} />,
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { orderId: initialOrderId },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const result = await trackOrder(values.phone, values.orderId || undefined);
      setOrders(result);
      setSearched(true);
    } catch {
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIndex(status: OrderStatus): number {
    const idx = STATUS_TIMELINE.indexOf(status);
    if (status === 'cancelled') return -1;
    return idx;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">Track Order</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Search form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Track your order
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter your phone number to find your orders
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
              label="Phone number *"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Order ID (optional)"
              placeholder="Enter specific order ID"
              {...register('orderId')}
            />
            <Button type="submit" fullWidth loading={loading} size="md">
              <Search size={16} />
              Track order
            </Button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">No orders found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Check your phone number and try again
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusIdx = getStatusIndex(order.orderStatus);
                  const isCancelled = order.orderStatus === 'cancelled';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <OrderStatusBadge status={order.orderStatus} />
                        </div>
                        <div className="flex items-center gap-3">
                          <PaymentStatusBadge status={order.paymentStatus} />
                          <p className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Progress timeline */}
                      {!isCancelled && (
                        <div className="px-5 py-5">
                          <div className="flex items-center justify-between relative">
                            <div
                              className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100"
                              style={{ zIndex: 0 }}
                            />
                            <div
                              className="absolute top-4 left-0 h-0.5 bg-gray-900 transition-all duration-700"
                              style={{
                                width: `${Math.max(0, (statusIdx / (STATUS_TIMELINE.length - 1)) * 100)}%`,
                                zIndex: 1,
                              }}
                            />
                            {STATUS_TIMELINE.map((status, idx) => {
                              const done = idx <= statusIdx;
                              const current = idx === statusIdx;
                              return (
                                <div
                                  key={status}
                                  className="flex flex-col items-center gap-1.5 relative"
                                  style={{ zIndex: 2 }}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                      done
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    } ${current ? 'ring-4 ring-gray-200' : ''}`}
                                  >
                                    {STATUS_ICONS[status]}
                                  </div>
                                  <p
                                    className={`text-xs font-medium capitalize ${
                                      done ? 'text-gray-900' : 'text-gray-400'
                                    }`}
                                  >
                                    {status}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="px-5 pb-4 space-y-2.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Items
                        </p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {item.featuredImage ? (
                                <Image
                                  src={item.featuredImage}
                                  alt={item.productName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package size={14} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500">
                                × {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                        <div className="pt-2.5 border-t border-gray-100 flex justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            Total
                          </span>
                          <span className="text-base font-bold text-gray-900">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}
