-- Insert sample facilities
insert into public.facilities (name) values
  ('Free WiFi'),
  ('Air Conditioning'),
  ('Mini Bar'),
  ('Room Service'),
  ('Balcony'),
  ('Ocean View'),
  ('City View'),
  ('Jacuzzi'),
  ('Fireplace'),
  ('Kitchen'),
  ('Workspace'),
  ('Smart TV')
on conflict (name) do nothing;

-- Insert sample rooms
insert into public.rooms (name, description, price, image_url, status) values
  (
    'Presidential Suite',
    'The epitome of luxury with panoramic city views, private balcony, and exclusive amenities. This 1,200 sq ft suite features a separate living area, marble bathroom with jacuzzi, and personalized concierge service.',
    850,
    '/placeholder.svg?height=400&width=600&text=Presidential+Suite',
    'available'
  ),
  (
    'Ocean View Deluxe',
    'Wake up to breathtaking ocean views in this elegantly appointed room. Features a king-size bed, private balcony, and premium amenities for the perfect seaside retreat.',
    450,
    '/placeholder.svg?height=400&width=600&text=Ocean+View+Deluxe',
    'available'
  ),
  (
    'Executive Business Suite',
    'Perfect for business travelers, this suite combines comfort with functionality. Includes a dedicated workspace, high-speed internet, and access to our executive lounge.',
    320,
    '/placeholder.svg?height=400&width=600&text=Executive+Business+Suite',
    'booked'
  ),
  (
    'Romantic Honeymoon Suite',
    'Celebrate love in this intimate suite designed for romance. Features a four-poster bed, fireplace, private jacuzzi, and champagne service upon arrival.',
    680,
    '/placeholder.svg?height=400&width=600&text=Romantic+Honeymoon+Suite',
    'available'
  ),
  (
    'Garden View Standard',
    'A comfortable and elegant room overlooking our beautifully landscaped gardens. Perfect for guests seeking tranquility and natural beauty.',
    220,
    '/placeholder.svg?height=400&width=600&text=Garden+View+Standard',
    'maintenance'
  ),
  (
    'Penthouse Luxury',
    'The ultimate in luxury accommodation. This two-level penthouse features floor-to-ceiling windows, private elevator access, and a rooftop terrace with 360-degree views.',
    1200,
    '/placeholder.svg?height=400&width=600&text=Penthouse+Luxury',
    'available'
  );

-- Get room and facility IDs for junction table
do $$
declare
  presidential_id uuid;
  ocean_view_id uuid;
  executive_id uuid;
  honeymoon_id uuid;
  garden_id uuid;
  penthouse_id uuid;
  
  wifi_id uuid;
  ac_id uuid;
  minibar_id uuid;
  room_service_id uuid;
  balcony_id uuid;
  ocean_view_facility_id uuid;
  city_view_id uuid;
  jacuzzi_id uuid;
  fireplace_id uuid;
  kitchen_id uuid;
  workspace_id uuid;
  smart_tv_id uuid;
begin
  -- Get room IDs
  select id into presidential_id from public.rooms where name = 'Presidential Suite';
  select id into ocean_view_id from public.rooms where name = 'Ocean View Deluxe';
  select id into executive_id from public.rooms where name = 'Executive Business Suite';
  select id into honeymoon_id from public.rooms where name = 'Romantic Honeymoon Suite';
  select id into garden_id from public.rooms where name = 'Garden View Standard';
  select id into penthouse_id from public.rooms where name = 'Penthouse Luxury';
  
  -- Get facility IDs
  select id into wifi_id from public.facilities where name = 'Free WiFi';
  select id into ac_id from public.facilities where name = 'Air Conditioning';
  select id into minibar_id from public.facilities where name = 'Mini Bar';
  select id into room_service_id from public.facilities where name = 'Room Service';
  select id into balcony_id from public.facilities where name = 'Balcony';
  select id into ocean_view_facility_id from public.facilities where name = 'Ocean View';
  select id into city_view_id from public.facilities where name = 'City View';
  select id into jacuzzi_id from public.facilities where name = 'Jacuzzi';
  select id into fireplace_id from public.facilities where name = 'Fireplace';
  select id into kitchen_id from public.facilities where name = 'Kitchen';
  select id into workspace_id from public.facilities where name = 'Workspace';
  select id into smart_tv_id from public.facilities where name = 'Smart TV';
  
  -- Assign facilities to rooms
  -- Presidential Suite
  insert into public.room_facilities (room_id, facility_id) values
    (presidential_id, wifi_id),
    (presidential_id, ac_id),
    (presidential_id, minibar_id),
    (presidential_id, room_service_id),
    (presidential_id, balcony_id),
    (presidential_id, city_view_id),
    (presidential_id, jacuzzi_id),
    (presidential_id, smart_tv_id);
  
  -- Ocean View Deluxe
  insert into public.room_facilities (room_id, facility_id) values
    (ocean_view_id, wifi_id),
    (ocean_view_id, ac_id),
    (ocean_view_id, minibar_id),
    (ocean_view_id, balcony_id),
    (ocean_view_id, ocean_view_facility_id),
    (ocean_view_id, smart_tv_id);
  
  -- Executive Business Suite
  insert into public.room_facilities (room_id, facility_id) values
    (executive_id, wifi_id),
    (executive_id, ac_id),
    (executive_id, minibar_id),
    (executive_id, room_service_id),
    (executive_id, workspace_id),
    (executive_id, smart_tv_id);
  
  -- Romantic Honeymoon Suite
  insert into public.room_facilities (room_id, facility_id) values
    (honeymoon_id, wifi_id),
    (honeymoon_id, ac_id),
    (honeymoon_id, minibar_id),
    (honeymoon_id, room_service_id),
    (honeymoon_id, balcony_id),
    (honeymoon_id, jacuzzi_id),
    (honeymoon_id, fireplace_id),
    (honeymoon_id, smart_tv_id);
  
  -- Garden View Standard
  insert into public.room_facilities (room_id, facility_id) values
    (garden_id, wifi_id),
    (garden_id, ac_id),
    (garden_id, smart_tv_id);
  
  -- Penthouse Luxury
  insert into public.room_facilities (room_id, facility_id) values
    (penthouse_id, wifi_id),
    (penthouse_id, ac_id),
    (penthouse_id, minibar_id),
    (penthouse_id, room_service_id),
    (penthouse_id, balcony_id),
    (penthouse_id, city_view_id),
    (penthouse_id, jacuzzi_id),
    (penthouse_id, kitchen_id),
    (penthouse_id, smart_tv_id);
end $$;

-- Insert sample bookings
insert into public.bookings (room_id, guest_name, email, phone, check_in, check_out, status) 
select 
  r.id,
  'John Smith',
  'john.smith@email.com',
  '+1-555-0123',
  current_date + interval '7 days',
  current_date + interval '10 days',
  'confirmed'
from public.rooms r 
where r.name = 'Executive Business Suite';

insert into public.bookings (room_id, guest_name, email, phone, check_in, check_out, status) 
select 
  r.id,
  'Emily Johnson',
  'emily.johnson@email.com',
  '+1-555-0456',
  current_date + interval '14 days',
  current_date + interval '17 days',
  'pending'
from public.rooms r 
where r.name = 'Ocean View Deluxe';
