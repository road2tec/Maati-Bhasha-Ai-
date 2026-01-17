'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface AuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  isAdmin: boolean;
  isAdminLoading: boolean;
}

export interface FirebaseContextState extends AuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export interface FirebaseServicesAndUser extends AuthState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
    isAdmin: false,
    isAdminLoading: true,
  });

  useEffect(() => {
    if (!auth) {
      setAuthState({
        user: null,
        isUserLoading: false,
        userError: new Error("Auth service not provided."),
        isAdmin: false,
        isAdminLoading: false,
      });
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setAuthState(prevState => ({ ...prevState, user: firebaseUser, isUserLoading: false, userError: null }));
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setAuthState({
          user: null,
          isUserLoading: false,
          userError: error,
          isAdmin: false,
          isAdminLoading: false,
        });
      }
    );

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!firestore || !authState.user) {
      setAuthState(prevState => ({ ...prevState, isAdmin: false, isAdminLoading: false }));
      return;
    }

    setAuthState(prevState => ({ ...prevState, isAdminLoading: true }));
    const adminRoleRef = doc(firestore, 'roles_admin', authState.user.uid);

    const unsubscribeRole = onSnapshot(
      adminRoleRef,
      (snapshot) => {
        setAuthState(prevState => ({
          ...prevState,
          isAdmin: snapshot.exists(),
          isAdminLoading: false,
        }));
      },
      (error) => {
        console.error("Error checking admin role:", error);
        setAuthState(prevState => ({
          ...prevState,
          isAdmin: false,
          isAdminLoading: false,
        }));
      }
    );

    return () => unsubscribeRole();
  }, [authState.user, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      ...authState,
    };
  }, [firebaseApp, firestore, auth, authState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    isAdmin: context.isAdmin,
    isAdminLoading: context.isAdminLoading,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps) as MemoFirebase<T>;
  
  if(typeof memoized === 'object' && memoized !== null) {
    memoized.__memo = true;
  }
  
  return memoized;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};