import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tkfk.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TKFK — The Knowledge Forum Kerala | Competitions, Programmes & Learning',
    template: '%s | TKFK',
  },
  description: 'The Knowledge Forum Kerala (TKFK) is a vibrant community empowering curious minds through national competitions, learning programmes, and interactive challenges.',
  keywords: [
    'TKFK',
    'The Knowledge Forum Kerala',
    'Gandhi Knowledge Challenge 2026',
    'Gandhi Jayanti Quiz',
    'Digital Poster Contest',
    'National Quiz India',
    'Knowledge Challenge',
    'TKFK26',
  ],
  authors: [{ name: 'The Knowledge Forum Kerala' }],
  creator: 'The Knowledge Forum Kerala',
  publisher: 'The Knowledge Forum Kerala',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'google902bdb7995bae4fa',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    title: 'TKFK — The Knowledge Forum Kerala | Competitions, Programmes & Learning',
    description: 'Empowering curious minds through national competitions, learning programmes, and interactive challenges.',
    siteName: 'TKFK',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'TKFK - The Knowledge Forum Kerala',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'TKFK — The Knowledge Forum Kerala',
    description: 'Empowering curious minds through national competitions, learning programmes, and interactive challenges.',
    images: ['/android-chrome-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} font-sans scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-2xl ring-2 ring-white"
        >
          Skip to main content
        </a>
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
