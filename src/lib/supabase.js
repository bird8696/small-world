import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!URL && !!KEY;

export const supabase = isSupabaseConfigured
  ? createClient(URL, KEY, {
      auth: {
        persistSession: false, // 세션 localStorage 저장 안 함
        autoRefreshToken: false, // 자동 갱신 안 함
      },
    })
  : createClient("https://placeholder.supabase.co", "placeholder");
