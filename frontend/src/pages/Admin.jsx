import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, authHeaders } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LogOut, RefreshCw, ShieldAlert, UserCircle,
  LayoutDashboard, Bed, BookOpen, FileText,
  Settings, CheckCircle, AlertCircle, Trash2, Plus, Hotel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const { token, login: ctxLogin, logout: ctxLogout, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [offline, setOffline] = useState({ name:'', phone:'', date:'', payment:'', document:null });
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ bookedRooms: [], availableRooms: [] });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [pwFields, setPwFields] = useState({ oldPassword:'', newPassword:'', confirm:'' });
  const [showPwForm, setShowPwForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [viewDate, setViewDate] = useState('');
  const [viewRoomStatus, setViewRoomStatus] = useState({ bookedRooms: [], availableRooms: [] });
  const [activeTab, setActiveTab] = useState('dashboard');

  function handleLoginField(e) {
    const { name, value } = e.target; setCreds(c => ({...c, [name]: value}));
  }

  async function login(e) {
    e.preventDefault();
    setStatus('Logging in...'); setError(null);
    try {
      const data = await apiFetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(creds)});
      ctxLogin(data.token, creds.username);
      setStatus('Logged in');
      setError(null);
      setCreds({ username: '', password: '' });
    } catch(err) { setStatus(null); setError(err.message); }
  }

  const logout = useCallback(() => {
    ctxLogout();
    setBookings([]);
  }, [ctxLogout]);

  function handlePwChange(e){
    const { name, value } = e.target; setPwFields(f=>({...f,[name]:value}));
  }
  async function submitPasswordChange(e){
    e.preventDefault(); if(!token) return;
    setStatus('Changing password...'); setError(null);
    if(pwFields.newPassword !== pwFields.confirm){ setStatus(null); setError('New passwords do not match'); return; }
    try {
      await apiFetch('/api/admin/change-password', { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders(token) }, body: JSON.stringify({ oldPassword: pwFields.oldPassword, newPassword: pwFields.newPassword }) });
      setStatus('Password changed. Please login again.');
      setPwFields({ oldPassword:'', newPassword:'', confirm:'' });
      logout();
    } catch(err){ setStatus(null); setError(err.message); }
  }

  async function submitPasswordReset(e){
    e.preventDefault();
    setStatus('Resetting password...'); setError(null);
    try {
      await apiFetch('/api/admin/reset-password', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ username: resetUsername }) });
      setStatus('Password reset successfully. Use default credentials (admin/secret123) to login.');
      setResetUsername('');
      setShowResetForm(false);
    } catch(err){ setStatus(null); setError(err.message); }
  }

  const fetchBookings = useCallback(async ()=>{
    if(!token) return; setStatus('Loading bookings...'); setError(null);
    try {
      const data = await apiFetch('/api/admin/bookings', { headers: { ...authHeaders(token) } });
      setBookings(data); setStatus(null);
    } catch(err) {
      setStatus(null);
      setError(err.message);
      if(err.message.includes('Invalid token') || err.message.includes('auth')) {
        logout();
      }
    }
  }, [token, logout]);

  const fetchRoomStatus = useCallback(async () => {
    if (!token || !offline.date) return;
    try {
      const data = await apiFetch(`/api/rooms/status?date=${encodeURIComponent(offline.date)}`);
      setRoomStatus(data);
      setSelectedRooms([]);
    } catch {
      setError('Failed to fetch room status');
    }
  }, [token, offline.date]);

  const fetchViewRoomStatus = useCallback(async () => {
    if (!token || !viewDate) return;
    try {
      const data = await apiFetch(`/api/rooms/status?date=${encodeURIComponent(viewDate)}`);
      setViewRoomStatus(data);
    } catch {
      setError('Failed to fetch room status');
    }
  }, [token, viewDate]);

  async function toggleViewRoom(roomNumber) {
    if (!token || !viewDate) return;
    setStatus('Updating room status...');
    setError(null);
    try {
      const result = await apiFetch('/api/admin/rooms/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ date: viewDate, roomNumber })
      });
      setStatus(`Room ${roomNumber} ${result.action}`);
      setTimeout(() => setStatus(null), 2000);
      fetchViewRoomStatus();
      fetchBookings();
    } catch (err) {
      setStatus(null);
      setError(err.message);
    }
  }

  function handleOfflineChange(e){
    const { name, value, files } = e.target;
    if(files){ setOffline(o=>({...o, [name]: files[0]})); } else { setOffline(o=>({...o, [name]: value})); }
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

  async function submitOffline(e){
    e.preventDefault(); if(!token) return;
    if (selectedRooms.length === 0) {
      setError('Please select at least one room');
      return;
    }
    setStatus('Submitting offline booking...'); setError(null);
    try {
      const fd = new FormData();
      Object.entries(offline).forEach(([k,v])=>{ if(v) fd.append(k,v); });
      fd.append('roomNumbers', JSON.stringify(selectedRooms));
      await apiFetch('/api/admin/bookings/offline', { method:'POST', headers:{ ...authHeaders(token) }, body: fd });
      setStatus('Offline booking added');
      setOffline({ name:'', phone:'', date:'', payment:'', document:null });
      setSelectedRooms([]);
      fetchBookings();
      fetchRoomStatus();
    } catch(err){ setStatus(null); setError(err.message); }
  }

  useEffect(()=>{ if(token) fetchBookings(); }, [token, fetchBookings]);
  useEffect(()=>{ if(token && offline.date) fetchRoomStatus(); }, [token, offline.date, fetchRoomStatus]);
  useEffect(()=>{ if(token && viewDate) fetchViewRoomStatus(); }, [token, viewDate, fetchViewRoomStatus]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hotel-accent p-4">
        <div className="max-w-md w-full">
          {!showResetForm ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl border border-hotel-primary/10">
              <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-hotel-primary/10 text-hotel-primary rounded-2xl mb-4">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-bold text-hotel-secondary">Admin Login</h3>
                <p className="text-gray-500 mt-2">Secure access to hotel management</p>
              </div>
              <form onSubmit={login} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <input name="username" value={creds.username} onChange={handleLoginField} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">Password</label>
                  <input type="password" name="password" value={creds.password} onChange={handleLoginField} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                </div>
                <button type="submit" className="w-full py-4 bg-hotel-primary text-white rounded-2xl font-bold hover:bg-hotel-primary-dark transition-all shadow-lg transform hover:scale-[1.02]">Login</button>
                <button type="button" className="w-full py-2 text-sm text-hotel-primary font-medium hover:underline transition-all" onClick={() => setShowResetForm(true)}>Forgot Password?</button>
                {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm text-center font-bold border border-red-100">{error}</div>}
                {status && <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl text-sm text-center font-bold border border-blue-100">{status}</div>}
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl border border-hotel-primary/10">
              <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-2xl mb-4">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-bold text-hotel-secondary">Reset Password</h3>
                <p className="text-gray-500 mt-2">Enter your username to reset password</p>
              </div>
              <form onSubmit={submitPasswordReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <input name="username" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                </div>
                <button type="submit" className="w-full py-4 bg-hotel-primary text-white rounded-2xl font-bold hover:bg-hotel-primary-dark transition-all shadow-lg transform hover:scale-[1.02]">Reset Password</button>
                <button type="button" className="w-full py-2 text-sm text-hotel-primary font-medium hover:underline transition-all" onClick={() => { setShowResetForm(false); setResetUsername(''); setError(null); setStatus(null); }}>Back to Login</button>
                {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm text-center font-bold border border-red-100">{error}</div>}
                {status && <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl text-sm text-center font-bold border border-blue-100">{status}</div>}
              </form>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hotel-accent flex">
      {/* Sidebar */}
      <aside className="w-72 bg-hotel-secondary text-white hidden lg:flex flex-col p-8 border-r border-white/10">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="p-2 bg-hotel-primary rounded-lg">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight">Indraprasta</span>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: 'rooms', label: 'Rooms', icon: <Bed className="w-5 h-5" /> },
            { id: 'bookings', label: 'Bookings', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                activeTab === tab.id ? 'bg-hotel-primary text-white shadow-xl translate-x-2' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-hotel-secondary capitalize">{activeTab}</h2>
            <p className="text-gray-500 font-medium">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-hotel-primary transition-all transform hover:scale-110" onClick={fetchBookings}>
              <RefreshCw className={`w-6 h-6 ${status && 'animate-spin'}`} />
            </button>
            <div className="flex items-center gap-3 bg-white p-1.5 pr-6 rounded-full shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-hotel-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">AD</div>
              <span className="text-sm font-bold text-hotel-secondary">Admin</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-hotel-primary/10 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><BookOpen className="w-8 h-8" /></div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full">+12%</span>
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Bookings</p>
                  <h3 className="text-4xl font-bold text-hotel-secondary mt-2">{bookings.length}</h3>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-hotel-primary/10 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-green-50 text-green-500 rounded-2xl"><Bed className="w-8 h-8" /></div>
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">Stable</span>
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Avg. Occupancy</p>
                  <h3 className="text-4xl font-bold text-hotel-secondary mt-2">
                    {bookings.length > 0 ? Math.round((bookings.reduce((sum, b) => sum + (b.rooms || 0), 0) / 30) * 100) : 0}%
                  </h3>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-hotel-primary/10 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><FileText className="w-8 h-8" /></div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Monthly</span>
                  </div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Pending Receipts</p>
                  <h3 className="text-4xl font-bold text-hotel-secondary mt-2">
                    {bookings.filter(b => !b.receiptGenerated).length}
                  </h3>
                </div>
              </div>

              {/* Recent Bookings Preview */}
              <div className="bg-white rounded-3xl shadow-sm border border-hotel-primary/10 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-hotel-secondary">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-hotel-primary font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                      <tr className="border-b border-gray-100">
                        <th className="px-8 py-5">Guest</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5">Rooms</th>
                        <th className="px-8 py-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.slice(-5).reverse().map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5 font-bold text-hotel-secondary">{b.name}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.date}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.roomNumbers.join(', ')}</td>
                          <td className="px-8 py-5">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${b.receiptGenerated ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                              {b.receiptGenerated ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium">No bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rooms' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-hotel-primary/10">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <Bed className="w-8 h-8 text-hotel-primary" /> Room Occupancy
                    </h3>
                    <div className="space-y-8">
                      <div className="flex items-center gap-6">
                        <label className="text-base font-bold text-gray-600 whitespace-nowrap">Reference Date:</label>
                        <input type="date" value={viewDate} onChange={e=>setViewDate(e.target.value)} className="p-3 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                      </div>
                      {viewDate && (
                        <div className="space-y-8">
                          <p className="text-base text-gray-500 font-medium">
                            {viewRoomStatus.availableRooms.length} available out of 30 rooms on {viewDate}
                          </p>
                          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                              const isBooked = viewRoomStatus.bookedRooms.includes(roomNum);
                              return (
                                <button
                                  key={roomNum}
                                  onClick={() => toggleViewRoom(roomNum)}
                                  className={`h-14 rounded-2xl font-bold transition-all ${
                                    isBooked ? 'bg-gray-200 text-gray-400' : 'bg-green-100 text-green-600 hover:bg-green-200 shadow-sm'
                                  }`}
                                >
                                  {roomNum}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex gap-6 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-100"></span> Available</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-200"></span> Occupied</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-hotel-primary/10">
                    <h3 className="text-2xl font-bold mb-10 flex items-center gap-3">
                      <Plus className="w-8 h-8 text-hotel-primary" /> Add Offline Booking
                    </h3>
                    <form onSubmit={submitOffline} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Date*</label>
                        <input type="date" name="date" value={offline.date} onChange={handleOfflineChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Guest Name*</label>
                        <input name="name" value={offline.name} onChange={handleOfflineChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Phone*</label>
                        <input name="phone" value={offline.phone} onChange={handleOfflineChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Payment Ref</label>
                        <input name="payment" value={offline.payment} onChange={handleOfflineChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Document</label>
                        <input type="file" name="document" accept="image/*,.pdf" onChange={handleOfflineChange} className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full py-4 bg-hotel-primary text-white rounded-2xl font-bold hover:bg-hotel-primary-dark transition-all shadow-lg transform hover:scale-[1.02]">Add Booking</button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-hotel-primary/10">
                    <h4 className="text-2xl font-bold mb-8 flex items-center gap-3"><Bed className="w-7 h-7 text-hotel-primary" /> Selection</h4>
                    <div className="space-y-8">
                      <div className="grid grid-cols-5 gap-3">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                          const isBooked = roomStatus.bookedRooms.includes(roomNum);
                          const isSelected = selectedRooms.includes(roomNum);
                          return (
                            <button
                              key={roomNum}
                              type="button"
                              className={`h-12 rounded-xl font-bold transition-all ${
                                isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                                isSelected ? 'bg-hotel-primary text-white scale-110 shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                              onClick={() => !isBooked && toggleRoom(roomNum)}
                              disabled={isBooked}
                            >
                              {roomNum}
                            </button>
                          );
                        })}
                      </div>
                      <div className="pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-gray-600">Rooms Selected:</span>
                          <span className="text-hotel-primary">{selectedRooms.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="bg-white rounded-3xl shadow-sm border border-hotel-primary/10 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-hotel-secondary">All Guest Bookings</h3>
                  <button onClick={fetchBookings} className="p-3 text-gray-400 hover:text-hotel-primary transition-all transform hover:rotate-180">
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                      <tr className="border-b border-gray-100">
                        <th className="px-8 py-5">Type</th>
                        <th className="px-8 py-5">Guest</th>
                        <th className="px-8 py-5">Email</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5">Rooms</th>
                        <th className="px-8 py-5">Room #s</th>
                        <th className="px-8 py-5">Payment</th>
                        <th className="px-8 py-5">Doc</th>
                        <th className="px-8 py-5">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${b.type === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                              {b.type}
                            </span>
                          </td>
                          <td className="px-8 py-5 font-bold text-hotel-secondary">{b.name}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.email || '-'}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.date}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.rooms}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.roomNumbers ? b.roomNumbers.join(', ') : '-'}</td>
                          <td className="px-8 py-5 text-sm text-gray-500">{b.payment}</td>
                          <td className="px-8 py-5">
                            {b.document ? <a href={`/api/uploads/${b.document}`} target="_blank" rel="noreferrer" className="text-hotel-primary hover:underline flex items-center gap-1 text-xs font-bold"><FileText className="w-3 h-3" /> View</a> : '-'}
                          </td>
                          <td className="px-8 py-5">
                            {b.receiptGenerated ? (
                              <a href={`/api/receipts-view/receipt-${b.id}.pdf`} target="_blank" rel="noreferrer" className="text-hotel-primary hover:underline flex items-center gap-1 text-xs font-bold"><FileText className="w-3 h-3" /> PDF</a>
                            ) : (
                              <span className="text-gray-300 text-xs">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="9" className="px-8 py-20 text-center text-gray-400 font-medium">No bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-hotel-primary/10 max-w-2xl">
                <h3 className="text-3xl font-bold mb-10 flex items-center gap-4">
                  <Settings className="w-8 h-8 text-hotel-primary" /> Security Settings
                </h3>
                <div className="space-y-8">
                  <button
                    onClick={() => setShowPwForm(!showPwForm)}
                    className="w-full py-4 px-6 bg-gray-50 text-hotel-secondary rounded-2xl font-bold hover:bg-gray-100 transition-all flex justify-between items-center group"
                  >
                    <span>Change Admin Password</span>
                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full uppercase font-bold transition-colors group-hover:bg-hotel-primary group-hover:text-white">{showPwForm ? 'Open' : 'Closed'}</span>
                  </button>

                  <AnimatePresence>
                    {showPwForm && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={submitPasswordChange}
                        className="space-y-6 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Old Password</label>
                            <input type="password" name="oldPassword" value={pwFields.oldPassword} onChange={handlePwChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">New Password</label>
                            <input type="password" name="newPassword" value={pwFields.newPassword} onChange={handlePwChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Confirm New Password</label>
                            <input type="password" name="confirm" value={pwFields.confirm} onChange={handlePwChange} required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-hotel-primary outline-none transition-all shadow-sm" />
                          </div>
                          <button type="submit" className="w-full py-4 bg-hotel-primary text-white rounded-2xl font-bold hover:bg-hotel-primary-dark transition-all shadow-lg transform hover:scale-[1.02]">Update Password</button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-10 right-10">
          <AnimatePresence>
            {(status || error) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`p-6 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[350px] ${
                  error ? 'bg-red-500 text-white' : 'bg-white text-hotel-secondary border border-hotel-primary/20'
                }`}
              >
                {error ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6 text-green-500" />}
                <span className="font-bold">{status || error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
