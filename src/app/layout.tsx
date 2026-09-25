import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'TKFK Gandhi Knowledge Challenge 2026 | The Knowledge Forum Kerala',
  description: 'An online national-level quiz on the life, principles and legacy of Mahatma Gandhi — Open to all participants across India, scheduled for 2 October 2026.',
  keywords: 'Gandhi Jayanti 2026, TKFK, Gandhi Quiz, Mahatma Gandhi, Knowledge Challenge, TKFK26',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} font-sans scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased pb-20 md:pb-0">
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
