'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Merchant, Product, Category, ThemeConfig, THEME_CONFIGS } from '@/types';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/currency';
import { cn, getInitials } from '@/utils/helpers';
import { ShoppingBag, Package } from 'lucide-react';

interface Props {
  merchant: Merchant;
  products: Product[];
  categories: Category[];
}

const FONT_FAMILIES: Record<string, string> = {
  sora: "'Sora', sans-serif",
  playfair: "'Playfair Display', serif",
  nunito: "'Comic Neue', cursive",
};

export function StorefrontClient({ merchant, products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { itemCount } = useCart();
  const theme = THEME_CONFIGS[merchant.theme];
  const fontFamily = FONT_FAMILIES[merchant.font ?? 'sora'];

  const filteredProducts = activeCategory
    ? products.filter((p) => p.categoryId === activeCategory)
    : products;

  const inStockProducts = filteredProducts.filter((p) => p.quantityAvailable > 0);
  const outOfStock = filteredProducts.filter((p) => p.quantityAvailable === 0);
  const displayProducts = [...inStockProducts, ...outOfStock];

  return (
    <div style={{ backgroundColor: theme.background, color: theme.text, fontFamily }} className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="sticky top-0 z-40 border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {merchant.logoUrl ? (
              <Image src={merchant.logoUrl} alt={merchant.shopName} width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <span style={{ color: theme.primaryFg }} className="text-xs font-bold">{getInitials(merchant.shopName)}</span>
              </div>
            )}
            <span className="font-semibold text-sm">{merchant.shopName}</span>
          </div>

          <Link href="/cart" className="relative p-2 rounded-xl transition-colors hover:opacity-70">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: theme.primary, color: theme.primaryFg, width: 18, height: 18, fontSize: 10 }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Hero / Banner ── */}
      {merchant.bannerUrl && theme.heroStyle !== 'minimal' ? (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/1', maxHeight: 320 }}>
          <Image src={merchant.bannerUrl} alt={merchant.shopName} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 md:px-8 pb-5">
            <p className="text-white font-bold text-xl md:text-2xl" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {merchant.shopName}
            </p>
            {merchant.bio && (
              <p className="text-white/80 text-sm mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {merchant.bio}
              </p>
            )}
          </div>
        </div>
      ) : merchant.bio ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-2">
          <p style={{ color: theme.muted }} className="text-sm">{merchant.bio}</p>
        </div>
      ) : null}

      {/* ── Body: sidebar + products ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 flex gap-8 items-start">

        {/* Sidebar categories — desktop only */}
        {categories.length > 0 && (
          <aside className="hidden lg:flex flex-col gap-1 w-44 shrink-0 sticky top-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: theme.muted }}>
              Categories
            </p>
            <button
              onClick={() => setActiveCategory(null)}
              className={cn('text-left px-3 py-2 rounded-xl text-sm font-medium transition-all')}
              style={{
                backgroundColor: !activeCategory ? theme.primary + '18' : 'transparent',
                color: !activeCategory ? theme.primary : theme.muted,
                fontWeight: !activeCategory ? 600 : 400,
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="text-left px-3 py-2 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: activeCategory === cat.id ? theme.primary + '18' : 'transparent',
                  color: activeCategory === cat.id ? theme.primary : theme.muted,
                  fontWeight: activeCategory === cat.id ? 600 : 400,
                }}
              >
                {cat.name}
              </button>
            ))}
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Category tabs — mobile only */}
          {categories.length > 0 && (
            <div className="lg:hidden -mx-4 px-4 mb-5 overflow-x-auto scrollbar-hide">
              <div className="flex gap-0 border-b" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
                  style={{
                    color: !activeCategory ? theme.primary : theme.muted,
                    borderColor: !activeCategory ? theme.primary : 'transparent',
                  }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
                    style={{
                      color: activeCategory === cat.id ? theme.primary : theme.muted,
                      borderColor: activeCategory === cat.id ? theme.primary : 'transparent',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products grid */}
          {displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: theme.surface }}>
                <Package size={28} style={{ color: theme.muted }} />
              </div>
              <p className="font-semibold" style={{ color: theme.text }}>No products here yet</p>
              <p className="text-sm mt-1" style={{ color: theme.muted }}>Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} merchantHandle={merchant.handle} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t mt-4" style={{ borderColor: theme.border }}>
        <Link href="/" className="inline-flex items-center gap-1.5" style={{ color: theme.muted }}>
          <span className="text-xs">Powered by</span>
          <Image src="/popzop_logo.png" alt="popzop.bio" width={16} height={16} className="w-4 h-4 rounded object-contain" />
          <span className="text-xs font-medium" style={{ color: theme.primary }}>popzop.bio</span>
        </Link>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  merchantHandle,
  theme,
}: {
  product: Product;
  merchantHandle: string;
  theme: ThemeConfig;
}) {
  const outOfStock = product.quantityAvailable === 0;

  return (
    <Link href={`/shop/${merchantHandle}/product/${product.id}`}>
      <div
        className="rounded-2xl overflow-hidden transition-transform hover:scale-[1.01] active:scale-[0.99] h-full"
        style={{
          backgroundColor: theme.surface,
          boxShadow:
            theme.cardStyle === 'elevated'
              ? '0 2px 12px rgba(0,0,0,0.08)'
              : undefined,
          border:
            theme.cardStyle === 'outline' || theme.cardStyle === 'flat'
              ? `1px solid ${theme.border}`
              : undefined,
        }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: theme.background }}>
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className={cn('object-cover', outOfStock && 'opacity-50')}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package size={28} style={{ color: theme.muted, opacity: 0.4 }} />
            </div>
          )}

          {product.badge && !outOfStock && (
            <span
              className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: theme.primary, color: theme.primaryFg }}
            >
              {product.badge}
            </span>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/90 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-semibold line-clamp-2 mb-1" style={{ color: theme.text }}>
            {product.name}
          </p>
          {product.salePrice && product.salePrice < product.price ? (
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold" style={{ color: theme.primary }}>
                {formatCurrency(product.salePrice)}
              </p>
              <p className="text-xs line-through" style={{ color: theme.muted }}>
                {formatCurrency(product.price)}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold" style={{ color: theme.primary }}>
              {formatCurrency(product.price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
