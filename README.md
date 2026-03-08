# Popzop.bio — Creator Commerce Platform

A production-quality MVP for a creator-commerce storefront platform where merchants create their own shop, manage catalog, receive orders, and customers browse and purchase products.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Firebase** (Auth, Firestore, Storage)
- **Tailwind CSS v4**
- **Razorpay** (payments)
- **Sora font**

---

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# Firebase Client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:xxx

# Razorpay (public key for client-side checkout)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Razorpay (secret — server-side only)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_key

# Firebase Admin SDK (server-side payment verification)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Google Sign-In
3. Create **Firestore** database
4. Enable **Firebase Storage**
5. Copy Web app config → fill `NEXT_PUBLIC_FIREBASE_*` vars
6. For server-side: Project Settings → Service Accounts → Generate private key → fill `FIREBASE_ADMIN_*` vars

### Firestore Indexes (required)

Create composite indexes:

| Collection | Fields |
|---|---|
| `products` | `merchantId` ASC, `active` ASC, `createdAt` DESC |
| `products` | `merchantId` ASC, `categoryId` ASC, `active` ASC, `createdAt` DESC |
| `categories` | `merchantId` ASC, `sortOrder` ASC |
| `orders` | `merchantId` ASC, `createdAt` DESC |
| `orders` | `merchantId` ASC, `orderStatus` ASC, `createdAt` DESC |
| `orders` | `customerPhone` ASC, `createdAt` DESC |

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /merchants/{merchantId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == merchantId;
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
  }
}
```

---

## Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings → API Keys → Generate key pair
3. Use Test mode keys for development
4. Fill `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Merchant sign-in |
| `/shop/[handle]` | Customer storefront |
| `/shop/[handle]/product/[productId]` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with Razorpay |
| `/track-order` | Order tracking |
| `/dashboard` | Merchant dashboard redirect |
| `/dashboard/onboarding` | Shop creation |
| `/dashboard/analytics` | Analytics |
| `/dashboard/catalog` | Products |
| `/dashboard/categories` | Categories |
| `/dashboard/orders` | Orders |
| `/dashboard/settings` | Shop settings |

---

## Project Structure

```
app/            Pages and API routes
components/     Reusable UI components
  ui/           Base primitives (Button, Input, Card, Modal, etc.)
  layout/       Dashboard layout with sidebar
  merchant/     Merchant-specific components (ThemePicker, etc.)
hooks/          React hooks (useAuth, useCart, useMerchant)
services/       Firestore service layer (merchants, products, orders, etc.)
lib/            Firebase client + Razorpay server setup
types/          TypeScript types + theme configs
utils/          Currency formatting, helpers
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) — add all env vars in the dashboard.

### Subdomain Support (Future)

Add `middleware.ts` to rewrite `handle.popzop.bio` → `/shop/handle`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const handle = host.split('.')[0];
  if (host.includes('popzop.bio') && handle !== 'www') {
    const url = req.nextUrl.clone();
    url.pathname = `/shop/${handle}${req.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
```
