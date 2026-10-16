import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PreFooterCtaSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#f8f5f0]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Kairu Cinematic Dark CTA Container */}
        <div className="relative rounded-[32px] bg-[#141412] text-white p-8 sm:p-12 lg:p-16 overflow-hidden border border-[#2a2a26] shadow-2xl">
          
          {/* Subtle warm orange glow in background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#ff6b35]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-[#ff6b35]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BE A PART OF SOMETHING MEANINGFUL</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.12]">
                Let&apos;s learn, compete and grow together.
              </h2>

              <p className="text-base sm:text-lg text-[#9c9a97] font-normal max-w-2xl leading-relaxed">
                Whether you&apos;re a student seeking exciting challenges or an enthusiast pursuing lifelong knowledge, TKFK offers a thriving home for your aspirations.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white px-7 py-3.5 rounded-full font-medium text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-lg hover:shadow-[#ff6b35]/25 transition-all duration-300 active:scale-95"
                >
                  <span>Explore Events & Contests</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded-full font-medium text-xs sm:text-sm transition-all duration-200"
                >
                  <span>Join as Volunteer</span>
                </Link>
              </div>
            </div>

            {/* Right Badge: "Small Ideas. Big Impact." */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-7 rotate-1 hover:rotate-0 transition-transform duration-300 max-w-xs text-center shadow-lg">
                <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 text-[#ff6b35] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif italic text-lg sm:text-xl text-white font-medium mb-1">
                  &ldquo;Small Ideas, Big Impact&rdquo;
                </h4>
                <p className="text-xs text-[#9c9a97] leading-relaxed">
                  Every question asked, every stroke created shapes a brighter tomorrow.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
