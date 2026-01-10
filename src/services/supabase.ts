import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Use valores padrão se as variáveis de ambiente não estiverem definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hippeoxfvuiskyeuiazj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHBlb3hmdnVpc2t5ZXVpYXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTMwMTUsImV4cCI6MjA4MzYyOTAxNX0.ThNZsPlBIoQwmX39PR8LnuJtWMFOnjXCRTPeOC4Be4Q';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
