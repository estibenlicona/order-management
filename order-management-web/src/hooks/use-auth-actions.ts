import { supabase } from '@lib/supabase';

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

export const authActions = {
  async signInWithPassword(email: string, password: string): Promise<AuthActionResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error !== null) return { ok: false, error: error.message };
    return { ok: true };
  },

  async signUpWithPassword(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthActionResult> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error !== null) return { ok: false, error: error.message };
    return { ok: true };
  },

  async signInWithGoogle(): Promise<AuthActionResult> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error !== null) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: toMessage(e) };
    }
  },

  async signOut(): Promise<AuthActionResult> {
    const { error } = await supabase.auth.signOut();
    if (error !== null) return { ok: false, error: error.message };
    return { ok: true };
  },
};
