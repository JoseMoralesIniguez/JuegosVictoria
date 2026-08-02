import React from 'react';
import { Navbar } from './Navbar';
import { GlobalChallengeListener } from './GlobalChallengeListener';

export function PageContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className="min-h-screen bg-[#0077be] flex flex-col font-sans relative text-slate-800">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/40 rounded-full"></div>
        <div className="absolute top-1/3 left-1/3 w-6 h-6 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 w-8 h-8 bg-white/30 rounded-full"></div>
        {/* Stylized Coral (SVG placeholders) */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#004a80] to-transparent"></div>
      </div>
      
      <Navbar />
      <GlobalChallengeListener />
      
      <main className={`relative z-10 pt-28 pb-12 px-4 max-w-6xl mx-auto min-h-screen flex flex-col ${className}`}>
        {children}
      </main>
    </div>
  );
}

