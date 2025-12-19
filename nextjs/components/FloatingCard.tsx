'use client';

import { ReactNode } from 'react';

interface FloatingCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  delay?: number;
  className?: string;
}

export default function FloatingCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
  className = '',
}: FloatingCardProps) {
  return (
    <div
      className={`glass rounded-xl p-4 animate-float glow-primary ${className.includes('w-full') ? '' : 'max-w-[260px]'} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="glow-icon flex-shrink-0">{icon}</div>}
        <div className="text-xs text-gray-400 leading-tight font-medium">{title}</div>
      </div>
      <div className="text-xl font-bold text-[#F66F00] mb-1.5">{value}</div>
      {subtitle && <div className="text-[10px] text-gray-500 leading-relaxed">{subtitle}</div>}
    </div>
  );
}

