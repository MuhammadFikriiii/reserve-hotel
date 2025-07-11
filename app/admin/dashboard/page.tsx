"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Bed, Calendar, Users, Settings } from "lucide-react"
import Link from "next/link"
import AdminLayout from "@/components/admin-layout"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push("/admin/login")
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch room stats
      const { data: rooms } = await supabase.from("rooms").select("status")

      const totalRooms = rooms?.length || 0
      const availableRooms = rooms?.filter((room) => room.status === "available").length || 0

      // Fetch booking stats
      const { data: bookings } = await supabase.from("bookings").select("status")

      const totalBookings = bookings?.length || 0
      const pendingBookings = bookings?.filter((booking) => booking.status === "pending").length || 0

      setStats({
        totalRooms,
        availableRooms,
        totalBookings,
        pendingBookings,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-gold mb-2">Dashboard</h1>
          <p className="text-ivory/60">Welcome to your hotel management system</p>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-charcoal border-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ivory">Total Rooms</CardTitle>
              <Bed className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{stats.totalRooms}</div>
              <p className="text-xs text-ivory/60">{stats.availableRooms} available</p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ivory">Available Rooms</CardTitle>
              <Bed className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.availableRooms}</div>
              <p className="text-xs text-ivory/60">Ready for booking</p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ivory">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{stats.totalBookings}</div>
              <p className="text-xs text-ivory/60">All time bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-ivory">Pending Bookings</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingBookings}</div>
              <p className="text-xs text-ivory/60">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-2xl font-playfair font-bold text-gold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/rooms">
              <Card className="bg-charcoal border-gold hover:scale-105 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center text-ivory group-hover:text-gold">
                    <Bed className="w-5 h-5 mr-2" />
                    Manage Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ivory/60">Add, edit, or remove hotel rooms</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/bookings">
              <Card className="bg-charcoal border-gold hover:scale-105 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center text-ivory group-hover:text-gold">
                    <Calendar className="w-5 h-5 mr-2" />
                    View Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ivory/60">Manage guest reservations</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/facilities">
              <Card className="bg-charcoal border-gold hover:scale-105 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center text-ivory group-hover:text-gold">
                    <Settings className="w-5 h-5 mr-2" />
                    Manage Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ivory/60">Add or edit room amenities</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Back to Website */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/">
            <Button variant="outline" size="lg">
              View Hotel Website
            </Button>
          </Link>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
