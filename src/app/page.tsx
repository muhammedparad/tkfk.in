import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { MediaPreviewSection } from '@/components/landing/MediaPreviewSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { TransformationTimelineSection } from '@/components/landing/TransformationTimelineSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CurriculumSection } from '@/components/landing/CurriculumSection';
import { ConversionStatementSection } from '@/components/landing/ConversionStatementSection';
import { AudienceFitSection } from '@/components/landing/AudienceFitSection';
import { CommunityLeadershipSection } from '@/components/landing/CommunityLeadershipSection';
import { PricingOfferSection } from '@/components/landing/PricingOfferSection';
import { FaqGridSection } from '@/components/landing/FaqGridSection';
import { ContactPromptSection } from '@/components/landing/ContactPromptSection';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'TKFK — The Knowledge Forum Kerala | Competitions, Programmes & Learning',
  description: 'Turn what you know into achievements that inspire. National digital poster contests, knowledge challenges, and verified student credentials.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased">
      {/* 1. Persistent Header with Kairu Capsule CTA */}
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
        {/* 2. Hero Section: 5-Star Trust + Rotating Keyword Highlight + Moving Notification Marquee */}
        <HeroSection />

        {/* 3. Product / Media Preview: Mock Browser Window */}
        <MediaPreviewSection />

        {/* 4. The Problem: 2x2 Grid with Outlined Peach Illustrations */}
        <ProblemSection />

        {/* 5. The Transformation: 4-Phase Vertical Timeline with Active Orange Highlights */}
        <TransformationTimelineSection />

        {/* 6. Testimonials & Social Proof: Overlapping Portraits, Star Ratings & Orange Metrics */}
        <TestimonialsSection />

        {/* 7. Curriculum & Blueprint: Asymmetric 6-Module Grid with Oversized Numbers */}
        <CurriculumSection />

        {/* 8. Statistics & Conversion Headline: 3-Metric Row + Animated Keyword Highlight */}
        <ConversionStatementSection />

        {/* 9. Audience-Fit: 4 Vertically Stacked Category Cards */}
        <AudienceFitSection />

        {/* 10. Community Desk & Jury Profile: Interactive Social Cards with Synchronized Dynamic Metrics */}
        <CommunityLeadershipSection />

        {/* 11. Pricing & Access: One Simple Entry (₹99) Full Feature Card */}
        <PricingOfferSection />

        {/* 12. FAQ: 2-Column Grid of Static Q&A Cards */}
        <FaqGridSection />

        {/* 13. Contact Prompt: Low-pressure Support Desk Invitation */}
        <ContactPromptSection />
      </main>

      {/* 14. Spacious Light Editorial Footer */}
      <Footer />
    </div>
  );
}
