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

const generateQuestion = (level: number) => {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * (level > 2 ? 3 : 2))];
  
  let a, b, answer;
  if (op === '+') {
    a = Math.floor(Math.random() * 10 * level) + 1;
    b = Math.floor(Math.random() * 10 * level) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 10 * level) + 5;
    b = Math.floor(Math.random() * a);
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 5) + 1;
    b = Math.floor(Math.random() * 5) + 1;
    answer = a * b;
  }

  // Generate 3 wrong options
  const options = [answer];
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const opt = answer + offset;
    if (opt !== answer && opt >= 0 && !options.includes(opt)) {
      options.push(opt);
    }
  }

  return {
    q: `${a} ${op} ${b}`,
    answer,
    options: options.sort(() => Math.random() - 0.5)
  };
};

export function Game1() {
  const { user, profile, updateProfilePoints, addMedal } = useAuth();
  const navigate = useNavigate();
  
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [jellyfishPos, setJellyfishPos] = useState(0); // 0 to 10
  const [currentQuestion, setCurrentQuestion] = useState(() => generateQuestion(1));

  useEffect(() => {
    // We removed the user check so guests or unauthenticated users can still play,
    // and we avoid the bug where guests with a local profile get redirected to login.
  }, []);

  const startGame = () => {
    setPlaying(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setJellyfishPos(0);
    setCurrentQuestion(generateQuestion(1));
  };

  const handleAnswer = async (selected: number) => {
    if (selected === currentQuestion.answer) {
      // Correct!
      const newPos = jellyfishPos + 1;
      const points = 10 * level;
      setScore(s => s + points);
      
      if (newPos >= 10) {
        // Level up
        setJellyfishPos(0);
        setLevel(l => l + 1);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } else {
        setJellyfishPos(newPos);
      }
      setCurrentQuestion(generateQuestion(level));
    } else {
      // Wrong! Game Over
      setPlaying(false);
      setGameOver(true);
      await finishGame();
    }
  };

  const finishGame = async () => {
    if (!profile) return;
    
    // Save score
    if (user) {
      await addDoc(collection(db, 'scores'), {
        userId: user.uid,
        userName: profile.displayName,
        userAvatar: profile.avatar,
        gameId: 'game1',
        score: score,
        createdAt: Date.now()
      });
    }

    await updateProfilePoints(score, true);
    
    if (score >= 50) {
      await addMedal('Aprendiz de Medusa');
    }
    if (score >= 200) {
      await addMedal('Matemático del Océano');
    }
    if (score >= 500) {
      await addMedal('Genio de las Mareas');
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white drop-shadow-md">Medusas Matemáticas</h1>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-white font-bold">
            Puntos: {score}
          </div>
        </div>

        <Card className="min-h-[500px] flex flex-col relative overflow-hidden bg-gradient-to-b from-blue-400 to-indigo-900 border-none">
          {!playing && !gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="text-6xl mb-6">🪼</div>
              <h2 className="text-3xl font-black mb-4 drop-shadow-md">Ayuda a la Medusa</h2>
              <p className="text-xl mb-8 font-medium drop-shadow-sm">Resuelve problemas matemáticos para ayudar a la medusa a subir a la superficie.</p>
              <Button onClick={startGame} size="lg" className="w-full sm:w-auto">¡Comenzar a Nadar!</Button>
            </div>
          ) : gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-white">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-black mb-2 text-red-300">¡Oh no!</h2>
              <p className="text-xl mb-6 font-medium">Conseguiste {score} puntos llegando al Nivel {level}.</p>
              <div className="flex gap-4">
                <Button onClick={startGame} variant="primary">Volver a Intentar</Button>
                <Button onClick={() => navigate('/')} variant="ghost">Salir</Button>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col relative">
              {/* Game Area */}
              <div className="flex-grow relative border-b-4 border-white/20">
                {/* Water surface indicator */}
                <div className="absolute top-0 left-0 w-full h-8 bg-cyan-300/30 border-b border-cyan-100/50"></div>
                
                {/* Character */}
                <motion.div 
                  className="absolute left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg"
                  animate={{ bottom: `${(jellyfishPos / 10) * 80 + 10}%` }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  {profile?.avatar || '🪼'}
                </motion.div>
                
                <div className="absolute bottom-2 left-4 text-white/50 font-bold">Nivel {level}</div>
              </div>

              {/* Controls */}
              <div className="h-64 bg-white p-6 rounded-t-3xl mt-auto">
                <div className="text-center mb-6">
                  <div className="text-slate-500 font-bold uppercase text-sm mb-1">Resuelve:</div>
                  <div className="text-5xl font-black text-slate-800 tracking-wider">
                    {currentQuestion.q} = ?
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt, i) => (
                    <Button 
                      key={i} 
                      onClick={() => handleAnswer(opt)}
                      variant="secondary"
                      className="h-16 text-2xl font-black shadow-lg"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
