'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMerchant } from '@/hooks/useMerchant';
import { updateMerchant } from '@/services/merchants';
import { uploadMerchantLogo, uploadMerchantBanner } from '@/services/storage';
import { ThemePreset, FontOption, THEME_CONFIGS } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { ThemePicker } from '@/components/merchant/ThemePicker';
import { Spinner } from '@/components/ui/LoadingSpinner';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  ShoppingBag,
  Package,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/helpers';

const schema = z.object({
  shopName: z.string().min(2).max(50),
  bio: z.string().max(160).optional(),
});
type FormValues = z.infer<typeof schema>;

// ─── Mini storefront preview ───────────────────────────────────────────────────
const FONT_FAMILIES: Record<FontOption, string> = {
  sora: "'Sora', sans-serif",
  playfair: "'Playfair Display', serif",
  nunito: "'Comic Neue', cursive",
};

function StorefrontPreview({
  shopName,
  bio,
  theme,
  font,
  logoPreview,
  bannerPreview,
}: {
  shopName: string;
  bio: string;
  theme: ThemePreset;
  font: FontOption;
  logoPreview: string | null;
  bannerPreview: string | null;
}) {
  const cfg = THEME_CONFIGS[theme];
  const fontFamily = FONT_FAMILIES[font];

  const sampleProducts = [
    { name: 'Product One', price: '₹1,299', badge: 'New' },
    { name: 'Product Two', price: '₹899', badge: null },
    { name: 'Product Three', price: '₹599', badge: 'Sale' },
    { name: 'Product Four', price: '₹1,099', badge: null },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ backgroundColor: cfg.background, color: cfg.text, fontFamily }}
    >
      {/* Phone frame top bar */}
      <div className="bg-gray-900 flex items-center justify-center gap-1.5 py-2">
        <div className="w-10 h-1.5 rounded-full bg-gray-700" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ backgroundColor: cfg.surface, borderColor: cfg.border }}
      >
        <div className="flex items-center gap-2">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreview}
              alt=""
              className="w-6 h-6 rounded-md object-cover"
            />
          ) : (
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: cfg.primary, color: cfg.primaryFg }}
            >
              {shopName ? shopName[0].toUpperCase() : 'S'}
            </div>
          )}
          <span className="text-xs font-semibold truncate max-w-25">
            {shopName || 'Your Shop'}
          </span>
        </div>
        <ShoppingBag size={14} style={{ color: cfg.muted }} />
      </div>

      {/* Banner or bio */}
      {bannerPreview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerPreview} alt="" className="w-full h-16 object-cover" />
      ) : bio ? (
        <div className="px-3 py-2">
          <p className="text-xs" style={{ color: cfg.muted }}>
            {bio.slice(0, 60)}{bio.length > 60 ? '…' : ''}
          </p>
        </div>
      ) : null}

      {/* Category tabs */}
      <div
        className="flex gap-0 border-b overflow-hidden"
        style={{ backgroundColor: cfg.surface, borderColor: cfg.border }}
      >
        {['All', 'Tops', 'Dresses'].map((cat, i) => (
          <div
            key={cat}
            className="px-3 py-1.5 text-xs font-medium border-b-2"
            style={{
              color: i === 0 ? cfg.primary : cfg.muted,
              borderColor: i === 0 ? cfg.primary : 'transparent',
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {sampleProducts.map((p, i) => (
          <div
            key={i}
            className="overflow-hidden"
            style={{
              backgroundColor: cfg.surface,
              borderRadius: cfg.radius,
              border:
                cfg.cardStyle === 'outline' || cfg.cardStyle === 'flat'
                  ? `1px solid ${cfg.border}`
                  : undefined,
              boxShadow:
                cfg.cardStyle === 'elevated'
                  ? '0 2px 8px rgba(0,0,0,0.08)'
                  : undefined,
            }}
          >
            <div
              className="aspect-square flex items-center justify-center relative"
              style={{ backgroundColor: cfg.background }}
            >
              <Package size={16} style={{ color: cfg.muted, opacity: 0.3 }} />
              {p.badge && (
                <span
                  className="absolute top-1 left-1 text-[8px] font-bold px-1 py-0.5 rounded-full"
                  style={{ backgroundColor: cfg.primary, color: cfg.primaryFg }}
                >
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-1.5">
              <p
                className="text-[10px] font-semibold truncate"
                style={{ color: cfg.text }}
              >
                {p.name}
              </p>
              <p
                className="text-[10px] font-bold"
                style={{ color: cfg.primary }}
              >
                {p.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="text-center py-2 border-t text-[9px]"
        style={{ color: cfg.muted, borderColor: cfg.border }}
      >
        <span className="inline-flex items-center gap-1">
          Powered by
          <Image src="/popzop_logo.png" alt="popzop.bio" width={10} height={10} className="w-2.5 h-2.5 rounded object-contain inline" />
          popzop.bio
        </span>
      </div>
    </div>
  );
}

// ─── Main settings page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { merchant, loading } = useMerchant();
  const [theme, setTheme] = useState<ThemePreset>('minimal');
  const [font, setFont] = useState<FontOption>('sora');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const watchedShopName = watch('shopName') ?? '';
  const watchedBio = watch('bio') ?? '';

  // Seed form when merchant loads
  useEffect(() => {
    if (merchant) {
      setTheme(merchant.theme);
      setFont(merchant.font ?? 'sora');
      setLogoPreview(merchant.logoUrl || null);
      setBannerPreview(merchant.bannerUrl || null);
      reset({
        shopName: merchant.shopName,
        bio: merchant.bio || '',
      });
    }
  }, [merchant, reset]);

  // Track unsaved changes
  useEffect(() => {
    if (!merchant) return;
    const sub = watch((values) => {
      const nameChanged = values.shopName !== merchant.shopName;
      const bioChanged = (values.bio ?? '') !== (merchant.bio ?? '');
      const themeChanged = theme !== merchant.theme;
      const fontChanged = font !== (merchant.font ?? 'sora');
      const fileChanged = !!(logoFile || bannerFile);
      setHasChanges(nameChanged || bioChanged || themeChanged || fontChanged || fileChanged);
    });
    return () => sub.unsubscribe();
  }, [watch, merchant, theme, font, logoFile, bannerFile]);

  // Also track theme changes for hasChanges
  useEffect(() => {
    if (!merchant) return;
    if (theme !== merchant.theme || font !== (merchant.font ?? 'sora')) setHasChanges(true);
  }, [theme, font, merchant]);

  function handleLogoChange(file: File | null) {
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setHasChanges(true);
    }
  }

  function handleBannerChange(file: File | null) {
    setBannerFile(file);
    if (file) {
      setBannerPreview(URL.createObjectURL(file));
      setHasChanges(true);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!merchant) return;
    setSaving(true);
    try {
      let logoUrl = merchant.logoUrl;
      let bannerUrl = merchant.bannerUrl;

      if (logoFile) logoUrl = await uploadMerchantLogo(merchant.id, logoFile);
      if (bannerFile) bannerUrl = await uploadMerchantBanner(merchant.id, bannerFile);

      await updateMerchant(merchant.id, {
        shopName: values.shopName,
        bio: values.bio,
        logoUrl,
        bannerUrl,
        theme,
        font,
      });
      setHasChanges(false);
      setLogoFile(null);
      setBannerFile(null);
      toast.success('Changes published!');
    } catch {
      toast.error('Failed to publish changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const shopUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/shop/${merchant?.handle}`
      : `/shop/${merchant?.handle}`;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your shop settings and branding
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      <div className={cn('flex flex-col gap-6', showPreview && 'lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-8')}>
        {/* ── Left: form ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Shop URL card */}
          {merchant && (
            <div className="bg-gray-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Your shop link</p>
                <p className="text-white font-medium text-sm truncate">{shopUrl}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shopUrl);
                    toast.success('Link copied!');
                  }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                >
                  <Copy size={13} />
                  Copy
                </button>
                <Link
                  href={`/shop/${merchant.handle}`}
                  target="_blank"
                  className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink size={13} />
                  Open
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shop info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Shop info</h2>
              <Input
                label="Shop name *"
                error={errors.shopName?.message}
                {...register('shopName')}
              />
              <Textarea
                label="Bio"
                rows={3}
                placeholder="Tell customers about your shop..."
                {...register('bio')}
              />
            </div>

            {/* Branding */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
              <h2 className="text-sm font-semibold text-gray-900">Branding</h2>
              <div className="grid grid-cols-2 gap-4">
                <FileUpload
                  label="Logo"
                  aspectRatio="square"
                  value={logoPreview || merchant?.logoUrl}
                  onChange={handleLogoChange}
                />
                <FileUpload
                  label="Banner"
                  aspectRatio="banner"
                  value={bannerPreview || merchant?.bannerUrl}
                  onChange={handleBannerChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Storefront theme
                </p>
                <ThemePicker
                  value={theme}
                  onChange={(t) => {
                    setTheme(t);
                    setHasChanges(true);
                  }}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Font</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    {
                      id: 'sora' as FontOption,
                      label: 'Modern',
                      sample: 'Aa',
                      desc: 'Clean & minimal',
                      style: { fontFamily: "'Sora', sans-serif" },
                    },
                    {
                      id: 'playfair' as FontOption,
                      label: 'Classic',
                      sample: 'Aa',
                      desc: 'Elegant & editorial',
                      style: { fontFamily: "'Playfair Display', serif" },
                    },
                    {
                      id: 'nunito' as FontOption,
                      label: 'Playful',
                      sample: 'Aa',
                      desc: 'Friendly & rounded',
                      style: { fontFamily: "'Comic Neue', cursive" },
                    },
                  ]).map((f) => {
                    const selected = font === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFont(f.id);
                          setHasChanges(true);
                        }}
                        className={cn(
                          'relative flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all',
                          selected
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        )}
                      >
                        {selected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                            <Check size={9} color="white" strokeWidth={3} />
                          </span>
                        )}
                        <span
                          className="text-3xl font-semibold text-gray-900 leading-none"
                          style={f.style}
                        >
                          {f.sample}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          {f.label}
                        </span>
                        <span className="text-xs text-gray-400">{f.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Publish bar */}
            <div
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                hasChanges
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gray-50 border-gray-100'
              )}
            >
              {hasChanges ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle size={15} className="text-amber-500 shrink-0" />
                  <p className="text-xs font-medium text-amber-700">
                    You have unpublished changes
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 flex-1">
                  All changes are published
                </p>
              )}
              <Button
                type="submit"
                loading={saving}
                disabled={saving || !hasChanges}
                size="sm"
                className={cn(
                  'shrink-0 transition-all',
                  hasChanges && 'shadow-md shadow-amber-100'
                )}
              >
                Publish changes
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right: live preview ── */}
        {showPreview && (
          <div className="w-full lg:w-70 shrink-0 lg:sticky lg:top-6">
            <div className="mb-3 flex items-center gap-2">
              <Eye size={13} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Live preview
              </p>
            </div>
            <StorefrontPreview
              shopName={watchedShopName}
              bio={watchedBio}
              theme={theme}
              font={font}
              logoPreview={logoFile ? logoPreview : (merchant?.logoUrl || null)}
              bannerPreview={bannerFile ? bannerPreview : (merchant?.bannerUrl || null)}
            />
            <p className="text-xs text-center text-gray-400 mt-2">
              Updates as you edit
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
