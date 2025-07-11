import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gndvqwhfkfahkqnesnav.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZHZxd2hma2ZhaGtxbmVzbmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzc3NjAsImV4cCI6MjA2NzgxMzc2MH0.bPlopMOUz8HjINdzmikUM9pBqW4OVvOzVEw_XypbJPM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Room = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  status: "available" | "booked" | "maintenance"
  created_at: string
}

export type Facility = {
  id: string
  name: string
}

export type Booking = {
  id: string
  room_id: string
  guest_name: string
  email: string | null
  phone: string | null
  check_in: string
  check_out: string
  status: "pending" | "confirmed" | "canceled"
  created_at: string
  room?: Room
}

export type RoomWithFacilities = Room & {
  facilities: Facility[]
}
