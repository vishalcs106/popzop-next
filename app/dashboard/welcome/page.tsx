'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMerchant } from '@/hooks/useMerchant';
import { CreditCard, Settings, ArrowRight, Crown, Bell, Sparkles, Store, LayoutGrid } from 'lucide-react';

// ── Confetti ────────────────────────────────────────────────────────────────
const COLORS = ['#7c3aed', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#fbbf24'];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
  opacity: number;
}

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
    }));

    let frame: number;
    let tick = 0;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      tick++;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vy += 0.05; // gravity
        if (p.y > canvas!.height * 0.8) p.opacity -= 0.015;

        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.opacity);
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }

      if (particles.some(p => p.opacity > 0)) {
        frame = requestAnimationFrame(draw);
      }
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function WelcomePage() {
  const { merchant } = useMerchant();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so confetti fires after mount
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      {visible && <Confetti />}

      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-lg z-10" style={{ animation: 'fadeUp 0.5s ease both' }}>

        {/* Success badge */}
        <div className="flex justify-center mb-6">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
          >
            <Sparkles size={14} />
            Shop created successfully!
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            You&apos;re live!{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎉
            </span>
          </h1>
          {merchant && (
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Your shop{' '}
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {merchant.shopName}
              </span>{' '}
              is ready to take orders
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden mb-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #ec4899, #f97316)' }} />

          {/* Subscription highlight */}
          <div className="p-5 md:p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
              >
                <Crown size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-white">First month is on us</p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}
                  >
                    FREE
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Enjoy full access to all features at no cost for your first month.
                </p>
                <div
                  className="flex items-start gap-2 mt-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Bell size={13} className="shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    We&apos;ll notify you before your free trial ends. To keep your shop running, extend your subscription from the Subscription page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Next steps
            </p>
            <div className="space-y-2">
              {[
                {
                  href: '/dashboard/payment',
                  icon: <CreditCard size={16} style={{ color: '#fbbf24' }} />,
                  iconBg: 'rgba(251,191,36,0.15)',
                  iconBorder: 'rgba(251,191,36,0.2)',
                  title: 'Set up bank details',
                  desc: 'Required to receive payments from customers',
                },
                {
                  href: '/dashboard/categories',
                  icon: <LayoutGrid size={16} style={{ color: '#34d399' }} />,
                  iconBg: 'rgba(16,185,129,0.15)',
                  iconBorder: 'rgba(16,185,129,0.2)',
                  title: 'Manage catalog',
                  desc: 'Create categories and add products with prices, images and stock',
                },
                {
                  href: '/dashboard/settings',
                  icon: <Settings size={16} style={{ color: '#a78bfa' }} />,
                  iconBg: 'rgba(124,58,237,0.15)',
                  iconBorder: 'rgba(124,58,237,0.2)',
                  title: 'Style your shop',
                  desc: 'Customise theme, logo, banner and shop info',
                },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition-all group"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: item.iconBg, border: `1px solid ${item.iconBorder}` }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
                  </div>
                  <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Go to dashboard */}
        <button
          onClick={() => router.replace('/dashboard/analytics')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white' }}
        >
          <Store size={16} />
          Go to Dashboard
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
