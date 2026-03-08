'use client';

import { useEffect, useState, use } from 'react';
import { getMerchantByHandle } from '@/services/merchants';
import { getProduct } from '@/services/products';
import { Merchant, Product } from '@/types';
import { ProductDetailClient } from './ProductDetailClient';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; productId: string }>;
}) {
  const { handle, productId } = use(params);
  const [merchant, setMerchant] = useState<Merchant | null | undefined>(undefined);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, p] = await Promise.all([
          getMerchantByHandle(handle),
          getProduct(productId),
        ]);
        setMerchant(m);
        setProduct(p);
      } catch {
        setMerchant(null);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [handle, productId]);

  if (loading || merchant === undefined || product === undefined) {
    return <PageLoader />;
  }

  if (!merchant || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <p className="text-gray-500">This product doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return <ProductDetailClient merchant={merchant} product={product} />;
}
