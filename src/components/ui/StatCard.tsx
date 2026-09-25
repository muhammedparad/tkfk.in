import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald'
}) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-700' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  };

  const style = colorMap[color];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
