import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import './Booking.css';

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', date: '', payment: '', document: null
  });
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ bookedRooms: [], availableRooms: [] });
  const [roomInfo, setRoomInfo] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRoomInfo() {
      try {
        const info = await apiFetch('/api/rooms/info');
        setRoomInfo(info);
      } catch (err) {
        console.error('Failed to fetch room info', err);
      }
    }
    fetchRoomInfo();
  }, []);

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

  function getRoomType(roomNum) {
    const info = roomInfo.find(r => roomNum >= r.range[0] && roomNum <= r.range[1]);
    return info || { type: 'Standard', price: 2000 };
  }

  const calculateTotal = () => {
    return selectedRooms.reduce((sum, r) => sum + getRoomType(r).price, 0);
  };

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
      const booking = await apiFetch('/api/bookings', { method: 'POST', body: fd });
      navigate(`/receipt/${booking.id}`);
    } catch (err) {
      setStatus(null);
      setError(err.message);
    }
  }

  return (
    <section className="booking-page">
      <div className="booking-header">
        <h2>Reserve Your Stay</h2>
        <p>Follow the steps below to book your luxury experience.</p>

        <div className="step-indicator">
          {[1, 2, 3].map(s => (
            <div key={s} className="step-item">
              <div className={`step-circle ${step === s ? 'current' : step > s ? 'completed' : ''}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`step-line ${step > s ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="booking-card">
        {step === 1 && (
          <div className="booking-step">
            <div className="step-title">
              <span className="step-icon">📅</span>
              <h3>Select Date</h3>
            </div>

            <div className="date-selector">
              <label>When are you visiting us?</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
              {form.date && (
                <p className="date-hint">
                  {roomStatus.availableRooms.length} rooms available for this date.
                </p>
              )}
            </div>

            <div className="step-actions">
              <button
                disabled={!form.date}
                onClick={() => setStep(2)}
                className="btn-primary"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step">
            <div className="step-title">
              <span className="step-icon">🏨</span>
              <h3>Choose Your Rooms</h3>
            </div>

            <div className="room-selection-container">
              <div className="room-grid-wrapper">
                <div className="room-legend">
                  <div className="legend-item"><span className="dot available"></span> Available</div>
                  <div className="legend-item"><span className="dot selected"></span> Selected</div>
                  <div className="legend-item"><span className="dot booked"></span> Booked</div>
                </div>
                <div className="rooms-grid">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                    const isBooked = roomStatus.bookedRooms.includes(roomNum);
                    const isSelected = selectedRooms.includes(roomNum);
                    const { type } = getRoomType(roomNum);
                    return (
                      <button
                        key={roomNum}
                        type="button"
                        className={`room-cell ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => !isBooked && toggleRoom(roomNum)}
                        disabled={isBooked}
                        title={`${type} Room`}
                      >
                        {roomNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <div className="summary-list">
                  {selectedRooms.length === 0 && <p className="empty-text">No rooms selected yet.</p>}
                  {selectedRooms.map(r => (
                    <div key={r} className="summary-item">
                      <span>Room {r} ({getRoomType(r).type})</span>
                      <div className="summary-price-wrap">
                        <span className="price">₹{getRoomType(r).price}</span>
                        <button onClick={() => toggleRoom(r)} className="remove-btn">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span className="total-amount">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button
                disabled={selectedRooms.length === 0}
                onClick={() => setStep(3)}
                className="btn-primary"
              >
                Enter Details →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="booking-step">
            <div className="step-title">
              <span className="step-icon">👤</span>
              <h3>Guest Details</h3>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-grid">
                <div className="field">
                  <label>Full Name*</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Email Address*</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Phone Number*</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Payment Reference / Mode</label>
                  <input name="payment" value={form.payment} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Identity Proof (PDF/Image)</label>
                  <input type="file" name="document" accept="image/*,.pdf" onChange={handleChange} />
                </div>
              </div>

              <div className="step-actions">
                <button type="button" onClick={() => setStep(2)} className="btn-ghost">Back to Rooms</button>
                <button type="submit" className="btn-primary">Confirm Booking ✓</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="feedback-area">
        {status && <span className="success-text">{status}</span>}
        {error && <span className="error-text">{error}</span>}
      </div>
    </section>
  );
}
