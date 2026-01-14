import { createClient } from '@supabase/supabase-js';

// Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for reference:
// Table: player_assessments
// Columns:
// - id (uuid, primary key, auto-generated)
// - name (text)
// - email (text)
// - age (integer)
// - position (text)
// - technical_score (numeric)
// - tactical_score (numeric)
// - physical_score (numeric)
// - mental_score (numeric)
// - created_at (timestamp)
// - completed_at (timestamp)