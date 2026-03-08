import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';

export const metadata: Metadata = {
  title: {
    template: '%s | popzop.bio',
    default: 'popzop.bio — Creator Commerce Platform',
  },
  description:
    'Turn your Instagram bio into a beautiful storefront. Create your shop, manage catalog, and accept orders with popzop.bio.',
  keywords: ['creator commerce', 'instagram shop', 'bio link', 'storefront'],
  openGraph: {
    type: 'website',
    siteName: 'popzop.bio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Comic+Neue:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '14px',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  boxShadow:
                    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
