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
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          {!showResetForm ? (
            <form onSubmit={login} className="auth-form">
              <div className="auth-header">
                <div className="auth-icon">🔒</div>
                <h3>Admin Login</h3>
                <p>Secure access to hotel management</p>
              </div>
              <div className="field">
                <label>Username</label>
                <input name="username" value={creds.username} onChange={handleLoginField} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" name="password" value={creds.password} onChange={handleLoginField} required />
              </div>
              <button type="submit" className="btn-primary">Login</button>
              <button type="button" className="btn-link" onClick={() => setShowResetForm(true)}>Forgot Password?</button>
              {error && <div className="error-msg">{error}</div>}
              {status && <div className="status-msg">{status}</div>}
            </form>
          ) : (
            <form onSubmit={submitPasswordReset} className="auth-form">
              <div className="auth-header">
                <div className="auth-icon">🔑</div>
                <h3>Reset Password</h3>
                <p>Enter your username to reset password</p>
              </div>
              <div className="field">
                <label>Username</label>
                <input name="username" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary">Reset Password</button>
              <button type="button" className="btn-link" onClick={() => { setShowResetForm(false); setResetUsername(''); setError(null); setStatus(null); }}>Back to Login</button>
              {error && <div className="error-msg">{error}</div>}
              {status && <div className="status-msg">{status}</div>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">H</div>
          <span className="logo-text">Indraprastha</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'rooms', label: 'Rooms' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'settings', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h2>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'rooms' ? 'Rooms' : activeTab === 'bookings' ? 'Bookings' : 'Settings'}</h2>
            <p>Welcome back, Administrator</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={fetchBookings} title="Refresh">↻</button>
            <div className="admin-profile">
              <div className="profile-avatar">AD</div>
              <span className="profile-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📖</div>
                  <div className="stat-info">
                    <p>Total Bookings</p>
                    <h3>{bookings.length}</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🛌</div>
                  <div className="stat-info">
                    <p>Avg. Occupancy</p>
                    <h3>{bookings.length > 0 ? Math.round((bookings.reduce((sum, b) => sum + (b.rooms || 0), 0) / 30) * 100) : 0}%</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📄</div>
                  <div className="stat-info">
                    <p>Pending Receipts</p>
                    <h3>{bookings.filter(b => !b.receiptGenerated).length}</h3>
                  </div>
                </div>
              </div>

              <div className="recent-bookings-card">
                <div className="card-header">
                  <h3>Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="btn-link">View All</button>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Guest</th>
                        <th>Date</th>
                        <th>Rooms</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(-5).reverse().map(b => (
                        <tr key={b.id}>
                          <td>{b.name}</td>
                          <td>{b.date}</td>
                          <td>{b.roomNumbers.join(', ')}</td>
                          <td>
                            <span className={`status-badge ${b.receiptGenerated ? 'confirmed' : 'pending'}`}>
                              {b.receiptGenerated ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan="4" className="empty-row">No bookings found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="rooms-view">
              <div className="rooms-manager-grid">
                <div className="room-mgmt-main">
                  <div className="room-mgmt-card">
                    <h3>Room Occupancy</h3>
                    <div className="date-picker-row">
                      <label>Reference Date:</label>
                      <input type="date" value={viewDate} onChange={e=>setViewDate(e.target.value)} />
                    </div>
                    {viewDate && (
                      <div className="occupancy-status">
                        <p>{viewRoomStatus.availableRooms.length} available out of 30 rooms on {viewDate}</p>
                        <div className="rooms-grid">
                          {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                            const isBooked = viewRoomStatus.bookedRooms.includes(roomNum);
                            return (
                              <button
                                key={roomNum}
                                onClick={() => toggleViewRoom(roomNum)}
                                className={`room-cell ${isBooked ? 'booked' : 'available'}`}
                              >
                                {roomNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="offline-booking-card">
                    <h3>Add Offline Booking</h3>
                    <form onSubmit={submitOffline} className="offline-form">
                      <div className="form-grid">
                        <div className="field">
                          <label>Date*</label>
                          <input type="date" name="date" value={offline.date} onChange={handleOfflineChange} required />
                        </div>
                        <div className="field">
                          <label>Guest Name*</label>
                          <input name="name" value={offline.name} onChange={handleOfflineChange} required />
                        </div>
                        <div className="field">
                          <label>Phone*</label>
                          <input name="phone" value={offline.phone} onChange={handleOfflineChange} required />
                        </div>
                        <div className="field">
                          <label>Payment Ref</label>
                          <input name="payment" value={offline.payment} onChange={handleOfflineChange} />
                        </div>
                        <div className="field full-width">
                          <label>Document</label>
                          <input type="file" name="document" accept="image/*,.pdf" onChange={handleOfflineChange} />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary">Add Booking</button>
                    </form>
                  </div>
                </div>

                <div className="room-selection-sidebar">
                  <div className="selection-card">
                    <h4>Booking Selection</h4>
                    <div className="mini-rooms-grid">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(roomNum => {
                        const isBooked = roomStatus.bookedRooms.includes(roomNum);
                        const isSelected = selectedRooms.includes(roomNum);
                        return (
                          <button
                            key={roomNum}
                            type="button"
                            className={`mini-room-cell ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isBooked && toggleRoom(roomNum)}
                            disabled={isBooked}
                          >
                            {roomNum}
                          </button>
                        );
                      })}
                    </div>
                    <div className="selection-footer">
                      <span>Rooms Selected:</span>
                      <span className="count">{selectedRooms.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-view">
              <div className="bookings-card">
                <div className="card-header">
                  <h3>All Guest Bookings</h3>
                  <button onClick={fetchBookings} className="btn-icon">↻</button>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Guest</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Rooms</th>
                        <th>Room #s</th>
                        <th>Payment</th>
                        <th>Doc</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td><span className={`type-badge ${b.type}`}>{b.type}</span></td>
                          <td>{b.name}</td>
                          <td>{b.email || '-'}</td>
                          <td>{b.date}</td>
                          <td>{b.rooms}</td>
                          <td>{b.roomNumbers ? b.roomNumbers.join(', ') : '-'}</td>
                          <td>{b.payment}</td>
                          <td>{b.document ? <a href={`/api/uploads/${b.document}`} target="_blank" rel="noreferrer" className="btn-link">View</a> : '-'}</td>
                          <td>
                            {b.receiptGenerated ? (
                              <a href={`/api/receipts-view/receipt-${b.id}.pdf`} target="_blank" rel="noreferrer" className="btn-link">📄 PDF</a>
                            ) : (
                              <span className="pending-text">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan="9" className="empty-row">No bookings found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view">
              <div className="settings-card">
                <h3>Security Settings</h3>
                <button
                  onClick={() => setShowPwForm(!showPwForm)}
                  className="settings-toggle"
                >
                  Change Admin Password
                  <span className="toggle-status">{showPwForm ? 'Open' : 'Closed'}</span>
                </button>

                {showPwForm && (
                  <form onSubmit={submitPasswordChange} className="password-form">
                    <div className="field">
                      <label>Old Password</label>
                      <input type="password" name="oldPassword" value={pwFields.oldPassword} onChange={handlePwChange} required />
                    </div>
                    <div className="field">
                      <label>New Password</label>
                      <input type="password" name="newPassword" value={pwFields.newPassword} onChange={handlePwChange} required />
                    </div>
                    <div className="field">
                      <label>Confirm New Password</label>
                      <input type="password" name="confirm" value={pwFields.confirm} onChange={handlePwChange} required />
                    </div>
                    <button type="submit" className="btn-primary">Update Password</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-feedback">
          {status && <div className="feedback-msg success">{status}</div>}
          {error && <div className="feedback-msg error">{error}</div>}
        </div>
      </main>
    </div>
  );
}
