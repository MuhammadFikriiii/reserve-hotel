"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase, type Room } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Upload, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminLayout from "@/components/admin-layout"

// --- Supabase Storage Bucket Name ---
// Make sure you have a bucket named 'room_images' in your Supabase project.
// The bucket should have appropriate access policies. For this example, we'll
// assume a public bucket for simplicity, but you should configure policies
// based on your security requirements.
const STORAGE_BUCKET = "room-images";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_file: null as File | null,
    status: "available" as const,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchRooms()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push("/admin/login")
    }
  }

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error("Error fetching rooms:", error)
      // Here you might want to show a toast notification to the user
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, image_file: file }))

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // If no file is selected, revert to the original image if editing
      setImagePreview(editingRoom ? editingRoom.image_url : null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = editingRoom ? editingRoom.image_url : null;

      // --- FIXED: Image Upload Logic ---
      // If a new image file is selected, upload it to Supabase Storage.
      if (formData.image_file) {
        const file = formData.image_file;
        // Create a unique file name to avoid conflicts
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const filePath = `${fileName}`;

        // If we are editing and there was a previous image, delete it from storage.
        if (editingRoom?.image_url) {
            const oldImageKey = editingRoom.image_url.split(`${STORAGE_BUCKET}/`).pop();
            if (oldImageKey) {
                await supabase.storage.from(STORAGE_BUCKET).remove([oldImageKey]);
            }
        }

        // Upload the new image.
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // Get the public URL of the newly uploaded image.
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const roomData = {
        name: formData.name,
        description: formData.description || null,
        price: Number.parseInt(formData.price),
        image_url: imageUrl, // Use the new or existing URL
        status: formData.status,
      }

      // --- Database Operation ---
      if (editingRoom) {
        // Update existing room
        const { error } = await supabase.from("rooms").update(roomData).eq("id", editingRoom.id)
        if (error) throw error
      } else {
        // Insert new room
        const { error } = await supabase.from("rooms").insert([roomData])
        if (error) throw error
      }

      await fetchRooms() // Re-fetch all rooms to update the list
      closeDialog()
    } catch (error) {
      console.error("Error saving room:", error)
      // You should display this error to the user (e.g., using a toast library)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description || "",
      price: room.price.toString(),
      image_file: null, // Reset file input
      status: room.status,
    })
    setImagePreview(room.image_url) // Show current image
    setIsDialogOpen(true)
  }

  const handleDelete = async (room: Room) => {
    // Using a custom modal is better than window.confirm in a real app
    if (!window.confirm(`Are you sure you want to delete "${room.name}"?`)) return

    try {
      // --- FIXED: Delete image from storage first ---
      if (room.image_url) {
        const imageKey = room.image_url.split(`${STORAGE_BUCKET}/`).pop();
        if (imageKey) {
          const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([imageKey]);
          if (storageError) {
            // Log the error but proceed with deleting the DB record
            console.error("Could not delete image from storage:", storageError.message);
          }
        }
      }

      // Delete the room record from the database
      const { error } = await supabase.from("rooms").delete().eq("id", room.id)
      if (error) throw error
      
      // Optimistically update UI instead of re-fetching
      setRooms(prevRooms => prevRooms.filter(r => r.id !== room.id));

    } catch (error) {
      console.error("Error deleting room:", error)
      // Show an error message to the user
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_file: null,
      status: "available",
    })
    setEditingRoom(null)
    setImagePreview(null)
    setIsSubmitting(false)
  }

  const closeDialog = () => {
      resetForm();
      setIsDialogOpen(false);
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
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">Loading rooms...</div>
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
            <h1 className="text-3xl font-playfair font-bold text-gold">Room Management</h1>
            <p className="text-ivory/60">Manage your hotel rooms</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-charcoal border-gold max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gold">{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-ivory">
                      Room Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="bg-black border-gold text-ivory"
                      placeholder="Presidential Suite"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-ivory">
                      Price per Night *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      required
                      className="bg-black border-gold text-ivory"
                      placeholder="299"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-ivory">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="bg-black border-gold text-ivory"
                    placeholder="Describe the room features and amenities..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image_file" className="text-ivory flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Room Image
                    </Label>
                    <div className="space-y-3">
                      <Input
                        id="image_file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-black border-gold text-ivory file:bg-gold file:text-black file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3 file:cursor-pointer hover:file:bg-gold/90"
                      />
                      {imagePreview && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gold/30">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" onError={() => setImagePreview('/placeholder.svg')} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-ivory">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="bg-black border-gold text-ivory">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gold">
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (editingRoom ? "Update Room" : "Add Room")}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {rooms.map((room) => (
            <Card key={room.id} className="bg-charcoal border-gold hover:border-gold/60 transition-colors">
              <div className="relative">
                <Image
                  src={room.image_url || `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(room.name)}`}
                  alt={room.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-2 right-2 ${getStatusColor(room.status)} text-white`}>
                  {room.status}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-gold">{room.name}</CardTitle>
                <p className="text-2xl font-bold text-ivory">
                  ${room.price}
                  <span className="text-sm text-ivory/60">/night</span>
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-ivory/80 text-sm mb-4 line-clamp-2">
                  {room.description || "No description available"}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(room)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(room)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {rooms.length === 0 && !loading && (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-ivory/20 mx-auto mb-4" />
            <p className="text-xl text-ivory/60 mb-4">No rooms found</p>
            <p className="text-ivory/40 mb-6">Add your first room to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Room
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
