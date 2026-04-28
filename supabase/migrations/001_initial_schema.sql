-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- users
-- Mirrors auth.users; stores profile data
-- ─────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- user_platforms
-- Streaming platforms each user subscribes to
-- ─────────────────────────────────────────
create table public.user_platforms (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  platform_name  text not null,
  created_at     timestamptz not null default now(),
  unique (user_id, platform_name)
);

-- ─────────────────────────────────────────
-- titles
-- Movies and TV shows sourced from TMDb
-- ─────────────────────────────────────────
create table public.titles (
  id               uuid primary key default gen_random_uuid(),
  tmdb_id          integer not null unique,
  type             text not null check (type in ('movie', 'tv')),
  title            text not null,
  overview         text,
  genres           text[] not null default '{}',
  release_year     smallint,
  runtime_minutes  smallint,
  poster_url       text,
  platforms        text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- user_title_interactions
-- Records watches, likes, dislikes, watchlist additions
-- ─────────────────────────────────────────
create table public.user_title_interactions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  title_id          uuid not null references public.titles(id) on delete cascade,
  interaction_type  text not null check (interaction_type in ('watched', 'watchlist', 'liked', 'disliked')),
  rating            smallint check (rating between 1 and 5),
  interacted_at     timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (user_id, title_id, interaction_type)
);

-- ─────────────────────────────────────────
-- recommendation_sessions
-- A single request: mood + time + platforms
-- ─────────────────────────────────────────
create table public.recommendation_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  mood                    text not null check (mood in ('happy', 'sad', 'excited', 'relaxed', 'tense', 'romantic')),
  available_time_minutes  smallint not null,
  selected_platforms      text[] not null default '{}',
  created_at              timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- recommendation_results
-- Up to 3 ranked results per session
-- ─────────────────────────────────────────
create table public.recommendation_results (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.recommendation_sessions(id) on delete cascade,
  title_id          uuid not null references public.titles(id) on delete cascade,
  rank              smallint not null check (rank between 1 and 3),
  confidence_score  numeric(4,3) not null check (confidence_score between 0 and 1),
  reasoning         text,
  created_at        timestamptz not null default now(),
  unique (session_id, rank)
);

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
create index on public.user_platforms (user_id);
create index on public.user_title_interactions (user_id);
create index on public.user_title_interactions (title_id);
create index on public.recommendation_sessions (user_id);
create index on public.recommendation_results (session_id);
create index on public.titles (tmdb_id);

-- ─────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────
alter table public.users                   enable row level security;
alter table public.user_platforms          enable row level security;
alter table public.titles                  enable row level security;
alter table public.user_title_interactions enable row level security;
alter table public.recommendation_sessions enable row level security;
alter table public.recommendation_results  enable row level security;

-- users: own row only
create policy "users: read own" on public.users for select using (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);

-- user_platforms: own rows only
create policy "user_platforms: all own" on public.user_platforms
  using (auth.uid() = user_id);

-- titles: readable by all authenticated users (shared catalogue)
create policy "titles: read all" on public.titles for select
  using (auth.role() = 'authenticated');

-- user_title_interactions: own rows only
create policy "interactions: all own" on public.user_title_interactions
  using (auth.uid() = user_id);

-- recommendation_sessions: own rows only
create policy "sessions: all own" on public.recommendation_sessions
  using (auth.uid() = user_id);

-- recommendation_results: readable if session belongs to user
create policy "results: read own" on public.recommendation_results for select
  using (
    exists (
      select 1 from public.recommendation_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- Auto-update updated_at
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at before update on public.titles
  for each row execute procedure public.set_updated_at();
