import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Profile = { id: string; full_name: string | null; phone: string | null; role: string; avatar_url: string | null };

const AuthCtx = createContext<{
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}>({ user: null, session: null, profile: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer profile fetch to avoid deadlock
        setTimeout(() => fetchProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (data) setProfile(data as Profile);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return <AuthCtx.Provider value={{ user, session, profile, loading, signOut }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);
