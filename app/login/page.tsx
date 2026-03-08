'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMerchant } from '@/hooks/useMerchant';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInAnon } = useAuth();
  const { merchant, loading: merchantLoading } = useMerchant();
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!loading && !merchantLoading && user) {
      router.replace(merchant ? '/dashboard/analytics' : '/dashboard/onboarding');
    }
  }, [user, merchant, loading, merchantLoading, router]);

  useEffect(() => {
    const onMouse = (e: MouseEvent) =>
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  if (loading || merchantLoading) return <PageLoader />;
  if (user) return <PageLoader />;

  async function handleSignIn() {
    try { await signInWithGoogle(); }
    catch { toast.error('Sign in failed. Please try again.'); }
  }

  async function handleAnonSignIn() {
    try { await signInAnon(); }
    catch { toast.error('Could not continue. Please try again.'); }
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
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          left: `${mousePos.x * 100 - 30}%`, top: `${mousePos.y * 100 - 30}%`,
          transform: 'translate(-50%,-50%)',
          transition: 'left 1s ease, top 1s ease',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          animation: 'fadeUp 0.7s ease both',
        }}
      >
        {/* Top gradient bar */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899, #f97316)' }} />

        <div className="px-8 pt-10 pb-10">
          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Image src="/popzop_logo.png" alt="popzop" width={44} height={44} className="w-11 h-11 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">Welcome to popzop</h1>
            <p className="text-sm text-white/40 text-center mt-2 max-w-xs leading-relaxed">
              The creator commerce platform for Instagram-first sellers
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['🛍️ Beautiful storefronts', '📦 Easy catalog', '💳 Instant payments'].map((feat) => (
              <span
                key={feat}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {feat}
              </span>
            ))}
          </div>

          {/* Google sign in */}
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 font-semibold text-sm h-12 rounded-2xl transition-all active:scale-[0.97]"
            style={{ background: 'white', color: '#111827' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Anon button */}
          <button
            onClick={handleAnonSignIn}
            className="w-full flex items-center justify-center font-semibold text-sm h-11 rounded-2xl transition-all active:scale-[0.97]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Continue without account
          </button>

          <p className="text-xs text-center mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
            By signing in, you agree to our{' '}
            <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.4)' }}>Terms of Service</span>{' '}
            and{' '}
            <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.4)' }}>Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Below card */}
      <p className="absolute bottom-8 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Learn more at{' '}
        <Link href="/" className="underline underline-offset-2 hover:text-white/50 transition-colors">
          popzop.bio
        </Link>
      </p>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
