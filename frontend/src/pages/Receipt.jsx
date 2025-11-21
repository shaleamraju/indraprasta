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
      // For public access, we'll need to get booking info
      // In production, you might want to secure this with a token sent via email
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
      <section className="section receipt-page">
        <div className="receipt-container">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="section receipt-page">
        <div className="receipt-container">
          <div className="error-box">
            <h2>❌ {error || 'Booking not found'}</h2>
            <button className="primary-btn" onClick={() => navigate('/booking')}>
              Make a Booking
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section receipt-page">
      <div className="receipt-container">
        <div className="receipt-header">
          <h1>🎉 Booking Confirmed!</h1>
          <p className="success-message">Thank you for your booking. A confirmation email has been sent to {booking.email}</p>
        </div>

        <div className="receipt-card">
          <div className="receipt-title">
            <h2>Booking Receipt</h2>
            <span className="booking-id">ID: {booking.id}</span>
          </div>

          <div className="receipt-section">
            <h3>Customer Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">{booking.name}</span>
              </div>
              {booking.email && (
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{booking.email}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{booking.phone}</span>
              </div>
              {booking.address && (
                <div className="detail-item">
                  <span className="label">Address:</span>
                  <span className="value">{booking.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="receipt-section">
            <h3>Booking Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Check-in Date:</span>
                <span className="value">{booking.date}</span>
              </div>
              <div className="detail-item">
                <span className="label">Number of Rooms:</span>
                <span className="value">{booking.rooms}</span>
              </div>
              <div className="detail-item">
                <span className="label">Room Numbers:</span>
                <span className="value rooms-list">{booking.roomNumbers.join(', ')}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment:</span>
                <span className="value">{booking.payment}</span>
              </div>
              <div className="detail-item">
                <span className="label">Booking Date:</span>
                <span className="value">{new Date(booking.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="receipt-actions">
            <button className="primary-btn" onClick={downloadReceipt}>
              📄 Download PDF Receipt
            </button>
            <button className="ghost-btn" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Please keep this receipt for your records.</p>
          <p>For any queries, please contact us with your Booking ID.</p>
        </div>
      </div>
    </section>
  );
}
