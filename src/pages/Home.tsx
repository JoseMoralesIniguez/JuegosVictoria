import React, { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GAMES } from '../types';
import { Link, useNavigate } from 'react-router';
import { Play, Sparkles, Trophy, Star } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !profile) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  if (loading || !profile) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64 text-white font-bold text-2xl">
          Cargando...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="inline-block relative"
        >
          <div className="absolute -inset-4 bg-yellow-300/30 blur-xl rounded-full"></div>
          <h1 className="relative text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] mb-2 leading-tight">
            ¡Feliz 7mo<br/>Cumpleaños<br/>Victoria!
          </h1>
          <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin-slow" style={{ animationDuration: '4s' }} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="max-w-3xl mx-auto mb-12 bg-white/20 backdrop-blur-lg rounded-[30px] border-4 border-white/30 p-6 shadow-xl flex flex-col md:flex-row items-center gap-6"
      >
        <div className="text-7xl bg-white/50 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
          {profile.avatar}
        </div>
        <div className="text-center md:text-left flex-grow text-white">
          <h2 className="text-3xl font-black mb-1 drop-shadow-sm">¡Hola, {profile.displayName}!</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-bold">
            <div className="flex items-center gap-1 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-300/50">
              <Star className="w-4 h-4 text-yellow-300" />
              <span>{profile.totalPoints} Puntos</span>
            </div>
            <div className="flex items-center gap-1 bg-cyan-400/20 px-3 py-1 rounded-full border border-cyan-300/50">
              <Trophy className="w-4 h-4 text-cyan-300" />
              <span>{profile.gamesCompleted} Juegos</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {profile.medals.length > 0 ? (
            profile.medals.map(medal => (
              <div key={medal} className="text-3xl" title={medal}>🏅</div>
            ))
          ) : (
            <div className="text-white/60 font-bold text-sm text-center">¡Juega para<br/>ganar medallas!</div>
          )}
        </div>
      </motion.div>

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
