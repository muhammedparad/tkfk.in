'use client';

import React, { useRef, useEffect } from 'react';
import { Download, Award, ShieldCheck } from 'lucide-react';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions for high-res ID Card (Width: 800px, Height: 500px)
    canvas.width = 800;
    canvas.height = 500;

    // Background Gradient (Slate 900 to Emerald 950)
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 500);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 500);

    // Decorative Borders & Accents
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 460);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 440);

    // Header Branding Line
    ctx.fillStyle = '#10b981';
    ctx.fillRect(40, 40, 720, 6);

    // Logo / Header Text
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('THE KNOWLEDGE FORUM KERALA (TKFK)', 50, 85);

    ctx.font = '800 32px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GANDHI KNOWLEDGE CHALLENGE 2026', 50, 130);

    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('OFFICIAL PARTICIPANT IDENTIFICATION CARD', 50, 160);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(50, 180);
    ctx.lineTo(750, 180);
    ctx.stroke();

    // Participant Name Section
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PARTICIPANT NAME', 50, 220);

    ctx.font = '800 36px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(participantName.toUpperCase(), 50, 265);

    // Participant ID Box (Emerald Highlight)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, 300, 380, 80, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('UNIQUE PARTICIPANT ID', 70, 325);

    ctx.font = '800 32px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(participantId, 70, 363);

    // Event Date Section
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('COMPETITION DATE', 470, 325);

    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(eventDateDisplay, 470, 360);

    // Footer Watermark / Security Tag
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(50, 420);
    ctx.lineTo(750, 420);
    ctx.stroke();

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('AUTHENTICATED PARTICIPANT RECORD • GANDHI KNOWLEDGE CHALLENGE 2026', 50, 450);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('VERIFIED-TKFK26', 640, 450);

  }, [participantName, participantId, eventDateDisplay]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `TKFK26_ID_Card_${participantId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-900 p-2">
        <canvas ref={canvasRef} className="w-full h-auto rounded-xl max-w-full block" />
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-[0.99]"
      >
        <Download className="w-4 h-4" />
        <span>Download Participant ID Card (PNG)</span>
      </button>
    </div>
  );
};
