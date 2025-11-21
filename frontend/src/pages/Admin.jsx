import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, authHeaders } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Admin.css';

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{ if(token) fetchBookings(); }, [token, fetchBookings]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{ if(token && offline.date) fetchRoomStatus(); }, [token, offline.date, fetchRoomStatus]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{ if(token && viewDate) fetchViewRoomStatus(); }, [token, viewDate, fetchViewRoomStatus]);

  return (
    <section id="admin_page" className={`section admin admin-panel ${!isAuthenticated ? 'login-centered' : ''}`}>
      {!isAuthenticated ? (
        <div className="centered-login-wrapper">
          {!showResetForm ? (
            <form onSubmit={login} className="admin-login card-block" noValidate>
              <h3 className="panel-title">Admin Login</h3>
              <div className="field"><label>Username</label><input name="username" value={creds.username} onChange={handleLoginField} required/></div>
              <div className="field"><label>Password</label><input type="password" name="password" value={creds.password} onChange={handleLoginField} required/></div>
              <button type="submit" className="primary-btn">Login</button>
              <button type="button" className="reset-link-btn" onClick={() => setShowResetForm(true)}>Forgot Password?</button>
              {error && <div className="error-text">{error}</div>}
            </form>
          ) : (
            <form onSubmit={submitPasswordReset} className="admin-login card-block" noValidate>
              <h3 className="panel-title">Reset Password</h3>
              <div className="field"><label>Username</label><input name="username" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required/></div>
              <button type="submit" className="primary-btn">Reset Password</button>
              <button type="button" className="reset-link-btn" onClick={() => { setShowResetForm(false); setResetUsername(''); setError(null); setStatus(null); }}>Back to Login</button>
              {error && <div className="error-text">{error}</div>}
            </form>
          )}
        </div>
      ) : (
        <>
          <div className="admin-header">
            <h2>Admin Panel</h2>
            <p className="admin-desc">Manage bookings & availability. Use offline booking for walk-ins and documents.</p>
          </div>
        <div className="admin-actions wrap">
          <button className="primary-btn" onClick={logout}>Logout</button>
          <button className="ghost-btn" onClick={fetchBookings}>Refresh Bookings</button>
          <button className="ghost-btn" onClick={() => { setOffline({ name:'', phone:'', date:'', payment:'', document:null }); setSelectedRooms([]); setStatus(null); setError(null); }}>Reset Panel</button>
          <button className="ghost-btn" onClick={()=> setShowPwForm(s=>!s)}>{showPwForm ? 'Hide Password Form' : 'Change Password'}</button>
        </div>

      {isAuthenticated && showPwForm && (
        <form onSubmit={submitPasswordChange} className="password-form card-block" noValidate>
          <h3 className="panel-title">Change Password</h3>
          <div className="field"><label>Old Password</label><input type="password" name="oldPassword" value={pwFields.oldPassword} onChange={handlePwChange} required/></div>
          <div className="field"><label>New Password</label><input type="password" name="newPassword" value={pwFields.newPassword} onChange={handlePwChange} required/></div>
          <div className="field"><label>Confirm New Password</label><input type="password" name="confirm" value={pwFields.confirm} onChange={handlePwChange} required/></div>
          <button type="submit" className="primary-btn">Update Password</button>
        </form>
      )}

      {isAuthenticated && (
        <div className="room-manager card-block">
          <h3>Room Management</h3>
          <p className="room-status-info">Manage permanent room occupancy - booked rooms stay occupied across all dates until checkout</p>
          <div className="field" style={{maxWidth: '300px'}}>
            <label>Select Date (for reference)</label>
            <input type="date" value={viewDate} onChange={e=>setViewDate(e.target.value)} />
          </div>
          <div style={{minHeight: viewDate ? 'auto' : '0', opacity: viewDate ? 1 : 0, transition: 'opacity 0.2s'}}>
          {viewDate && (
            <>
              <p className="room-status-info">
                {viewRoomStatus.availableRooms.length} available out of 30 rooms on {viewDate}
              </p>
              <p className="room-status-info" style={{fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem'}}>
                <strong>Click to toggle:</strong> Green = Available | Gray = Occupied (blocks ALL dates)
              </p>
              <div className="rooms-grid">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                  const isBooked = viewRoomStatus.bookedRooms.includes(roomNum);
                  return (
                    <div
                      key={roomNum}
                      className={`room-cell ${isBooked ? 'booked' : 'available'}`}
                      style={{cursor: 'pointer'}}
                      onClick={() => toggleViewRoom(roomNum)}
                      title={isBooked ? 'Click to checkout/make available' : 'Click to occupy/make unavailable'}
                    >
                      {roomNum}
                    </div>
                  );
                })}
              </div>
              <div className="room-legend">
                <span className="legend-item"><span className="dot available"></span> Available for all dates</span>
                <span className="legend-item"><span className="dot booked"></span> Occupied (unavailable until checkout)</span>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {isAuthenticated && offline.date && (
        <div className="room-selector card-block">
          <h3>Select Rooms for Booking (Selected: {selectedRooms.length})</h3>
          <p className="room-status-info">
            {roomStatus.availableRooms.length} available out of 30 rooms on {offline.date}
          </p>
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

      {isAuthenticated && (
        <form onSubmit={submitOffline} className="offline-form card-block" encType="multipart/form-data" noValidate>
          <h3>Add Offline Booking</h3>
          <div className="field"><label>Date*</label><input type="date" name="date" value={offline.date} onChange={handleOfflineChange} required/></div>
          <div className="field"><label>Name*</label><input name="name" value={offline.name} onChange={handleOfflineChange} required/></div>
          <div className="field"><label>Phone*</label><input name="phone" value={offline.phone} onChange={handleOfflineChange} required/></div>
          <div className="field"><label>Payment Ref</label><input name="payment" value={offline.payment} onChange={handleOfflineChange}/></div>
          <div className="field"><label>Document</label><input type="file" name="document" accept="image/*,.pdf" onChange={handleOfflineChange}/></div>
          <button type="submit">Add Offline Booking</button>
        </form>
      )}

      {isAuthenticated && (
        <div className="feedback">
          {status && <span className="success-text">{status}</span>}
          {error && <span className="error-text">{error}</span>}
        </div>
      )}

      {isAuthenticated && (
        <div className="booking-list card-block">
          <h3>All Bookings</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th><th>Name</th><th>Date</th><th>Rooms</th><th>Room Numbers</th><th>Payment</th><th>Doc</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="row">
                  <td data-label="Type">{b.type}</td>
                  <td data-label="Name">{b.name}</td>
                  <td data-label="Date">{b.date}</td>
                  <td data-label="Rooms">{b.rooms}</td>
                  <td data-label="Room Numbers">{b.roomNumbers ? b.roomNumbers.join(', ') : '-'}</td>
                  <td data-label="Payment">{b.payment}</td>
                  <td data-label="Doc">{b.document ? <a href={`/api/uploads/${b.document}`} target="_blank" rel="noreferrer">file</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </section>
  );
}
