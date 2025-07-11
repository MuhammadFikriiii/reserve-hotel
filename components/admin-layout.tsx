"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Bed, Calendar, Settings, LogOut, Menu, X, BarChart3, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  const sidebarItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Rooms", href: "/admin/rooms", icon: Bed },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Facilities", href: "/admin/facilities", icon: Settings },
    { name: "Assign Facilities", href: "/admin/assign-facilities", icon: LinkIcon },
  ]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push("/admin/login")
    } else {
      setUser(session.user)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-gold/20 lg:static"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between p-6 border-b border-gold/20">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-playfair font-bold text-gold">HotelVerse</span>
                </Link>
                <button
                  className="lg:hidden text-ivory hover:text-gold transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-gold text-black font-medium shadow-lg"
                        : "text-ivory hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* User Info & Logout */}
              <div className="p-4 border-t border-gold/20">
                {user && (
                  <div className="mb-4 p-3 bg-black/50 rounded-xl">
                    <p className="text-sm text-ivory/60">Logged in as</p>
                    <p className="text-ivory font-medium truncate">{user.email}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Link href="/">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Home className="w-4 h-4 mr-2" />
                      View Website
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarOpen ? "0" : "0" }}>
        {/* Header with Toggle */}
        <header className="bg-charcoal border-b border-gold/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="text-ivory hover:text-gold transition-colors p-2 rounded-lg hover:bg-gold/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden">
              <span className="text-lg font-playfair font-bold text-gold">Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
