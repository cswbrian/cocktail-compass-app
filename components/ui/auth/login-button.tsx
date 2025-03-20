'use client'
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Button } from "@/components/ui/button"; // Using your existing button component
import { useAuth } from '@/context/AuthContext';

export function LoginButton() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!auth) return;
    
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    
    try {
      setIsLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <Button disabled>Loading...</Button>;

  return user ? (
    <Button 
      onClick={handleLogout} 
      disabled={isLoading}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  ) : (
    <Button 
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
} 