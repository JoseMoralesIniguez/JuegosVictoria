import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';
import { Award, Star, Gamepad2 } from 'lucide-react';
import * as motion from 'motion/react-client';

export function Profile() {
  const { profile, loading } = useAuth();

  if (loading) return <PageContainer><div className="text-center text-white font-bold text-2xl mt-20">Cargando...</div></PageContainer>;
  if (!profile) return <Navigate to="/login" />;

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto w-full">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="mb-8 border-t-8 border-pink-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-bl-full"></div>
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">
                {profile.avatar}
              </div>
              <div className="text-center md:text-left flex-grow">
                <h1 className="text-4xl font-black text-slate-800 mb-2">{profile.displayName}</h1>
                <p className="text-lg text-slate-500 font-medium">
                  {profile.age} años • Color favorito: {profile.favoriteColor}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="h-full bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-400 rounded-2xl shadow-sm text-yellow-900">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-slate-500 font-bold uppercase text-sm tracking-wider">Puntos Totales</div>
                  <div className="text-4xl font-black text-yellow-600">{profile.totalPoints}</div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="h-full bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-400 rounded-2xl shadow-sm text-purple-900">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-slate-500 font-bold uppercase text-sm tracking-wider">Juegos Completados</div>
                  <div className="text-4xl font-black text-purple-600">{profile.gamesCompleted}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-black text-white drop-shadow-md mb-6 flex items-center gap-3">
            <Award className="text-yellow-300" /> Tus Medallas
          </h2>
          {profile.medals.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-slate-500 font-bold text-lg">¡Aún no tienes medallas! Juega para ganar.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.medals.map((medal, i) => {
                let icon = '🏅';
                if (medal === 'Aprendiz de Medusa') icon = '🪼';
                else if (medal === 'Matemático del Océano') icon = '🧮';
                else if (medal === 'Genio de las Mareas') icon = '🧠';
                else if (medal === 'Buscador Novato') icon = '🔍';
                else if (medal === 'Cazador de Perlas') icon = '💎';
                else if (medal === 'Memoria de Delfín') icon = '🐬';
                else if (medal === 'Escudero del Mar') icon = '🛡️';
                else if (medal === 'Capitán de las Profundidades') icon = '⚓';
                else if (medal === 'Rey de la Arena') icon = '👑';
                else if (medal === 'Pinchaburbujas') icon = '🫧';
                else if (medal === 'Héroe Marino') icon = '🔱';
                else if (medal === 'Tirador de Élite') icon = '🎯';
                else if (medal === 'Explorador Curioso') icon = '🧭';
                else if (medal === 'Maestro de los Acertijos') icon = '🧩';
                else if (medal === 'Cerebro de Pulpo') icon = '🐙';

                return (
                  <Card key={i} className="text-center flex flex-col items-center justify-center p-4 bg-white/60">
                    <div className="text-4xl mb-2">{icon}</div>
                    <div className="font-bold text-slate-700 text-sm leading-tight">{medal}</div>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
