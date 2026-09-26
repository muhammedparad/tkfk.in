'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Download, Share2, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ParticipantIdCardCanvasProps {
  participantName: string;
  participantId: string;
  eventDateDisplay?: string;
}

export const ParticipantIdCardCanvas: React.FC<ParticipantIdCardCanvasProps> = ({
  participantName,
  participantId,
  eventDateDisplay = '2 October 2026'
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

    // Background Gradient (Deep Navy/Emerald Luxury)
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#0a192f');
    bgGradient.addColorStop(0.5, '#062e24');
    bgGradient.addColorStop(1, '#021e17');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative Circular Glows
    const glow1 = ctx.createRadialGradient(W - 100, 100, 10, W - 100, 100, 350);
    glow1.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    glow1.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(150, H - 100, 10, 150, H - 100, 300);
    glow2.addColorStop(0, 'rgba(5, 150, 105, 0.18)');
    glow2.addColorStop(1, 'rgba(5, 150, 105, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // Outer Decorative Border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Inner Subtle Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    // Header Accent Bar
    ctx.fillStyle = '#10b981';
    ctx.fillRect(60, 60, W - 120, 8);

    // Organization Header
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('THE KNOWLEDGE FORUM KERALA (TKFK)', 75, 125);

    // Main Event Title
    ctx.font = '800 44px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GANDHI KNOWLEDGE CHALLENGE 2026', 75, 185);

    // Subtitle Tag
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('OFFICIAL PARTICIPANT IDENTIFICATION PASS', 75, 225);

    // Main Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 255);
    ctx.lineTo(W - 75, 255);
    ctx.stroke();

    // Participant Name Section
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('PARTICIPANT NAME', 75, 305);

    // Auto-fit long names cleanly
    const upperName = (participantName || 'CONFIRMED PARTICIPANT').toUpperCase();
    let nameFontSize = 48;
    ctx.font = `800 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(upperName).width > (W - 160) && nameFontSize > 28) {
      nameFontSize -= 2;
      ctx.font = `800 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText(upperName, 75, 365);

    // Participant ID Highlight Box (Bottom Left)
    const idBoxW = 540;
    const idBoxH = 130;
    const idBoxX = 75;
    const idBoxY = 425;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(idBoxX, idBoxY, idBoxW, idBoxH, 20);
    } else {
      ctx.rect(idBoxX, idBoxY, idBoxW, idBoxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('UNIQUE PARTICIPANT ID', idBoxX + 30, idBoxY + 40);

    ctx.font = '800 48px monospace, system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(participantId || 'PENDING', idBoxX + 30, idBoxY + 98);

    // Event Date & Details Box (Bottom Right)
    const dateBoxX = 660;
    const dateBoxY = 425;
    const dateBoxW = 465;
    const dateBoxH = 130;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(dateBoxX, dateBoxY, dateBoxW, dateBoxH, 20);
    } else {
      ctx.rect(dateBoxX, dateBoxY, dateBoxW, dateBoxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('COMPETITION DATE', dateBoxX + 30, dateBoxY + 40);

    ctx.font = '800 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(eventDateDisplay, dateBoxX + 30, dateBoxY + 92);

    // Bottom Security Banner / Authentication Tag
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 620);
    ctx.lineTo(W - 75, 620);
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('AUTHENTICATED PARTICIPANT RECORD • GANDHI KNOWLEDGE CHALLENGE 2026', 75, 665);

    ctx.font = '800 18px monospace';
    ctx.fillStyle = '#10b981';
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
            title: 'TKFK Gandhi Knowledge Challenge 2026 ID Card',
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

    const isJpg = format === 'jpg';
    const mimeType = isJpg ? 'image/jpeg' : 'image/png';
    const ext = isJpg ? 'jpg' : 'png';
    const fileName = `TKFK26_Participant_ID_${participantId || 'Pass'}.${ext}`;

    let exportCanvas = canvas;
    if (isJpg) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = '#0a192f';
        tCtx.fillRect(0, 0, canvas.width, canvas.height);
        tCtx.drawImage(canvas, 0, 0);
        exportCanvas = tempCanvas;
      }
    }

    exportCanvas.toBlob((blob) => {
      if (!blob) {
        // Fallback for older browsers
        const fallbackUrl = exportCanvas.toDataURL(mimeType, 0.95);
        const link = document.createElement('a');
        link.href = fallbackUrl;
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
      {/* Visual ID Card Preview (Responsive, High-Res & Touch Friendly) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl bg-slate-950 p-2 sm:p-3 group">
        
        {/* Hidden Master Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Display Image (Crisp, Native on all Mobile/iOS/Android devices) */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`TKFK 2026 Participant ID Card for ${participantName}`}
            className="w-full h-auto rounded-xl sm:rounded-2xl shadow-inner block select-none pointer-events-auto"
          />
        ) : (
          <div className="aspect-[16/10] w-full bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs animate-pulse">
            Generating High-Resolution ID Card...
          </div>
        )}

        {/* Floating Verified Badge on Card */}
        <div className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AUTHENTICATED</span>
        </div>
      </div>

      {/* Action Buttons (Mobile-First & Desktop Friendly) */}
      <div className="space-y-2.5">
        
        {/* Primary Mobile Action: Native Share / Save to Photos Sheet */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm shadow-lg shadow-emerald-700/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            {sharedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-200" />
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

        {/* Direct Download Buttons (PNG & JPG) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleDownload('png')}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownload('jpg')}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-3 rounded-xl text-xs sm:text-sm border border-slate-700 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download JPG</span>
          </button>
        </div>

        {/* Mobile Helpful Hint */}
        <p className="text-center text-[11px] text-slate-500 pt-1 flex items-center justify-center gap-1.5">
          <span>💡</span>
          <span><strong>Mobile Tip:</strong> You can also tap & hold the card image above to save directly to your phone Gallery.</span>
        </p>

      </div>
    </div>
  );
};
