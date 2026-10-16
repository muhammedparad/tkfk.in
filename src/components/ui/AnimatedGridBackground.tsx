'use client';

import React from 'react';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* 
        1. Ambient Animated Grid Layer
        Uses CSS background-position animation for 60fps GPU acceleration without layout recalculations.
        Seamless 36px loop over 54s provides barely-perceptible, organic drift.
      */}
      <div className="absolute inset-0 kairu-animated-grid" />

      {/* 
        2. Feathered Edge Masking Overlay
        Dissolves the grid toward both sides (horizontal feather) and bottom (vertical feather),
        keeping the central reading column clean and readable.
      */}
      <div className="absolute inset-0 kairu-grid-feather" />

      {/* 
        3. Restrained Ambient Glow and Vignette
        Soft warm light in the upper center, fading into the natural #f8f5f0 canvas.
      */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[650px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(255, 107, 53, 0.05) 0%, rgba(248, 245, 240, 0) 70%)',
        }}
      />

      {/* 
        4. Subtle Technical Corner/Intersection Markers
        Tiny, minimal geometric crosshairs at the grid boundaries (Kairu aesthetic)
      */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-[1100px] px-6 pointer-events-none hidden lg:block opacity-30">
        <svg className="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle crosshairs (+) at precise grid positions */}
          <path d="M72 12v8M68 16h8" stroke="#141412" strokeWidth="1" strokeLinecap="square" />
          <path d="M1028 12v8M1024 16h8" stroke="#141412" strokeWidth="1" strokeLinecap="square" />
          {/* Faint accent coordinate line */}
          <line x1="72" y1="16" x2="180" y2="16" stroke="#ff6b35" strokeWidth="1" strokeDasharray="2 6" />
        </svg>
      </div>
    </div>
  );
};
