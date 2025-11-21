import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';
import './Booking.css';

export default function Booking() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', date: '', payment: '', document: null
  });
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ bookedRooms: [], availableRooms: [] });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (form.date) {
      fetchRoomStatus();
    }
  }, [form.date]);

  async function fetchRoomStatus() {
    if (!form.date) return;
    try {
      const data = await apiFetch(`/api/rooms/status?date=${encodeURIComponent(form.date)}`);
      setRoomStatus(data);
      setSelectedRooms([]);
    } catch (err) {
      setError('Failed to fetch room availability');
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function toggleRoom(roomNum) {
    setSelectedRooms(prev => {
      if (prev.includes(roomNum)) {
        return prev.filter(r => r !== roomNum);
      } else {
        return [...prev, roomNum];
      }
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedRooms.length === 0) {
      setError('Please select at least one room');
      return;
    }
    setStatus('Submitting...');
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (v) fd.append(k, v); });
      fd.append('roomNumbers', JSON.stringify(selectedRooms));
      await apiFetch('/api/bookings', { method: 'POST', body: fd });
      setStatus('Booking successful');
      setForm({ name:'', email:'', phone:'', address:'', date:'', payment:'', document:null });
      setSelectedRooms([]);
      fetchRoomStatus();
    } catch (err) {
      setStatus(null);
      setError(err.message);
    }
  }

  return (
    <section id="booking_page" className="section booking clean-panel">
      <div className="panel-header">
        <h2>Book a Room</h2>
        <p className="panel-desc">
          We have 30 total rooms. 
          {form.date && ` For ${form.date}: ${roomStatus.availableRooms.length} available, ${roomStatus.bookedRooms.length} booked.`}
        </p>
      </div>

      {form.date && (
        <div className="room-selector card-block">
          <h3>Select Rooms (Selected: {selectedRooms.length})</h3>
          <div className="rooms-grid">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
              const isBooked = roomStatus.bookedRooms.includes(roomNum);
              const isSelected = selectedRooms.includes(roomNum);
              return (
                <button
                  key={roomNum}
                  type="button"
                  className={`room-cell ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isBooked && toggleRoom(roomNum)}
                  disabled={isBooked}
                >
                  {roomNum}
                </button>
              );
            })}
          </div>
          <div className="room-legend">
            <span className="legend-item"><span className="dot available"></span> Available</span>
            <span className="legend-item"><span className="dot selected"></span> Selected</span>
            <span className="legend-item"><span className="dot booked"></span> Booked</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form" encType="multipart/form-data" noValidate>
        <div className="form-grid">
          <div className="field">
            <label>Date*</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Name*</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email*</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Phone*</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Payment Ref / Mode</label>
            <input name="payment" value={form.payment} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Document (ID Proof)</label>
            <input type="file" name="document" accept="image/*,.pdf" onChange={handleChange} />
          </div>
        </div>
        <div className="actions-row">
          <button type="submit" className="primary-btn">Submit Booking</button>
          <button type="button" className="ghost-btn" onClick={() => { setForm({ name:'', email:'', phone:'', address:'', date:'', payment:'', document:null }); setSelectedRooms([]); setStatus(null); setError(null); }}>Reset</button>
        </div>
      </form>
      <div className="feedback">
        {status && <span className="success-text">{status}</span>}
        {error && <span className="error-text">{error}</span>}
      </div>
    </section>
  );
}
