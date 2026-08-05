export interface UserProfile {
  uid: string;
  displayName: string;
  avatar: string;
  age: number;
  favoriteColor: string;
  totalPoints: number;
  gamesCompleted: number;
  medals: string[];
  createdAt: number;
  pin?: string;
  isGuest: boolean;
}

export interface ScoreEntry {
  id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  gameId: string;
  score: number;
  createdAt: number;
}

export const GAMES = [
  { id: 'game1', title: 'Carrera de Medusas', description: '¡Salta y resuelve sumas marinas!', icon: '🪼', theme: 'cyan', path: '/game1', tag: 'MATH + PLATFORM' },
  { id: 'game2', title: 'Tesoro Perdido', description: 'Encuentra las parejas de piñas', icon: '🏴‍☠️', theme: 'amber', path: '/game2', tag: 'MEMORIA' },
  { id: 'game3', title: 'Liga Guardianes', description: 'Estrategia épica bajo el mar', icon: '⚔️', theme: 'indigo', path: '/game3', tag: 'MULTIPLAYER' },
  { id: 'game4', title: 'Batalla Burbujas', description: '¡Explota la respuesta correcta!', icon: '🫧', theme: 'emerald', path: '/game4', tag: 'REAL-TIME' },
  { id: 'game5', title: 'Arrecife Secreto', description: 'Puzzles en el laberinto coral', icon: '🪸', theme: 'rose', path: '/game5', tag: 'ADVENTURE' }
];

export const AVATARS = [
  '🦈', '🐬', '🐙', '🦀', '🐡', '🐢', '🦑', '🐠', '🐳', '🦐'
];
