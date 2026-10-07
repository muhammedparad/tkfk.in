'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Download, Share2, Check, Printer, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Participant, Certificate } from '@/types';

interface Props {
  participant: any;
  certificate?: Partial<Certificate>;
  onReady?: () => void;
}

export const CertificateCanvas: React.FC<Props> = ({ participant, certificate, onReady }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sharedSuccess, setSharedSuccess] = useState<boolean>(false);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

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

    // Dimensions matching original high-res template (2560 x 1809)
    const W = 2560;
    const H = 1809;
    canvas.width = W;
    canvas.height = H;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = '/certificate/certificate_template.jpeg';

    const pId = participant?.participant_id || certificate?.participant_id || 'TKFK26-OFFICIAL';
    const cleanName = (participant?.name || certificate?.participant_name || 'CONFIRMED PARTICIPANT').trim().toUpperCase();

    img.onload = () => {
      // 1. Draw Template Background
      ctx.drawImage(img, 0, 0, W, H);

      // 2. Render Participant ID
      // Template has "Participant ID:" label at x=406..619, baseline y=312
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#222222';
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.fillText(pId, 640, 312);

      // 3. Render Participant Name
      // Underline is from x=404 to x=1704 at y=1023 (Center x=1054)
      let fontSize = 62;
      const maxLineWidth = 1220; // safe span inside underline

      ctx.textAlign = 'center';
      ctx.fillStyle = '#432912';

      // Dynamically fit font size if name is long
      ctx.font = `800 ${fontSize}px "Cinzel", "Playfair Display", Georgia, "Times New Roman", serif`;
      while (ctx.measureText(cleanName).width > maxLineWidth && fontSize > 32) {
        fontSize -= 2;
        ctx.font = `800 ${fontSize}px "Cinzel", "Playfair Display", Georgia, "Times New Roman", serif`;
      }

      // Draw Name above underline (baseline y=996 gives perfect spacing above the y=1023 line)
      ctx.fillText(cleanName, 1054, 996);

      try {
        const generatedDataUrl = canvas.toDataURL('image/png', 1.0);
        setImageUrl(generatedDataUrl);
        setImageLoaded(true);
        if (onReady) onReady();
      } catch (err) {
        console.error('Error generating certificate data URL:', err);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load certificate template, falling back to procedural design.');
      // Procedural Fallback if template image fails to load
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#fefdfa');
      bg.addColorStop(1, '#f8f4e9');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = '#533710';
      ctx.lineWidth = 16;
      ctx.strokeRect(60, 60, W - 120, H - 120);

      ctx.fillStyle = '#432912';
      ctx.font = 'bold 72px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Certificate of Participation', W / 2, 450);

      ctx.font = '36px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('This is to certify that', W / 2, 600);

      ctx.font = 'bold 64px Georgia, serif';
      ctx.fillStyle = '#432912';
      ctx.fillText((participant.name || '').toUpperCase(), W / 2, 750);

      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`Participant ID: ${participant.participant_id}`, W / 2, 900);

      try {
        setImageUrl(canvas.toDataURL('image/png', 1.0));
        setImageLoaded(true);
      } catch {}
    };

  }, [participant, certificate, onReady]);

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

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload();
          setDownloading(false);
          return;
        }

        const fileName = `TKFK26_Certificate_${participant.participant_id}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'TKFK Gandhi Jayanti Quiz 2026 Certificate',
            text: `Certificate of Participation for ${participant.name} (${participant.participant_id})`
          });
          setSharedSuccess(true);
          setTimeout(() => setSharedSuccess(false), 3000);
        } else {
          triggerBlobDownload(blob, fileName);
        }
        setDownloading(false);
      }, 'image/png');
    } catch {
      handleDownload();
      setDownloading(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const safeName = (participant.name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `TKFK26_Certificate_${participant.participant_id}_${safeName}.png`;

    canvas.toBlob((blob) => {
      if (!blob) {
        const imageURI = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        triggerBlobDownload(blob, fileName);
      }
      setDownloading(false);
    }, 'image/png');
  };

  const handlePrint = () => {
    if (!imageUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${participant.name} (${participant.participant_id})</title>
            <style>
              @page { size: landscape; margin: 0; }
              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
              img { width: 100%; height: auto; max-height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Visual Certificate Frame */}
      <div className="w-full max-w-4xl bg-white p-2 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-900/10 flex flex-col items-center overflow-hidden transition-all">
        {imageUrl ? (
          <div className="relative group w-full flex justify-center">
            <img 
              src={imageUrl} 
              alt={`TKFK 2026 Certificate for ${participant.name}`}
              className="w-full h-auto rounded-xl border border-amber-950/10 shadow-md block select-none max-w-full"
            />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official TKFK Certificate</span>
            </div>
          </div>
        ) : (
          <div className="aspect-[2560/1809] w-full bg-amber-50/50 rounded-xl flex flex-col items-center justify-center text-amber-900/40 text-xs sm:text-sm animate-pulse gap-3 border border-dashed border-amber-200">
            <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="font-semibold text-amber-900/70">Generating Official High-Resolution Certificate...</span>
          </div>
        )}
      </div>

      {/* Participant Verification Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 shadow-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Verified Participant: <strong>{participant.name}</strong> ({participant.participant_id})</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={downloading || !imageUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {sharedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Saved / Shared!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Save to Photos / Share</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !imageUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Certificate (PNG)</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!imageUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 border border-slate-200"
          title="Print Certificate / Save as PDF"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print / PDF</span>
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-500 max-w-md">
        💡 <strong>Mobile Tip:</strong> You can also tap and hold on the certificate image to save directly to your mobile photo gallery.
      </p>
    </div>
  );
};
