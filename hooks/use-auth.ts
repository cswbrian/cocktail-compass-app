"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/services/auth-service";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    AuthService.getCurrentSession().then((user) => {
      if (!mounted) return;
      setUser(user);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
} 