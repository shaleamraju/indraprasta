import React from 'react'
import './App.css'
import NavBar from './components/NavBar.jsx'
import HotelContent from './pages/HotelContent.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {
 

  return (

      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<HotelContent />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>

  )
}

export default App
