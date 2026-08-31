import React, { useState } from 'react';
import { apiFetch } from '../api/client.js';
import { motion } from 'framer-motion';
import { Search, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackBooking() {
  const [query, setQuery] = useState({ bookingId: '', email: '' });
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleTrack(e) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      const data = await apiFetch(`/api/public/booking/${query.bookingId}`);
      if (data.email !== query.email) {
        throw new Error('Email does not match this booking record');
      }
      setBooking(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Booking not found');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-hotel-background flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-hotel-secondary mb-4">Track Your Booking</h2>
          <p className="text-gray-500">Enter your details to view your reservation status.</p>
        </div>

        {status === 'idle' || status === 'error' || status === 'loading' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-hotel-primary/10"
          >
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Booking ID*</label>
                  <input
                    value={query.bookingId}
                    onChange={e => setQuery({...query, bookingId: e.target.value})}
                    placeholder="Paste your ID here"
                    required
                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-hotel-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Registered Email*</label>
                  <input
                    type="email"
                    value={query.email}
                    onChange={e => setQuery({...query, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-hotel-primary outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-hotel-primary text-white rounded-xl font-semibold hover:bg-hotel-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-300"
              >
                {status === 'loading' ? 'Searching...' : <><Search className="w-5 h-5" /> Track Booking</>}
              </button>
            </form>
            {status === 'error' && (
              <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-xl flex items-center gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-8 bg-hotel-secondary text-white flex justify-between items-center">
              <div>
                <p className="text-hotel-primary font-bold text-xs uppercase mb-1">Booking Found</p>
                <h3 className="text-2xl font-bold">Reservation Details</h3>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs uppercase mb-1">ID</p>
                <p className="font-mono font-bold">#{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> Guest
                  </h4>
                  <p className="font-bold text-hotel-secondary text-lg">{booking.name}</p>
                  <p className="text-sm text-gray-500">{booking.email}</p>
                  <p className="text-sm text-gray-500">{booking.phone}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Stay Info
                  </h4>
                  <p className="font-bold text-hotel-secondary text-lg">{booking.date}</p>
                  <p className="text-sm text-gray-500">Rooms: {booking.rooms} ({booking.roomNumbers.join(', ')})</p>
                  <p className="text-sm text-gray-500">Payment: {booking.payment}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.open(`/api/receipts-view/receipt-${booking.id}.pdf`, '_blank')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-hotel-primary text-white rounded-2xl font-semibold hover:bg-hotel-primary/90 transition-all shadow-lg"
                >
                  <Download className="w-5 h-5" /> Download Receipt
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-hotel-secondary rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                >
                  <Home className="w-5 h-5" /> Return Home
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
