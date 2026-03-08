import { Timestamp } from 'firebase/firestore';

// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp | Date;
}

// ─── Merchant / Shop ─────────────────────────────────────────────────────────
export type ThemePreset = 'minimal' | 'boutique' | 'bold' | 'neon' | 'sakura' | 'midnight' | 'pop' | 'christmas' | 'summer' | 'halloween' | 'cyberpunk' | 'diwali' | 'holi';
export type FontOption = 'sora' | 'playfair' | 'nunito';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  phone: string;
  upiId?: string;
}

export interface Merchant {
  id: string;
  uid: string;
  shopName: string;
  handle: string;
  logoUrl: string;
  bannerUrl: string;
  theme: ThemePreset;
  font?: FontOption;
  bankDetails?: BankDetails;
  bio?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Automation ──────────────────────────────────────────────────────────────
export interface AutomationStats {
  comments: number;
  dmsSent: number;
  conversions: number;
}

export interface Automation {
  id: string;
  merchantId: string;
  postUrl: string;
  postType: 'reel' | 'post';
  keyword: string;
  replyLink: string;
  replyMessage: string;
  isLive: boolean;
  stats: AutomationStats;
  createdAt: Date;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  merchantId: string;
  name: string;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
  createdAt: Timestamp | Date;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductBadge = 'New' | 'Best Seller' | 'Sale' | null;

export interface Product {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  quantityAvailable: number;
  images: string[];
  featuredImage: string;
  active: boolean;
  badge: ProductBadge;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  merchantId: string;
  shopHandle: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  featuredImage: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  productsSold: number;
  averageOrderValue: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

// ─── Theme Config ─────────────────────────────────────────────────────────────
export interface ThemeConfig {
  primary: string;
  primaryFg: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  radius: string;
  cardStyle: 'flat' | 'elevated' | 'outline';
  heroStyle: 'minimal' | 'full' | 'centered';
}

export const THEME_CONFIGS: Record<ThemePreset, ThemeConfig> = {
  minimal: {
    primary: '#0f0f0f',
    primaryFg: '#ffffff',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#0f0f0f',
    muted: '#6b7280',
    border: '#e5e7eb',
    radius: '0.5rem',
    cardStyle: 'flat',
    heroStyle: 'minimal',
  },
  boutique: {
    primary: '#c9a96e',
    primaryFg: '#ffffff',
    background: '#fdf8f3',
    surface: '#ffffff',
    text: '#1a1209',
    muted: '#9d8563',
    border: '#e8ddd0',
    radius: '1rem',
    cardStyle: 'elevated',
    heroStyle: 'full',
  },
  bold: {
    primary: '#7c3aed',
    primaryFg: '#ffffff',
    background: '#ffffff',
    surface: '#f5f3ff',
    text: '#1e1b4b',
    muted: '#6d28d9',
    border: '#ddd6fe',
    radius: '0.75rem',
    cardStyle: 'outline',
    heroStyle: 'centered',
  },
  neon: {
    primary: '#00f5a0',
    primaryFg: '#0a0a0a',
    background: '#0a0a0a',
    surface: '#141414',
    text: '#f0f0f0',
    muted: '#6b7280',
    border: '#1f1f1f',
    radius: '0.5rem',
    cardStyle: 'flat',
    heroStyle: 'full',
  },
  sakura: {
    primary: '#e91e8c',
    primaryFg: '#ffffff',
    background: '#fff5f9',
    surface: '#ffffff',
    text: '#2d1b2e',
    muted: '#b06fa0',
    border: '#f8d7ea',
    radius: '1.25rem',
    cardStyle: 'elevated',
    heroStyle: 'minimal',
  },
  midnight: {
    primary: '#d4a853',
    primaryFg: '#0f0c07',
    background: '#0f0c07',
    surface: '#1a1610',
    text: '#f5ead8',
    muted: '#8a7a5a',
    border: '#2a2418',
    radius: '0.25rem',
    cardStyle: 'flat',
    heroStyle: 'full',
  },
  pop: {
    primary: '#ff3d00',
    primaryFg: '#ffffff',
    background: '#fffbf0',
    surface: '#ffffff',
    text: '#1a0a00',
    muted: '#a05030',
    border: '#ffe0cc',
    radius: '1.5rem',
    cardStyle: 'elevated',
    heroStyle: 'centered',
  },
  christmas: {
    primary: '#c41e3a',
    primaryFg: '#ffffff',
    background: '#f8fdf8',
    surface: '#ffffff',
    text: '#1a2e1a',
    muted: '#5a7a5a',
    border: '#d4e8d4',
    radius: '0.75rem',
    cardStyle: 'outline',
    heroStyle: 'full',
  },
  summer: {
    primary: '#f59e0b',
    primaryFg: '#ffffff',
    background: '#fffdf0',
    surface: '#ffffff',
    text: '#1c1400',
    muted: '#92714a',
    border: '#fde68a',
    radius: '1rem',
    cardStyle: 'elevated',
    heroStyle: 'full',
  },
  halloween: {
    primary: '#f97316',
    primaryFg: '#ffffff',
    background: '#0d0b12',
    surface: '#1a1625',
    text: '#f5f0ff',
    muted: '#7c6a9e',
    border: '#2e2540',
    radius: '0.5rem',
    cardStyle: 'flat',
    heroStyle: 'full',
  },
  cyberpunk: {
    primary: '#faff00',
    primaryFg: '#0a0a0a',
    background: '#080810',
    surface: '#0f0f1a',
    text: '#e0e0ff',
    muted: '#5050a0',
    border: '#1a1a40',
    radius: '0',
    cardStyle: 'outline',
    heroStyle: 'full',
  },
  diwali: {
    primary: '#f59e0b',
    primaryFg: '#1a0a00',
    background: '#12080a',
    surface: '#1e0e12',
    text: '#fde8c0',
    muted: '#a0602a',
    border: '#3a1e0a',
    radius: '0.5rem',
    cardStyle: 'flat',
    heroStyle: 'full',
  },
  holi: {
    primary: '#ec4899',
    primaryFg: '#ffffff',
    background: '#ffffff',
    surface: '#fdf4ff',
    text: '#1a001a',
    muted: '#9333ea',
    border: '#f0abfc',
    radius: '1.25rem',
    cardStyle: 'elevated',
    heroStyle: 'centered',
  },
};
