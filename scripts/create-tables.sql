-- Create rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  image_url text,
  status text default 'available' check (status in ('available', 'booked', 'maintenance')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create facilities table
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Create room_facilities junction table
create table if not exists public.room_facilities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete cascade,
  unique(room_id, facility_id)
);

-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  guest_name text not null,
  email text,
  phone text,
  check_in date not null,
  check_out date not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'canceled')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.rooms enable row level security;
alter table public.facilities enable row level security;
alter table public.room_facilities enable row level security;
alter table public.bookings enable row level security;

-- Create policies for public read access
create policy "Allow public read access on rooms" on public.rooms for select using (true);
create policy "Allow public read access on facilities" on public.facilities for select using (true);
create policy "Allow public read access on room_facilities" on public.room_facilities for select using (true);

-- Create policies for bookings (public can insert, authenticated users can manage)
create policy "Allow public insert on bookings" on public.bookings for insert with check (true);
create policy "Allow authenticated read on bookings" on public.bookings for select using (auth.role() = 'authenticated');
create policy "Allow authenticated update on bookings" on public.bookings for update using (auth.role() = 'authenticated');

-- Create policies for admin operations (authenticated users can manage all)
create policy "Allow authenticated insert on rooms" on public.rooms for insert using (auth.role() = 'authenticated');
create policy "Allow authenticated update on rooms" on public.rooms for update using (auth.role() = 'authenticated');
create policy "Allow authenticated delete on rooms" on public.rooms for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated insert on facilities" on public.facilities for insert using (auth.role() = 'authenticated');
create policy "Allow authenticated update on facilities" on public.facilities for update using (auth.role() = 'authenticated');
create policy "Allow authenticated delete on facilities" on public.facilities for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated insert on room_facilities" on public.room_facilities for insert using (auth.role() = 'authenticated');
create policy "Allow authenticated delete on room_facilities" on public.room_facilities for delete using (auth.role() = 'authenticated');
