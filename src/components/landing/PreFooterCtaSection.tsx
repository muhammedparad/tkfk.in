import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PreFooterCtaSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl bg-gradient-to-br from-[#EBF3FE] via-[#F0F6FF] to-[#E3EFFF] border border-blue-100 p-8 sm:p-12 lg:p-16 overflow-hidden">
          
          {/* Subtle decorative circles in background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-200/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-200/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs sm:text-sm font-bold text-[#0066FF] tracking-wider uppercase block">
                BE A PART OF SOMETHING MEANINGFUL
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Let&apos;s Learn, Compete and Grow Together.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl leading-relaxed">
                Whether you&apos;re a student seeking exciting challenges or an enthusiast pursuing lifelong knowledge, TKFK offers a thriving home for your aspirations.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
                >
                  <span>Join as Volunteer</span>
                </Link>
              </div>
            </div>

            {/* Right Decorative Badge: "Small Ideas. Big Impact." */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative bg-white/90 backdrop-blur-xs border border-blue-100 shadow-md rounded-2xl p-6 sm:p-7 rotate-2 hover:rotate-0 transition-transform duration-300 max-w-xs text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif italic text-lg sm:text-xl text-slate-800 font-semibold mb-1">
                  &ldquo;Small Ideas, Big Impact&rdquo;
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Every question asked, every step taken shapes a brighter tomorrow.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
