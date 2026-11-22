import React from 'react';
import { Check } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';

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
    title: 'Theme & Concept Development',
    description: 'Discover how to translate an abstract theme into a resonant visual metaphor before opening your design software.',
    checklist: [
      'Select themes with high emotional resonance',
      'Translate core ideas into symbolic visual metaphors',
      'Distill complex concepts into a single focal message',
    ],
    tag: 'Stage 1 • Concept',
  },
  {
    number: '02',
    title: 'Visual Hierarchy & Composition',
    description: 'Master spatial balance, contrast, and layout systems that draw the viewer's attention immediately to key elements.',
    checklist: [
      'Golden ratio, rule of thirds, and grid alignment',
      'Intentional color palettes that evoke mood and tone',
      'Balancing whitespace against primary focal subjects',
    ],
    tag: 'Stage 2 • Composition',
  },
  {
    number: '03',
    title: 'Typography & Messaging',
    description: 'The typographic discipline that ensures your poster communicates clearly from across a room or on a mobile feed.',
    checklist: [
      'Pairing expressive display fonts with legible body type',
      'Establishing rigid font size and weight hierarchies',
      'Crafting memorable, concise slogans and calls-to-action',
    ],
    tag: 'Stage 3 • Typography',
  },
  {
    number: '04',
    title: 'Digital Tools & File Standards',
    description: 'Everything required to produce print-ready fidelity and flawless digital display across modern screens.',
    checklist: [
      'A4 portrait (210×297mm) or 1080×1920 px dimensions',
      'High-resolution rendering at 300 DPI for print quality',
      'Standard export formats: PNG, JPG, or PDF (under 25MB)',
    ],
    tag: 'Stage 4 • Standards',
  },
  {
    number: '05',
    title: 'Originality & Contest Compliance',
    description: 'Safeguard your submission against intellectual property disputes and adhere to strict competition honesty rules.',
    checklist: [
      '100% original work produced by the registered participant',
      'Permitted use of licensed and copyright-free assets',
      'Prohibition of plagiarism, watermarks, or deceptive edits',
    ],
    tag: 'Stage 5 • Compliance',
  },
  {
    number: '06',
    title: 'Jury Evaluation Rubric',
    description: 'Transparent multi-parameter scoring criteria applied by the expert jury panel to select merit award recipients.',
    checklist: [
      'Conceptual Originality & Creativity: 30%',
      'Visual Hierarchy & Composition: 30%',
      'Typography & Message Clarity: 20%',
      'Technical Quality & Craft: 20%',
    ],
    tag: 'Stage 6 • Rubric',
  },
];

export const CurriculumSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#0a0a0f] border-b border-white/5" id="curriculum">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Asymmetric Section Heading */}
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-16 sm:mb-20">
            <div className="md:col-span-7 space-y-3">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-[#a78bfa] text-[11px] font-semibold tracking-[0.2em] uppercase block">
                LEARNING DIMENSIONS • 6 MODULES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-[-0.04em] leading-[1.12]">
                Creative standards & jury evaluation framework
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed font-normal">
                Essential visual communication and design competencies applied across TKFK challenges, evaluated rigorously by independent mentors.
              </p>
            </div>
          </div>
        </GsapReveal>

        {/* 6-Card Grid (3 Columns, 2 Rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {MODULES.map((item, idx) => (
            <GsapReveal key={item.number} delay={idx * 0.08} duration={1.0} yOffset={40} scale={0.97}>
              <div
                className="bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group cursor-default h-full"
              >
                <div>
                  {/* Oversized Module Number */}
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#a78bfa] font-mono tracking-tight mb-4 transition-colors duration-300">
                    {item.number}
                  </div>

                  <h3 className="text-lg sm:text-xl font-medium text-white mb-2 leading-snug tracking-[-0.03em] transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed font-normal mb-6">
                    {item.description}
                  </p>

                  {/* Checklist with Violet Tick Marks */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.08] mb-6">
                    {item.checklist.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-[#94a3b8] font-medium">
                        <Check className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Tag */}
                <div className="pt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[11px] font-mono text-[#a78bfa] uppercase tracking-wider transition-colors">
                    {item.tag}
                  </span>
                </div>
              </div>
            </GsapReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
