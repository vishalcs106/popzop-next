'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { getMerchantByHandle, getMerchantByUid } from '@/services/merchants';
import { Merchant, THEME_CONFIGS } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  Package,
} from 'lucide-react';

const FONT_FAMILIES: Record<string, string> = {
  sora: "'Sora', sans-serif",
  playfair: "'Playfair Display', serif",
  nunito: "'Comic Neue', cursive",
};

export default function CartPage() {
  const { cart, removeItem, updateQuantity, getTotal, itemCount } = useCart();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const total = getTotal();

  useEffect(() => {
    if (!cart) return;
    if (cart.shopHandle) {
      getMerchantByHandle(cart.shopHandle).then(setMerchant).catch(() => {});
    } else if (cart.merchantId) {
      getMerchantByUid(cart.merchantId).then(setMerchant).catch(() => {});
    }
  }, [cart?.shopHandle, cart?.merchantId]);

  const theme = merchant ? THEME_CONFIGS[merchant.theme] : null;
  const fontFamily = FONT_FAMILIES[merchant?.font ?? 'sora'];

  const backHref = cart ? `/shop/${cart.shopHandle || ''}` : '/';

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme?.background ?? '#f9fafb', fontFamily }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: theme?.surface ?? '#ffffff',
          borderColor: theme?.border ?? '#f3f4f6',
        }}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2 -ml-2 rounded-xl transition-colors"
            style={{ color: theme?.muted ?? '#6b7280' }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1
            className="text-base font-semibold flex-1"
            style={{ color: theme?.text ?? '#111827' }}
          >
            Cart
          </h1>
          {itemCount > 0 && (
            <span
              className="text-sm"
              style={{ color: theme?.muted ?? '#6b7280' }}
            >
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: theme?.surface ?? '#f3f4f6' }}
            >
              <ShoppingCart size={28} style={{ color: theme?.muted ?? '#9ca3af' }} />
            </div>
            <h2
              className="font-semibold mb-1.5"
              style={{ color: theme?.text ?? '#111827' }}
            >
              Your cart is empty
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: theme?.muted ?? '#6b7280' }}
            >
              Add products to your cart and they&apos;ll show up here
            </p>
            <Link href={backHref}>
              <Button variant="secondary" size="sm">
                <ShoppingBag size={16} />
                Start shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items */}
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-2xl border p-4 flex items-center gap-4"
                  style={{
                    backgroundColor: theme?.surface ?? '#ffffff',
                    borderColor: theme?.border ?? '#f3f4f6',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                    style={{ backgroundColor: theme?.background ?? '#f3f4f6' }}
                  >
                    {item.product.featuredImage ? (
                      <Image
                        src={item.product.featuredImage}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package size={20} style={{ color: theme?.muted ?? '#d1d5db' }} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold line-clamp-2"
                      style={{ color: theme?.text ?? '#111827' }}
                    >
                      {item.product.name}
                    </p>
                    <p
                      className="text-sm font-bold mt-0.5"
                      style={{ color: theme?.primary ?? '#111827' }}
                    >
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="transition-colors hover:opacity-60"
                      style={{ color: theme?.muted ?? '#d1d5db' }}
                    >
                      <Trash2 size={15} />
                    </button>
                    <div
                      className="flex items-center rounded-xl overflow-hidden border"
                      style={{ borderColor: theme?.border ?? '#e5e7eb' }}
                    >
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                        style={{ color: theme?.text ?? '#111827' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-semibold"
                        style={{ color: theme?.text ?? '#111827' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.min(item.product.quantityAvailable, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= item.product.quantityAvailable}
                        className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                        style={{ color: theme?.text ?? '#111827' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl border p-4 space-y-3"
              style={{
                backgroundColor: theme?.surface ?? '#ffffff',
                borderColor: theme?.border ?? '#f3f4f6',
              }}
            >
              <div className="flex justify-between text-sm" style={{ color: theme?.muted ?? '#6b7280' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: theme?.muted ?? '#6b7280' }}>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div
                className="border-t pt-3 flex justify-between"
                style={{ borderColor: theme?.border ?? '#f3f4f6' }}
              >
                <span className="font-semibold" style={{ color: theme?.text ?? '#111827' }}>Total</span>
                <span className="font-bold text-lg" style={{ color: theme?.text ?? '#111827' }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Checkout button */}
            <Link href="/checkout">
              <button
                className="w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: theme?.primary ?? '#111827',
                  color: theme?.primaryFg ?? '#ffffff',
                }}
              >
                Proceed to checkout
                <ShoppingBag size={18} />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
