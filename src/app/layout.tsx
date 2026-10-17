import type { Metadata } from 'next';
import './globals.css';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AnimatedGridBackground } from '@/components/ui/AnimatedGridBackground';

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
    'TKFK Competitions',
    'Digital Poster Contest',
    'National Competitions India',
    'Knowledge Challenge',
    'Creative Challenges Kerala',
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
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20 selection:text-[#141412] relative overflow-x-hidden">
        {/* Subtle Ambient Animated Grid Background */}
        <AnimatedGridBackground />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] bg-[#141412] text-white px-5 py-2.5 rounded-full font-bold shadow-2xl ring-2 ring-[#ff6b35]"
        >
          Skip to main content
        </a>
        <div className="relative z-10 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden min-w-0">
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
