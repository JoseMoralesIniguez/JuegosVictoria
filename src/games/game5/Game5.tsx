import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import * as motion from 'motion/react-client';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const COLORS = [
  { id: 0, color: 'bg-red-500', active: 'bg-red-300', sound: 261.63 }, // C4
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-300', sound: 329.63 }, // E4
  { id: 2, color: 'bg-yellow-400', active: 'bg-yellow-200', sound: 392.00 }, // G4
  { id: 3, color: 'bg-green-500', active: 'bg-green-300', sound: 523.25 }  // C5
];

export function Game5() {
  const { user, profile, updateProfilePoints, addMedal } = useAuth();
  const navigate = useNavigate();

  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playSound = (freq: number) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtxRef.current.currentTime + 0.5);
    osc.stop(audioCtxRef.current.currentTime + 0.5);
  };

  const startGame = () => {
    setPlaying(true);
    setGameOver(false);
    setScore(0);
    setSequence([]);
    setPlayerStep(0);
    setIsPlayerTurn(false);
    nextRound([]);
  };

  const nextRound = (currentSeq: number[]) => {
    const nextSeq = [...currentSeq, Math.floor(Math.random() * 4)];
    setSequence(nextSeq);
    setPlayerStep(0);
    setIsPlayerTurn(false);
    playSequence(nextSeq);
  };

  const playSequence = (seq: number[]) => {
    let delay = 500;
    seq.forEach((colorIdx, i) => {
      setTimeout(() => {
        setActiveColor(colorIdx);
        playSound(COLORS[colorIdx].sound);
        setTimeout(() => setActiveColor(null), 300);
      }, delay);
      delay += 600;
    });
    setTimeout(() => {
      setIsPlayerTurn(true);
    }, delay);
  };

  const handleColorClick = (colorIdx: number) => {
    if (!isPlayerTurn) return;

    setActiveColor(colorIdx);
    playSound(COLORS[colorIdx].sound);
    setTimeout(() => setActiveColor(null), 200);

    if (colorIdx === sequence[playerStep]) {
      // Correct step
      const nextStep = playerStep + 1;
      if (nextStep === sequence.length) {
        // Round complete
        const newScore = score + (sequence.length * 10);
        setScore(newScore);
        setIsPlayerTurn(false);
        setTimeout(() => nextRound(sequence), 1000);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // Wrong
      handleGameOver();
    }
  };

  const handleGameOver = async () => {
    playSound(150); // Error sound
    setPlaying(false);
    setGameOver(true);
    setIsPlayerTurn(false);
    
    if (score > 100) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (profile) {
      if (profile) {
        addDoc(collection(db, 'scores'), {
          userId: profile.uid,
          userName: profile.displayName,
          userAvatar: profile.avatar,
          gameId: 'game5',
          score: score,
          createdAt: Date.now()
        });
      }
      await updateProfilePoints(score, true);
      if (score >= 50) {
        await addMedal('Explorador Curioso');
      }
      if (score >= 150) {
        await addMedal('Maestro de los Acertijos');
      }
      if (score >= 350) {
        await addMedal('Cerebro de Pulpo');
      }
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white drop-shadow-md">Arrecife Secreto</h1>
          {playing && (
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-white font-bold flex gap-4">
              <span>Nivel: {sequence.length}</span>
              <span>⭐ {score}</span>
            </div>
          )}
        </div>

        <Card className="min-h-[500px] flex flex-col relative bg-gradient-to-br from-purple-800 to-indigo-900 border-purple-500 p-8">
          {!playing && !gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-6">🗺️</div>
              <h2 className="text-3xl font-black mb-4 text-white drop-shadow-sm">Simon del Arrecife</h2>
              <p className="text-xl mb-8 font-medium text-purple-200">Repite la secuencia de corales mágicos. ¡Cuidado con equivocarte!</p>
              <Button onClick={startGame} variant="primary" size="lg" className="w-full sm:w-auto">¡Explorar!</Button>
            </div>
          ) : gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-4xl font-black mb-2 text-white">¡Secuencia rota!</h2>
              <p className="text-2xl mb-8 font-bold text-purple-200">Puntuación Final: {score}</p>
              <div className="flex gap-4">
                <Button onClick={startGame} variant="primary">Jugar de Nuevo</Button>
                <Button onClick={() => navigate('/')} variant="ghost" className="text-white">Salir</Button>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center">
              <div className="text-center mb-8 h-8">
                <p className="text-2xl font-bold text-white">
                  {!isPlayerTurn ? 'Escucha la secuencia...' : '¡Tu turno!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm w-full mx-auto">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorClick(c.id)}
                    className={`aspect-square rounded-full transition-all duration-200 shadow-[0_8px_0_0_rgba(0,0,0,0.2)] active:translate-y-2 active:shadow-none border-4 border-white/20
                      ${activeColor === c.id ? c.active + ' scale-105 shadow-[0_0_30px_rgba(255,255,255,0.5)]' : c.color}
                      ${!isPlayerTurn ? 'pointer-events-none' : 'hover:scale-105'}
                    `}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
