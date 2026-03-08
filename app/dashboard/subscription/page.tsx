'use client';

import { useMerchant } from '@/hooks/useMerchant';
import { Spinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Crown, Check, Shield, Zap, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { merchant, loading } = useMerchant();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const isActive = true; // Assuming subscription is active if merchant exists

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
              <Check size={12} />
              Active
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 pl-11">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 mb-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1">Current Plan</h2>
            <p className="text-sm text-gray-500">You&apos;re on our monthly subscription plan</p>
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
            <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
              43% OFF
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full mb-2">
            <Star size={11} />
            First Month FREE
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1.5">
            Limited time offer — enjoy your first month at ₹0!
          </p>
        </div>

        {/* Features — 2 col on mobile */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">What&apos;s included:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Unlimited products',
              'All themes included',
              'Unlimited orders',
              'Sales analytics',
              'Order management',
              'Instagram comment automation',
              'Secure payments via Razorpay',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <p className="text-sm text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction fee note */}
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

      {/* Billing Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing Information</h3>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-600">Billing cycle</span>
            <span className="text-sm font-medium text-gray-900">Monthly</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-t border-gray-100">
            <span className="text-sm text-gray-600">Next billing date</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button fullWidth variant="primary">
          Manage Subscription
        </Button>
        <Link href="/dashboard/payment" className="flex-1">
          <Button variant="outline" fullWidth>
            Update Payment Method
          </Button>
        </Link>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-400 text-center mt-5">
        Need help? Contact support or{' '}
        <Link href="/" className="text-violet-600 hover:underline">
          view pricing details
        </Link>
      </p>
    </div>
  );
}
