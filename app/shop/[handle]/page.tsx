'use client';

import { useEffect, useState, use } from 'react';
import { getMerchantByHandle } from '@/services/merchants';
import { getActiveProducts } from '@/services/products';
import { getCategories } from '@/services/categories';
import { Merchant, Product, Category } from '@/types';
import { StorefrontClient } from './StorefrontClient';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function ShopPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const [merchant, setMerchant] = useState<Merchant | null | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const m = await getMerchantByHandle(handle);
        if (!m) {
          setMerchant(null);
          return;
        }
        setMerchant(m);
        const [prods, cats] = await Promise.all([
          getActiveProducts(m.id),
          getCategories(m.id),
        ]);
        setProducts(prods);
        setCategories(cats.filter((c) => c.active));
      } catch {
        setMerchant(null);
      } finally {
        setLoading(false);
      }
    }

    load();

    // Refetch when tab regains focus so published changes appear immediately
    function handleFocus() { load(); }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [handle]);

  if (loading || merchant === undefined) return <PageLoader />;

  if (merchant === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop not found</h1>
          <p className="text-gray-500">
            This shop doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontClient
      merchant={merchant}
      products={products}
      categories={categories}
    />
  );
}
