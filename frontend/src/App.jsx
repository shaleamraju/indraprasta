import React from 'react'
import './App.css'
import NavBar from './components/NavBar.jsx'
import HotelContent from './pages/HotelContent.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'
import Receipt from './pages/Receipt.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {
 

  return (

      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<HotelContent />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/receipt/:bookingId" element={<Receipt />} />
        </Routes>
      </div>

  )
}

export default App
