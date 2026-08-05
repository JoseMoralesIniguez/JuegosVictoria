import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, ScoreEntry, GAMES } from '../types';
import { Trophy, Star, Medal } from 'lucide-react';
import * as motion from 'motion/react-client';

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'global' | string>('global');
  const [globalLeaders, setGlobalLeaders] = useState<UserProfile[]>([]);
  const [gameLeaders, setGameLeaders] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        if (activeTab === 'global') {
          const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(10));
          const querySnapshot = await getDocs(q);
          const fetched = querySnapshot.docs.map(doc => doc.data() as UserProfile);
          setGlobalLeaders(fetched);
        } else {
          // Fetch scores for this game, sort in memory to avoid needing composite indexes in Firestore
          const q = query(
            collection(db, 'scores'), 
            where('gameId', '==', activeTab)
          );
          const querySnapshot = await getDocs(q);
          const scores = querySnapshot.docs.map(doc => doc.data() as ScoreEntry);
          
          // Group by user to only show their highest score
          const uniqueUsers = new Map<string, ScoreEntry>();
          scores.forEach(s => {
            if (!uniqueUsers.has(s.userId)) {
              uniqueUsers.set(s.userId, s);
            } else {
              if (s.score > uniqueUsers.get(s.userId)!.score) {
                uniqueUsers.set(s.userId, s);
              }
            }
          });
          
          // Sort by score descending and take top 10
          const sorted = Array.from(uniqueUsers.values()).sort((a, b) => b.score - a.score).slice(0, 10);
          setGameLeaders(sorted);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaders();
  }, [activeTab]);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md mb-2 flex items-center justify-center gap-4">
              <Trophy className="w-10 h-10 text-yellow-300" />
              Ranking
              <Trophy className="w-10 h-10 text-yellow-300" />
            </h1>
            <p className="text-cyan-100 font-medium text-lg drop-shadow-sm">¡Los mejores jugadores del océano!</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 hide-scrollbar snap-x">
          <button
            onClick={() => setActiveTab('global')}
            className={`snap-center shrink-0 px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all ${
              activeTab === 'global' 
              ? 'bg-yellow-400 text-yellow-900 border-4 border-white shadow-lg scale-105' 
              : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30'
            }`}
          >
            🌟 Global
          </button>
          
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveTab(game.id)}
              className={`snap-center shrink-0 px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === game.id 
                ? 'bg-white text-cyan-900 border-4 border-cyan-300 shadow-lg scale-105' 
                : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30'
              }`}
            >
              <span className="text-xl">{game.icon}</span>
              {game.title}
            </button>
          ))}
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-[40px] border-4 border-white/30 p-6 flex flex-col gap-3 shadow-xl overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-white font-bold text-xl animate-pulse">Cargando ranking...</div>
            </div>
          ) : activeTab === 'global' ? (
            globalLeaders.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-white font-bold text-xl">¡Sé el primero en jugar!</div>
            ) : (
              <div className="flex flex-col gap-2">
                {globalLeaders.map((user, index) => {
                  let itemClass = "bg-white/80 p-3 rounded-xl flex items-center gap-3 border-b-4 border-white/50";
                  if (index === 0) itemClass = "bg-yellow-400 p-3 rounded-xl flex items-center gap-3 border-b-4 border-yellow-600";
                  if (index === 1) itemClass = "bg-slate-200 p-3 rounded-xl flex items-center gap-3 border-b-4 border-slate-400";
                  if (index === 2) itemClass = "bg-amber-600 p-3 rounded-xl flex items-center gap-3 border-b-4 border-amber-800 text-white";
                  
                  return (
                    <motion.div 
                      key={user.uid}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={itemClass}
                    >
                      <span className={`font-black w-8 text-center ${index === 0 ? 'text-yellow-900' : index === 2 ? 'text-white' : 'text-blue-900'}`}>
                        {index + 1}.
                      </span>
                      <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center text-3xl">
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${index === 2 ? 'text-white' : 'text-slate-800'} truncate text-lg`}>{user.displayName}</div>
                        <div className={`text-[10px] uppercase font-bold ${index === 2 ? 'text-amber-200' : 'text-slate-500'} flex items-center gap-1`}>
                          <Medal className="w-3 h-3" /> {user.gamesCompleted} juegos
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-2xl ${index === 2 ? 'text-white' : 'text-slate-800'}`}>{user.totalPoints}</span>
                        <div className={`text-[10px] uppercase font-bold ${index === 2 ? 'text-amber-200' : 'text-slate-500'}`}>pts</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            gameLeaders.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-white font-bold text-xl">¡Aún no hay puntuaciones en este juego!</div>
            ) : (
              <div className="flex flex-col gap-2">
                {gameLeaders.map((scoreEntry, index) => {
                  let itemClass = "bg-white/80 p-3 rounded-xl flex items-center gap-3 border-b-4 border-white/50";
                  if (index === 0) itemClass = "bg-yellow-400 p-3 rounded-xl flex items-center gap-3 border-b-4 border-yellow-600";
                  if (index === 1) itemClass = "bg-slate-200 p-3 rounded-xl flex items-center gap-3 border-b-4 border-slate-400";
                  if (index === 2) itemClass = "bg-amber-600 p-3 rounded-xl flex items-center gap-3 border-b-4 border-amber-800 text-white";
                  
                  return (
                    <motion.div 
                      key={scoreEntry.id || index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={itemClass}
                    >
                      <span className={`font-black w-8 text-center ${index === 0 ? 'text-yellow-900' : index === 2 ? 'text-white' : 'text-blue-900'}`}>
                        {index + 1}.
                      </span>
                      <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center text-3xl">
                        {scoreEntry.userAvatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${index === 2 ? 'text-white' : 'text-slate-800'} truncate text-lg`}>{scoreEntry.userName}</div>
                        <div className={`text-[10px] uppercase font-bold ${index === 2 ? 'text-amber-200' : 'text-slate-500'} flex items-center gap-1`}>
                          Puntuación Máxima
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-2xl ${index === 2 ? 'text-white' : 'text-slate-800'}`}>{scoreEntry.score}</span>
                        <div className={`text-[10px] uppercase font-bold ${index === 2 ? 'text-amber-200' : 'text-slate-500'}`}>pts</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </PageContainer>
  );
}
