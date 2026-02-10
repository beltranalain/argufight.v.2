"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase instance for Realtime subscriptions
// Lazy-init to avoid crash when env vars are missing
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars not set — realtime features disabled");
    return null;
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Backwards-compat export (may be null)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
