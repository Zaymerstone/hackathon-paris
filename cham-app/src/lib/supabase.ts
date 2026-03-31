import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types matching the ER diagram ──────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  subscription_tier: 'free' | 'premium';
  created_at: string;
}

export interface DigitalPortrait {
  id: string;
  user_id: string;
  social_energy_score: number;
  friendship_style: string;
  ideal_group_min: number;
  ideal_group_max: number;
  availability: Record<string, boolean>;
  friendship_intent: string;
  completion_pct: number;
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

export interface VerificationRecord {
  id: string;
  user_id: string;
  type: 'selfie' | 'id_document' | 'community';
  status: 'pending' | 'verified' | 'rejected';
}

export interface MatchCluster {
  id: string;
  name: string;
  compatibility_score: number;
  ai_rationale: string;
}

export interface Activity {
  id: string;
  cluster_id: string;
  title: string;
  category: string;
  badge_label: string;
  scheduled_at: string;
  duration_hrs: number;
  group_min: number;
  group_max: number;
  is_premium: boolean;
  price: number;
  ai_rationale: string;
  venues?: Venue;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  category: string;
}

export interface EventBooking {
  id: string;
  activity_id: string;
  user_id: string;
  status: 'booked' | 'confirmed' | 'cancelled' | 'attended';
  booked_at: string;
  activities?: Activity;
}

export interface OnboardingSession {
  id: string;
  user_id: string;
  completed: boolean;
}

export interface OnboardingAnswer {
  session_id: string;
  question_key: string;
  answer_text: string;
  tags: string[];
}
