-- Make email nullable so anonymous Supabase auth users can be stored
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Add missing INSERT policy for users (required for first-time upsert)
CREATE POLICY "users: insert own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add INSERT policy for titles (authenticated users populate the shared catalogue)
CREATE POLICY "titles: insert authenticated" ON public.titles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- The original "interactions: all own" policy only covers SELECT/UPDATE/DELETE via USING.
-- Replace it with explicit per-operation policies so INSERT (WITH CHECK) is covered.
DROP POLICY "interactions: all own" ON public.user_title_interactions;

CREATE POLICY "interactions: select own" ON public.user_title_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "interactions: insert own" ON public.user_title_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interactions: update own" ON public.user_title_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "interactions: delete own" ON public.user_title_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Replace interaction_type values with the watch-feeling vocabulary
ALTER TABLE public.user_title_interactions
  DROP CONSTRAINT user_title_interactions_interaction_type_check;

ALTER TABLE public.user_title_interactions
  ADD CONSTRAINT user_title_interactions_interaction_type_check
  CHECK (interaction_type IN ('binged', 'liked', 'watched_normally', 'dropped', 'not_for_me'));

-- One interaction record per (user, title) — simplifies upsert logic
ALTER TABLE public.user_title_interactions
  DROP CONSTRAINT user_title_interactions_user_id_title_id_interaction_type_key;

ALTER TABLE public.user_title_interactions
  ADD CONSTRAINT user_title_interactions_user_id_title_id_key
  UNIQUE (user_id, title_id);
