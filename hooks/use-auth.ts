"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCurrentUser().then(({ data, error }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
} 