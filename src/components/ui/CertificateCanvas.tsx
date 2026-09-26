'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Download, ShieldCheck, Share2, Check } from 'lucide-react';
import { Certificate, Participant } from '@/types';

interface Props {
  certificate: Certificate;
  participant: Participant;
}

export const CertificateCanvas: React.FC<Props> = ({ certificate, participant }) => {
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

    // Dimensions for high-res certificate (1200 x 850)
    canvas.width = 1200;
    canvas.height = 850;

    // Background Gradient (Elegant Ivory / Academic Parchment)
    const bg = ctx.createLinearGradient(0, 0, 1200, 850);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.5, '#fbfbfe');
    bg.addColorStop(1, '#f4f6f8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Tricolor Border Frame
    ctx.strokeStyle = '#0b2545'; // TKFK Navy
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = '#1e6f42'; // Green Accent
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, 1104, 754);

    ctx.strokeStyle = '#d97706'; // Gold Accent
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 1088, 738);

    // Header Title
    ctx.fillStyle = '#0b2545';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE KNOWLEDGE FORUM KERALA (TKFK)', 600, 120);

    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText('GANDHI KNOWLEDGE CHALLENGE 2026', 600, 180);

    ctx.fillStyle = '#d97706';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('Official Certificate of Academic Merit', 600, 220);

    // Divider Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 245);
    ctx.lineTo(850, 245);
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#475569';
    ctx.font = '18px sans-serif';
    ctx.fillText('This is to certify that', 600, 290);

    // Participant Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(participant.name.toUpperCase(), 600, 355);

    // Participant ID & Institution
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Participant ID: ${participant.participant_id}`, 600, 400);

    if (participant.college) {
      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Institution: ${participant.college}`, 600, 435);
    }

    // Performance Summary Box
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(300, 470, 600, 110, 16);
    } else {
      ctx.rect(300, 470, 600, 110);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Score Secured: ${certificate.score_percentage}%`, 450, 520);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Grade: ${certificate.grade}`, 750, 520);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Event Date: 2 October 2026 • 50 Questions (25 Mins)`, 600, 555);

    // Footer Signatures / Verification Code
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('Academic Controller', 350, 690);
    ctx.fillText('Secretary, TKFK Board', 850, 690);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, 665);
    ctx.lineTo(450, 665);
    ctx.moveTo(750, 665);
    ctx.lineTo(950, 665);
    ctx.stroke();

    // Security Verification Stamp & QR Code Representation
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`CERTIFICATE CODE: ${certificate.certificate_code}`, 600, 740);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText(`VERIFICATION HASH: ${certificate.verification_hash}`, 600, 765);

    ctx.fillStyle = '#16a34a';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Verify authenticity online at: https://tkfk.in/verify/${participant.participant_id}`, 600, 790);

    try {
      setImageUrl(canvas.toDataURL('image/png'));
    } catch {}

  }, [certificate, participant]);

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
            title: 'TKFK Gandhi Knowledge Challenge 2026 Certificate',
            text: `Certificate of Merit for ${participant.name} (${participant.participant_id})`
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
    const fileName = `TKFK26_Certificate_${participant.participant_id}_${participant.name.replace(/\s+/g, '_')}.png`;

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

  return (
    <div className="flex flex-col items-center space-y-5 w-full">
      {/* Visual Certificate Frame */}
      <div className="w-full max-w-4xl bg-white p-2 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 flex justify-center overflow-hidden">
        <canvas ref={canvasRef} className="hidden" />
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`TKFK 2026 Certificate for ${participant.name}`}
            className="max-w-full h-auto rounded-xl border border-gray-100 shadow-sm block select-none"
          />
        ) : (
          <div className="aspect-[1200/850] w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs animate-pulse">
            Generating High-Resolution Certificate...
          </div>
        )}
      </div>

      {/* Download Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={downloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {sharedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Saved / Shared Successfully!</span>
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
          disabled={downloading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG Certificate</span>
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-500">
        💡 <strong>Mobile Tip:</strong> You can also tap & hold the certificate image above to save directly to your photo gallery.
      </p>
    </div>
  );
};
