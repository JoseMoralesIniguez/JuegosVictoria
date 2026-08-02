import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router';
import confetti from 'canvas-confetti';
import * as motion from 'motion/react-client';
import { collection, addDoc, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';

const CHOICES = [
  { id: 'shark', icon: '🦈', name: 'Tiburón', beats: 'fish' },
  { id: 'fish', icon: '🐡', name: 'Pez Globo', beats: 'jellyfish' },
  { id: 'jellyfish', icon: '🪼', name: 'Medusa', beats: 'shark' },
];

const GREETINGS = [
  "¡Hola!",
  "¡Buena jugada!",
  "¡Uy, casi!",
  "¡Eres muy rápido!",
  "¡Nos vemos!"
];

export function Game3() {
  const { user, profile, updateProfilePoints, addMedal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchIdParam = searchParams.get('matchId');

  const [matchId, setMatchId] = useState<string | null>(matchIdParam);
  const [matchData, setMatchData] = useState<any>(null);

  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [round, setRound] = useState(1);
  const [resultMsg, setResultMsg] = useState('');
  
  const [playerChoice, setPlayerChoice] = useState<any>(null);
  const [aiChoice, setAiChoice] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);

  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [activeGreeting, setActiveGreeting] = useState<any>(null);
  const [showGreetingsMenu, setShowGreetingsMenu] = useState(false);

  const isHost = matchData?.hostUid === profile?.uid;
  
  useEffect(() => {
    if (!matchId) return;
    
    setIsMultiplayer(true);
    const unsubscribe = onSnapshot(doc(db, 'game3_matches', matchId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMatchData(data);
        
        if (data.status === 'playing' && !playing && !gameOver) {
          setPlaying(true);
          setWaitingForOpponent(false);
        }

        if (data.lastGreeting && data.lastGreeting.timestamp !== activeGreeting?.timestamp) {
           setActiveGreeting(data.lastGreeting);
           setTimeout(() => setActiveGreeting(null), 3000);
        }
        
        if (data.status === 'playing') {
           setPlayerScore(isHost ? data.hostScore : data.guestScore);
           setAiScore(isHost ? data.guestScore : data.hostScore);
           setRound(data.round);
           
           if (data.roundResult) {
             const r = data.roundResult;
             setIsResolving(true);
             const myChoiceId = isHost ? r.hostChoiceId : r.guestChoiceId;
             const oppChoiceId = isHost ? r.guestChoiceId : r.hostChoiceId;
             
             setPlayerChoice(CHOICES.find(c => c.id === myChoiceId));
             setAiChoice(CHOICES.find(c => c.id === oppChoiceId));
             setResultMsg(r.message);
             
             setTimeout(() => {
               if (data.hostScore >= 3 || data.guestScore >= 3) {
                 handleGameOver(
                   isHost ? (data.hostScore > data.guestScore) : (data.guestScore > data.hostScore)
                 );
                 if (isHost) updateDoc(doc(db, 'game3_matches', matchId), { status: 'finished' });
               } else {
                 setPlayerChoice(null);
                 setAiChoice(null);
                 setIsResolving(false);
                 setResultMsg('¡Elige tu guardián!');
               }
             }, 3000);
           }
        }
      }
    });

    if (matchIdParam && !isHost && !playing && !gameOver) {
      joinMatch(matchIdParam);
    }
    
    return () => unsubscribe();
  }, [matchId, isHost, playing, gameOver, matchIdParam]);

  useEffect(() => {
    if (isMultiplayer && isHost && matchData?.status === 'playing' && !matchData.roundResult) {
       if (matchData.hostChoice && matchData.guestChoice) {
          const hostObj = CHOICES.find(c => c.id === matchData.hostChoice)!;
          const guestObj = CHOICES.find(c => c.id === matchData.guestChoice)!;
          
          let hScore = matchData.hostScore;
          let gScore = matchData.guestScore;
          let msg = '';
          
          if (hostObj.id === guestObj.id) {
            msg = '¡Empate!';
          } else if (hostObj.beats === guestObj.id) {
            msg = `¡Ganó ${matchData.hostName}! ${hostObj.name} vence a ${guestObj.name}`;
            hScore++;
          } else {
            msg = `¡Ganó ${matchData.guestName}! ${guestObj.name} vence a ${hostObj.name}`;
            gScore++;
          }
          
          const resultRef = doc(db, 'game3_matches', matchId);
          updateDoc(resultRef, {
             hostScore: hScore,
             guestScore: gScore,
             roundResult: {
                hostChoiceId: hostObj.id,
                guestChoiceId: guestObj.id,
                message: msg,
                timestamp: Date.now()
             }
          });
          
          setTimeout(() => {
             if (hScore < 3 && gScore < 3) {
               updateDoc(resultRef, {
                 hostChoice: null,
                 guestChoice: null,
                 roundResult: null,
                 round: matchData.round + 1
               });
             }
          }, 3000);
       }
    }
  }, [matchData, isMultiplayer, isHost, matchId]);

  const joinMatch = async (id: string) => {
    if (!profile) return;
    const matchRef = doc(db, 'game3_matches', id);
    const snap = await getDoc(matchRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.status === 'pending' && data.hostUid !== profile.uid) {
        await updateDoc(matchRef, {
          guestUid: profile.uid,
          guestName: profile.displayName,
          guestAvatar: profile.avatar,
          status: 'playing'
        });
      }
    }
  };

  const createChallenge = async () => {
    if (!profile) return;
    setWaitingForOpponent(true);
    setIsMultiplayer(true);
    
    const newMatchRef = collection(db, 'game3_matches');
    const docRef = await addDoc(newMatchRef, {
      hostUid: profile.uid,
      hostName: profile.displayName,
      hostAvatar: profile.avatar,
      guestUid: null,
      guestName: null,
      guestAvatar: null,
      status: 'pending',
      hostChoice: null,
      guestChoice: null,
      hostScore: 0,
      guestScore: 0,
      round: 1,
      roundResult: null,
      createdAt: Date.now()
    });
    setMatchId(docRef.id);
  };

  const startGameSingle = () => {
    setIsMultiplayer(false);
    setPlaying(true);
    setGameOver(false);
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
    setResultMsg('El primero en llegar a 3 gana.');
    setPlayerChoice(null);
    setAiChoice(null);
  };

  const handlePlay = async (choice: any) => {
    if (isResolving) return;
    
    setPlayerChoice(choice);
    setIsResolving(true);
    
    if (isMultiplayer) {
      if (isHost) {
        await updateDoc(doc(db, 'game3_matches', matchId!), { hostChoice: choice.id });
      } else {
        await updateDoc(doc(db, 'game3_matches', matchId!), { guestChoice: choice.id });
      }
      setResultMsg('Esperando al oponente...');
    } else {
      const randomAi = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      
      setTimeout(() => {
        setAiChoice(randomAi);
        
        setTimeout(() => {
          let pScore = playerScore;
          let aScore = aiScore;
          let msg = '';
          
          if (choice.id === randomAi.id) {
            msg = '¡Empate!';
          } else if (choice.beats === randomAi.id) {
            msg = `¡Ganaste! ${choice.name} vence a ${randomAi.name}`;
            pScore++;
            setPlayerScore(pScore);
          } else {
            msg = `Perdiste. ${randomAi.name} vence a ${choice.name}`;
            aScore++;
            setAiScore(aScore);
          }
          
          setResultMsg(msg);
          
          setTimeout(() => {
            if (pScore >= 3 || aScore >= 3) {
              handleGameOver(pScore > aScore);
            } else {
              setRound(r => r + 1);
              setPlayerChoice(null);
              setAiChoice(null);
              setIsResolving(false);
              setResultMsg('¡Elige tu guardián!');
            }
          }, 2000);
        }, 1000);
      }, 500);
    }
  };

  const handleGameOver = async (playerWon: boolean) => {
    setPlaying(false);
    setGameOver(true);
    setIsResolving(false);
    
    const finalScore = playerWon ? 300 : 50;
    
    if (playerWon) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }

    if (profile) {
      if (profile) {
        await addDoc(collection(db, 'scores'), {
          userId: profile.uid,
          userName: profile.displayName,
          userAvatar: profile.avatar,
          gameId: 'game3',
          score: finalScore,
          createdAt: Date.now()
        });
      }
      await updateProfilePoints(finalScore, true);
      await addMedal('Escudero del Mar');
      if (playerWon) {
        await addMedal('Capitán de las Profundidades');
        if (!isMultiplayer && aiScore === 0) {
          await addMedal('Rey de la Arena');
        }
      }
    }
  };

  const sendGreeting = async (text: string) => {
    setShowGreetingsMenu(false);
    if (!profile) return;
    
    if (isMultiplayer && matchId) {
      await updateDoc(doc(db, 'game3_matches', matchId), {
        lastGreeting: {
          text,
          senderId: profile.uid,
          timestamp: Date.now()
        }
      });
    } else {
      setActiveGreeting({
        text,
        senderId: profile.uid,
        timestamp: Date.now()
      });
      setTimeout(() => setActiveGreeting(null), 3000);
      
      // Simular que Neptuno responde a veces
      setTimeout(() => {
        if (Math.random() > 0.3) {
          setActiveGreeting({
            text: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
            senderId: 'neptuno',
            timestamp: Date.now()
          });
          setTimeout(() => setActiveGreeting(null), 3000);
        }
      }, 1000 + Math.random() * 1000);
    }
  };

  const opponentName = isMultiplayer ? (isHost ? matchData?.guestName : matchData?.hostName) || 'Oponente' : 'Neptuno';

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white drop-shadow-md">Guardianes del Océano</h1>
        </div>

        <Card className="min-h-[500px] flex flex-col relative bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-400 p-8">
          {!playing && !gameOver && !waitingForOpponent ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-white">
              <div className="text-6xl mb-6">🛡️</div>
              <h2 className="text-3xl font-black mb-4 drop-shadow-sm">Liga de Guardianes</h2>
              <p className="text-xl mb-4 font-medium text-blue-200">Enfrentate a Neptuno o Reta a Jugadores en Línea.</p>
              <div className="flex gap-4 justify-center text-sm font-bold text-blue-200 mb-8 bg-black/20 p-4 rounded-xl">
                <span>Tiburón vence Pez</span>•
                <span>Pez vence Medusa</span>•
                <span>Medusa vence Tiburón</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button onClick={startGameSingle} variant="ghost" size="lg" className="w-full sm:w-auto bg-blue-800 text-white hover:bg-blue-700">Jugar contra Neptuno (IA)</Button>
                {profile && <Button onClick={createChallenge} variant="primary" size="lg" className="w-full sm:w-auto">¡Retar a Todos!</Button>}
              </div>
            </div>
          ) : waitingForOpponent ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-white">
               <div className="text-6xl mb-6 animate-pulse">📡</div>
               <h2 className="text-3xl font-black mb-4">Llamando Retadores...</h2>
               <p className="text-xl font-medium text-blue-200 mb-8">Esperando que alguien acepte tu reto en línea.</p>
               <Button onClick={() => setWaitingForOpponent(false)} variant="ghost" className="text-blue-300">Cancelar Reto</Button>
            </div>
          ) : gameOver ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-white">
              <div className="text-6xl mb-4">{playerScore > aiScore ? '👑' : '💀'}</div>
              <h2 className="text-4xl font-black mb-2 text-blue-200">
                {playerScore > aiScore ? '¡Victoria Gloriosa!' : 'Derrota Honorable'}
              </h2>
              <p className="text-2xl mb-8 font-bold">Tú {playerScore} - {aiScore} {opponentName}</p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/')} variant="ghost">Salir</Button>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col relative">
              
              {/* Multiplayer Chat/Greetings */}
              <div className="flex justify-end mb-2 z-50 relative">
                   <Button size="sm" onClick={() => setShowGreetingsMenu(!showGreetingsMenu)} className="bg-indigo-600 text-white rounded-xl flex gap-2 items-center px-4 py-2 hover:bg-indigo-500 shadow-lg border-2 border-indigo-400">
                     <MessageCircle className="w-5 h-5" />
                     <span className="font-bold">Mensajes</span>
                   </Button>
                   <AnimatePresence>
                     {showGreetingsMenu && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl p-2 flex flex-col gap-1 border-2 border-indigo-200 z-50 origin-top-right">
                           {GREETINGS.map(g => (
                              <button key={g} onClick={() => sendGreeting(g)} className="text-left text-sm font-bold text-indigo-900 hover:bg-indigo-100 p-2 rounded-lg transition-colors">{g}</button>
                           ))}
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>

              {/* Floating Active Greeting */}
              <AnimatePresence>
                {activeGreeting && (
                  <motion.div 
                     initial={{ opacity: 0, y: -20, scale: 0.8 }} 
                     animate={{ opacity: 1, y: 0, scale: 1 }} 
                     exit={{ opacity: 0, scale: 0.8 }}
                     className={`absolute top-16 z-10 bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-2xl shadow-lg border-2 border-white ${activeGreeting.senderId === profile?.uid ? 'left-4' : 'right-4'}`}
                  >
                    {activeGreeting.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mb-8 px-4 py-2 bg-black/20 rounded-2xl mt-4">
                <div className="text-center">
                  <div className="text-blue-200 font-bold text-sm">Tú</div>
                  <div className="text-3xl font-black text-white">{playerScore}</div>
                </div>
                <div className="text-blue-300 font-bold">Ronda {round}</div>
                <div className="text-center">
                  <div className="text-blue-200 font-bold text-sm">{opponentName}</div>
                  <div className="text-3xl font-black text-white">{aiScore}</div>
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center gap-8 mb-12">
                <div className="text-6xl relative">
                  {playerChoice ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>{playerChoice.icon}</motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 flex items-center justify-center text-blue-500/30">?</div>
                  )}
                </div>
                <div className="text-4xl font-black text-blue-400">VS</div>
                <div className="text-6xl relative">
                  {aiChoice ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>{aiChoice.icon}</motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-4 border-red-500/30 flex items-center justify-center text-red-500/30">?</div>
                  )}
                </div>
              </div>

              <div className="text-center mb-8 h-8">
                <p className="text-xl font-bold text-white drop-shadow-md">{resultMsg}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-auto">
                {CHOICES.map((choice) => (
                  <Button
                    key={choice.id}
                    onClick={() => handlePlay(choice)}
                    disabled={isResolving}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${playerChoice?.id === choice.id ? 'bg-pink-500 shadow-none translate-y-[2px]' : 'bg-white hover:bg-blue-50'}`}
                  >
                    <span className="text-4xl">{choice.icon}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
