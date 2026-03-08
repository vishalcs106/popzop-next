'use client';

import { useEffect, useState } from 'react';
import { Merchant } from '@/types';
import { useAuth } from './useAuth';
import { MOCK_MERCHANT } from '@/lib/mock/data';

const IS_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

export function useMerchant() {
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMerchant(null);
      setLoading(false);
      return;
    }

    // Bypass mode — use mock merchant from localStorage so onboarding is skippable
    if (IS_BYPASS) {
      const stored = localStorage.getItem('dev_merchant');
      if (stored) {
        try {
          setMerchant(JSON.parse(stored));
        } catch {
          setMerchant(MOCK_MERCHANT);
          localStorage.setItem('dev_merchant', JSON.stringify(MOCK_MERCHANT));
        }
      } else {
        // First time: no merchant yet → will redirect to onboarding
        setMerchant(null);
      }
      setLoading(false);
      return;
    }

    // Real Firebase path
    let unsubscribe: () => void;
    (async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/client');
      const ref = doc(db, 'merchants', user.uid);
      unsubscribe = onSnapshot(
        ref,
        (snap) => {
          setMerchant(snap.exists() ? ({ id: snap.id, ...snap.data() } as Merchant) : null);
          setLoading(false);
        },
        () => {
          setMerchant(null);
          setLoading(false);
        }
      );
    })();

    return () => unsubscribe?.();
  }, [user]);

  return { merchant, loading };
}
