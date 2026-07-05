import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  session: null,
  user: null,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      isInitialized: true
    });

    // Setup auth listener
    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        session: newSession,
        user: newSession?.user || null,
        isAuthenticated: !!newSession
      });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isAuthenticated: false });
  }
}));

