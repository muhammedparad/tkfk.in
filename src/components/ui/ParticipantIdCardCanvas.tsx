'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Download, Share2, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

interface ParticipantIdCardCanvasProps {
  participantName: string;
  participantId: string;
  eventDateDisplay?: string;
}

export const ParticipantIdCardCanvas: React.FC<ParticipantIdCardCanvasProps> = ({
  participantName,
  participantId,
  eventDateDisplay = EVENT_CONFIG.eventDateDisplay
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sharedSuccess, setSharedSuccess] = useState<boolean>(false);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);

  useEffect(() => {
    // Check if device supports native file sharing (iOS / Android)
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution canvas for sharp mobile & desktop display (1200x750, 16:10 aspect ratio)
    const W = 1200;
    const H = 750;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient (Deep Charcoal Luxury with Warm Brand Accents)
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#141412');
    bgGradient.addColorStop(0.5, '#1c1b18');
    bgGradient.addColorStop(1, '#111110');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative Circular Warm Glows
    const glow1 = ctx.createRadialGradient(W - 120, 100, 10, W - 120, 100, 360);
    glow1.addColorStop(0, 'rgba(255, 107, 53, 0.22)');
    glow1.addColorStop(1, 'rgba(255, 107, 53, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(150, H - 100, 10, 150, H - 100, 300);
    glow2.addColorStop(0, 'rgba(232, 89, 38, 0.16)');
    glow2.addColorStop(1, 'rgba(232, 89, 38, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // Outer Decorative Border
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Inner Subtle Frame
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    // Header Accent Bar
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(60, 60, W - 120, 6);

    // Organization Header
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ff6b35';
    ctx.fillText('THE KNOWLEDGE FORUM KERALA (TKFK)', 75, 125);

    // Main Event Title
    ctx.font = '700 40px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DIGITAL POSTER CREATION CONTEST 2026', 75, 185);

    // Subtitle Tag
    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#9c9a97';
    ctx.fillText('OFFICIAL PARTICIPANT IDENTIFICATION PASS', 75, 225);

    // Main Divider
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 255);
    ctx.lineTo(W - 75, 255);
    ctx.stroke();

    // Participant Name Section
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ff6b35';
    ctx.fillText('PARTICIPANT NAME', 75, 305);

    // Auto-fit long names cleanly
    const upperName = (participantName || 'CONFIRMED PARTICIPANT').toUpperCase();
    let nameFontSize = 46;
    ctx.font = `700 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(upperName).width > (W - 160) && nameFontSize > 28) {
      nameFontSize -= 2;
      ctx.font = `700 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText(upperName, 75, 365);

    // Participant ID Highlight Box (Bottom Left)
    const idBoxW = 540;
    const idBoxH = 130;
    const idBoxX = 75;
    const idBoxY = 425;

    ctx.fillStyle = 'rgba(255, 107, 53, 0.12)';
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(idBoxX, idBoxY, idBoxW, idBoxH, 20);
    } else {
      ctx.rect(idBoxX, idBoxY, idBoxW, idBoxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ff6b35';
    ctx.fillText('UNIQUE PARTICIPANT ID', idBoxX + 30, idBoxY + 40);

    ctx.font = '700 46px monospace, system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(participantId || 'PENDING', idBoxX + 30, idBoxY + 98);

    // Event Date & Details Box (Bottom Right)
    const dateBoxX = 660;
    const dateBoxY = 425;
    const dateBoxW = 465;
    const dateBoxH = 130;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(dateBoxX, dateBoxY, dateBoxW, dateBoxH, 20);
    } else {
      ctx.rect(dateBoxX, dateBoxY, dateBoxW, dateBoxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#9c9a97';
    ctx.fillText('COMPETITION DATE', dateBoxX + 30, dateBoxY + 40);

    ctx.font = '700 30px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f8f5f0';
    ctx.fillText(eventDateDisplay, dateBoxX + 30, dateBoxY + 92);

    // Bottom Security Banner / Authentication Tag
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 620);
    ctx.lineTo(W - 75, 620);
    ctx.stroke();

    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#706e6a';
    ctx.fillText('AUTHENTICATED PARTICIPANT RECORD • DIGITAL POSTER CREATION CONTEST 2026', 75, 665);

    ctx.font = '700 18px monospace';
    ctx.fillStyle = '#ff6b35';
    ctx.fillText('VERIFIED-TKFK26', W - 260, 665);

    // Convert to Image Data URL for smooth mobile touch & preview
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);
    } catch {}

  }, [participantName, participantId, eventDateDisplay]);

  // Mobile Native Share / Save Action
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload('png');
          setDownloading(false);
          return;
        }

        const fileName = `TKFK26_Participant_ID_${participantId || 'Pass'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'TKFK Digital Poster Creation Contest 2026 ID Card',
            text: `Official Participant ID Card for ${participantName} (${participantId})`
          });
          setSharedSuccess(true);
          setTimeout(() => setSharedSuccess(false), 3000);
        } else {
          // Fallback to direct blob download
          triggerBlobDownload(blob, fileName);
        }
        setDownloading(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.warn('[SHARE ERROR]', err);
      handleDownload('png');
      setDownloading(false);
    }
  };

  // Direct Blob Trigger for Mobile & Desktop
  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  };

  // Standard PNG / JPG Download Handler with full Blob support
  const handleDownload = (format: 'png' | 'jpg' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const fileName = `TKFK26_Participant_ID_${participantId || 'Pass'}.${format}`;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

    canvas.toBlob((blob) => {
      if (!blob) {
        const imageURI = canvas.toDataURL(mimeType, 0.95);
        const link = document.createElement('a');
        link.href = imageURI;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        triggerBlobDownload(blob, fileName);
      }
      setDownloading(false);
    }, mimeType, 0.95);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Visual ID Card Preview */}
      <div className="relative rounded-[24px] overflow-hidden border border-[#f0ede8] shadow-soft bg-[#141412] p-2 sm:p-3 group">
        
        {/* Hidden Master Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Display Image */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`TKFK 2026 Participant ID Card for ${participantName}`}
            className="w-full h-auto rounded-xl sm:rounded-2xl shadow-inner block select-none pointer-events-auto"
          />
        ) : (
          <div className="aspect-[16/10] w-full bg-[#1c1b18] rounded-xl flex items-center justify-center text-[#9c9a97] text-xs animate-pulse">
            Generating High-Resolution ID Card...
          </div>
        )}

        {/* Floating Verified Badge on Card */}
        <div className="absolute top-4 right-4 bg-[#141412]/85 backdrop-blur-md border border-[#ff6b35]/40 text-[#ff6b35] text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ff6b35]" />
          <span>AUTHENTICATED</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        
        {/* Primary Mobile Action */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2.5 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 px-6 rounded-full text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {sharedSuccess ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Saved / Shared Successfully!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Save to Photos / Share ID Card</span>
              </>
            )}
          </button>
        )}

        {/* Direct Download Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleDownload('png')}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3 px-4 rounded-full text-xs sm:text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownload('jpg')}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] font-medium py-3 px-4 rounded-full text-xs sm:text-sm border border-[#f0ede8] hover:border-[#e2ded8] shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download JPG</span>
          </button>
        </div>

        {/* Mobile Helpful Hint */}
        <p className="text-center text-[11px] text-[#706e6a] pt-1 flex items-center justify-center gap-1.5">
          <span>💡</span>
          <span>Tip: You can also tap and hold the ID card above to save it directly to your photos.</span>
        </p>

      </div>
    </div>
  );
};
