'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMerchant } from '@/hooks/useMerchant';
import { updateMerchant } from '@/services/merchants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { CreditCard, Building2, Phone, Wallet, Hash, User, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  accountHolderName: z.string().min(2, 'Required'),
  accountNumber: z.string().min(8, 'Enter a valid account number'),
  ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code')
    .optional()
    .or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  upiId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PaymentPage() {
  const { merchant, loading } = useMerchant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (merchant) {
      reset({
        accountHolderName: merchant.bankDetails?.accountHolderName || '',
        accountNumber: merchant.bankDetails?.accountNumber || '',
        ifsc: merchant.bankDetails?.ifsc || '',
        phone: merchant.bankDetails?.phone || '',
        upiId: merchant.bankDetails?.upiId || '',
      });
    }
  }, [merchant, reset]);

  async function onSubmit(values: FormValues) {
    if (!merchant) return;
    try {
      await updateMerchant(merchant.id, {
        bankDetails: {
          accountHolderName: values.accountHolderName,
          accountNumber: values.accountNumber,
          ifsc: values.ifsc || '',
          phone: values.phone,
          upiId: values.upiId,
        },
      });
      toast.success('Payment details saved');
      reset(values);
    } catch {
      toast.error('Failed to save. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const hasPayment = !!merchant?.bankDetails?.accountNumber;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <CreditCard size={18} className="text-violet-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Payment details</h1>
          {hasPayment && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} />
              Active
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 ml-12">
          Where we send your earnings. Required to accept orders.
        </p>
      </div>

      {/* Alert when no payment info */}
      {!hasPayment && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
          <CreditCard size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Your shop won&apos;t be able to accept orders until you add your payment details.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Bank account */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Bank account</h2>
          </div>
          <Input
            label="Account holder name *"
            placeholder="As per bank records"
            error={errors.accountHolderName?.message}
            leftIcon={<User size={15} />}
            {...register('accountHolderName')}
          />
          <Input
            label="Account number *"
            placeholder="Your bank account number"
            error={errors.accountNumber?.message}
            leftIcon={<Hash size={15} />}
            {...register('accountNumber')}
          />
          <Input
            label="IFSC code"
            placeholder="e.g. HDFC0001234"
            error={errors.ifsc?.message}
            leftIcon={<Building2 size={15} />}
            {...register('ifsc')}
          />
        </div>

        {/* Contact & UPI */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Contact & UPI</h2>
          </div>
          <Input
            label="Phone number *"
            placeholder="10-digit mobile number"
            error={errors.phone?.message}
            leftIcon={<Phone size={15} />}
            {...register('phone')}
          />
          <Input
            label="UPI ID (optional)"
            placeholder="yourname@upi"
            leftIcon={<Wallet size={15} />}
            {...register('upiId')}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save payment details
          </Button>
        </div>
      </form>
    </div>
  );
}
