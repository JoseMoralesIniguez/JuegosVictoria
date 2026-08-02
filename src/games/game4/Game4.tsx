import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import * as motion from 'motion/react-client';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Bubble {
  id: string;
  value: number;
  x: number;
}

export function Game4() {
  const { user, profile, updateProfilePoints, addMedal } = useAuth();
  const navigate = useNavigate();

  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let interval: any;
    if (playing && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing, gameOver]);

  useEffect(() => {
    if (playing && !gameOver && timeLeft === 0) {
      handleGameOver();
    }
  }, [timeLeft, playing, gameOver]);

  useEffect(() => {
    let bubbleInterval: any;
    if (playing && !gameOver) {
      bubbleInterval = setInterval(() => {
        setBubbles(prev => {
          if (prev.length > 5) return prev;
          
          // Generate new bubble. 50% chance to be the target
          const isTarget = Math.random() > 0.5;
          const value = isTarget ? target : Math.floor(Math.random() * 20) + 1;
          
          const newBubble = {
            id: Math.random().toString(),
            value,
            x: 10 + Math.random() * 80 // 10% to 90%
          };
          return [...prev, newBubble];
        });
      }, 1500);
    }
    return () => clearInterval(bubbleInterval);
  }, [playing, gameOver, target]);

  // Clean up bubbles automatically
  useEffect(() => {
    let cleanInterval: any;
    if (playing && !gameOver) {
      cleanInterval = setInterval(() => {
        setBubbles(prev => prev.slice(1)); // Remove oldest
      }, 3000);
    }
    return () => clearInterval(cleanInterval);
  }, [playing, gameOver]);

  const startGame = () => {
    setPlaying(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
    generateTarget();
  };

  const generateTarget = () => {
    setTarget(Math.floor(Math.random() * 20) + 1);
  };

  const popBubble = (bubble: Bubble) => {
    if (bubble.value === target) {
      setScore(s => s + 50);
      generateTarget();
      setBubbles([]); // Clear current bubbles to force refresh
    } else {
      setScore(s => Math.max(0, s - 20));
    }
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
  };

  const handleGameOver = async () => {
    setPlaying(false);
    setGameOver(true);
    
    if (score > 500) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (profile) {
      if (user) {
        await addDoc(collection(db, 'scores'), {
          userId: user.uid,
          userName: profile.displayName,
          userAvatar: profile.avatar,
          gameId: 'game4',
          score: score,
          createdAt: Date.now()
        });
      }
      await updateProfilePoints(score, true);
      if (score >= 100) {
        await addMedal('Pinchaburbujas');
      }
      if (score >= 400) {
        await addMedal('Héroe Marino');
      }
      if (score >= 800) {
        await addMedal('Tirador de Élite');
      }
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white drop-shadow-md">Batalla de Burbujas</h1>
          {playing && (
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-white font-bold flex gap-4">
              <span>⏱️ {timeLeft}s</span>
              <span>⭐ {score}</span>
            </div>
          )}
        </div>

        <Card className="min-h-[500px] flex flex-col relative bg-gradient-to-t from-cyan-600 to-blue-400 border-cyan-300 p-0 overflow-hidden">
          {!playing && !gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-6">🫧</div>
              <h2 className="text-3xl font-black mb-4 text-white drop-shadow-sm">Batalla de Burbujas</h2>
              <p className="text-xl mb-8 font-medium text-cyan-50">¡Toca o haz clic en las burbujas con el número correcto para reventarlas!</p>
              <Button onClick={startGame} variant="primary" size="lg" className="w-full sm:w-auto">¡Jugar!</Button>
            </div>
          ) : gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-black mb-2 text-white">¡Fin del Tiempo!</h2>
              <p className="text-2xl mb-8 font-bold text-cyan-100">Puntuación Final: {score}</p>
              <div className="flex gap-4">
                <Button onClick={startGame} variant="primary">Jugar de Nuevo</Button>
                <Button onClick={() => navigate('/')} variant="ghost" className="text-white">Salir</Button>
              </div>
            </div>
          ) : (
            <div className="flex-grow relative overflow-hidden">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-3 rounded-3xl shadow-lg text-center z-10 border-4 border-white">
                <div className="text-sm font-bold text-cyan-600 uppercase">Busca el número:</div>
                <div className="text-5xl font-black text-slate-800">{target}</div>
              </div>

              {bubbles.map(bubble => (
                <motion.button
                  key={bubble.id}
                  initial={{ y: 500, scale: 0.5, opacity: 0 }}
                  animate={{ y: -100, scale: 1, opacity: 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  onPointerDown={(e) => { e.preventDefault(); popBubble(bubble); }}
                  className="absolute w-20 h-20 bg-white/30 backdrop-blur-md rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center text-3xl font-black text-white hover:bg-white/50 hover:scale-110 active:scale-90 transition-transform cursor-pointer touch-none"
                  style={{ left: `${bubble.x}%` }}
                >
                  <div className="absolute top-2 right-4 w-4 h-4 bg-white/60 rounded-full blur-[1px]"></div>
                  {bubble.value}
                </motion.button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
