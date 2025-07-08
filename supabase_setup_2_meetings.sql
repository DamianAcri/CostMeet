-- 2. CREAR TABLA MEETINGS
create table public.meetings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  attendees_count integer not null check (attendees_count > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  average_hourly_rate numeric(10,2) not null check (average_hourly_rate > 0),
  total_cost numeric(10,2) generated always as (
    (attendees_count * average_hourly_rate * duration_minutes) / 60.0
  ) stored,
  currency text default 'EUR',
  meeting_date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.meetings enable row level security;

-- Políticas de seguridad
create policy "Users can view own meetings" 
  on meetings for select 
  using (auth.uid() = user_id);

create policy "Users can insert own meetings" 
  on meetings for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own meetings" 
  on meetings for update 
  using (auth.uid() = user_id);

create policy "Users can delete own meetings" 
  on meetings for delete 
  using (auth.uid() = user_id);
