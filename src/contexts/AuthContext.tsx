import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, pin: string) => Promise<void>;
  register: (username: string, pin: string, avatar: string, age: number, color: string) => Promise<void>;
  logout: () => void;
  updateProfilePoints: (points: number, gameCompleted: boolean) => Promise<void>;
  addMedal: (medal: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const profileRef = useRef<UserProfile | null>(null);
  
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    const loadSession = async () => {
      const storedUid = localStorage.getItem('userUid');
      if (storedUid) {
        try {
          const docRef = doc(db, 'users', storedUid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            localStorage.removeItem('userUid');
          }
        } catch (e) {
          console.error("Error loading profile", e);
        }
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const login = async (username: string, pin: string) => {
    const uid = username.toLowerCase().trim();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.pin !== pin) {
        throw new Error("Contraseña incorrecta");
      }
      setProfile(data as UserProfile);
      localStorage.setItem('userUid', uid);
    } else {
      throw new Error("El usuario no existe");
    }
  };

  const register = async (username: string, pin: string, avatar: string, age: number, color: string) => {
    const uid = username.toLowerCase().trim();
    if (!uid || !pin) throw new Error("Faltan datos");
    
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      throw new Error("El nombre de usuario ya está en uso. ¡Elige otro!");
    }
    
    const newProfile: UserProfile = {
      uid,
      displayName: username.trim(),
      pin, // In a real app we'd hash this, but it's a kids game
      avatar,
      age,
      favoriteColor: color,
      totalPoints: 0,
      gamesCompleted: 0,
      medals: [],
      createdAt: Date.now(),
      isGuest: false
    };
    
    await setDoc(docRef, newProfile);
    setProfile(newProfile);
    localStorage.setItem('userUid', uid);
  };

  const logout = () => {
    localStorage.removeItem('userUid');
    setProfile(null);
  };

  const updateProfilePoints = async (points: number, gameCompleted: boolean) => {
    const currentUid = profileRef.current?.uid;
    if (!currentUid) return;
    
    // Update local state robustly
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        totalPoints: prev.totalPoints + points,
        gamesCompleted: prev.gamesCompleted + (gameCompleted ? 1 : 0)
      };
    });

    // Update firestore robustly
    try {
      await updateDoc(doc(db, 'users', currentUid), {
        totalPoints: increment(points),
        gamesCompleted: increment(gameCompleted ? 1 : 0)
      });
    } catch(e) {
      console.error(e);
    }
  };

  const addMedal = async (medal: string) => {
    const currentUid = profileRef.current?.uid;
    if (!currentUid) return;
    
    // Check if we already have it in ref to avoid unnecessary writes
    if (profileRef.current?.medals.includes(medal)) return;

    // Update local state robustly
    setProfile(prev => {
      if (!prev) return prev;
      if (prev.medals.includes(medal)) return prev;
      return {
        ...prev,
        medals: [...prev.medals, medal]
      };
    });

    // We can't easily arrayUnion with increment without arrayUnion function,
    // so let's import arrayUnion
    try {
      await updateDoc(doc(db, 'users', currentUid), {
        medals: arrayUnion(medal)
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ profile, loading, login, register, logout, updateProfilePoints, addMedal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
