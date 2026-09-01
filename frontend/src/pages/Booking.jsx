import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, CreditCard, FileText, CheckCircle, AlertCircle, Trash2, Hotel, ArrowRight } from 'lucide-react';

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
    <section className="min-h-screen py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-hotel-secondary mb-4">Reserve Your Stay</h2>
        <p className="text-hotel-secondary/60 text-lg">Follow the steps below to book your luxury experience.</p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mt-12">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                step === s ? 'bg-hotel-primary text-white scale-110 shadow-lg ring-4 ring-hotel-primary/20' :
                step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 bg-gray-200 transition-colors duration-300 ${step > s ? 'bg-green-500' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-hotel-primary/10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <Calendar className="text-hotel-primary w-8 h-8" />
                <h3 className="text-3xl font-bold">Select Date</h3>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <label className="block text-center text-base font-medium text-gray-600">When are you visiting us?</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full p-4 text-center text-xl border-2 border-hotel-primary/20 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm"
                  required
                />
                {form.date && (
                  <p className="text-center text-base text-hotel-secondary/60">
                    {roomStatus.availableRooms.length} rooms available for this date.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-12">
                <button
                  disabled={!form.date}
                  onClick={() => setStep(2)}
                  className="px-10 py-4 bg-hotel-primary text-white rounded-full font-semibold text-lg hover:bg-hotel-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                >
                  Next Step <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <Hotel className="text-hotel-primary w-8 h-8" />
                <h3 className="text-3xl font-bold">Choose Your Rooms</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-6 text-xs font-medium">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></span> Available</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-hotel-primary"></span> Selected</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300"></span> Booked</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                      const isBooked = roomStatus.bookedRooms.includes(roomNum);
                      const isSelected = selectedRooms.includes(roomNum);
                      const { type } = getRoomType(roomNum);
                      return (
                        <button
                          key={roomNum}
                          type="button"
                          className={`h-14 rounded-xl font-bold transition-all relative group ${
                            isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                            isSelected ? 'bg-hotel-primary text-white shadow-lg scale-110' : 'bg-white text-hotel-secondary border-2 border-gray-100 hover:border-hotel-primary'
                          }`}
                          onClick={() => !isBooked && toggleRoom(roomNum)}
                          disabled={isBooked}
                        >
                          {roomNum}
                          {!isBooked && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[11px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                              {type} Room
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-hotel-primary/5 p-8 rounded-3xl border border-hotel-primary/10 space-y-8">
                  <h4 className="font-bold text-2xl">Booking Summary</h4>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {selectedRooms.length === 0 && <p className="text-sm text-gray-500 italic">No rooms selected yet.</p>}
                    {selectedRooms.map(r => (
                      <div key={r} className="flex justify-between items-center text-sm py-3 border-b border-gray-100 group">
                        <span className="font-medium">Room {r} ({getRoomType(r).type})</span>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-hotel-primary">₹{getRoomType(r).price}</span>
                          <button onClick={() => toggleRoom(r)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span>Total</span>
                      <span className="text-hotel-primary">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-12">
                <button onClick={() => setStep(1)} className="px-8 py-3 text-gray-500 font-semibold hover:text-hotel-secondary transition-all">
                  Back
                </button>
                <button
                  disabled={selectedRooms.length === 0}
                  onClick={() => setStep(3)}
                  className="px-10 py-4 bg-hotel-primary text-white rounded-full font-semibold text-lg hover:bg-hotel-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                >
                  Enter Details <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <User className="text-hotel-primary w-8 h-8" />
                <h3 className="text-3xl font-bold">Guest Details</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Full Name*</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Email Address*</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Phone Number*</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <input name="address" value={form.address} onChange={handleChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Reference / Mode
                    </label>
                    <input name="payment" value={form.payment} onChange={handleChange} placeholder="e.g. UPI Transaction ID or Credit Card" className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Identity Proof (PDF/Image)
                    </label>
                    <input type="file" name="document" accept="image/*,.pdf" onChange={handleChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-hotel-primary/10 file:text-hotel-primary hover:file:bg-hotel-primary/20" />
                  </div>
                </div>

                <div className="pt-12 flex justify-between items-center">
                  <button type="button" onClick={() => setStep(2)} className="px-8 py-3 text-gray-500 font-semibold hover:text-hotel-secondary transition-all">
                    Back to Rooms
                  </button>
                  <button type="submit" className="px-10 py-4 bg-hotel-primary text-white rounded-full font-semibold text-lg hover:bg-hotel-primary-dark transition-all shadow-lg flex items-center gap-2 transform hover:scale-105">
                    Confirm Booking <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <div className="text-center">
                {status && <span className="text-blue-500 font-medium">{status}</span>}
                {error && <div className="flex items-center justify-center gap-2 text-red-500 font-medium"><AlertCircle className="w-5 h-5" /> {error}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
