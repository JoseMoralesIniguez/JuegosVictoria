import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-black transition-all active:translate-y-[2px] active:border-b-0 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wide',
        {
          'bg-cyan-500 text-white hover:bg-cyan-400 border-b-4 border-cyan-700': variant === 'primary',
          'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 border-b-4 border-yellow-600': variant === 'accent',
          'bg-indigo-500 text-white hover:bg-indigo-400 border-b-4 border-indigo-700': variant === 'secondary',
          'bg-rose-500 text-white hover:bg-rose-400 border-b-4 border-rose-700': variant === 'danger',
          'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-b-4 border-white/40': variant === 'ghost',
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-lg': size === 'md',
          'px-8 py-4 text-xl': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
