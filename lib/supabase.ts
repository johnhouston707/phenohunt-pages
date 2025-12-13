import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Only create client on the client side or when env vars are available
function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Default client (for backwards compatibility)
export const supabase = getSupabaseClient();

// Browser client factory (for use in client components)
export function createBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export interface TesterTag {
  id: string;
  pheno_id: string;
  owner_id: string;
  code: string;
  strain_name: string | null;
  pheno_number: number | null;
  profile_photo_url: string | null;
  created_at: string;
}

export interface TesterFeedback {
  id: string;
  tester_tag_id: string;
  tester_id: string;
  overall_rating: number | null;
  potency_rating: number | null;
  flavor_rating: number | null;
  nose_rating: number | null;
  smoothness_rating: number | null;
  effects_rating: number | null;
  bag_appeal_rating: number | null;
  color_rating: number | null;
  review_notes: string | null;
  tester_display_name: string | null;
  created_at?: string;
  updated_at?: string;
  // Terpene fields
  overall_strength_pct?: number | null;
  nose_gas_pct?: number | null;
  nose_floral_pct?: number | null;
  nose_earthy_pct?: number | null;
  nose_fruity_pct?: number | null;
  nose_chem_pct?: number | null;
  nose_grapes_pct?: number | null;
  nose_candy_pct?: number | null;
  nose_lemons_pct?: number | null;
  nose_lime_pct?: number | null;
  nose_tangie_pct?: number | null;
  nose_peaches_pct?: number | null;
  nose_skunk_pct?: number | null;
  nose_jack_pct?: number | null;
  nose_pine_pct?: number | null;
  // Color
  selected_color?: string | null;
}
