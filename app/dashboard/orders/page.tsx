'use client';

import { useEffect, useState } from 'react';
import { useMerchant } from '@/hooks/useMerchant';
import { getOrdersByMerchant, updateOrderStatus } from '@/services/orders';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Input';
import { Badge, OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatRelativeTime } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  Mail,
  Package,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const { merchant } = useMerchant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  useEffect(() => {
    if (merchant) loadOrders();
  }, [merchant]);

  async function loadOrders() {
    if (!merchant) return;
    setLoading(true);
    try {
      const data = await getOrdersByMerchant(merchant.id);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, orderStatus: newStatus } : o
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, orderStatus: newStatus } : null
      );
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.orderStatus === filter;
    const matchSearch =
      !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    return matchStatus && matchSearch;
  });

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 w-full max-w-5xl pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter chips + Search */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as OrderStatus | 'all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
              {opt.value !== 'all' && statusCounts[opt.value] ? (
                <span className="ml-1.5 opacity-70">
                  {statusCounts[opt.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            icon={<ShoppingBag size={24} />}
            title={search || filter !== 'all' ? 'No matching orders' : 'No orders yet'}
            description="Orders will appear here when customers checkout"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                setSelectedOrder(order);
                setNewStatus(order.orderStatus);
              }}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 md:px-5 md:py-4 flex items-center gap-3 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <ShoppingBag size={15} className="text-gray-500" />
              </div>

              {/* Main content — two-row layout on mobile */}
              <div className="flex-1 min-w-0">
                {/* Row 1: name + amount */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {order.customerName}
                  </p>
                  <p className="text-sm font-bold text-gray-900 shrink-0">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                {/* Row 2: id + time + badges */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">
                    #{order.id.slice(-6).toUpperCase()} · {formatRelativeTime(order.createdAt)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>
              </div>

              <ChevronRight
                size={15}
                className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
              />
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id.slice(-8).toUpperCase()}`}
          size="lg"
        >
          <div className="p-4 md:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={selectedOrder.orderStatus} />
              <PaymentStatusBadge status={selectedOrder.paymentStatus} />
              <span className="text-xs text-gray-500 ml-auto">
                {formatDate(selectedOrder.createdAt)}
              </span>
            </div>

            {/* Customer info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Customer
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-600">
                    {selectedOrder.customerName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={11} className="shrink-0" />
                      {selectedOrder.customerPhone}
                    </span>
                    {selectedOrder.customerEmail && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 min-w-0">
                        <Mail size={11} className="shrink-0" />
                        <span className="truncate">{selectedOrder.customerEmail}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  {selectedOrder.shippingAddress.line1}
                  {selectedOrder.shippingAddress.line2 &&
                    `, ${selectedOrder.shippingAddress.line2}`}
                  , {selectedOrder.shippingAddress.city},{' '}
                  {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Order items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Items
              </p>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <p className="text-sm font-semibold text-gray-900">Total</p>
                <p className="text-base font-bold text-gray-900">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>
            </div>

            {/* Update status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Update status
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  options={ORDER_STATUS_OPTIONS}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateStatus}
                  loading={updatingStatus}
                  disabled={newStatus === selectedOrder.orderStatus}
                >
                  Update
                </Button>
              </div>
            </div>

            {/* Payment info */}
            {selectedOrder.razorpayPaymentId && (
              <div className="text-xs text-gray-500 break-all">
                <span className="font-medium">Payment ID:</span>{' '}
                {selectedOrder.razorpayPaymentId}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
