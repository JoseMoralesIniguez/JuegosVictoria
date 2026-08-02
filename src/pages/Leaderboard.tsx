import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Trophy, Medal } from 'lucide-react';
import * as motion from 'motion/react-client';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        setLeaders(fetched);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md mb-2 flex items-center justify-center gap-4">
              <Trophy className="w-10 h-10 text-yellow-300" />
              Ranking Global
              <Trophy className="w-10 h-10 text-yellow-300" />
            </h1>
            <p className="text-cyan-100 font-medium text-lg drop-shadow-sm">¡Los mejores jugadores del océano!</p>
          </motion.div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-[40px] border-4 border-white/30 p-6 flex flex-col gap-3 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white font-bold">Cargando...</div>
          ) : leaders.length === 0 ? (
            <div className="p-12 text-center text-white font-bold">¡Sé el primero en jugar!</div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaders.map((user, index) => {
                let itemClass = "bg-white/80 p-3 rounded-xl flex items-center gap-3 border-b-4 border-white/50";
                if (index === 0) itemClass = "bg-yellow-400 p-3 rounded-xl flex items-center gap-3 border-b-4 border-yellow-600";
                if (index === 1) itemClass = "bg-slate-200 p-3 rounded-xl flex items-center gap-3 border-b-4 border-slate-400";
                if (index === 2) itemClass = "bg-amber-600 p-3 rounded-xl flex items-center gap-3 border-b-4 border-amber-800 text-white";

                return (
                  <motion.div 
                    key={user.uid}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={itemClass}
                  >
                    <span className={`font-black w-8 text-center ${index === 0 ? 'text-yellow-900' : index === 2 ? 'text-white' : 'text-blue-900'}`}>
                      {index + 1}.
                    </span>
                    <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-2xl">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${index === 2 ? 'text-white' : 'text-slate-800'} truncate`}>{user.displayName}</div>
                      <div className={`text-[10px] uppercase font-bold ${index === 2 ? 'text-amber-200' : 'text-slate-500'}`}>{user.gamesCompleted} juegos</div>
                    </div>
                    <span className={`font-black text-xl ${index === 2 ? 'text-white' : 'text-slate-800'}`}>{user.totalPoints}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
