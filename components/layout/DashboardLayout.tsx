'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Tag,
  LogOut,
  Menu,
  ExternalLink,
  CreditCard,
  ArrowRight,
  Crown,
  Zap,
} from 'lucide-react';
import { cn, getInitials } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { useMerchant } from '@/hooks/useMerchant';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/catalog', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag },
  { href: '/dashboard/automation', label: 'Automation', icon: Zap },
  { href: '/dashboard/subscription', label: 'Subscription', icon: Crown },
  { href: '/dashboard/payment', label: 'Payment', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { merchant } = useMerchant();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0d0d14' }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard/analytics" className="flex items-center gap-2.5">
          <Image src="/popzop_logo.png" alt="popzop" width={32} height={32} className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold text-white text-base">popzop</span>
        </Link>
      </div>

      {/* Shop preview link */}
      {merchant && (
        <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href={`/shop/${merchant.handle}`}
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors group"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              {merchant.logoUrl ? (
                <Image src={merchant.logoUrl} alt={merchant.shopName} width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                  <span className="text-white text-xs font-bold">{getInitials(merchant.shopName)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{merchant.shopName}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>@{merchant.handle}</p>
            </div>
            <ExternalLink size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.2))' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.45)',
                border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <item.icon size={16} />
              {item.label}
              {item.href === '/dashboard/payment' && !merchant?.bankDetails?.accountNumber && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group cursor-default"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            {user?.photoURL ? (
              <Image src={user.photoURL} alt={user.displayName || 'User'} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                <span className="text-white text-xs font-bold">{getInitials(user?.displayName || 'U')}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.displayName}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            title="Sign out"
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen" style={{ backgroundColor: '#0d0d14' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex flex-col w-64 h-full shadow-2xl" style={{ backgroundColor: '#0d0d14' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header
          className="lg:hidden flex items-center justify-between h-14 px-4 shrink-0"
          style={{ backgroundColor: '#0d0d14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard/analytics" className="flex items-center gap-2">
            <Image src="/popzop_logo.png" alt="popzop" width={28} height={28} className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-white text-sm">popzop</span>
          </Link>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Payment info banner */}
          {merchant && !merchant.bankDetails?.accountNumber && (
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <CreditCard size={14} className="text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-800 font-medium">
                    Add payment details to start receiving orders
                  </p>
                </div>
                <Link
                  href="/dashboard/payment"
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  Add now <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
