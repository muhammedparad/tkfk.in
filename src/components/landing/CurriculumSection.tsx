import React from 'react';
import { Check } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface ModuleCard {
  number: string;
  title: string;
  description: string;
  checklist: string[];
  tag: string;
}

const MODULES: ModuleCard[] = [
  {
    number: '01',
    title: 'Find what resonates before you design',
    description: 'Most creative posters fail before they are drawn. This phase ensures your core concept has clarity and impact.',
    checklist: [
      'Select themes with high emotional resonance',
      'Translate concepts into visual metaphors',
      'Idea vs. actionable poster composition',
    ],
    tag: 'Stage 1 • Concept',
  },
  {
    number: '02',
    title: 'Build a layout that commands attention',
    description: 'Structure, visual hierarchy, and the design systems that turn a raw idea into a compelling entry.',
    checklist: [
      'Golden ratio and grid alignment rules',
      'Color palettes that evoke tone and mood',
      'Ship a polished v1, not an unfinished draft',
    ],
    tag: 'Stage 2 • Layout',
  },
  {
    number: '03',
    title: 'Typography & slogan crafting',
    description: 'The typographic foundation that ensures your message is readable from across the room.',
    checklist: [
      'Pairing display type with body text',
      'Whitespace hierarchy that prevents clutter',
      'Make the core slogan unforgettable',
    ],
    tag: 'Stage 3 • Typography',
  },
  {
    number: '04',
    title: 'Digital rendering & file standards',
    description: 'Everything you need to go from digital canvas to print-ready and web-ready high resolution.',
    checklist: [
      'Export settings for vector and raster artwork',
      'Resolution requirements: 300 DPI vs screen',
      'Originality & copyright compliance checklist',
    ],
    tag: 'Stage 4 • Export',
  },
  {
    number: '05',
    title: 'Participant desk & verification',
    description: 'One submission is a start. This phase issues your official digital pass and locks in your entry.',
    checklist: [
      'Instant digital ID pass generation',
      'Upload verification and receipt check',
      'Participant portal status tracking',
    ],
    tag: 'Stage 5 • Portal',
  },
  {
    number: '06',
    title: 'Jury evaluation & permanent credentials',
    description: 'The credentials and recognition that continue supporting your academic and creative profile.',
    checklist: [
      'Multi-parameter scoring by panel experts',
      'Cash awards up to ₹9,999 for top entries',
      'Verifiable digital certificate for portfolio',
    ],
    tag: 'Stage 6 • Recognition',
  },
];

export const CurriculumSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="curriculum">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Asymmetric Section Heading */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-16 sm:mb-20">
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-[0.2em] uppercase block">
                CURRICULUM & STAGES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
                The complete blueprint, module by module
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed font-normal">
                From picking an inspiring concept to submitting your verified digital poster. Six deliberate stages, one clear direction.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 6-Card Grid (3 Columns, 2 Rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {MODULES.map((item, idx) => (
            <ScrollReveal key={item.number} delayMs={idx * 80} direction="up">
              <div
                className="bg-[#f0ede8]/60 hover:bg-[#f0ede8] border border-[#f0ede8] hover:border-[#ff6b35]/40 rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-kairu hover:-translate-y-1.5 group cursor-default h-full"
              >
                <div>
                  {/* Oversized Module Number with hover transition from peach to vibrant orange */}
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#f5b49c] group-hover:text-[#ff6b35] font-mono tracking-tight mb-4 transition-colors duration-300">
                    {item.number}
                  </div>

                  <h3 className="text-lg sm:text-xl font-medium text-[#141412] group-hover:text-[#ff6b35] mb-2 leading-snug tracking-[-0.03em] transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal mb-6">
                    {item.description}
                  </p>

                  {/* Checklist with Simple Black Tick Marks */}
                  <div className="space-y-2.5 pt-4 border-t border-[#f0ede8] mb-6">
                    {item.checklist.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-[#141412] font-medium">
                        <Check className="w-3.5 h-3.5 text-[#141412] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Tag */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-[#9c9a97] uppercase tracking-wider group-hover:text-[#706e6a] transition-colors">
                    {item.tag}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
