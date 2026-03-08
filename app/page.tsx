'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ShoppingBag,
  BarChart3,
  Palette,
  Package,
  Zap,
  Shield,
  Check,
  Star,
  TrendingUp,
  Users,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react';

// ─── Intersection Observer hook ───────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1400;
    const step = 16;
    const inc = to / (duration / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= to) { setCount(to); clearInterval(t); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(t);
  }, [visible, to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  from = 'bottom',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  from?: 'bottom' | 'left' | 'right' | 'scale';
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const transforms: Record<string, string> = {
    bottom: 'translateY(40px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    scale: 'scale(0.92)',
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : transforms[from],
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/popzop_logo.png" alt="popzop.bio" width={32} height={32} className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold text-white text-lg">popzop.bio</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 active:scale-[0.97] transition-all flex items-center gap-2 shadow-lg shadow-white/10"
            >
              Start free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Animated gradient orbs */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
            left: `${mousePos.x * 100 - 30}%`,
            top: `${mousePos.y * 100 - 30}%`,
            transform: 'translate(-50%,-50%)',
            transition: 'left 0.8s ease, top 0.8s ease',
          }}
        />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-32 pb-20 text-center w-full">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold px-4 py-2 rounded-full mb-8"
            style={{ animation: 'fadeSlideDown 0.8s ease 0.1s both' }}
          >
            <Zap size={11} />
            Creator Commerce · Instagram First
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl lg:text-8xl font-black leading-[1.0] tracking-tight mb-7 max-w-5xl mx-auto"
            style={{ animation: 'fadeSlideDown 0.9s ease 0.25s both' }}
          >
            <span className="text-white">Selling on instagram</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              made easy
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-6 leading-relaxed"
            style={{ animation: 'fadeSlideDown 0.9s ease 0.4s both' }}
          >
            Create a stunning shop in minutes. Drop the link in your Instagram bio.
            Start selling — no tech skills, no friction.
          </p>

          {/* Limited time offer announcement */}
          <div
            className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-semibold px-5 py-2.5 rounded-full mb-12"
            style={{ animation: 'fadeSlideDown 0.9s ease 0.5s both' }}
          >
            
            <span>Enjoy limited time benefits, <span className="text-emerald-400 font-bold">first month free</span></span>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            style={{ animation: 'fadeSlideDown 0.9s ease 0.55s both' }}
          >
            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-gray-900 font-bold text-base px-9 py-4 rounded-2xl hover:bg-gray-50 active:scale-[0.97] transition-all shadow-2xl shadow-white/20"
            >
              Create your shop — free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/track-order"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white/70 font-semibold text-base px-8 py-4 rounded-2xl hover:bg-white/10 hover:text-white transition-all"
            >
              <Package size={18} />
              Track an order
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center justify-center gap-10 md:gap-16"
            style={{ animation: 'fadeSlideDown 0.9s ease 0.7s both' }}
          >
            {[
              { value: 5, suffix: ' min', label: 'to go live' },
              { value: 13, suffix: '+', label: 'beautiful themes' },
              { value: 100, suffix: '%', label: 'mobile-first' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-white/40 mt-1 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animation: 'bounce 2s ease infinite' }}>
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="border-y border-white/5 bg-white/[0.02] py-4 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'marquee 20s linear infinite' }}>
          {Array(4).fill(['Beautiful themes', 'Instant payments', 'Order tracking', 'Sales analytics', 'Mobile-first', 'Instagram sellers', 'Creator commerce']).flat().map((text, i) => (
            <span key={i} className="text-xs font-semibold text-white/25 uppercase tracking-widest flex items-center gap-3">
              <Star size={8} className="text-violet-500" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 md:py-36 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <Reveal className="text-center mb-16 md:mb-24">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Live in under
              <span style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}> 5 minutes</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent hidden md:block" />

            {[
              { step: '01', title: 'Create your shop', description: 'Sign in with Google, pick a stunning theme, upload your logo and banner. Your shop is born.', icon: Palette, gradient: 'from-violet-500 to-purple-600' },
              { step: '02', title: 'Add products', description: 'Upload photos, set prices, write descriptions. Your catalog is live the second you publish.', icon: Package, gradient: 'from-pink-500 to-rose-600' },
              { step: '03', title: 'Share & earn', description: 'Drop your link in your Instagram bio. Customers browse, buy, and pay — you get paid.', icon: Send, gradient: 'from-orange-500 to-amber-600' },
            ].map((step, i) => (
              <Reveal key={step.step} delay={i * 150} from="bottom">
                <div
                  className="relative rounded-3xl p-8 border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all group overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, rgba(124,58,237,0.12), transparent 70%)` }} />

                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-6xl font-black text-white/[0.05] leading-none select-none">{step.step}</span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <step.icon size={22} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 md:py-36 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(236,72,153,0.07) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <Reveal className="text-center mb-16 md:mb-20">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Everything you need
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #ec4899, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>to sell online</span>
            </h2>
          </Reveal>

          {/* Instagram Automation — hero feature card */}
          <Reveal from="bottom" className="mb-4">
            <div
              className="relative rounded-3xl p-8 border overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(236,72,153,0.12) 60%, rgba(249,115,22,0.1) 100%)',
                borderColor: 'rgba(168,85,247,0.35)',
              }}
            >
              {/* animated glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(168,85,247,0.12), transparent 70%)' }} />

              <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                {/* Left: text */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                      <MessageCircle size={22} className="text-white" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                      Coming soon
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Instagram comment automation</h3>
                  <p className="text-white/60 leading-relaxed max-w-lg">
                    Followers comment a keyword on your post — they instantly receive the product link in their DM. Turn every post into a sales funnel, automatically.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {['Comment triggers', 'Auto DM delivery', 'Any product link', 'Works 24/7'].map((tag) => (
                      <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: visual mockup */}
                <div className="shrink-0 w-full md:w-72">
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {/* post header */}
                    <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }} />
                      <span className="text-xs font-semibold text-white">@yourbrand</span>
                    </div>
                    {/* post image placeholder */}
                    <div className="h-28 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.15))' }}>
                      <span className="text-3xl">👗</span>
                    </div>
                    {/* comments */}
                    <div className="p-3 space-y-2">
                      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Comments</p>
                      {[
                        { user: 'priya_22', comment: 'LINK 🔥', highlight: true },
                        { user: 'deepa.styles', comment: 'want this!!', highlight: false },
                        { user: 'rahul_k', comment: 'LINK', highlight: true },
                      ].map((c) => (
                        <div key={c.user} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full shrink-0 mt-0.5"
                            style={{ background: c.highlight ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.1)' }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-white/70">{c.user} </span>
                            <span className="text-[10px]"
                              style={{ color: c.highlight ? '#c084fc' : 'rgba(255,255,255,0.4)', fontWeight: c.highlight ? 700 : 400 }}>
                              {c.comment}
                            </span>
                          </div>
                          {c.highlight && (
                            <div className="shrink-0 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                              <Send size={8} /> DM sent
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* DM preview */}
                    <div className="mx-3 mb-3 rounded-xl p-3"
                      style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles size={10} className="text-violet-400" />
                        <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Auto DM sent</span>
                      </div>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        &quot;Hey! Here&apos;s the link you asked for 👉 popzop.bio/yourbrand&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Regular feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Palette, title: 'Beautiful themes', description: '13 curated themes — Minimal, Boutique, Bold, Neon, Midnight, Sakura, Holi and more.', accent: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.25)', iconBg: 'from-violet-500 to-purple-600' },
              { icon: ShoppingBag, title: 'Seamless checkout', description: 'Browse, add to cart, pay — all in a smooth mobile-native experience.', accent: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', iconBg: 'from-blue-500 to-cyan-600' },
              { icon: BarChart3, title: 'Sales analytics', description: 'Revenue charts, top products, order trends — beautiful at a glance.', accent: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', iconBg: 'from-emerald-500 to-teal-600' },
              { icon: Package, title: 'Order management', description: 'Track all orders, update statuses, and keep customers informed.', accent: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', iconBg: 'from-amber-500 to-orange-600' },
              { icon: Shield, title: 'Secure payments', description: 'Powered by Razorpay. Accept UPI, cards, net banking. Safe and verified.', accent: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.2)', iconBg: 'from-pink-500 to-rose-600' },
              { icon: Zap, title: 'Instant go-live', description: 'Your shop is live the moment you create it. Share, sell, repeat.', accent: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.2)', iconBg: 'from-orange-500 to-red-600' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80} from="bottom">
                <div
                  className="rounded-3xl p-6 border h-full transition-all duration-300 group hover:-translate-y-1"
                  style={{ backgroundColor: f.accent, borderColor: f.border }}
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                    <f.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Merchant benefits ── */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text */}
            <div>
              <Reveal>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">For merchants</p>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1]">
                  Your complete<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>commerce toolkit</span>
                </h2>
                <p className="text-white/50 text-lg mb-10 leading-relaxed">
                  Everything to run a thriving Instagram business — in one beautiful dashboard.
                </p>
              </Reveal>

              <div className="space-y-4">
                {[
                  'Create a stunning branded storefront in minutes',
                  'Manage unlimited products with images and descriptions',
                  'Receive orders and process payments instantly',
                  'Track sales, revenue, and top-performing products',
                  'Update order status and keep customers happy',
                ].map((point, i) => (
                  <Reveal key={point} delay={i * 80} from="left">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <Check size={11} className="text-white" />
                      </div>
                      <p className="text-sm text-white/70">{point}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={500}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 mt-10 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:opacity-90 active:scale-[0.97] transition-all shadow-xl shadow-violet-500/25"
                >
                  Start selling today
                  <ArrowRight size={16} />
                </Link>
              </Reveal>
            </div>

            {/* Dashboard mockup */}
            <Reveal from="right" delay={200}>
              <div
                className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}
              >
                {/* Header bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="flex-1 mx-3 h-5 rounded-md bg-white/5 text-white/20 text-[9px] flex items-center justify-center">
                    dashboard.popzop.bio
                  </div>
                </div>

                <div className="flex h-72">
                  {/* Sidebar */}
                  <div className="w-14 bg-black/30 flex flex-col items-center py-4 gap-3 border-r border-white/5">
                    <Image src="/popzop_logo.png" alt="popzop" width={24} height={24} className="w-6 h-6 rounded-md object-contain mb-2" />
                    {[BarChart3, ShoppingBag, Package, Palette, TrendingUp].map((Icon, i) => (
                      <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${i === 0 ? 'bg-violet-600/60' : 'bg-transparent hover:bg-white/5'}`}>
                        <Icon size={14} className={i === 0 ? 'text-white' : 'text-white/30'} />
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold text-white/80">Analytics</p>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Live</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: 'Revenue', value: '₹48,200', color: 'rgba(16,185,129,0.15)', tc: '#10b981' },
                        { label: 'Orders', value: '37', color: 'rgba(59,130,246,0.15)', tc: '#3b82f6' },
                        { label: 'Products sold', value: '52', color: 'rgba(124,58,237,0.15)', tc: '#a855f7' },
                        { label: 'Avg. order', value: '₹1,303', color: 'rgba(245,158,11,0.15)', tc: '#f59e0b' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl p-3" style={{ backgroundColor: s.color }}>
                          <p className="text-sm font-bold" style={{ color: s.tc }}>{s.value}</p>
                          <p className="text-[9px] text-white/40 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-[9px] font-semibold text-white/30 mb-2">Revenue trend</p>
                      <div className="flex items-end gap-1 h-10">
                        {[30, 55, 40, 80, 60, 95, 70, 85, 45, 90, 75, 100, 65, 88].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t transition-all"
                            style={{ height: `${h}%`, background: i === 13 ? 'linear-gradient(to top, #7c3aed, #ec4899)' : 'rgba(255,255,255,0.08)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Social proof numbers ── */}
      <section className="py-16 border-y border-white/5 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: 500, suffix: '+', label: 'Creators', color: 'text-violet-400' },
              { icon: ShoppingBag, value: 10, suffix: 'K+', label: 'Orders processed', color: 'text-pink-400' },
              { icon: TrendingUp, value: 98, suffix: '%', label: 'Satisfaction', color: 'text-emerald-400' },
              { icon: Zap, value: 5, suffix: ' min', label: 'To first sale', color: 'text-amber-400' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 100} className="text-center">
                <s.icon size={20} className={`${s.color} mx-auto mb-3`} />
                <p className={`text-3xl font-black ${s.color}`}>
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <Reveal className="text-center mb-16 md:mb-20">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Simple, transparent
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>pricing</span>
            </h2>
            <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto">
              One flat monthly fee. No hidden charges. No per-transaction fees.
            </p>
          </Reveal>

          <Reveal delay={200} from="bottom">
            <div className="relative max-w-md mx-auto">
              {/* Limited time badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30 animate-pulse">
                  <Zap size={10} />
                  Limited Time Offer
                </div>
              </div>

              {/* Pricing card */}
              <div
                className="relative rounded-3xl p-8 md:p-10 border overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  borderColor: 'rgba(168,85,247,0.3)',
                  boxShadow: '0 20px 60px rgba(124,58,237,0.15)',
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.15), transparent 70%)' }} />

                <div className="relative z-10">
                  {/* First month free badge */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg shadow-emerald-500/30">
                      <Star size={12} />
                      First Month FREE
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-3 mb-2">
                      <span className="text-5xl md:text-6xl font-black text-white">₹399</span>
                      <span className="text-lg text-white/50">/month</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-sm text-white/40 line-through">₹699/month</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        43% OFF
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-3 font-medium">
                      Start with ₹0 — first month on us!
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {[
                      'Unlimited products',
                      'All themes included',
                      'Unlimited orders',
                      'Sales analytics',
                      'Order management',
                      'Secure payments via Razorpay',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Check size={11} className="text-white" />
                        </div>
                        <p className="text-sm text-white/70">{feature}</p>
                      </div>
                    ))}
                  </div>

                  {/* Transaction fee note */}
                  <div className="rounded-2xl p-4 mb-8 border"
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.1)',
                      borderColor: 'rgba(16,185,129,0.2)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Shield size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-400 mb-1">No transaction fees</p>
                        <p className="text-xs text-white/50 leading-relaxed">
                          We don&apos;t charge on each transaction. You only pay payment gateway charges (as per Razorpay&apos;s standard rates).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/login"
                    className="block w-full text-center bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-base px-8 py-4 rounded-2xl hover:opacity-90 active:scale-[0.97] transition-all shadow-xl shadow-violet-500/25"
                  >
                    Start your free shop
                  </Link>

                  <p className="text-center text-xs text-white/30 mt-4">
                    No credit card required · Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
          <Reveal>
            <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-sm">
              <Image src="/popzop_logo.png" alt="popzop.bio" width={44} height={44} className="w-11 h-11 object-contain" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
              Your shop is<br />
              <span style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>one click away</span>
            </h2>
            <p className="text-white/50 text-lg mb-12 max-w-lg mx-auto">
              Join creators who&apos;ve turned their Instagram followers into customers with popzop.bio
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 bg-white text-gray-900 font-black text-base px-12 py-5 rounded-2xl hover:bg-gray-50 active:scale-[0.97] transition-all shadow-2xl shadow-white/20"
            >
              Create your free shop
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/25 text-sm mt-6">No credit card required · Free forever</p>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/popzop_logo.png" alt="popzop.bio" width={28} height={28} className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-white">popzop.bio</span>
          </div>
          <p className="text-sm text-white/25">© 2024 popzop.bio · Creator Commerce Platform</p>
          <div className="flex items-center gap-6">
            <Link href="/track-order" className="text-sm text-white/40 hover:text-white transition-colors">Track Order</Link>
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">Merchant Login</Link>
          </div>
        </div>
      </footer>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
