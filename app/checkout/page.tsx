'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/useCart';
import { createOrder, updateOrderPayment } from '@/services/orders';
import { decrementInventory } from '@/services/products';
import { getMerchantByHandle, getMerchantByUid } from '@/services/merchants';
import { Merchant, THEME_CONFIGS } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/currency';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Lock,
  CheckCircle2,
} from 'lucide-react';

const schema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit number'),
  customerEmail: z.string().email('Enter valid email').optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
});

type FormValues = z.infer<typeof schema>;

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; contact: string; email?: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const FONT_FAMILIES: Record<string, string> = {
  sora: "'Sora', sans-serif",
  playfair: "'Playfair Display', serif",
  nunito: "'Comic Neue', cursive",
};

export default function CheckoutPage() {
  const { cart, getTotal, clearCart } = useCart();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const total = getTotal();
  const theme = merchant ? THEME_CONFIGS[merchant.theme] : null;
  const fontFamily = FONT_FAMILIES[merchant?.font ?? 'sora'];

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!cart) return;
    if (cart.shopHandle) {
      getMerchantByHandle(cart.shopHandle).then(setMerchant);
    } else if (cart.merchantId) {
      getMerchantByUid(cart.merchantId).then(setMerchant);
    }
  }, [cart]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function onSubmit(values: FormValues) {
    if (!cart || !merchant) {
      toast.error('No items in cart');
      return;
    }

    setProcessing(true);

    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          merchantId: merchant.id,
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const { orderId: razorpayOrderId } = await orderRes.json();

      // Create order in Firestore
      const orderItems = cart.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        featuredImage: item.product.featuredImage || '',
      }));

      const order = await createOrder({
        merchantId: merchant.id,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined,
        shippingAddress: {
          line1: values.addressLine1,
          line2: values.addressLine2,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          country: 'India',
        },
        items: orderItems,
        subtotal: total,
        total: total,
        razorpayOrderId,
      });

      // Launch Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: total * 100,
        currency: 'INR',
        name: merchant.shopName,
        description: `Order from ${merchant.shopName}`,
        order_id: razorpayOrderId,
        prefill: {
          name: values.customerName,
          contact: values.customerPhone,
          email: values.customerEmail || undefined,
        },
        theme: { color: '#0f0f0f' },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order.id,
              }),
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');

            // Decrement inventory
            await decrementInventory(
              cart.items.map((i) => ({
                productId: i.product.id,
                quantity: i.quantity,
              }))
            );

            clearCart();
            setSuccessOrderId(order.id);
            setSuccess(true);
          } catch {
            toast.error('Payment verification failed. Contact support with your order ID.');
            // Mark payment status as failed
            await updateOrderPayment(order.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              paymentStatus: 'failed',
              orderStatus: 'cancelled',
            });
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Checkout failed. Please try again.');
      setProcessing(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme?.background ?? '#f9fafb', fontFamily }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
          <p className="text-gray-500 text-sm mb-2">
            Thank you for your purchase. Your order is confirmed.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Order ID: <span className="font-mono font-medium text-gray-600">{successOrderId.slice(-12).toUpperCase()}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/track-order?orderId=${successOrderId}`}>
              <Button fullWidth variant="primary">
                Track your order
              </Button>
            </Link>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme?.background ?? '#f9fafb', fontFamily }}>
        <div className="text-center">
          <ShoppingBag size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/">
            <Button variant="secondary" size="sm">Go shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme?.background ?? '#f9fafb', fontFamily }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: theme?.surface ?? '#ffffff', borderColor: theme?.border ?? '#f3f4f6' }}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/cart" className="p-2 -ml-2 rounded-xl transition-colors" style={{ color: theme?.muted ?? '#6b7280' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-semibold flex-1" style={{ color: theme?.text ?? '#111827' }}>
            Checkout
          </h1>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: theme?.muted ?? '#6b7280' }}>
            <Lock size={12} />
            Secure
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Order summary */}
          <div className="rounded-2xl border p-4" style={{ backgroundColor: theme?.surface ?? '#ffffff', borderColor: theme?.border ?? '#f3f4f6' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: theme?.muted ?? '#6b7280' }}>
              Order summary
            </p>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: theme?.background ?? '#f3f4f6' }}>
                    {item.product.featuredImage ? (
                      <Image
                        src={item.product.featuredImage}
                        alt={item.product.name}
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: theme?.text ?? '#111827' }}>
                      {item.product.name}
                    </p>
                    <p className="text-xs" style={{ color: theme?.muted ?? '#6b7280' }}>× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: theme?.text ?? '#111827' }}>
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between" style={{ borderColor: theme?.border ?? '#f3f4f6' }}>
              <span className="text-sm font-semibold" style={{ color: theme?.text ?? '#111827' }}>Total</span>
              <span className="text-base font-bold" style={{ color: theme?.text ?? '#111827' }}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: theme?.surface ?? '#ffffff', borderColor: theme?.border ?? '#f3f4f6' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme?.muted ?? '#6b7280' }}>
              Contact info
            </p>
            <Input
              label="Full name *"
              placeholder="Your name"
              error={errors.customerName?.message}
              {...register('customerName')}
            />
            <Input
              label="Phone number *"
              placeholder="10-digit mobile number"
              error={errors.customerPhone?.message}
              {...register('customerPhone')}
            />
            <Input
              label="Email (optional)"
              type="email"
              placeholder="For order confirmation"
              error={errors.customerEmail?.message}
              {...register('customerEmail')}
            />
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: theme?.surface ?? '#ffffff', borderColor: theme?.border ?? '#f3f4f6' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme?.muted ?? '#6b7280' }}>
              Shipping address
            </p>
            <Input
              label="Address line 1 *"
              placeholder="House / flat / building"
              error={errors.addressLine1?.message}
              {...register('addressLine1')}
            />
            <Input
              label="Address line 2 (optional)"
              placeholder="Area / colony / landmark"
              {...register('addressLine2')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City *"
                placeholder="City"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State *"
                placeholder="State"
                error={errors.state?.message}
                {...register('state')}
              />
            </div>
            <Input
              label="Pincode *"
              placeholder="6-digit pincode"
              error={errors.pincode?.message}
              {...register('pincode')}
            />
          </div>

          {/* Pay button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: theme?.primary ?? '#111827', color: theme?.primaryFg ?? '#ffffff' }}
          >
            {processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
          </button>

          <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: theme?.muted ?? '#9ca3af' }}>
            <Lock size={11} />
            Payments secured by Razorpay
          </p>
        </div>
      </form>
    </div>
  );
}
