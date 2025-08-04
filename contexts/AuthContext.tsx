import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from '../services/firebase';
import firebase from 'firebase/compat/app';


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password_raw: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password_raw: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
        if(firebaseUser) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const userDocRef = db.collection('users').doc(firebaseUser.uid);
            const userDocSnap = await userDocRef.get();
            if(userDocSnap.exists) {
                setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as User);
            } else {
                // Handle case where user exists in Auth but not in Firestore
                setUser(null);
            }
        } else {
            // User is signed out
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password_raw: string): Promise<void> => {
    await auth.signInWithEmailAndPassword(email, password_raw);
  };

  const register = async (name: string, email: string, password_raw: string): Promise<void> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password_raw);
    const firebaseUser = userCredential.user;
    
    // Save additional user info in Firestore
    if (firebaseUser) {
      const userDocRef = db.collection('users').doc(firebaseUser.uid);
      await userDocRef.set({
          name: name,
          email: email,
          role: 'Admin Desa' // Default role
      });
    }
  };
  
  const logout = () => {
    auth.signOut();
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
