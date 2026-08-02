import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn('bg-white p-6 rounded-[40px] border-8 border-white/50 shadow-2xl', className)}>
      {children}
    </div>
  );
}
