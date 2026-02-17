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
  status text not null check (status in ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REJECTED')),
  assigned_room_number text references public.rooms(room_number), -- Optional until confirmed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

-- Policies (Simplified for demo)
-- Allow public read access to room types
create policy "Public read room types" on public.room_types for select using (true);
-- Allow public read access to rooms (availability check)
create policy "Public read rooms" on public.rooms for select using (true);
-- Allow anyone to create bookings
create policy "Public create bookings" on public.bookings for insert with check (true);
-- Allow users to read their own bookings (Mock: logic handled in app for now)
create policy "Read own bookings" on public.bookings for select using (true); 

-- 5. Seed Data (Based on room_spec.md)

-- Insert Room Types
insert into public.room_types 
(id, name, floor_location, max_guests, bed_config, size_sqm, porch_size_sqm, price_weekday, price_holiday, price_cny, amenities)
values 
('rt_vesselin', 'Vesselin & Bach (主題客房)', '樓下', 2, '加大床 × 1', 45, null, 3200, 3500, 4800, ARRAY['按摩椅', '大屏電視', '音響']),
('rt_maya_legend', '馬雅傳說', '樓下', 4, '標準雙人床 × 2', 30, 8, 2800, 3200, 5000, null),
('rt_maya_classic', '馬雅經典', '樓下', 2, '加大床 × 1', 30, 8, 2300, 2500, 4200, null),
('rt_antiguo', '安提哥', '二樓', 2, '標準雙人床 × 1', 26, 6, 2000, 2300, 3300, null),
('rt_inca', '印加風情', '二樓', 2, '標準雙人床 × 1', 25, 6, 2000, 2300, 3300, null),
('rt_latin', '拉丁浪漫', '二樓', 2, '標準雙人床 × 1', 16, 7, 1600, 1800, 2800, null);

-- Insert Rooms (Inventory)
insert into public.rooms (room_number, room_type_id) values
-- Vesselin (1 room, number TBD, let's assume 108)
('108', 'rt_vesselin'),
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
