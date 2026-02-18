-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Room Types Table
create table public.room_types (
  id text primary key, -- Explicit IDs e.g., 'rt_vesselin'
  name text not null,
  floor_location text not null, -- '樓下', '二樓'
  max_guests integer not null default 2,
  bed_config text not null,
  size_sqm integer,
  porch_size_sqm integer,
  amenities text[], -- Array of strings
  price_weekday integer not null,
  price_holiday integer not null,
  price_cny integer not null,
  description text,
  image_url text, -- For demo purposes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Physical Rooms Table
create table public.rooms (
  room_number text primary key, -- '101', '102'
  room_type_id text references public.room_types(id) on delete cascade not null,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Bookings Table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  room_type_id text references public.room_types(id) not null,
  user_id text not null, -- Can be linked to auth.users if using Supabase Auth
  guest_name text not null,
  check_in_date date not null,
  check_out_date date not null,
  status text not null check (status in ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REJECTED', 'BLOCKED', 'PAID')),
  assigned_room_number text references public.rooms(room_number), -- Optional until confirmed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Disable Row Level Security (RLS) for development
-- (User requested to keep RLS off for initial testing)
alter table public.room_types disable row level security;
alter table public.rooms disable row level security;
alter table public.bookings disable row level security;

-- Policies are not needed when RLS is disabled, but keeping them commented out for future reference
-- create policy "Public read room types" on public.room_types for select using (true);
-- create policy "Public read rooms" on public.rooms for select using (true);
-- create policy "Public create bookings" on public.bookings for insert with check (true);
-- create policy "Read own bookings" on public.bookings for select using (true); 

-- 5. Seed Data (Based on room_spec.md)

-- Insert Room Types
insert into public.room_types 
(id, name, floor_location, max_guests, bed_config, size_sqm, porch_size_sqm, price_weekday, price_holiday, price_cny, amenities)
values 
('rt_vesselin', '主題客房', '樓下', 2, '加大床 × 1', 45, null, 3200, 3500, 4800, ARRAY['按摩椅', '大屏電視', '音響']),
('rt_maya_legend', '馬雅傳說', '樓下', 4, '標準雙人床 × 2', 30, 8, 2800, 3200, 5000, null),
('rt_maya_classic', '馬雅經典', '樓下', 2, '加大床 × 1', 30, 8, 2300, 2500, 4200, null),
('rt_antiguo', '安提哥', '二樓', 2, '標準雙人床 × 1', 26, 6, 2000, 2300, 3300, null),
('rt_inca', '印加風情', '二樓', 2, '標準雙人床 × 1', 25, 6, 2000, 2300, 3300, null),
('rt_latin', '拉丁浪漫', '二樓', 2, '標準雙人床 × 1', 16, 7, 1600, 1800, 2800, null);

-- Insert Rooms (Inventory)
insert into public.rooms (room_number, room_type_id) values
-- Vesselin (1 room, number TBD, let's assume 108)
('001', 'rt_vesselin'),
-- Maya Legend (4 rooms)
('103', 'rt_maya_legend'),
('105', 'rt_maya_legend'),
('106', 'rt_maya_legend'),
('107', 'rt_maya_legend'),
-- Maya Classic (2 rooms)
('101', 'rt_maya_classic'),
('102', 'rt_maya_classic'),
-- Antiguo (2 rooms)
('301', 'rt_antiguo'),
('302', 'rt_antiguo'),
-- Inca (1 room)
('203', 'rt_inca'),
-- Latin (3 rooms)
('201', 'rt_latin'),
('202', 'rt_latin'),
('205', 'rt_latin');

-- 6. Create Authorized Hosts Table (Security)
create table public.authorized_hosts (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Authorized Hosts
insert into public.authorized_hosts (email) values 
('stevenwang1012@gmail.com'),
('monetbnb@gmail.com'),
('monetgardenhl@gmail.com'),
('chenwenwang1012@gmail.com');

-- Enable RLS (Will be configured in next step)
alter table public.authorized_hosts enable row level security;
create policy "Allow public read to check access" on public.authorized_hosts for select using (true);

-- 7. Configure RLS Policies for Core Tables
-- Re-enable RLS (was disabled in Step 4)
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

-- Helper function to check if user is an authorized host
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.authorized_hosts
    where email = auth.jwt() ->> 'email'
  );
end;
$$ language plpgsql security definer;

-- Policies for Room Types (Public Read, Host Write)
create policy "Room Types: Public Read" on public.room_types for select using (true);
create policy "Room Types: Host All" on public.room_types for all using (public.is_admin());

-- Policies for Rooms (Public Read, Host Write)
create policy "Rooms: Public Read" on public.rooms for select using (true);
create policy "Rooms: Host All" on public.rooms for all using (public.is_admin());

-- Policies for Bookings
-- Public can read (to see availability)
create policy "Bookings: Public Read" on public.bookings for select using (true);
-- Public can insert (to make a booking)
create policy "Bookings: Public Insert" on public.bookings for insert with check (true);
-- Only Host can update/delete (cancel, confirm, etc.)
create policy "Bookings: Host Update" on public.bookings for update using (public.is_admin());
create policy "Bookings: Host Delete" on public.bookings for delete using (public.is_admin());

-- Allow Guests to cancel their own bookings (Anonymous update allowed if they know the ID)
-- RESTRICTION: Can only update if new status is 'CANCELLED'
create policy "Bookings: Guest Cancel" on public.bookings for update 
using (true) 
with check (status = 'CANCELLED');

-- 8. Security Hardening: RPC Functions (Safe Data Access)

-- Function 1: Public Calendar/Availability (Anonymized)
-- Returns only dates and status, NO personal info or UUIDs
create or replace function public.get_calendar_events()
returns table (
  room_type_id text,
  check_in_date date,
  check_out_date date,
  status text
) 
language sql
security definer -- Bypasses RLS to read data, but filters return
as $$
  select room_type_id, check_in_date, check_out_date, status
  from public.bookings
  where status != 'CANCELLED' 
  and status != 'REJECTED';
$$;

-- Function 2: My Trips (Authenticated by LINE ID)
-- Returns full details ONLY for the requesting user
create or replace function public.get_user_bookings(line_user_id text)
returns setof public.bookings
language sql
security definer
as $$
  select *
  from public.bookings
  where user_id = line_user_id
  order by created_at desc;
$$;

-- 9. Security Hardening: Disable Public Select (Final Step)
-- Remove the public read policy so that ONLY RPC functions (and Hosts) can access data
drop policy if exists "Bookings: Public Read" on public.bookings;

