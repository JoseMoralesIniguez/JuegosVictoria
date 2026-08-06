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

// Función para hashear la contraseña/pin y no guardarla en texto plano
async function hashPin(pin: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "_fiestamarina"); // Salt simple
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    const cleanUsername = username.trim().replace(/[<>]/g, '');
    const uid = cleanUsername.toLowerCase();
    
    if (!uid || !pin) throw new Error("Faltan datos");

    const hashedInputPin = await hashPin(pin);
    
    // Check credentials collection
    const credRef = doc(db, 'auth_credentials', uid);
    try {
      const credSnap = await getDoc(credRef);
      if (credSnap.exists()) {
        const storedHash = credSnap.data().hash;
        if (storedHash !== hashedInputPin) {
          throw new Error("Contraseña incorrecta");
        }
        
        // Pin is correct, load profile
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
          localStorage.setItem('userUid', uid);
          return;
        } else {
          throw new Error("El usuario no existe");
        }
      }
    } catch (e: any) {
      if (e.message === "Contraseña incorrecta" || e.message === "El usuario no existe") {
        throw e;
      }
      // If error is permission-related, it might mean the document doesn't exist
    }

    // Fallback: Legacy check for users who registered before hashing was implemented
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.pin) {
        if (data.pin !== pin) {
          throw new Error("Contraseña incorrecta");
        }
        // Migrate to secure hashed pin
        try {
          await setDoc(doc(db, 'auth_credentials', uid), { hash: hashedInputPin });
        } catch (e) {
          console.error("Could not migrate PIN", e);
        }
      }
      
      setProfile(data as UserProfile);
      localStorage.setItem('userUid', uid);
    } else {
      throw new Error("El usuario no existe");
    }
  };

  const register = async (username: string, pin: string, avatar: string, age: number, color: string) => {
    const cleanUsername = username.trim().replace(/[<>]/g, '');
    const uid = cleanUsername.toLowerCase();
    
    if (!uid || !pin) throw new Error("Faltan datos");
    
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      throw new Error("El nombre de usuario ya está en uso. ¡Elige otro!");
    }
    
    const hashedPin = await hashPin(pin);

    const newProfile: UserProfile = {
      uid,
      displayName: cleanUsername,
      avatar,
      age,
      favoriteColor: color,
      totalPoints: 0,
      gamesCompleted: 0,
      medals: [],
      createdAt: Date.now(),
      isGuest: false
    };
    
    // Save pin hash in private credentials collection
    await setDoc(doc(db, 'auth_credentials', uid), { hash: hashedPin });
    // Save public profile (without pin)
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
    
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        totalPoints: prev.totalPoints + points,
        gamesCompleted: prev.gamesCompleted + (gameCompleted ? 1 : 0)
      };
    });

    try {
      await updateDoc(doc(db, 'users', currentUid), {
        totalPoints: increment(points),
        gamesCompleted: increment(gameCompleted ? 1 : 0)
      });
    } catch(e) {
      console.error("Error updating points", e);
    }
  };

  const addMedal = async (medal: string) => {
    const currentUid = profileRef.current?.uid;
    if (!currentUid) return;
    
    if (profileRef.current?.medals.includes(medal)) return;

    setProfile(prev => {
      if (!prev) return prev;
      if (prev.medals.includes(medal)) return prev;
      return {
        ...prev,
        medals: [...prev.medals, medal]
      };
    });

    try {
      await updateDoc(doc(db, 'users', currentUid), {
        medals: arrayUnion(medal)
      });
    } catch (e) {
      console.error("Error adding medal", e);
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
