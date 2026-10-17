import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'brand' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'brand'
}) => {
  const colorMap = {
    brand: { bg: 'bg-[#f0ede8]', text: 'text-[#ff6b35]' },
    emerald: { bg: 'bg-[#eef8f2]', text: 'text-[#16a34a]' },
    amber: { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]' },
    rose: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]' },
    sky: { bg: 'bg-[#f0f9ff]', text: 'text-[#0284c7]' },
    indigo: { bg: 'bg-[#f0ede8]', text: 'text-[#ff6b35]' },
  };

  const style = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#f0ede8] shadow-soft flex items-center justify-between">
      <div className="space-y-1.5">
        <p className="text-[11px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-medium text-[#141412] tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-[#706e6a] font-normal">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0 border border-[#f0ede8]`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
