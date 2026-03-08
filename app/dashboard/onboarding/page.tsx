'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createMerchant } from '@/services/merchants';
import { uploadMerchantLogo, uploadMerchantBanner } from '@/services/storage';
import { Input, Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { ThemePicker } from '@/components/merchant/ThemePicker';
import { ThemePreset } from '@/types';
import toast from 'react-hot-toast';
import { Store, Palette, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const schema = z.object({
  shopName: z.string().min(2, 'At least 2 characters').max(50, 'Under 50 characters'),
  bio: z.string().max(160, 'Under 160 characters').optional(),
});

type FormValues = z.infer<typeof schema>;

const steps = [
  { id: 1, label: 'Shop', icon: Store },
  { id: 2, label: 'Branding', icon: Palette },
];

const darkInput = '!bg-white/[0.06] !border-white/10 !text-white placeholder:!text-white/25 focus:!border-violet-500/60 focus:!ring-violet-500/10';
const darkLabel = '[&_label]:!text-white/60';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<ThemePreset>('minimal');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMouse = (e: MouseEvent) =>
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function validateStep(s: number) {
    if (s === 1) return trigger(['shopName', 'bio']);
    return true;
  }

  async function goNext() {
    const valid = await validateStep(step);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  }

  async function onSubmit(values: FormValues) {
    if (!user) return;
    setLoading(true);
    try {
      let logoUrl = '';
      let bannerUrl = '';
      if (logoFile) logoUrl = await uploadMerchantLogo(user.uid, logoFile);
      if (bannerFile) bannerUrl = await uploadMerchantBanner(user.uid, bannerFile);
      await createMerchant({
        uid: user.uid,
        shopName: values.shopName,
        logoUrl,
        bannerUrl,
        theme,
        bio: values.bio,
      });
      router.replace('/dashboard/welcome');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create shop. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0f', color: 'white' }}
    >
      {/* Orbs */}
      <div className="absolute pointer-events-none"
        style={{
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)',
          left: `${mousePos.x * 100 - 30}%`, top: `${mousePos.y * 100 - 30}%`,
          transform: 'translate(-50%,-50%)',
          transition: 'left 1s ease, top 1s ease',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative w-full max-w-xl" style={{ animation: 'fadeUp 0.6s ease both' }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Image src="/popzop_logo.png" alt="popzop" width={36} height={36} className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your shop</h1>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Set up your storefront in 2 quick steps
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: step === s.id
                    ? 'linear-gradient(135deg, #7c3aed, #ec4899)'
                    : step > s.id
                    ? 'rgba(16,185,129,0.2)'
                    : 'rgba(255,255,255,0.06)',
                  color: step === s.id
                    ? 'white'
                    : step > s.id
                    ? '#34d399'
                    : 'rgba(255,255,255,0.35)',
                  border: step === s.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {step > s.id ? <Check size={12} /> : <s.icon size={12} />}
                {s.label}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-6 h-px transition-all"
                  style={{ background: step > s.id ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top gradient line */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899, #f97316)' }} />

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="p-6 space-y-5">

              {/* Step 1 — always mounted, hidden when inactive */}
              <div className={step === 1 ? 'space-y-4' : 'hidden'}>
                <div>
                  <h2 className="text-base font-semibold text-white mb-0.5">Shop details</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>This is how customers will find you</p>
                </div>
                <div className={darkLabel}>
                  <Input label="Shop name *" placeholder="e.g. Zara's Boutique" error={errors.shopName?.message} className={darkInput} {...register('shopName')} />
                </div>
                <div className={darkLabel}>
                  <Textarea label="Bio (optional)" placeholder="Describe your shop in a few words..." rows={3} className={darkInput} {...register('bio')} />
                </div>
              </div>

              {/* Step 2 — always mounted, hidden when inactive */}
              <div className={step === 2 ? 'space-y-5' : 'hidden'}>
                <div>
                  <h2 className="text-base font-semibold text-white mb-0.5">Branding</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Upload your logo and banner</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload label="Logo" hint="Square, 1:1" aspectRatio="square" onChange={setLogoFile} />
                  <FileUpload label="Banner" hint="Wide, 3:1" aspectRatio="banner" onChange={setBannerFile} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Choose a theme
                  </label>
                  <ThemePicker value={theme} onChange={setTheme} />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white' }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit(onSubmit)()}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white' }}
                >
                  {loading && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Creating…' : 'Launch my shop 🚀'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
