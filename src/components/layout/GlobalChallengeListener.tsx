import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { Button } from '../ui/Button';

export function GlobalChallengeListener() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    if (!profile || !user) return;
    
    // Listen to pending game3 matches
    const q = query(collection(db, 'game3_matches'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const activeChallenges = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((c: any) => c.hostUid !== user.uid && now - c.createdAt < 60000); // Only within 1 minute
      
      setChallenges(activeChallenges);
    });

    return () => unsubscribe();
  }, [profile, user]);

  const acceptChallenge = (challengeId: string) => {
    navigate(`/game3?matchId=${challengeId}`);
  };

  // If already in game3, maybe don't show the toast if we are playing? 
  // Let's hide if we are currently looking at game3 to avoid clutter, or show it anyway.
  if (location.pathname === '/game3' && new URLSearchParams(location.search).get('matchId')) {
    return null; // Don't show if already in a match
  }

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {challenges.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="bg-indigo-600 border-2 border-yellow-400 p-4 rounded-xl shadow-xl flex items-center gap-4 text-white"
          >
            <div className="text-4xl">{c.hostAvatar}</div>
            <div>
              <div className="font-bold">{c.hostName} te reta a</div>
              <div className="text-sm text-indigo-200 font-medium">Liga de Guardianes</div>
            </div>
            <Button size="sm" onClick={() => acceptChallenge(c.id)} className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 border-none ml-2 shadow-sm font-bold">
              ¡Aceptar!
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
