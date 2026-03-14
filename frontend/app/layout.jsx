import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'UCRS - University Car Reservation System',
  description: 'Enterprise-grade fleet management and vehicle reservation system for universities and organizations. Streamline your transportation requests with role-based access control.',
  keywords: 'fleet management, vehicle reservation, university transport, car booking system',
  authors: [{ name: 'UCRS Team' }],
  openGraph: {
    title: 'UCRS - University Car Reservation System',
    description: 'Streamline your university fleet management with our comprehensive vehicle reservation system',
    type: 'website',
    locale: 'en_US',
    siteName: 'UCRS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UCRS Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UCRS - University Car Reservation System',
    description: 'Enterprise-grade fleet management for universities',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

// Separate viewport export (required in Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}