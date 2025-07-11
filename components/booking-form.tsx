"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, AlertTriangle } from "lucide-react"

interface BookingFormProps {
  roomId: string
  roomName: string
}

interface ConflictBooking {
  guest_name: string
  check_in: string
  check_out: string
}

export default function BookingForm({ roomId, roomName }: BookingFormProps) {
  const [formData, setFormData] = useState({
    guest_name: "",
    email: "",
    phone: "",
    check_in: "",
    check_out: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [conflictBooking, setConflictBooking] = useState<ConflictBooking | null>(null)

  const checkDateConflict = async (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("guest_name, check_in, check_out")
        .eq("room_id", roomId)
        .in("status", ["confirmed", "pending"])
        .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`)

      if (error) throw error

      if (data && data.length > 0) {
        setConflictBooking(data[0])
        setError("")
      } else {
        setConflictBooking(null)
        setError("")
      }
    } catch (error) {
      console.error("Error checking date conflict:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate dates
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (checkIn < today) {
        throw new Error("Check-in date cannot be in the past")
      }

      if (checkOut <= checkIn) {
        throw new Error("Check-out date must be after check-in date")
      }

      // Check for conflicts one more time before booking
      await checkDateConflict(formData.check_in, formData.check_out)

      if (conflictBooking) {
        throw new Error("This room is already booked for the selected dates")
      }

      const { error } = await supabase.from("bookings").insert([
        {
          room_id: roomId,
          guest_name: formData.guest_name,
          email: formData.email,
          phone: formData.phone,
          check_in: formData.check_in,
          check_out: formData.check_out,
          status: "pending",
        },
      ])

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "An error occurred while booking")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Check for date conflicts when dates change
    if (name === "check_in" || name === "check_out") {
      const newFormData = { ...formData, [name]: value }
      if (newFormData.check_in && newFormData.check_out) {
        checkDateConflict(newFormData.check_in, newFormData.check_out)
      }
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gold mb-2">Booking Submitted!</h3>
        <p className="text-ivory/80 mb-4">
          Your booking for {roomName} has been submitted successfully. We'll contact you shortly to confirm the details.
        </p>
        <Button onClick={() => window.location.reload()}>Book Another Room</Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="guest_name" className="text-ivory">
          Full Name *
        </Label>
        <Input
          id="guest_name"
          name="guest_name"
          value={formData.guest_name}
          onChange={handleChange}
          required
          className="bg-black border-gold text-ivory"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-ivory">
          Email Address *
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="bg-black border-gold text-ivory"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-ivory">
          Phone Number
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="bg-black border-gold text-ivory"
          placeholder="Enter your phone number"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="check_in" className="text-ivory">
            Check-in *
          </Label>
          <Input
            id="check_in"
            name="check_in"
            type="date"
            value={formData.check_in}
            onChange={handleChange}
            required
            className="bg-black border-gold text-ivory"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <Label htmlFor="check_out" className="text-ivory">
            Check-out *
          </Label>
          <Input
            id="check_out"
            name="check_out"
            type="date"
            value={formData.check_out}
            onChange={handleChange}
            required
            className="bg-black border-gold text-ivory"
            min={formData.check_in || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {conflictBooking && (
        <Alert className="border-red-600 bg-red-600/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            This room has been booked by <strong>{conflictBooking.guest_name}</strong> from{" "}
            <strong>{new Date(conflictBooking.check_in).toLocaleDateString()}</strong> to{" "}
            <strong>{new Date(conflictBooking.check_out).toLocaleDateString()}</strong>. Please select different dates.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-600 bg-red-600/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading || !!conflictBooking}>
        {loading ? "Processing..." : "Confirm Booking"}
      </Button>

      <p className="text-xs text-ivory/60 text-center">
        By booking, you agree to our terms and conditions. Your booking will be confirmed within 24 hours.
      </p>
    </form>
  )
}
