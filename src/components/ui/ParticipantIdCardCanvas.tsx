'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';
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
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = '/certificate/TKFK%20Digital%20Poster%20Contest%20Pass.png';

    const render = () => {
      const W = 1586;
      const H = 992;
      canvas.width = W;
      canvas.height = H;

      // 1. Draw Official Participant ID Template Image
      ctx.drawImage(img, 0, 0, W, H);

      // 2. Render Participant Name in Name Box (Box Center: x=793, y=524)
      const upperName = (participantName || 'CONFIRMED PARTICIPANT').toUpperCase().trim();
      let nameFontSize = 46;
      ctx.font = `700 ${nameFontSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
      while (ctx.measureText(upperName).width > 1250 && nameFontSize > 22) {
        nameFontSize -= 2;
        ctx.font = `700 ${nameFontSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
      }
      ctx.fillStyle = '#141412';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(upperName, 793, 524);

      // 3. Render Unique Participant ID in Left Box (Box Center: x=430, y=729)
      ctx.font = "700 38px 'Space Mono', 'Courier New', monospace, system-ui";
      ctx.fillStyle = '#ff6b35';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(participantId || 'PENDING', 430, 729);

      // 4. Render Competition Date in Right Box (Box Center: x=1156, y=729)
      ctx.font = "600 34px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = '#141412';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(eventDateDisplay || 'November 2026', 1156, 729);

      // Generate preview data URL
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setImageUrl(dataUrl);
      } catch (err) {
        console.error('Error generating preview data URL:', err);
      }
    };

    img.onload = render;
    if (img.complete) {
      render();
    }
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

        const fileName = `TKFK26_Participant_Pass_${participantId || 'Pass'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'TKFK Digital Poster Creation Contest 2026 Pass',
            text: `Official Participant Pass for ${participantName} (${participantId})`
          });
          setSharedSuccess(true);
          setTimeout(() => setSharedSuccess(false), 3000);
        } else {
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

  const handleDownload = (format: 'png' | 'jpg' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const fileName = `TKFK26_Participant_Pass_${participantId || 'Pass'}.${format}`;
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
      {/* Visual ID Pass Preview using exact template */}
      <div className="relative rounded-[24px] overflow-hidden border border-[#f0ede8] shadow-soft bg-white p-2 sm:p-3 group">
        
        {/* Hidden Master Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Display Image */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`TKFK 2026 Participant ID Pass for ${participantName}`}
            className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xs block select-none pointer-events-auto"
          />
        ) : (
          <div className="aspect-[1586/992] w-full bg-[#f8f5f0] rounded-xl flex items-center justify-center text-[#9c9a97] text-xs animate-pulse">
            Generating Official Participant Pass...
          </div>
        )}
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
                <span>Save to Photos / Share Pass</span>
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
          <span>Tip: You can also tap and hold the pass above to save it directly to your photos.</span>
        </p>

      </div>
    </div>
  );
};
