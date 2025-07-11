"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase, type Booking } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Mail, Phone, User, CheckCircle, XCircle, Clock } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          room:rooms(name, price)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

      if (error) throw error
      await fetchBookings()
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600"
      case "canceled":
        return "bg-red-600"
      case "pending":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return CheckCircle
      case "canceled":
        return XCircle
      case "pending":
        return Clock
      default:
        return Clock
    }
  }

  const filteredBookings = bookings.filter((booking) => filter === "all" || booking.status === filter)

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">Loading bookings...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-gold mb-2">Booking Management</h1>
          <p className="text-ivory/60">Manage guest reservations and approvals</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="text-ivory font-medium">Filter by Status:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-charcoal border-gold text-ivory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-charcoal border-gold">
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-gold">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {bookings.filter((b) => b.status === "pending").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {bookings.filter((b) => b.status === "confirmed").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Canceled</p>
                  <p className="text-2xl font-bold text-red-500">
                    {bookings.filter((b) => b.status === "canceled").length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {filteredBookings.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status)
            return (
              <Card key={booking.id} className="bg-charcoal border-gold hover:border-gold/60 transition-colors">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    {/* Guest Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gold" />
                        <span className="font-semibold text-ivory">{booking.guest_name}</span>
                      </div>
                      {booking.email && (
                        <div className="flex items-center gap-2 text-sm text-ivory/60 mb-1">
                          <Mail className="w-3 h-3" />
                          {booking.email}
                        </div>
                      )}
                      {booking.phone && (
                        <div className="flex items-center gap-2 text-sm text-ivory/60">
                          <Phone className="w-3 h-3" />
                          {booking.phone}
                        </div>
                      )}
                    </div>

                    {/* Room & Dates */}
                    <div>
                      <p className="font-semibold text-gold mb-1">{booking.room?.name || "Room"}</p>
                      <p className="text-sm text-ivory/60 mb-1">
                        Check-in: {new Date(booking.check_in).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-ivory/60">
                        Check-out: {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-5 h-5" />
                      <Badge className={`${getStatusColor(booking.status)} text-white`}>{booking.status}</Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking.id, "canceled")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateBookingStatus(booking.id, "canceled")}
                        >
                          Cancel
                        </Button>
                      )}
                      {booking.status === "canceled" && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-ivory/60 mb-4">No bookings found</p>
            <p className="text-ivory/40">
              {filter === "all" ? "No bookings have been made yet" : `No ${filter} bookings found`}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
