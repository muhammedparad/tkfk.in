import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FaqAccordion } from '@/components/landing/FaqAccordion';

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-grow py-8 outline-none">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
