-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  idea_prompt text,
  current_step text not null default 'prompt'
    check (current_step in ('prompt', 'requirement', 'tech', 'structure', 'prd', 'tasks', 'diagram')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on projects (user_id);

-- Requirements (1:1 with project)
create table requirements (
  project_id uuid primary key references projects (id) on delete cascade,
  questions_and_answers jsonb not null default '[]',
  tech_preference text check (tech_preference in ('ai', 'manual')),
  updated_at timestamptz not null default now()
);

-- Tech stack (1:1 with project)
create table tech_stacks (
  project_id uuid primary key references projects (id) on delete cascade,
  frontend text,
  backend text,
  database text,
  authentication text,
  storage text,
  deployment text,
  source text not null default 'manual' check (source in ('ai', 'manual')),
  updated_at timestamptz not null default now()
);

-- Product structure (1:1 with project)
create table product_structures (
  project_id uuid primary key references projects (id) on delete cascade,
  structure jsonb not null default '[]',
  version int not null default 1,
  updated_at timestamptz not null default now()
);

-- PRD (1:1 with project)
create table prds (
  project_id uuid primary key references projects (id) on delete cascade,
  content_markdown text not null default '',
  sections jsonb not null default '{}',
  version int not null default 1,
  updated_at timestamptz not null default now()
);

-- Task lists (1:1 with project)
create table task_lists (
  project_id uuid primary key references projects (id) on delete cascade,
  epics jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- Class diagrams (1:1 with project)
create table class_diagrams (
  project_id uuid primary key references projects (id) on delete cascade,
  mermaid_code text not null default '',
  updated_at timestamptz not null default now()
);

-- Row Level Security: owner-only access (NFR-004)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table requirements enable row level security;
alter table tech_stacks enable row level security;
alter table product_structures enable row level security;
alter table prds enable row level security;
alter table task_lists enable row level security;
alter table class_diagrams enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can manage own projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own requirements" on requirements
  for all using (
    exists (select 1 from projects where projects.id = requirements.project_id and projects.user_id = auth.uid())
  ) with check (
    exists (select 1 from projects where projects.id = requirements.project_id and projects.user_id = auth.uid())
  );

create policy "Users can manage own tech stacks" on tech_stacks
  for all using (
    exists (select 1 from projects where projects.id = tech_stacks.project_id and projects.user_id = auth.uid())
  ) with check (
    exists (select 1 from projects where projects.id = tech_stacks.project_id and projects.user_id = auth.uid())
  );

create policy "Users can manage own product structures" on product_structures
  for all using (
    exists (select 1 from projects where projects.id = product_structures.project_id and projects.user_id = auth.uid())
  ) with check (
    exists (select 1 from projects where projects.id = product_structures.project_id and projects.user_id = auth.uid())
  );

create policy "Users can manage own prds" on prds
  for all using (
    exists (select 1 from projects where projects.id = prds.project_id and projects.user_id = auth.uid())
  ) with check (
    exists (select 1 from projects where projects.id = prds.project_id and projects.user_id = auth.uid())
  );

create policy "Users can manage own task lists" on task_lists
  for all using (
    exists (select 1 from projects where projects.id = task_lists.project_id and projects.user_id = auth.uid())
  ) with check (
    exists (select 1 from projects where projects.id = task_lists.project_id and projects.user_id = auth.uid())
  );

create policy "Users can manage own class diagrams" on class_diagrams
  for all using (
    exists (select 1 from projects where projects.id = class_diagrams.project_id and projects.user_id = auth.uid())
  ) with check (
    exists (select 1 from projects where projects.id = class_diagrams.project_id and projects.user_id = auth.uid())
  );

-- Base grants: RLS above governs per-row access, but Postgres still checks
-- table-level privileges first. New tables don't inherit anon/authenticated/
-- service_role grants unless explicitly given (or default privileges were
-- pre-configured for the executing role), so grant them explicitly.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
