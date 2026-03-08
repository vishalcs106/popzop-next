'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Merchant, Product, THEME_CONFIGS } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/helpers';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';

interface Props {
  merchant: Merchant;
  product: Product;
}

const FONT_FAMILIES: Record<string, string> = {
  sora: "'Sora', sans-serif",
  playfair: "'Playfair Display', serif",
  nunito: "'Comic Neue', cursive",
};

export function ProductDetailClient({ merchant, product }: Props) {
  const { addItem, itemCount } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const theme = THEME_CONFIGS[merchant.theme];
  const fontFamily = FONT_FAMILIES[merchant.font ?? 'sora'];

  const outOfStock = product.quantityAvailable === 0;
  const images = product.images.length > 0 ? product.images : [product.featuredImage].filter(Boolean);

  function handleAddToCart() {
    addItem({ ...product, merchantId: merchant.id }, quantity, merchant.handle);
  }

  function handleBuyNow() {
    addItem({ ...product, merchantId: merchant.id }, quantity, merchant.handle);
    router.push('/checkout');
  }

  return (
    <div style={{ backgroundColor: theme.background, fontFamily }} className="min-h-screen">
      {/* Topbar */}
      <header
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="sticky top-0 z-40 border-b"
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl -ml-2 transition-opacity hover:opacity-60"
            style={{ color: theme.text }}
          >
            <ArrowLeft size={20} />
          </button>

          <Link
            href="/cart"
            className="relative p-2 rounded-xl"
            style={{ color: theme.text }}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 rounded-full text-xs flex items-center justify-center font-bold"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryFg,
                  width: 18,
                  height: 18,
                  fontSize: 10,
                }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Images */}
        <div className="relative aspect-square bg-gray-100">
          {images.length > 0 ? (
            <Image
              src={images[selectedImage] || images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
          )}

          {product.badge && !outOfStock && (
            <span
              className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryFg,
              }}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  'flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all',
                  selectedImage === idx
                    ? 'border-gray-900'
                    : 'border-transparent opacity-60'
                )}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Product info */}
        <div className="px-4 py-4 space-y-4">
          {/* Name & price */}
          <div>
            <h1
              className="text-xl font-bold leading-snug"
              style={{ color: theme.text }}
            >
              {product.name}
            </h1>
            {product.salePrice && product.salePrice < product.price ? (
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                  {formatCurrency(product.salePrice)}
                </p>
                <p className="text-lg line-through" style={{ color: theme.muted }}>
                  {formatCurrency(product.price)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold mt-1.5" style={{ color: theme.primary }}>
                {formatCurrency(product.price)}
              </p>
            )}
          </div>

          {/* Stock */}
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: outOfStock ? '#ef4444' : theme.muted }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: outOfStock ? '#ef4444' : '#10b981' }}
            />
            {outOfStock
              ? 'Out of stock'
              : `${product.quantityAvailable} in stock`}
          </div>

          {/* Description */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.muted }}
          >
            {product.description}
          </p>

          {/* Quantity picker */}
          {!outOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium" style={{ color: theme.text }}>
                Quantity
              </span>
              <div
                className="flex items-center gap-0 rounded-xl overflow-hidden border"
                style={{ borderColor: theme.border }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center transition-opacity disabled:opacity-30"
                  style={{ backgroundColor: theme.surface }}
                >
                  <Minus size={14} />
                </button>
                <span
                  className="w-10 text-center text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.quantityAvailable, q + 1)
                    )
                  }
                  disabled={quantity >= product.quantityAvailable}
                  className="w-9 h-9 flex items-center justify-center transition-opacity disabled:opacity-30"
                  style={{ backgroundColor: theme.surface }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="sticky bottom-0 px-4 py-4 border-t" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          {outOfStock ? (
            <div
              className="w-full h-12 rounded-xl flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: theme.border, color: theme.muted }}
            >
              Out of stock
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  borderColor: theme.primary,
                  color: theme.primary,
                  backgroundColor: 'transparent',
                }}
              >
                <ShoppingCart size={17} />
                Add to cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryFg,
                }}
              >
                Buy now
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
