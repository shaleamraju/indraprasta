import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Phone, Mail, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const remoteImages = [
  {
    local: '/assets/CLIQ4797-copyjpg.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c992_a/image/upload/v1602743758/business/42d0c966-decc-4e3b-88be-be8c03306253/CLIQ4797-copyjpg.jpg',
    alt: 'Restaurant entrance facade with evening lighting'
  },
  {
    local: '/assets/shutterstock_548927521.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1551791787/category/shutterstock_548927521.jpg',
    alt: 'Elegant plated multi cuisine dish presentation'
  },
  {
    local: '/assets/shutterstock_724503046.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1568110680/category/shutterstock_724503046.jpg',
    alt: 'Room interior with ambient lighting'
  },
  {
    local: '/assets/shutterstock_1262587624.jpg',
    remote: 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1568029117/category/shutterstock_1262587624.jpg',
    alt: 'Chef preparing food in professional kitchen'
  }
];

export default function HotelContent() {
  const navigate = useNavigate();

  return (
    <main className="bg-hotel-background text-hotel-secondary">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={remoteImages[0].remote}
            alt="Hotel Luxury"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-hotel-background"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl text-white font-bold mb-6 leading-tight">
              Experience Luxury at <br />
              <span className="text-hotel-primary">Hotel Indraprastha</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              A sanctuary of elegance and comfort in the heart of Nandyala.
              Where world-class hospitality meets timeless luxury.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/booking')}
                className="px-8 py-4 bg-hotel-primary text-white rounded-full font-semibold text-lg hover:bg-hotel-primary/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
              >
                Book Your Stay <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#about_us"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Explore More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about_us" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src={remoteImages[2].remote}
              alt="Luxury Room"
              className="rounded-3xl shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-hotel-primary/20 rounded-full blur-3xl -z-0"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-hotel-secondary">Welcome to Indraprastha</h2>
            <div className="w-20 h-1.5 bg-hotel-primary rounded-full mb-6"></div>
            <p className="text-lg text-hotel-secondary/70 leading-relaxed">
              Visiting Nandyala and looking for a place to stay the night? Perhaps you’re a
              local looking for somewhere for friends or family to stay. Either way, Hotel DR
              Indraprastha is the right place for you.
            </p>
            <p className="text-lg text-hotel-secondary/70 leading-relaxed">
              We offer nothing less than top-notch rooms, amenities, and services. When you visit us, you’ll find that you have
              everything you need for a comfortable stay.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-hotel-primary w-6 h-6" />
                <span className="font-medium">Luxury Suites</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-hotel-primary w-6 h-6" />
                <span className="font-medium">Fine Dining</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-hotel-primary w-6 h-6" />
                <span className="font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-hotel-primary w-6 h-6" />
                <span className="font-medium">Free Wifi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-hotel-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">A Glimpse of Luxury</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Experience the blend of traditional hospitality and modern luxury.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 max-w-7xl mx-auto">
          {remoteImages.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative group overflow-hidden rounded-2xl aspect-[4/5]"
            >
              <img
                src={img.remote}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-medium">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-hotel-secondary mb-4">World-Class Amenities</h2>
          <div className="w-20 h-1.5 bg-hotel-primary rounded-full mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <MapPin />, label: 'Prime Location' },
            { icon: <CheckCircle />, label: 'Free High-Speed Wifi' },
            { icon: <Star />, label: 'Luxury Bedding' },
            { icon: <Phone />, label: '24/7 Room Service' },
            { icon: <CheckCircle />, label: 'Secure Parking' },
            { icon: <CheckCircle />, label: 'Wheelchair Accessible' },
            { icon: <CheckCircle />, label: 'Credit Cards Accepted' },
            { icon: <CheckCircle />, label: 'Child Friendly' },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-hotel-primary/10 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-hotel-primary/10 text-hotel-primary rounded-full mb-4">
                {item.icon}
              </div>
              <span className="font-semibold text-hotel-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-hotel-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-hotel-secondary mb-12">Guest Experiences</h2>
          <div className="bg-white p-12 rounded-3xl shadow-xl relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-hotel-primary text-white p-3 rounded-full">
              <Star className="w-8 h-8 fill-current" />
            </div>
            <blockquote className="text-2xl italic text-hotel-secondary/80 leading-relaxed mb-8">
              "Excellent quality service, recommended A++. The staff was incredibly helpful and the rooms were spotless. A truly wonderful stay in Nandyala!"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-hotel-primary/20 rounded-full flex items-center justify-center text-hotel-primary font-bold">
                SK
              </div>
              <div className="text-left">
                <p className="font-bold text-hotel-secondary">Singh Kishan</p>
                <p className="text-sm text-hotel-secondary/50">Visited Oct 2020</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact_us" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="bg-hotel-secondary rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
          <div className="p-12 text-white flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-hotel-primary rounded-lg"><MapPin className="w-6 h-6" /></div>
                <p className="text-lg text-white/80">Padmavathi Nagar, Nandyala, AP, 518501</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-hotel-primary rounded-lg"><Phone className="w-6 h-6" /></div>
                <p className="text-lg text-white/80">078936 61133</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-hotel-primary rounded-lg"><Mail className="w-6 h-6" /></div>
                <p className="text-lg text-white/80">drhotels.ndl@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="bg-hotel-primary/10 p-12 flex items-center justify-center">
             <div className="text-center">
                <p className="text-2xl font-bold text-hotel-secondary mb-4">Ready for a break?</p>
                <button
                  onClick={() => navigate('/booking')}
                  className="px-8 py-4 bg-hotel-secondary text-white rounded-full font-semibold hover:bg-hotel-secondary/90 transition-all"
                >
                  Reserve Now
                </button>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
