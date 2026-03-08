'use client';

import { useState } from 'react';
import { useMerchant } from '@/hooks/useMerchant';
import { useSubscription } from '@/hooks/useSubscription';
import { Spinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import {
  Crown, Check, Shield, Zap, Star, AlertCircle, CheckCircle2, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  'Unlimited products',
  'All themes included',
  'Unlimited orders',
  'Sales analytics',
  'Order management',
  'Instagram comment automation',
  'Secure payments via Razorpay',
];

function toDate(v: unknown): Date {
  if (!v) return new Date();
  if (v instanceof Date) return v;
  if (typeof v === 'object' && v !== null && 'toDate' in v) return (v as { toDate: () => Date }).toDate();
  return new Date(v as string);
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(d: Date) {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
}

export default function SubscriptionPage() {
  const { merchant } = useMerchant();
  const { subscription, loading } = useSubscription();
  const [activating, setActivating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const status = subscription?.status ?? 'trial';
  const trialEnd = subscription ? toDate(subscription.trialEndsAt) : new Date();
  const periodEnd = subscription?.currentPeriodEnd ? toDate(subscription.currentPeriodEnd) : null;
  const remaining = daysLeft(trialEnd);
  const isActive = status === 'active';
  const isTrial = status === 'trial';
  const isExpired = status === 'expired' || status === 'cancelled';

  async function setupAutoPayments() {
    if (!merchant) return;
    setActivating(true);
    try {
      const res = await fetch('/api/razorpay/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subscription');
      const { subscriptionId, keyId } = data;

      // Lazy-load Razorpay checkout script
      if (!document.querySelector('script[src*="checkout.razorpay.com"]')) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.head.appendChild(s);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: 'Popzop',
        description: 'Monthly subscription — ₹399/month',
        image: '/popzop_logo.png',
        theme: { color: '#7c3aed' },
        handler: () => {
          toast.success('Subscription activated! Auto-payments are now set up.');
          window.location.reload();
        },
        modal: {
          ondismiss: () => setActivating(false),
        },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Could not set up payments. Please try again.');
      setActivating(false);
    }
  }

  return (
    <div className="w-full max-w-4xl p-4 md:p-6 lg:p-8 pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
            <Crown size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
          {isActive && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} /> Active
            </span>
          )}
          {isTrial && (
            <span className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
              <Star size={12} /> Free Trial
            </span>
          )}
          {isExpired && (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <XCircle size={12} /> {status === 'cancelled' ? 'Cancelled' : 'Expired'}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 pl-11">Manage your subscription and billing details</p>
      </div>

      {/* Trial warning banner */}
      {isTrial && (
        <div className={`rounded-2xl p-4 mb-4 border flex items-start gap-3 ${remaining <= 5 ? 'bg-amber-50 border-amber-100' : 'bg-violet-50 border-violet-100'}`}>
          <AlertCircle size={15} className={`shrink-0 mt-0.5 ${remaining <= 5 ? 'text-amber-600' : 'text-violet-600'}`} />
          <div>
            <p className={`text-sm font-semibold mb-0.5 ${remaining <= 5 ? 'text-amber-900' : 'text-violet-900'}`}>
              {remaining > 0
                ? `${remaining} day${remaining !== 1 ? 's' : ''} left in your free trial`
                : 'Your free trial has ended'}
            </p>
            <p className={`text-xs leading-relaxed ${remaining <= 5 ? 'text-amber-700' : 'text-violet-700'}`}>
              {remaining > 0
                ? `Trial ends on ${formatDate(trialEnd)}. Set up auto-payments to continue without interruption.`
                : 'Set up auto-payments now to keep your shop running.'}
            </p>
          </div>
        </div>
      )}

      {/* Expired/cancelled banner */}
      {isExpired && (
        <div className="rounded-2xl p-4 mb-4 border bg-red-50 border-red-100 flex items-start gap-3">
          <XCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900 mb-0.5">
              Subscription {status === 'cancelled' ? 'cancelled' : 'expired'}
            </p>
            <p className="text-xs text-red-700 leading-relaxed">
              Your shop is currently not accepting orders. Set up a new subscription to restore access.
            </p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1">Monthly Plan</h2>
            <p className="text-sm text-gray-500">Everything you need to run your shop</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
            <Crown size={18} className="text-white" />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-linear-to-br from-violet-50 to-pink-50 rounded-2xl p-4 md:p-6 mb-5 border border-violet-100">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-black text-gray-900">₹399</span>
            <span className="text-base text-gray-600">/month</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500 line-through">₹699/month</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">43% OFF</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full mb-2">
            <Star size={11} />
            First Month FREE
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1.5">
            Limited time offer — enjoy your first month at ₹0!
          </p>
        </div>

        {/* Features */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">What&apos;s included:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <p className="text-sm text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* No fees */}
        <div className="rounded-2xl p-4 border bg-emerald-50 border-emerald-100">
          <div className="flex items-start gap-3">
            <Shield size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-1">No transaction fees</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                We don&apos;t charge on each transaction. You only pay payment gateway charges (as per Razorpay&apos;s standard rates).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing Information</h3>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-600">Billing cycle</span>
            <span className="text-sm font-medium text-gray-900">Monthly</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`text-sm font-medium capitalize ${isActive ? 'text-emerald-600' : isTrial ? 'text-violet-600' : 'text-red-600'}`}>
              {isTrial ? 'Free Trial' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          {isTrial && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-600">Trial ends</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(trialEnd)}</span>
            </div>
          )}
          {isActive && periodEnd && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-600">Next billing date</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(periodEnd)}</span>
            </div>
          )}
          {isActive && subscription?.razorpaySubscriptionId && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-600">Subscription ID</span>
              <span className="text-xs font-mono text-gray-400">{subscription.razorpaySubscriptionId}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {(isTrial || isExpired) && (
        <Button fullWidth variant="primary" onClick={setupAutoPayments} loading={activating}>
          <Zap size={15} />
          Setup Auto Payments
        </Button>
      )}

      {isActive && (
        <div className="flex items-center gap-2 justify-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">
            Auto-payments are active — your shop renews automatically each month
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-5">
        Payments processed securely via Razorpay. Cancel anytime from your Razorpay account.
      </p>
    </div>
  );
}
