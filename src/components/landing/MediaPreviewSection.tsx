'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';

export const MediaPreviewSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(23.6);
  const [isHovered, setIsHovered] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [preloadState, setPreloadState] = useState<'none' | 'metadata'>('none');
  const [isEnded, setIsEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Lazy load video metadata on first hover or touch
  const handleIntentToPlay = useCallback(() => {
    if (preloadState === 'none') {
      setPreloadState('metadata');
    }
  }, [preloadState]);

  // Handle Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused || videoRef.current.ended) {
      setHasStarted(true);
      setIsEnded(false);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback interrupted:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle Mute Toggle
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  // Handle Fullscreen
  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Handle Time Update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 23.6;
    setCurrentTime(curr);
    setDuration(dur);
    setProgress((curr / dur) * 100);
  }, []);

  // Handle Seek in Timeline
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newProgress * (videoRef.current.duration || duration);
    videoRef.current.currentTime = newTime;
    setProgress(newProgress * 100);
  }, [duration]);

  // Handle Video Ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setIsEnded(true);
    setShowControls(true);
  }, []);

  // Auto-hide controls when playing and inactive
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section className="py-14 sm:py-20 bg-[#f8f5f0] border-b border-[#f0ede8] relative" id="preview">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Top visual connector line seamlessly continuing from Hero */}
        <div className="mx-auto w-[1.5px] h-8 bg-gradient-to-b from-[#ff6b35]/80 to-[#f0ede8] mb-6 hidden md:block" />

        {/* Mock Browser Window Container with GsapReveal */}
        <GsapReveal delay={0.1} duration={1.2} yOffset={45} scale={0.97}>
          <div className="relative rounded-[32px] border border-[#f0ede8] bg-[#fafafb] p-3 sm:p-4 shadow-kairu transition-all duration-500 hover:shadow-kairu-hover">
            
            {/* Window Chrome Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 mb-3 border-b border-[#f0ede8]">
              {/* 3 Window Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Centered / Right Window Label */}
              <div className="text-[11px] font-mono text-[#706e6a] tracking-wider uppercase font-medium">
                TKFK / Digital Poster Creation Contest 2026
              </div>

              {/* Live Status Pill with Pulsing Dot */}
              <div className="flex items-center gap-1.5 bg-[#ff6b35]/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-ping" />
                <span className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide">
                  Live
                </span>
              </div>
            </div>

            {/* Large Rounded Media Preview Container */}
            <div 
              ref={containerRef}
              onMouseEnter={() => {
                setIsHovered(true);
                handleIntentToPlay();
              }}
              onMouseLeave={() => {
                setIsHovered(false);
                if (isPlaying) setShowControls(false);
              }}
              onMouseMove={handleMouseMove}
              onClick={togglePlay}
              className="group relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#141412] cursor-pointer shadow-inner select-none"
            >
              {/* HTML5 Video Element (Optimized for Fast Loading & 0-lag playback) */}
              <video
                ref={videoRef}
                src="/video/animattionnnn.mp4"
                poster="/video/thumbnail.webp"
                preload={preloadState}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={(e) => {
                  setDuration(e.currentTarget.duration || 23.6);
                }}
                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                  !isPlaying && !hasStarted ? 'group-hover:scale-[1.015]' : ''
                }`}
              />

              {/* High-Resolution Pre-load Poster Layer (Instant 48KB LCP fallback) */}
              {!hasStarted && (
                <div className="absolute inset-0 pointer-events-none">
                  <Image
                    src="/video/thumbnail.webp"
                    alt="Digital Poster Creation Contest Animated Overview"
                    fill
                    priority
                    sizes="(max-width: 1200px) 100vw, 1100px"
                    className="object-cover opacity-95 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  {/* Subtle dark gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141412]/80 via-[#141412]/20 to-transparent" />
                </div>
              )}

              {/* Center Play Button Overlay (Visible when paused or before start) */}
              {(!isPlaying || isEnded) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring */}
                    <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#ff6b35]/25 animate-ping" />
                    
                    {/* Main Circular Button */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff6b35] hover:bg-[#e85926] flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      {isEnded ? (
                        <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
                      ) : (
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Title Bar (Visible before video starts or when paused) */}
              {!hasStarted && (
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end justify-between pointer-events-none text-white z-20">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#ff6b35] font-semibold block mb-1">
                      OFFICIAL OVERVIEW
                    </span>
                    <h3 className="text-base sm:text-2xl font-bold tracking-tight">
                      Design Impactful Posters. Win Verified Recognition.
                    </h3>
                  </div>
                  <span className="text-xs text-white/90 bg-black/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full font-mono font-medium hidden sm:inline-block">
                    23s Animation
                  </span>
                </div>
              )}

              {/* Dynamic Interactive Player Controls (Visible on hover when started) */}
              {hasStarted && (
                <div 
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#141412]/95 via-[#141412]/60 to-transparent p-4 sm:p-5 transition-opacity duration-300 z-30 ${
                    showControls || !isPlaying || isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Interactive Seekable Progress Bar */}
                  <div 
                    onClick={handleSeek}
                    className="relative w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full mb-3.5 cursor-pointer transition-all group/bar"
                  >
                    <div 
                      className="h-full bg-[#ff6b35] rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause Button */}
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        )}
                      </button>

                      {/* Mute/Unmute Button */}
                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
                        )}
                      </button>

                      {/* Time Counter */}
                      <span className="font-mono text-[11px] text-white/80 select-none">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-[#ff6b35] font-semibold hidden sm:inline-block">
                        TKFK ANIMATION
                      </span>

                      {/* Fullscreen Button */}
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        aria-label="Toggle Fullscreen"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
                      >
                        <Maximize2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </GsapReveal>

      </div>
    </section>
  );
};
