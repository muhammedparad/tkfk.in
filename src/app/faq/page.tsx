import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FaqAccordion } from '@/components/landing/FaqAccordion';

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-grow pt-24 pb-12 outline-none">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
