'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchant } from '@/hooks/useMerchant';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { merchant, loading } = useMerchant();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (merchant) {
        router.replace('/dashboard/analytics');
      } else {
        router.replace('/dashboard/onboarding');
      }
    }
  }, [merchant, loading, router]);

  return <PageLoader />;
}
