'use client';

import { useEffect, useState } from 'react';
import { Subscription } from '@/types';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;
    (async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/client');
      unsubscribe = onSnapshot(
        doc(db, 'subscriptions', user.uid),
        (snap) => {
          setSubscription(snap.exists() ? ({ id: snap.id, ...snap.data() } as Subscription) : null);
          setLoading(false);
        },
        () => {
          setSubscription(null);
          setLoading(false);
        }
      );
    })();

    return () => unsubscribe?.();
  }, [user]);

  return { subscription, loading };
}
