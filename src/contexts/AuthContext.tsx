import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name: string, avatar: string, age: number, color: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePoints: (points: number, gameCompleted: boolean) => Promise<void>;
  addMedal: (medal: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Auto create profile for google users
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Capitán Marino',
            avatar: '🦈',
            age: 7,
            favoriteColor: 'Azul',
            totalPoints: 0,
            gamesCompleted: 0,
            medals: [],
            createdAt: Date.now(),
            isGuest: false
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        // Check for guest in local storage
        const storedGuest = localStorage.getItem('guestProfile');
        if (storedGuest) {
          setProfile(JSON.parse(storedGuest));
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginAsGuest = async (name: string, avatar: string, age: number, color: string) => {
    const newProfile: UserProfile = {
      uid: 'guest_' + Date.now(),
      displayName: name,
      avatar,
      age,
      favoriteColor: color,
      totalPoints: 0,
      gamesCompleted: 0,
      medals: [],
      createdAt: Date.now(),
      isGuest: true
    };
    
    // Save to local storage
    localStorage.setItem('guestProfile', JSON.stringify(newProfile));
    
    // Attempt to save to firestore so they show on leaderboard (relies on updated public rules)
    try {
      await setDoc(doc(db, 'users', newProfile.uid), newProfile);
    } catch (err) {
      console.warn("Could not save guest to firestore", err);
    }
    
    setProfile(newProfile);
  };

  const logout = async () => {
    if (user) {
      await signOut(auth);
    } else {
      localStorage.removeItem('guestProfile');
      setProfile(null);
    }
  };

  const updateProfilePoints = async (points: number, gameCompleted: boolean) => {
    if (!profile) return;
    
    const newTotalPoints = profile.totalPoints + points;
    const newGamesCompleted = profile.gamesCompleted + (gameCompleted ? 1 : 0);
    
    const updatedProfile = {
      ...profile,
      totalPoints: newTotalPoints,
      gamesCompleted: newGamesCompleted
    };

    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        totalPoints: newTotalPoints,
        gamesCompleted: newGamesCompleted
      });
    } else {
      localStorage.setItem('guestProfile', JSON.stringify(updatedProfile));
      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          totalPoints: newTotalPoints,
          gamesCompleted: newGamesCompleted
        });
      } catch(e) {}
    }
    
    setProfile(updatedProfile);
  };

  const addMedal = async (medal: string) => {
    if (!profile) return;
    if (profile.medals.includes(medal)) return;

    const newMedals = [...profile.medals, medal];
    const updatedProfile = {
      ...profile,
      medals: newMedals
    };

    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        medals: newMedals
      });
    } else {
      localStorage.setItem('guestProfile', JSON.stringify(updatedProfile));
      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          medals: newMedals
        });
      } catch (e) {}
    }

    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginAsGuest, logout, updateProfilePoints, addMedal }}>
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
