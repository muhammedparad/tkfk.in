import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    product: 'Digital Poster Contest 2026',
    quote: '"I had the digital design skills, but never had an official platform to showcase them. The feedback, participant pass, and cash prize changed how I view my creative potential."',
    name: 'Ananya S.',
    location: 'Kozhikode',
    metricLabel: '1st Prize Reward',
    metricValue: '₹9,999',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    product: 'National Knowledge Challenge',
    quote: '"The instant official ID pass and verified certificate gave me tangible credentials that I proudly included in my higher education portfolio. Transparent and inspiring."',
    name: 'Rohan Verma',
    location: 'Thrissur',
    metricLabel: 'Statewide Rank',
    metricValue: 'Rank 1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    product: 'Creative Design Challenge',
    quote: '"The detailed guidelines and prompt selection helped me move from rough sketches to a finished artwork. The ₹99 entry fee was the best investment in my learning this year."',
    name: 'Farhan K.',
    location: 'Malappuram',
    metricLabel: 'Jury Evaluation',
    metricValue: '98.5%',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141412] tracking-tight leading-[1.12]">
            Real students turning curiosity into recognition
          </h2>

          {/* Trust Row with Overlapping Avatars and Stars */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              <Image width={32} height={32} unoptimized className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f8f5f0] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
              <Image width={32} height={32} unoptimized className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f8f5f0] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
              <Image width={32} height={32} unoptimized className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f8f5f0] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
              <Image width={32} height={32} unoptimized className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f8f5f0] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" alt="Avatar" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-0.5 text-[#141412]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
                ))}
              </div>
              <span className="text-[11px] font-medium text-[#706e6a]">
                Trusted by 2,500+ participants
              </span>
            </div>
          </div>
        </div>

        {/* 3 Horizontal Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f0ede8]/60 hover:bg-[#f0ede8]/90 border border-[#f0ede8] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-kairu"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[#141412]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#9c9a97]">
                    {item.product}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#141412] leading-relaxed font-normal">
                  {item.quote}
                </p>
              </div>

              {/* Bottom Row: Avatar & Orange Metric */}
              <div className="pt-6 border-t border-[#f0ede8] flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <Image
                    width={40}
                    height={40}
                    unoptimized
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#f0ede8]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#141412]">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-[#9c9a97]">
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-medium text-[#9c9a97] uppercase tracking-wider block">
                    {item.metricLabel}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#ff6b35]">
                    {item.metricValue}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
