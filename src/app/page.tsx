import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { CorePillarsBar } from '@/components/landing/CorePillarsBar';
import { UpcomingEventsSection } from '@/components/landing/UpcomingEventsSection';
import { AboutCommunitySection } from '@/components/landing/AboutCommunitySection';
import { ExploreActionsSection } from '@/components/landing/ExploreActionsSection';
import { PreFooterCtaSection } from '@/components/landing/PreFooterCtaSection';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'TKFK — A Knowledge Community | Competitions, Programmes & Learning',
  description: 'TKFK is a vibrant community empowering curious minds through national competitions, learning programmes, and interactive challenges.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Core Pillars Bar (Quizzes, Programmes, Community, Certificates) */}
        <CorePillarsBar />

        {/* 3. Upcoming Events Section ("Explore Our Next Opportunities") */}
        <UpcomingEventsSection />

        {/* 4. About TKFK ("A Community for Curious Minds") */}
        <AboutCommunitySection />

        {/* 5. Explore Section ("What Would You Like to Do?") */}
        <ExploreActionsSection />

        {/* 6. Pre-Footer Call to Action Banner */}
        <PreFooterCtaSection />
      </main>
      <Footer />
    </div>
  );
}
