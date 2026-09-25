import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { FaqAccordion } from '@/components/landing/FaqAccordion';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
        <HeroSection />
        <AboutSection />
        <HowItWorks />
        <TimelineSection />
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
