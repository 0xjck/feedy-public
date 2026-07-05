create extension if not exists pgcrypto;

create type feedy_feedback_source as enum ('platform', 'website', 'external');
create type feedy_feedback_type as enum ('bug', 'idea', 'question', 'request', 'general');
create type feedy_feedback_status as enum ('new', 'backlog', 'in_progress', 'resolved', 'dismissed');
create type feedy_feedback_priority as enum ('P0', 'P1', 'P2');
create type feedy_feedback_complexity as enum ('S', 'M', 'L', 'XL');
create type feedy_roadmap_status as enum ('now', 'next', 'future', 'just_released');

create table feedy_feedback_items (
  id uuid primary key default gen_random_uuid(),
  source feedy_feedback_source not null default 'platform',
  app_id text not null,
  environment text not null,
  release text,

  route_path text not null,
  source_url text,
  page_label text,
  page_object_type text,
  page_object_id text,

  external_user_id text,
  user_email text,
  external_org_id text,
  org_label text,

  type feedy_feedback_type not null,
  status feedy_feedback_status not null default 'new',
  priority feedy_feedback_priority,
  complexity feedy_feedback_complexity,
  assigned_user_id text,

  title text,
  is_roadmap_item boolean not null default false,
  roadmap_status feedy_roadmap_status,
  feature_flag_key text,
  feature_flag_description text,
  feature_flag_current_behavior text,

  description text not null,
  screenshot_storage_mode text check (screenshot_storage_mode in ('database', 'object')),
  screenshot_data_url text,
  screenshot_object_key text,
  screenshot_url text,
  video_link text,
  annotations jsonb not null default '[]'::jsonb,
  technical_info jsonb not null default '{}'::jsonb,

  addressed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint feedy_feedback_description_length check (char_length(description) between 10 and 5000),
  constraint feedy_feedback_roadmap_status_required check (
    (is_roadmap_item = false and roadmap_status is null)
    or (is_roadmap_item = true and roadmap_status is not null)
  )
);

create table feedy_feedback_notes (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedy_feedback_items(id) on delete cascade,
  author_id text,
  author_label text,
  body text not null,
  created_at timestamptz not null default now(),

  constraint feedy_feedback_notes_body_length check (char_length(body) between 1 and 5000)
);

create table feedy_feedback_activity (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedy_feedback_items(id) on delete cascade,
  event text not null,
  actor_id text,
  actor_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table feedy_feedback_links (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedy_feedback_items(id) on delete cascade,
  label text not null,
  url text not null,
  kind text,
  created_at timestamptz not null default now()
);

create index feedy_feedback_items_app_env_created_idx
  on feedy_feedback_items (app_id, environment, created_at desc);

create index feedy_feedback_items_status_created_idx
  on feedy_feedback_items (status, created_at desc);

create index feedy_feedback_items_type_created_idx
  on feedy_feedback_items (type, created_at desc);

create index feedy_feedback_items_priority_complexity_idx
  on feedy_feedback_items (priority, complexity);

create index feedy_feedback_items_page_idx
  on feedy_feedback_items (route_path, page_label);

create index feedy_feedback_items_identity_idx
  on feedy_feedback_items (external_org_id, external_user_id);

create index feedy_feedback_items_roadmap_idx
  on feedy_feedback_items (roadmap_status, updated_at desc)
  where is_roadmap_item = true;

create index feedy_feedback_notes_feedback_idx
  on feedy_feedback_notes (feedback_id, created_at);

create index feedy_feedback_activity_feedback_idx
  on feedy_feedback_activity (feedback_id, created_at);

create or replace function feedy_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger feedy_feedback_items_touch_updated_at
before update on feedy_feedback_items
for each row
execute function feedy_touch_updated_at();
