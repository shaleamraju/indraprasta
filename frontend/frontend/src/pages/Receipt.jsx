import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import './Receipt.css';

export default function Receipt() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  async function fetchBookingDetails() {
    try {
      const response = await apiFetch(`/api/public/booking/${bookingId}`);
      setBooking(response);
    } catch (err) {
      setError('Booking not found');
    } finally {
      setLoading(false);
    }
  }

  function downloadReceipt() {
    window.open(`/api/receipts-view/receipt-${bookingId}.pdf`, '_blank');
  }

  if (loading) {
    return (
      <div className="receipt-loading">
        <div className="spinner"></div>
        <p>Retrieving your booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="receipt-error">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'Booking not found'}</h2>
          <p>We couldn't find a booking with that ID. Please check the ID or contact support.</p>
          <button className="btn-primary" onClick={() => navigate('/booking')}>
            Make a New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <div className="receipt-header">
        <div className="success-badge">✓</div>
        <h1>Booking Confirmed!</h1>
        <p>Your luxury experience is now reserved.</p>
      </div>

      <div className="receipt-ticket">
        <div className="ticket-top">
          <div className="ticket-brand">
            <p className="brand-label">Booking Receipt</p>
            <h2>Hotel Indraprastha</h2>
          </div>
          <div className="ticket-id">
            <p className="id-label">Booking ID</p>
            <p className="id-value">#{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="ticket-divider">
          <div className="perforation"></div>
        </div>

        <div className="ticket-bottom">
          <div className="ticket-details">
            <div className="detail-group">
              <h3>Guest Information</h3>
              <p className="guest-name">{booking.name}</p>
              <p className="guest-info">{booking.email}</p>
              <p className="guest-info">{booking.phone}</p>
              {booking.address && <p className="guest-info">{booking.address}</p>}
            </div>
            <div className="detail-group">
              <h3>Stay Info</h3>
              <p className="info-row"><span>Date:</span> <strong>{booking.date}</strong></p>
              <p className="info-row"><span>Rooms:</span> <strong>{booking.rooms} ({booking.roomNumbers.join(', ')})</strong></p>
              <p className="info-row"><span>Payment:</span> <strong>{booking.payment}</strong></p>
            </div>
          </div>

          <div className="ticket-actions">
            <button className="btn-primary" onClick={downloadReceipt}>
              Download PDF Receipt
            </button>
            <button className="btn-ghost" onClick={() => navigate('/')}>
              Return Home
            </button>
          </div>
        </div>
      </div>

      <p className="receipt-footer">
        Please present this digital receipt upon check-in. <br />
        For support, contact us with your Booking ID: {booking.id}
      </p>
    </div>
  );
}
