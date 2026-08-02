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

const CARDS = ['🐡', '🦀', '🍔', '🍍', '🦑', '🐠', '🐚', '💎'];

interface CardObj {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

export function Game2() {
  const { user, profile, updateProfilePoints, addMedal } = useAuth();
  const navigate = useNavigate();

  const [cards, setCards] = useState<CardObj[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: any;
    if (playing && !gameOver) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing, gameOver]);

  const startGame = () => {
    const shuffled = [...CARDS, ...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
    
    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setTimer(0);
    setScore(0);
    setPlaying(true);
    setGameOver(false);
  };

  const handleCardClick = (id: number) => {
    if (flipped.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = newCards.find(c => c.id === firstId);
      const second = newCards.find(c => c.id === secondId);

      if (first?.icon === second?.icon) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
          ));
          setFlipped([]);
          checkWin(newCards.map(c => c.id === firstId || c.id === secondId ? { ...c, matched: true } : c));
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const checkWin = async (currentCards: CardObj[]) => {
    if (currentCards.every(c => c.matched)) {
      setPlaying(false);
      setGameOver(true);
      
      // Calculate score based on timer and moves
      const timeBonus = Math.max(0, 100 - timer) * 2;
      const movePenalty = Math.max(0, moves - 8) * 10;
      const finalScore = Math.max(50, 200 + timeBonus - movePenalty);
      
      setScore(finalScore);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      if (profile) {
        if (user) {
          await addDoc(collection(db, 'scores'), {
            userId: user.uid,
            userName: profile.displayName,
            userAvatar: profile.avatar,
            gameId: 'game2',
            score: finalScore,
            createdAt: Date.now()
          });
        }
        await updateProfilePoints(finalScore, true);
        await addMedal('Buscador Novato');
        if (timer < 45) {
          await addMedal('Cazador de Perlas');
        }
        if (moves === 8) {
          await addMedal('Memoria de Delfín');
        }
      }
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white drop-shadow-md">Tesoro Perdido</h1>
          {playing && (
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-white font-bold flex gap-4">
              <span>⏱️ {timer}s</span>
              <span>🔄 {moves}</span>
            </div>
          )}
        </div>

        <Card className="min-h-[500px] flex flex-col relative bg-gradient-to-br from-yellow-100 to-yellow-300 border-yellow-400 p-8">
          {!playing && !gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-6">🧽</div>
              <h2 className="text-3xl font-black mb-4 text-yellow-800 drop-shadow-sm">Fondo de Bikini</h2>
              <p className="text-xl mb-8 font-medium text-yellow-900/80">Encuentra las parejas de cartas en el menor tiempo posible usando tu memoria.</p>
              <Button onClick={startGame} variant="accent" size="lg" className="w-full sm:w-auto">¡Buscar Tesoros!</Button>
            </div>
          ) : gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-black mb-2 text-yellow-600">¡Lo lograste!</h2>
              <p className="text-2xl mb-2 font-bold text-slate-700">Puntuación: {score}</p>
              <p className="text-lg mb-8 font-medium text-slate-500">Tiempo: {timer}s | Intentos: {moves}</p>
              <div className="flex gap-4">
                <Button onClick={startGame} variant="primary">Jugar de Nuevo</Button>
                <Button onClick={() => navigate('/')} variant="ghost" className="text-yellow-900">Salir</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 md:gap-4 flex-grow content-center">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
                  whileTap={{ scale: card.flipped || card.matched ? 1 : 0.95 }}
                  className="aspect-square relative cursor-pointer"
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    className="w-full h-full relative"
                    animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front (Back of the card) */}
                    <div 
                      className="absolute inset-0 bg-yellow-400 rounded-xl md:rounded-2xl border-4 border-yellow-500 shadow-sm flex items-center justify-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-yellow-600/50 text-2xl md:text-4xl">?</div>
                    </div>
                    {/* Back (Face of the card) */}
                    <div 
                      className="absolute inset-0 bg-white rounded-xl md:rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-4xl md:text-5xl"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <motion.div
                        animate={{ scale: card.matched ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {card.icon}
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
