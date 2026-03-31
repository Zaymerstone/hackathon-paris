import { supabase } from './supabase';
import type { OnboardingAnswer } from './supabase';

// Demo user ID (seeded in schema.sql)
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── Profile ────────────────────────────────────────────────────

export async function fetchProfile() {
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', DEMO_USER_ID)
    .single();
  if (userErr) throw userErr;

  const { data: portrait } = await supabase
    .from('digital_portraits')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .single();

  const { data: verifications } = await supabase
    .from('verification_records')
    .select('*')
    .eq('user_id', DEMO_USER_ID);

  const { data: userInterests } = await supabase
    .from('user_interests')
    .select('interests(*)')
    .eq('user_id', DEMO_USER_ID);

  return { user, portrait, verifications: verifications ?? [], userInterests: userInterests ?? [] };
}

// ── Matches ────────────────────────────────────────────────────

export async function fetchMatches() {
  // Get clusters the demo user belongs to
  const { data: memberships } = await supabase
    .from('cluster_members')
    .select('cluster_id')
    .eq('user_id', DEMO_USER_ID);

  if (!memberships?.length) return [];

  const clusterIds = memberships.map(m => m.cluster_id);

  // Get other members in those clusters
  const { data: members } = await supabase
    .from('cluster_members')
    .select('user_id, match_clusters(id, name, compatibility_score, ai_rationale)')
    .in('cluster_id', clusterIds)
    .neq('user_id', DEMO_USER_ID);

  if (!members?.length) return [];

  const userIds = [...new Set(members.map(m => m.user_id))];

  const { data: matchedUsers } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds);

  const { data: verifications } = await supabase
    .from('verification_records')
    .select('*')
    .in('user_id', userIds)
    .eq('status', 'verified');

  // Merge compatibility scores
  return (matchedUsers ?? []).map(u => {
    const membership = members.find(m => m.user_id === u.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (membership?.match_clusters as any) as { compatibility_score: number; ai_rationale: string } | null;
    const userVerifs = (verifications ?? []).filter(v => v.user_id === u.id);
    return {
      ...u,
      compatibility_score: cluster?.compatibility_score ?? 80,
      ai_rationale: cluster?.ai_rationale ?? '',
      verifications: userVerifs,
    };
  });
}

// ── Activities ─────────────────────────────────────────────────

export async function fetchActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*, venues(*)')
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function bookActivity(activityId: string) {
  const { data, error } = await supabase
    .from('event_bookings')
    .upsert({ activity_id: activityId, user_id: DEMO_USER_ID, status: 'booked' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyBookings() {
  const { data, error } = await supabase
    .from('event_bookings')
    .select('*, activities(*, venues(*))')
    .eq('user_id', DEMO_USER_ID)
    .in('status', ['booked', 'confirmed']);
  if (error) throw error;
  return data ?? [];
}

// ── Onboarding ─────────────────────────────────────────────────

export async function saveOnboardingSession(answers: OnboardingAnswer[]) {
  // Create or reuse session
  const { data: session, error: sessionErr } = await supabase
    .from('ai_onboarding_sessions')
    .insert({ user_id: DEMO_USER_ID, completed: true, finished_at: new Date().toISOString() })
    .select()
    .single();
  if (sessionErr) throw sessionErr;

  // Save answers
  const rows = answers.map(a => ({ ...a, session_id: session.id }));
  await supabase.from('onboarding_answers').insert(rows);

  // Update portrait completion
  await supabase
    .from('digital_portraits')
    .update({ completion_pct: 65, updated_at: new Date().toISOString() })
    .eq('user_id', DEMO_USER_ID);

  return session;
}

// ── Feedback ───────────────────────────────────────────────────

export async function submitFeedback(activityId: string, revieweeId: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('post_meetup_feedback')
    .insert({ activity_id: activityId, reviewer_id: DEMO_USER_ID, reviewee_id: revieweeId, rating, comment })
    .select()
    .single();
  if (error) throw error;
  return data;
}
