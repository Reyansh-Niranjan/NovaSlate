import { createClient } from "@supabase/supabase-js";

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof globalThis !== "undefined" && (globalThis as any).process?.env
    ? (globalThis as any).process.env
    : {};
const supabaseUrl = (env.VITE_SUPABASE_URL || "https://placeholder-offline.supabase.co") as string;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key") as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
