// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Read from Vite envs (baked at build time)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helpful console in case envs are missing at build time
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase env missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.production'
  );
}

// Create and export a single client for the whole app
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// (Optional) quick connectivity check you can call from anywhere
export async function checkSupabaseCreds(): Promise<boolean> {
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey! },
    });
    return r.ok;
  } catch {
    return false;
  }
}
