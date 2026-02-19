-- Create Room Discounts Table
create table public.room_discounts (
  id uuid default uuid_generate_v4() primary key,
  room_type_id text references public.room_types(id) on delete cascade not null, -- Specific room type required
  start_date date not null,
  end_date date not null,
  discount_value integer not null check (discount_value > 0 and discount_value <= 100), -- 10 = 10% off
  is_active boolean default true,
  name text, -- e.g. "Summer Sale"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.room_discounts enable row level security;

-- Policies for Room Discounts
-- Public Read: Everyone can see active discounts
create policy "Discounts: Public Read" on public.room_discounts 
  for select 
  using (is_active = true);

-- Host Modify: Only Hosts can insert/update/delete
create policy "Discounts: Host All" on public.room_discounts 
  for all 
  using (public.is_admin());

-- Grant usage to authenticated and anon flows (RLS handles actual access)
grant select on public.room_discounts to anon, authenticated;
grant all on public.room_discounts to service_role;
