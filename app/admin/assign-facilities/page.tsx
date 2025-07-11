"use client"

import { useState, useEffect } from "react"
import { supabase, type Room, type Facility } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LinkIcon, Bed, Settings, Save } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface RoomFacility {
  room_id: string
  facility_id: string
}

export default function AssignFacilities() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [roomFacilities, setRoomFacilities] = useState<RoomFacility[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      loadRoomFacilities(selectedRoom)
    }
  }, [selectedRoom, roomFacilities])

  const fetchData = async () => {
    try {
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase.from("rooms").select("*").order("name")

      if (roomsError) throw roomsError

      // Fetch facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from("facilities")
        .select("*")
        .order("name")

      if (facilitiesError) throw facilitiesError

      // Fetch room-facility relationships
      const { data: roomFacilitiesData, error: roomFacilitiesError } = await supabase
        .from("room_facilities")
        .select("room_id, facility_id")

      if (roomFacilitiesError) throw roomFacilitiesError

      setRooms(roomsData || [])
      setFacilities(facilitiesData || [])
      setRoomFacilities(roomFacilitiesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoomFacilities = (roomId: string) => {
    const roomFacilityIds = roomFacilities.filter((rf) => rf.room_id === roomId).map((rf) => rf.facility_id)
    setSelectedFacilities(roomFacilityIds)
  }

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    if (checked) {
      setSelectedFacilities((prev) => [...prev, facilityId])
    } else {
      setSelectedFacilities((prev) => prev.filter((id) => id !== facilityId))
    }
  }

  const handleSave = async () => {
    if (!selectedRoom) return

    setSaving(true)
    try {
      // First, remove all existing facilities for this room
      const { error: deleteError } = await supabase.from("room_facilities").delete().eq("room_id", selectedRoom)

      if (deleteError) throw deleteError

      // Then, add the selected facilities
      if (selectedFacilities.length > 0) {
        const roomFacilityData = selectedFacilities.map((facilityId) => ({
          room_id: selectedRoom,
          facility_id: facilityId,
        }))

        const { error: insertError } = await supabase.from("room_facilities").insert(roomFacilityData)

        if (insertError) throw insertError
      }

      // Refresh the data
      await fetchData()

      // Show success message (you could add a toast here)
      alert("Facilities updated successfully!")
    } catch (error) {
      console.error("Error saving facilities:", error)
      alert("Error saving facilities. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const getRoomFacilities = (roomId: string) => {
    const roomFacilityIds = roomFacilities.filter((rf) => rf.room_id === roomId).map((rf) => rf.facility_id)

    return facilities.filter((facility) => roomFacilityIds.includes(facility.id))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">Loading data...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-gold mb-2">Assign Facilities</h1>
          <p className="text-ivory/60">Manage which facilities are available in each room</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Assignment Panel */}
          <Card className="bg-charcoal border-gold">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Assign Facilities to Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Selection */}
              <div>
                <label className="block text-ivory mb-2 font-medium">Select Room</label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="bg-black border-gold text-ivory">
                    <SelectValue placeholder="Choose a room..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gold">
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} - ${room.price}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Facilities Selection */}
              {selectedRoom && (
                <div>
                  <label className="block text-ivory mb-4 font-medium">Available Facilities</label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {facilities.map((facility) => (
                      <div key={facility.id} className="flex items-center space-x-3 p-3 bg-black/50 rounded-xl">
                        <Checkbox
                          id={facility.id}
                          checked={selectedFacilities.includes(facility.id)}
                          onCheckedChange={(checked) => handleFacilityToggle(facility.id, checked as boolean)}
                          className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                        <label htmlFor={facility.id} className="text-ivory cursor-pointer flex-1">
                          {facility.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  {facilities.length === 0 && (
                    <p className="text-ivory/60 text-center py-8">No facilities available. Add facilities first.</p>
                  )}
                </div>
              )}

              {/* Save Button */}
              {selectedRoom && (
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Assignments"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Current Assignments Overview */}
          <Card className="bg-charcoal border-gold">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Current Room Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rooms.map((room) => {
                  const roomFacilitiesList = getRoomFacilities(room.id)
                  return (
                    <div key={room.id} className="p-4 bg-black/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-ivory">{room.name}</h3>
                        <Badge variant="outline" className="border-gold text-gold">
                          {roomFacilitiesList.length} facilities
                        </Badge>
                      </div>

                      {roomFacilitiesList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {roomFacilitiesList.map((facility) => (
                            <Badge key={facility.id} className="bg-gold/20 text-gold border-gold/40">
                              <Settings className="w-3 h-3 mr-1" />
                              {facility.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-ivory/60 text-sm">No facilities assigned</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {rooms.length === 0 && (
                <p className="text-ivory/60 text-center py-8">No rooms available. Add rooms first.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Total Rooms</p>
                  <p className="text-2xl font-bold text-gold">{rooms.length}</p>
                </div>
                <Bed className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>

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

          <Card className="bg-charcoal border-gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory/60 text-sm">Total Assignments</p>
                  <p className="text-2xl font-bold text-gold">{roomFacilities.length}</p>
                </div>
                <LinkIcon className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
