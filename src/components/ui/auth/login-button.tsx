'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export function LoginButton() {
  const { user, loading, signInWithProvider, signOut } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithProvider('google');
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <Button disabled>Loading...</Button>;

  return user ? (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  ) : (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
}
