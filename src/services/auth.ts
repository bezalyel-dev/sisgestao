import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error as Error };
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    // Melhor tratamento de erros de rede
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      return { 
        user: null, 
        error: new Error('Erro de conexão. Verifique sua internet e se o Supabase está acessível.') 
      };
    }
    return { user: null, error: error as Error };
  }
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error as Error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error as Error | null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
    return user;
  } catch (error: any) {
    console.error('Erro ao obter usuário atual:', error);
    // Log mais detalhado para debug
    if (error?.message?.includes('Failed to fetch')) {
      console.error('Erro de conexão com Supabase. Verifique se o projeto está ativo no dashboard.');
    }
    return null;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
