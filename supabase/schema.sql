-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tables are created by Prisma, but RLS must be manual or raw SQL
-- This file contains the RLS policies and triggers for Supabase

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_picks ENABLE ROW LEVEL SECURITY;

-- USERS Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- PARLAYS Policies
CREATE POLICY "Users can view their own parlays" ON parlays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parlays" ON parlays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view daily parlays (public read)" ON parlays
  FOR SELECT USING (is_daily = true);

-- PARLAY LEGS Policies
CREATE POLICY "Users can view legs of visible parlays" ON parlay_legs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parlays
      WHERE parlays.id = parlay_legs.parlay_id
      AND (parlays.user_id = auth.uid() OR parlays.is_daily = true)
    )
  );

CREATE POLICY "Users can create legs for their parlays" ON parlay_legs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM parlays
      WHERE parlays.id = parlay_legs.parlay_id
      AND parlays.user_id = auth.uid()
    )
  );

-- BET HISTORY Policies
CREATE POLICY "Users can view their own bet history" ON bet_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bet history" ON bet_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DAILY PICKS Policies
CREATE POLICY "Everyone can view daily picks" ON daily_picks
  FOR SELECT USING (true);

-- Function to handle new user signup (Supabase Auth Trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
