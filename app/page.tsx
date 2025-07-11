"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown, Sparkles, Waves, Utensils, Car, Wifi, Dumbbell } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
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

const facilities = [
  { icon: Sparkles, name: "Luxury Spa", description: "Rejuvenate your senses with our world-class spa treatments" },
  { icon: Waves, name: "Infinity Pool", description: "Swim in our stunning rooftop infinity pool with city views" },
  {
    icon: Utensils,
    name: "Fine Dining",
    description: "Experience culinary excellence at our award-winning restaurant",
  },
  { icon: Car, name: "Valet Service", description: "Premium valet parking and concierge services" },
  { icon: Wifi, name: "High-Speed WiFi", description: "Stay connected with complimentary high-speed internet" },
  { icon: Dumbbell, name: "Fitness Center", description: "State-of-the-art fitness facilities available 24/7" },
]

const testimonials = [
  {
    quote: "An absolutely magical experience. The attention to detail and service quality exceeded all expectations.",
    name: "Sarah Johnson",
    date: "December 2024",
  },
  {
    quote: "HotelVerse redefined luxury for me. Every moment was crafted to perfection.",
    name: "Michael Chen",
    date: "November 2024",
  },
  {
    quote: "From the moment I arrived until checkout, I felt like royalty. Truly exceptional.",
    name: "Emma Rodriguez",
    date: "October 2024",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Luxury Hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="font-playfair text-6xl md:text-8xl font-bold text-gold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            HotelVerse
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-ivory mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Your Premium Escape Begins Here.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link href="/rooms">
              <Button size="lg" className="text-lg px-8 py-4">
                Discover Our Rooms
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-gold" />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-6">
                Where Elegance Meets Comfort
              </h2>
              <p className="text-lg text-ivory leading-relaxed mb-6">
                At HotelVerse, we believe that luxury is not just about opulent surroundings, but about creating
                unforgettable experiences that touch the soul. Our commitment to excellence is reflected in every
                detail, from our meticulously designed suites to our personalized service that anticipates your every
                need.
              </p>
              <p className="text-lg text-ivory leading-relaxed">
                Step into a world where sophistication meets warmth, where every moment is crafted to perfection, and
                where your comfort is our greatest achievement.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Hotel Lobby"
                width={800}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp} viewport={{ once: true }}>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-4">Luxury at Your Fingertips</h2>
            <p className="text-xl text-ivory max-w-2xl mx-auto">
              Discover our world-class amenities designed to elevate your stay
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-charcoal p-8 rounded-2xl hover:scale-105 transition-all duration-300 glow-gold hover:shadow-xl group"
              >
                <facility.icon className="w-12 h-12 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-ivory mb-3">{facility.name}</h3>
                <p className="text-ivory/80">{facility.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-charcoal">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp} viewport={{ once: true }}>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-4">See It Before You Stay</h2>
            <p className="text-xl text-ivory">A glimpse into the luxury that awaits you</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative overflow-hidden rounded-2xl group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={`/placeholder.svg?height=400&width=600&text=Gallery+${index}`}
                  alt={`Hotel Gallery ${index}`}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp} viewport={{ once: true }}>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-4">Words from Our Guests</h2>
            <p className="text-xl text-ivory">Discover what makes HotelVerse extraordinary</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-charcoal p-8 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-gold text-4xl mb-4">"</div>
                <p className="text-ivory italic mb-6 text-lg leading-relaxed">{testimonial.quote}</p>
                <div className="border-t border-gold/20 pt-4">
                  <p className="text-gold font-semibold">{testimonial.name}</p>
                  <p className="text-ivory/60 text-sm">{testimonial.date}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-charcoal">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-6">Get in Touch</h2>
            <p className="text-xl text-ivory mb-8 max-w-2xl mx-auto">
              Ready to experience luxury? Contact us for reservations and inquiries.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <h3 className="text-gold font-semibold mb-2">Phone</h3>
                <p className="text-ivory">+1 (555) 123-4567</p>
              </div>
              <div className="text-center">
                <h3 className="text-gold font-semibold mb-2">Email</h3>
                <p className="text-ivory">info@hotelverse.com</p>
              </div>
              <div className="text-center">
                <h3 className="text-gold font-semibold mb-2">Address</h3>
                <p className="text-ivory">123 Luxury Ave, Paradise City</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 gold-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to experience the extraordinary?
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Your luxury escape is just one click away. Book now and step into a world of unparalleled elegance.
            </p>
            <Link href="/rooms">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-gold bg-transparent"
              >
                Book Your Stay Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
