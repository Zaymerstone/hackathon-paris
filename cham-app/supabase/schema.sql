-- ============================================================
-- CHAM APP — Full Database Schema (from Miro ER Diagram)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  display_name  text not null,
  avatar_url    text,
  location      text,
  bio           text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'premium')),
  is_active     boolean default true,
  last_active_at timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── DIGITAL PORTRAIT ────────────────────────────────────────
create table if not exists digital_portraits (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references users(id) on delete cascade,
  social_energy_score integer check (social_energy_score between 0 and 100),
  friendship_style    text,
  ideal_group_min     integer default 2,
  ideal_group_max     integer default 6,
  availability        jsonb default '{}',
  friendship_intent   text,
  completion_pct      integer default 0 check (completion_pct between 0 and 100),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique(user_id)
);

-- ─── INTERESTS ───────────────────────────────────────────────
create table if not exists interests (
  id       uuid primary key default gen_random_uuid(),
  name     text unique not null,
  category text,
  emoji    text
);

create table if not exists user_interests (
  user_id     uuid not null references users(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  affinity    integer default 5 check (affinity between 1 and 10),
  primary key (user_id, interest_id)
);

-- ─── VERIFICATION ────────────────────────────────────────────
create table if not exists verification_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  type          text not null check (type in ('selfie', 'id_document', 'community')),
  status        text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  ai_risk_flag  boolean default false,
  verified_at   timestamptz,
  created_at    timestamptz default now()
);

-- ─── MATCH CLUSTERS ──────────────────────────────────────────
create table if not exists match_clusters (
  id                  uuid primary key default gen_random_uuid(),
  name                text,
  compatibility_score integer check (compatibility_score between 0 and 100),
  ai_rationale        text,
  created_at          timestamptz default now()
);

create table if not exists cluster_members (
  cluster_id  uuid not null references match_clusters(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  joined_at   timestamptz default now(),
  primary key (cluster_id, user_id)
);

-- ─── VENUES ──────────────────────────────────────────────────
create table if not exists venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  city        text,
  lat         decimal(9,6),
  lng         decimal(9,6),
  category    text,
  created_at  timestamptz default now()
);

-- ─── ACTIVITIES ──────────────────────────────────────────────
create table if not exists activities (
  id              uuid primary key default gen_random_uuid(),
  cluster_id      uuid references match_clusters(id),
  venue_id        uuid references venues(id),
  title           text not null,
  description     text,
  category        text,
  badge_label     text,
  scheduled_at    timestamptz,
  duration_hrs    decimal(4,1),
  group_min       integer default 2,
  group_max       integer default 10,
  is_premium      boolean default false,
  price           decimal(8,2) default 0,
  ai_rationale    text,
  created_at      timestamptz default now()
);

-- ─── EVENT BOOKINGS ──────────────────────────────────────────
create table if not exists event_bookings (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  status      text default 'booked' check (status in ('booked', 'confirmed', 'cancelled', 'attended')),
  booked_at   timestamptz default now(),
  unique(activity_id, user_id)
);

-- ─── PAYMENTS ────────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references event_bookings(id),
  user_id         uuid not null references users(id),
  amount          decimal(8,2) not null,
  currency        text default 'USD',
  gateway         text default 'stripe',
  status          text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  platform_cut    decimal(8,2),
  created_at      timestamptz default now()
);

-- ─── CHAT ────────────────────────────────────────────────────
create table if not exists chat_rooms (
  id          uuid primary key default gen_random_uuid(),
  cluster_id  uuid references match_clusters(id),
  activity_id uuid references activities(id),
  name        text,
  created_at  timestamptz default now()
);

create table if not exists chat_messages (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references chat_rooms(id) on delete cascade,
  sender_id       uuid not null references users(id),
  content         text not null,
  is_ai_generated boolean default false,
  ai_moderation_flag boolean default false,
  created_at      timestamptz default now()
);

-- ─── AI ONBOARDING ───────────────────────────────────────────
create table if not exists ai_onboarding_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  completed   boolean default false,
  started_at  timestamptz default now(),
  finished_at timestamptz
);

create table if not exists onboarding_answers (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references ai_onboarding_sessions(id) on delete cascade,
  question_key text not null,
  answer_text text,
  tags        text[],
  created_at  timestamptz default now()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  type        text not null,
  title       text,
  body        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ─── POST-MEETUP FEEDBACK ────────────────────────────────────
create table if not exists post_meetup_feedback (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id),
  reviewer_id uuid not null references users(id),
  reviewee_id uuid not null references users(id),
  rating      integer check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- ─── INCIDENT REPORTS ────────────────────────────────────────
create table if not exists incident_reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references users(id),
  reported_id   uuid not null references users(id),
  description   text,
  status        text default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at    timestamptz default now()
);

-- ─── USER LOCATION ───────────────────────────────────────────
create table if not exists user_locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  lat         decimal(9,6),
  lng         decimal(9,6),
  city        text,
  recorded_at timestamptz default now()
);

-- ─── SEED DATA ───────────────────────────────────────────────

-- Interests
insert into interests (name, category, emoji) values
  ('Coffee Walks',    'Social',   '☕'),
  ('Gallery Visits',  'Arts',     '🎨'),
  ('Hiking',          'Outdoor',  '🥾'),
  ('Yoga',            'Wellness', '🧘'),
  ('Book Clubs',      'Culture',  '📚'),
  ('Live Music',      'Arts',     '🎵'),
  ('Casual Brunches', 'Food',     '🍳'),
  ('Trail Walks',     'Outdoor',  '🌿'),
  ('Indie Cafés',     'Social',   '☕'),
  ('Design Exhibits', 'Arts',     '🖼️'),
  ('Food Markets',    'Food',     '🍜'),
  ('Co-working',      'Productivity', '💻')
on conflict (name) do nothing;

-- Demo user
insert into users (id, email, display_name, location, bio) values
  ('00000000-0000-0000-0000-000000000001', 'marissa@cham.app', 'Marissa Trevino', 'Portland, OR', 'Looking for genuine connections through shared outdoor & creative adventures.')
on conflict (id) do nothing;

-- Digital portrait for demo user
insert into digital_portraits (user_id, social_energy_score, friendship_style, ideal_group_min, ideal_group_max, friendship_intent, completion_pct, availability)
values (
  '00000000-0000-0000-0000-000000000001',
  78, 'Explorer', 4, 6,
  'Looking for genuine connections through shared outdoor & creative adventures. Open to small groups and 1-on-1 hangouts!',
  82,
  '{"sat": true, "sun": true, "mon": false, "tue": false, "wed": true, "thu": false, "fri": true}'
) on conflict (user_id) do nothing;

-- Verification records
insert into verification_records (user_id, type, status, verified_at) values
  ('00000000-0000-0000-0000-000000000001', 'id_document', 'verified', now()),
  ('00000000-0000-0000-0000-000000000001', 'selfie',      'verified', now()),
  ('00000000-0000-0000-0000-000000000001', 'community',   'verified', now())
on conflict do nothing;

-- Match cluster
insert into match_clusters (id, name, compatibility_score, ai_rationale) values
  ('10000000-0000-0000-0000-000000000001', 'Creative Explorers', 92, 'High overlap in arts, outdoor, and social energy patterns')
on conflict (id) do nothing;

-- Matched users
insert into users (id, email, display_name, location) values
  ('00000000-0000-0000-0000-000000000002', 'marisol@cham.app',  'Marisol Nguyen',  'Brooklyn, NY'),
  ('00000000-0000-0000-0000-000000000003', 'terrence@cham.app', 'Terrence Okafor', 'Brooklyn, NY'),
  ('00000000-0000-0000-0000-000000000004', 'priya@cham.app',    'Priya Sandoval',  'Brooklyn, NY'),
  ('00000000-0000-0000-0000-000000000005', 'declan@cham.app',   'Declan Herrera',  'Brooklyn, NY')
on conflict (id) do nothing;

insert into cluster_members (cluster_id, user_id) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005')
on conflict do nothing;

-- Venues
insert into venues (id, name, address, city, category) values
  ('20000000-0000-0000-0000-000000000001', 'Local Gallery Café',   '123 Bedford Ave',    'Brooklyn', 'Café + Gallery'),
  ('20000000-0000-0000-0000-000000000002', 'Prospect Park Trails', 'Prospect Park',      'Brooklyn', 'Nature Trail'),
  ('20000000-0000-0000-0000-000000000003', 'Smorgasburg',          'East River Waterfront', 'Brooklyn', 'Street Food'),
  ('20000000-0000-0000-0000-000000000004', 'Cha Cha Matcha',       '373 Broadway',       'Brooklyn', 'Co-work Café')
on conflict (id) do nothing;

-- Activities
insert into activities (id, cluster_id, venue_id, title, category, badge_label, scheduled_at, duration_hrs, group_min, group_max, is_premium, price, ai_rationale) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   'Coffee & Gallery Hopping', 'Arts', 'TOP PICK',
   now() + interval '2 days', 2.5, 3, 5, false, 0,
   'Best for first meetup · Low-pressure setting · Strong overlap in art & casual conversation'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002',
   'Hiking Trail Meetup', 'Outdoor', 'ACTIVE',
   now() + interval '3 days', 3.0, 4, 6, false, 0,
   'High energy match across group · Shared love of outdoors · Great for bonding through movement'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003',
   'Sunset Food Market Walk', 'Food', 'FOODIE',
   now() + interval '1 day', 2.0, 3, 4, false, 0,
   'Shared foodie interests · Relaxed walk-and-talk format · Sunset vibes lower pressure'),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004',
   'Co-working & Matcha', 'Productivity', 'CHILL',
   now() + interval '4 days', 3.0, 2, 3, false, 0,
   'Parallel activity reduces awkwardness · Shared productivity mindset · Low social energy required')
on conflict (id) do nothing;

-- Bookings for demo user
insert into event_bookings (activity_id, user_id, status) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'booked'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'confirmed')
on conflict do nothing;

-- RLS: enable row level security (open for demo — lock down in production)
alter table users               enable row level security;
alter table digital_portraits   enable row level security;
alter table interests           enable row level security;
alter table user_interests      enable row level security;
alter table verification_records enable row level security;
alter table match_clusters      enable row level security;
alter table cluster_members     enable row level security;
alter table venues              enable row level security;
alter table activities          enable row level security;
alter table event_bookings      enable row level security;
alter table chat_rooms          enable row level security;
alter table chat_messages       enable row level security;
alter table notifications       enable row level security;
alter table post_meetup_feedback enable row level security;
alter table user_locations      enable row level security;

-- Open read policies for demo (anon can read everything)
create policy "public read users"               on users               for select using (true);
create policy "public read portraits"           on digital_portraits   for select using (true);
create policy "public read interests"           on interests           for select using (true);
create policy "public read user_interests"      on user_interests      for select using (true);
create policy "public read verifications"       on verification_records for select using (true);
create policy "public read clusters"            on match_clusters      for select using (true);
create policy "public read cluster_members"     on cluster_members     for select using (true);
create policy "public read venues"              on venues              for select using (true);
create policy "public read activities"          on activities          for select using (true);
create policy "public read bookings"            on event_bookings      for select using (true);
create policy "public read chat_rooms"          on chat_rooms          for select using (true);
create policy "public read chat_messages"       on chat_messages       for select using (true);
create policy "public read notifications"       on notifications       for select using (true);
create policy "public read feedback"            on post_meetup_feedback for select using (true);
create policy "public read locations"           on user_locations      for select using (true);

-- Write policies (anon can insert/update for demo)
create policy "public write bookings"    on event_bookings      for insert with check (true);
create policy "public update bookings"   on event_bookings      for update using (true);
create policy "public write onboarding"  on ai_onboarding_sessions for all using (true) with check (true);
create policy "public write answers"     on onboarding_answers  for all using (true) with check (true);
create policy "public write portraits"   on digital_portraits   for all using (true) with check (true);
create policy "public write users"       on users               for insert with check (true);
create policy "public update users"      on users               for update using (true);
create policy "public write feedback"    on post_meetup_feedback for insert with check (true);
create policy "public write messages"    on chat_messages       for insert with check (true);
