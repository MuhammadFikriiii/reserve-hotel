"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase, type Facility } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Settings } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [facilityName, setFacilityName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase.from("facilities").select("*").order("name")

      if (error) throw error
      setFacilities(data || [])
    } catch (error) {
      console.error("Error fetching facilities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!facilityName.trim()) {
      setError("Facility name is required")
      return
    }

    try {
      if (editingFacility) {
        const { error } = await supabase
          .from("facilities")
          .update({ name: facilityName.trim() })
          .eq("id", editingFacility.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("facilities").insert([{ name: facilityName.trim() }])

        if (error) throw error
      }

      await fetchFacilities()
      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      if (error.code === "23505") {
        setError("A facility with this name already exists")
      } else {
        setError(error.message || "An error occurred")
      }
    }
  }

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility)
    setFacilityName(facility.name)
    setIsDialogOpen(true)
  }

  const handleDelete = async (facilityId: string) => {
    if (!confirm("Are you sure you want to delete this facility? This will remove it from all rooms.")) return

    try {
      const { error } = await supabase.from("facilities").delete().eq("id", facilityId)

      if (error) throw error
      await fetchFacilities()
    } catch (error) {
      console.error("Error deleting facility:", error)
    }
  }

  const resetForm = () => {
    setFacilityName("")
    setEditingFacility(null)
    setError("")
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">Loading facilities...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-gold">Facilities Management</h1>
            <p className="text-ivory/60">Manage hotel amenities and services</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-charcoal border-gold">
              <DialogHeader>
                <DialogTitle className="text-gold">
                  {editingFacility ? "Edit Facility" : "Add New Facility"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-ivory">
                    Facility Name *
                  </Label>
                  <Input
                    id="name"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    required
                    className="bg-black border-gold text-ivory"
                    placeholder="e.g., Free WiFi, Swimming Pool"
                  />
                </div>

                {error && (
                  <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-xl text-sm">{error}</div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingFacility ? "Update Facility" : "Add Facility"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Total Facilities</p>
                  <p className="text-2xl font-bold text-gold">{facilities.length}</p>
                </div>
                <Settings className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facilities Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {facilities.map((facility) => (
            <Card key={facility.id} className="bg-charcoal border-gold hover:border-gold/60 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-ivory text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gold" />
                  {facility.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(facility)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(facility.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {facilities.length === 0 && (
          <div className="text-center py-16">
            <Settings className="w-16 h-16 text-ivory/20 mx-auto mb-4" />
            <p className="text-xl text-ivory/60 mb-4">No facilities found</p>
            <p className="text-ivory/40 mb-6">Add your first facility to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Facility
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
