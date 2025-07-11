"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase, type RoomWithFacilities } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, MapPin, Users, Bed, Wifi } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import BookingForm from "@/components/booking-form"

export default function RoomDetailsPage() {
  const params = useParams()
  const [room, setRoom] = useState<RoomWithFacilities | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchRoomDetails(params.id as string)
    }
  }, [params.id])

  const fetchRoomDetails = async (roomId: string) => {
    try {
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase.from("rooms").select("*").eq("id", roomId).single()

      if (roomError) throw roomError

      // Fetch room facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from("room_facilities")
        .select(`
          facilities (
            id,
            name
          )
        `)
        .eq("room_id", roomId)

      if (facilitiesError) throw facilitiesError

      const facilities = facilitiesData?.map((rf) => rf.facilities).filter(Boolean) || []

      setRoom({
        ...roomData,
        facilities,
      })
    } catch (error) {
      console.error("Error fetching room details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-600"
      case "booked":
        return "bg-red-600"
      case "maintenance":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gold text-xl">Loading room details...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl text-ivory mb-4">Room not found</h1>
          <Link href="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Image */}
      <div className="relative h-96 md:h-[500px]">
        <Image
          src={room.image_url || `/placeholder.svg?height=500&width=1200&text=${encodeURIComponent(room.name)}`}
          alt={room.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-6 left-6">
          <Link href="/rooms">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>
        </div>
        <Badge className={`absolute top-6 right-6 ${getStatusColor(room.status)} text-white`}>{room.status}</Badge>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Room Details */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-4">{room.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-gold">
                  ${room.price}
                  <span className="text-lg text-ivory/60">/night</span>
                </span>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-lg text-ivory leading-relaxed">
                  {room.description ||
                    "Experience unparalleled luxury in this meticulously designed suite. Every detail has been carefully crafted to ensure your comfort and satisfaction, from the premium furnishings to the breathtaking views."}
                </p>
              </div>

              {/* Facilities */}
              {room.facilities && room.facilities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <h3 className="text-2xl font-bold text-gold mb-4">Room Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.facilities.map((facility) => (
                      <div key={facility.id} className="flex items-center gap-2 bg-charcoal p-3 rounded-xl">
                        <Wifi className="w-5 h-5 text-gold" />
                        <span className="text-ivory">{facility.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Room Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-charcoal p-4 rounded-xl text-center">
                  <Users className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-ivory">2-4 Guests</p>
                </div>
                <div className="bg-charcoal p-4 rounded-xl text-center">
                  <Bed className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-ivory">King Bed</p>
                </div>
                <div className="bg-charcoal p-4 rounded-xl text-center">
                  <MapPin className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-ivory">City View</p>
                </div>
                <div className="bg-charcoal p-4 rounded-xl text-center">
                  <Wifi className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-ivory">Free WiFi</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-charcoal p-6 rounded-2xl sticky top-6"
            >
              <h3 className="text-2xl font-bold text-gold mb-4">Book This Room</h3>
              <div className="mb-6">
                <p className="text-3xl font-bold text-gold">
                  ${room.price}
                  <span className="text-lg text-ivory/60">/night</span>
                </p>
              </div>

              {room.status === "available" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-charcoal border-gold max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gold">Book {room.name}</DialogTitle>
                    </DialogHeader>
                    <BookingForm roomId={room.id} roomName={room.name} />
                  </DialogContent>
                </Dialog>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  {room.status === "booked" ? "Currently Booked" : "Under Maintenance"}
                </Button>
              )}

              <div className="mt-6 pt-6 border-t border-gold/20">
                <p className="text-sm text-ivory/60 mb-2">Free cancellation up to 24 hours before check-in</p>
                <p className="text-sm text-ivory/60">Best price guarantee</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
