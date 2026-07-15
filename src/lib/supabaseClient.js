import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rzhcsnkzeheoxcxrmtnu.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aGNzbmt6ZWhlb3hjeHJtdG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDQ3NTcsImV4cCI6MjA5OTMyMDc1N30.bhGECTV0h-7M5F4JpXNpL6EgfSXK5Nx3QtJTZp5K8H4";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase Client] ⚠️ Supabase credentials not found. Falling back to mockup mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
