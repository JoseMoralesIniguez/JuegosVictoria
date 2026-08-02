import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GAMES } from '../types';
import { Link } from 'react-router';
import { Play, Sparkles } from 'lucide-react';
import * as motion from 'motion/react-client';

export function Home() {
  return (
    <PageContainer>
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="inline-block relative"
        >
          <div className="absolute -inset-4 bg-yellow-300/30 blur-xl rounded-full"></div>
          <h1 className="relative text-5xl md:text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-4 leading-tight">
            ¡Feliz 7mo<br/>Cumpleaños<br/>Victoria!
          </h1>
          <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin-slow" style={{ animationDuration: '4s' }} />
        </motion.div>
        <p className="text-xl text-cyan-50 font-medium max-w-2xl mx-auto drop-shadow-md">
          Bienvenido a la fiesta marina más divertida. ¡Juega, gana medallas y compite con tus amigos!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game, index) => {
          const themes: Record<string, { border: string, bg: string, text: string, tagBorder: string, btnBg: string, btnBorder: string }> = {
            cyan: { border: 'border-cyan-300', bg: 'bg-cyan-100', text: 'text-cyan-600', tagBorder: 'border-cyan-200', btnBg: 'bg-cyan-500', btnBorder: 'border-cyan-700' },
            amber: { border: 'border-amber-300', bg: 'bg-amber-100', text: 'text-amber-600', tagBorder: 'border-amber-200', btnBg: 'bg-amber-400', btnBorder: 'border-amber-600' },
            indigo: { border: 'border-indigo-400', bg: 'bg-indigo-100', text: 'text-indigo-600', tagBorder: 'border-indigo-200', btnBg: 'bg-indigo-500', btnBorder: 'border-indigo-700' },
            emerald: { border: 'border-emerald-300', bg: 'bg-emerald-100', text: 'text-emerald-600', tagBorder: 'border-emerald-200', btnBg: 'bg-emerald-400', btnBorder: 'border-emerald-600' },
            rose: { border: 'border-rose-300', bg: 'bg-rose-100', text: 'text-rose-600', tagBorder: 'border-rose-200', btnBg: 'bg-rose-400', btnBorder: 'border-rose-600' }
          };
          const t = themes[game.theme as string] || themes.cyan;

          return (
            <motion.div
              key={game.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`bg-white p-4 rounded-[40px] border-8 ${t.border} shadow-2xl flex flex-col items-center justify-between hover:border-yellow-400 transition-colors cursor-pointer group h-full`}>
                <div className={`${t.bg} w-full h-32 rounded-[30px] flex items-center justify-center relative overflow-hidden mb-4`}>
                  <span className="text-6xl group-hover:scale-110 transition-transform">{game.icon}</span>
                  <div className={`absolute top-2 right-4 bg-white px-2 py-1 rounded-full text-[10px] font-bold ${t.text} border ${t.tagBorder}`}>
                    {game.tag}
                  </div>
                </div>
                <div className="text-center mb-4 flex-grow">
                  <h3 className="font-black text-blue-900 text-lg leading-tight uppercase mb-1">{game.title}</h3>
                  <p className={`${t.text} text-xs font-bold px-4`}>{game.description}</p>
                </div>
                
                <Link to={game.path} className="w-full">
                  <button className={`w-full ${t.btnBg} text-white font-black py-2 rounded-2xl border-b-4 ${t.btnBorder} active:border-b-0 active:translate-y-[2px] uppercase tracking-wide`}>
                    ¡JUGAR YA!
                  </button>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageContainer>
  );
}
