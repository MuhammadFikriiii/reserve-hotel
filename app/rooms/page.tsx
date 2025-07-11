"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase, type Room } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [rooms, statusFilter, priceRange])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setRooms(data || [])

      // Set max price for slider
      const prices = data?.map((room) => room.price) || []
      const max = Math.max(...prices, 1000)
      setMaxPrice(max)
      setPriceRange([0, max])
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = rooms

    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === statusFilter)
    }

    filtered = filtered.filter((room) => room.price >= priceRange[0] && room.price <= priceRange[1])

    setFilteredRooms(filtered)
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

  const clearFilters = () => {
    setStatusFilter("all")
    setPriceRange([0, maxPrice])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">Loading luxury rooms...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gold mb-4">Our Luxury Suites</h1>
            <p className="text-xl text-ivory max-w-2xl mx-auto">
              Choose from our collection of meticulously designed rooms, each offering unparalleled comfort and elegance
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Filter Toggle Button (Mobile) */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-ivory">
                {filteredRooms.length} Room{filteredRooms.length !== 1 ? "s" : ""} Found
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filter Panel */}
            <Card className={`bg-charcoal border-gold/30 ${showFilters ? "block" : "hidden md:block"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Rooms
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-ivory/60 hover:text-ivory">
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-ivory mb-3 font-medium">Room Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-black border-gold/50 text-ivory hover:border-gold transition-colors">
                        <SelectValue placeholder="All rooms" />
                      </SelectTrigger>
                      <SelectContent className="bg-charcoal border-gold">
                        <SelectItem value="all">All Rooms</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-ivory mb-3 font-medium">
                      Price Range: ${priceRange[0]} - ${priceRange[1]} per night
                    </label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={maxPrice}
                        step={50}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-sm text-ivory/60 mt-2">
                        <span>$0</span>
                        <span>${maxPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rooms Grid */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                variants={fadeInUp}
                className="bg-charcoal rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 glow-gold group shadow-xl"
              >
                <div className="relative">
                  <Image
                    src={
                      room.image_url || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(room.name)}`
                    }
                    alt={room.name}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className={`absolute top-4 right-4 ${getStatusColor(room.status)} text-white shadow-lg`}>
                    {room.status}
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="font-playfair text-2xl font-bold text-gold mb-2">{room.name}</h3>
                  <p className="text-ivory/80 mb-4 line-clamp-2 leading-relaxed">
                    {room.description || "Experience luxury and comfort in this beautifully appointed suite."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-gold">${room.price}</span>
                      <span className="text-sm text-ivory/60 ml-1">/night</span>
                    </div>
                    <Link href={`/rooms/${room.id}`}>
                      <Button size="sm" className="shadow-lg">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredRooms.length === 0 && (
            <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-2xl font-bold text-gold mb-4">No Rooms Found</h3>
                <p className="text-ivory/60 mb-6">
                  No rooms match your current filters. Try adjusting your search criteria.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}

          {/* Back to Home */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
