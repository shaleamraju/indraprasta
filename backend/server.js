const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');

const PORT = process.env.PORT || 4000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'secret123'; // used only for initial seed if no persisted admin file exists
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const TOTAL_ROOMS = 30;

const app = express();
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Request error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// File upload configuration
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuid()}${ext}`);
  }
});
const upload = multer({ storage });

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const bookingsFile = path.join(dataDir, 'bookings.json');
const adminFile = path.join(dataDir, 'admin.json');
const occupancyFile = path.join(dataDir, 'room-occupancy.json');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash: derived };
}
function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  const derived = crypto.pbkdf2Sync(password, record.salt, 100000, 64, 'sha512').toString('hex');
  return derived === record.hash;
}
function loadAdmin() {
  if (fs.existsSync(adminFile)) {
    try { return JSON.parse(fs.readFileSync(adminFile, 'utf8')); } catch { /* fall through */ }
  }
  // seed default admin credentials
  const seeded = { username: ADMIN_USER, ...hashPassword(ADMIN_PASS) };
  fs.writeFileSync(adminFile, JSON.stringify(seeded, null, 2));
  return seeded;
}
let adminCreds = loadAdmin();
function readBookings() {
  if (!fs.existsSync(bookingsFile)) return [];
  try { return JSON.parse(fs.readFileSync(bookingsFile, 'utf8')); } catch { return []; }
}
function writeBookings(list) {
  fs.writeFileSync(bookingsFile, JSON.stringify(list, null, 2));
}

// Room occupancy functions - tracks which rooms are permanently occupied
function readOccupancy() {
  if (!fs.existsSync(occupancyFile)) return {};
  try { return JSON.parse(fs.readFileSync(occupancyFile, 'utf8')); } catch { return {}; }
}
function writeOccupancy(data) {
  fs.writeFileSync(occupancyFile, JSON.stringify(data, null, 2));
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminCreds.username && verifyPassword(password, adminCreds)) {
    const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Change admin password (must be authenticated & supply old password)
app.post('/api/admin/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'oldPassword and newPassword required' });
  if (!verifyPassword(oldPassword, adminCreds)) return res.status(401).json({ error: 'Old password incorrect' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  if (oldPassword === newPassword) return res.status(400).json({ error: 'New password must differ from old password' });
  const updated = { username: adminCreds.username, ...hashPassword(newPassword) };
  fs.writeFileSync(adminFile, JSON.stringify(updated, null, 2));
  adminCreds = updated;
  return res.json({ message: 'Password changed successfully. Please re-login.' });
});

// Reset admin password to default (no authentication required)
app.post('/api/admin/reset-password', (req, res) => {
  const { username } = req.body || {};
  if (!username || username !== adminCreds.username) return res.status(400).json({ error: 'Invalid username' });
  const resetPassword = ADMIN_PASS; // Reset to default
  const updated = { username: adminCreds.username, ...hashPassword(resetPassword) };
  fs.writeFileSync(adminFile, JSON.stringify(updated, null, 2));
  adminCreds = updated;
  return res.json({ message: 'Password reset to default. Use the default credentials to login.' });
});

// Create booking (online)
app.post('/api/bookings', upload.single('document'), (req, res) => {
  const { name, email, phone, address, roomNumbers, date, payment } = req.body;
  let parsedRoomNumbers = [];
  if (typeof roomNumbers === 'string') {
    try { parsedRoomNumbers = JSON.parse(roomNumbers); } catch { parsedRoomNumbers = []; }
  } else if (Array.isArray(roomNumbers)) {
    parsedRoomNumbers = roomNumbers;
  }
  if (!name || !email || !phone || !parsedRoomNumbers.length || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const bookings = readBookings();
  const id = uuid();
  const docFile = req.file ? req.file.filename : null;
  const booking = {
    id,
    type: 'online',
    name,
    email,
    phone,
    address: address || '',
    roomNumbers: parsedRoomNumbers,
    rooms: parsedRoomNumbers.length,
    date,
    payment: payment || 'pending',
    document: docFile,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  writeBookings(bookings);
  res.status(201).json(booking);
});

// Offline booking creation (admin)
app.post('/api/admin/bookings/offline', authMiddleware, upload.single('document'), (req, res) => {
  const { name, phone, roomNumbers, date, payment } = req.body;
  let parsedRoomNumbers = [];
  if (typeof roomNumbers === 'string') {
    try { parsedRoomNumbers = JSON.parse(roomNumbers); } catch { parsedRoomNumbers = []; }
  } else if (Array.isArray(roomNumbers)) {
    parsedRoomNumbers = roomNumbers;
  }
  if (!name || !phone || !parsedRoomNumbers.length || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const bookings = readBookings();
  const id = uuid();
  const docFile = req.file ? req.file.filename : null;
  const booking = {
    id,
    type: 'offline',
    name,
    email: '',
    phone,
    address: '',
    roomNumbers: parsedRoomNumbers,
    rooms: parsedRoomNumbers.length,
    date,
    payment: payment || 'pending',
    document: docFile,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  writeBookings(bookings);
  res.status(201).json(booking);
});

// List bookings (admin)
app.get('/api/admin/bookings', authMiddleware, (req, res) => {
  res.json(readBookings());
});

// Availability for a given date
app.get('/api/admin/availability', authMiddleware, (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query required' });
  const bookings = readBookings().filter(b => b.date === date);
  const used = bookings.reduce((sum, b) => sum + (b.rooms || 0), 0);
  const available = TOTAL_ROOMS - used;
  res.json({ date, total: TOTAL_ROOMS, used, available });
});

// Get room status for a date (public endpoint)
app.get('/api/rooms/status', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query required' });
  
  // Get permanently occupied rooms
  const occupancy = readOccupancy();
  const bookedRooms = Object.keys(occupancy)
    .filter(roomNum => occupancy[roomNum].occupied)
    .map(roomNum => parseInt(roomNum));
  
  const allRooms = Array.from({ length: TOTAL_ROOMS }, (_, i) => i + 1);
  const availableRooms = allRooms.filter(r => !bookedRooms.includes(r));
  res.json({ date, total: TOTAL_ROOMS, bookedRooms, availableRooms });
});

// Toggle room booking status (admin only) - permanent occupancy
app.post('/api/admin/rooms/toggle', authMiddleware, (req, res) => {
  const { date, roomNumber } = req.body;
  if (!date || !roomNumber) return res.status(400).json({ error: 'date and roomNumber required' });
  
  const occupancy = readOccupancy();
  const roomKey = String(roomNumber);
  
  if (occupancy[roomKey] && occupancy[roomKey].occupied) {
    // Unbook: mark room as available (customer checkout)
    delete occupancy[roomKey];
    writeOccupancy(occupancy);
    return res.json({ success: true, action: 'unbooked', roomNumber, message: 'Room is now available for all dates' });
  } else {
    // Book: mark room as permanently occupied
    occupancy[roomKey] = {
      occupied: true,
      roomNumber: roomNumber,
      bookedAt: new Date().toISOString(),
      bookedBy: 'admin'
    };
    writeOccupancy(occupancy);
    return res.json({ success: true, action: 'booked', roomNumber, message: 'Room is now booked for all dates until checkout' });
  }
});

// Serve uploaded documents
app.use('/api/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
