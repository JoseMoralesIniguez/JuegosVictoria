import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Anchor, Trophy, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/10 backdrop-blur-md border-b-4 border-yellow-400">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-16 h-16 bg-yellow-300 rounded-full border-4 border-white flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
            👑
          </div>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight uppercase drop-shadow-md hidden sm:block">
              Fiesta Marina de Victoria
            </h1>
            <p className="text-yellow-200 font-bold text-sm uppercase tracking-widest hidden sm:block">
              ¡Feliz Cumpleaños #7!
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {profile ? (
            <>
              <Link to="/leaderboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="hidden sm:inline">Ranking</span>
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="text-2xl">{profile.avatar}</span>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold leading-none">{profile.displayName}</div>
                    <div className="text-[10px] text-cyan-200">{profile.totalPoints} pts</div>
                  </div>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }}>
                Salir
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">Jugar Ahora</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
