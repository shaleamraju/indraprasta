const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const PORT = process.env.PORT || 4000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'secret123'; // used only for initial seed if no persisted admin file exists
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const TOTAL_ROOMS = 30;

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const HOTEL_NAME = process.env.HOTEL_NAME || 'Indraprasta Hotel';
const HOTEL_EMAIL = process.env.HOTEL_EMAIL || EMAIL_USER;

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
const receiptsDir = path.join(__dirname, 'receipts');
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);
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

// Email transporter
let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

// Generate PDF receipt
function generateReceipt(booking) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receipt-${booking.id}.pdf`;
    const filePath = path.join(receiptsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(24).text(HOTEL_NAME, { align: 'center' });
    doc.fontSize(10).text('Booking Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Receipt Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.text(`Booking ID: ${booking.id}`, { align: 'right' });
    doc.moveDown(2);

    // Customer Details
    doc.fontSize(14).text('Customer Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Name: ${booking.name}`);
    if (booking.email) doc.text(`Email: ${booking.email}`);
    doc.text(`Phone: ${booking.phone}`);
    if (booking.address) doc.text(`Address: ${booking.address}`);
    doc.moveDown(2);

    // Booking Details
    doc.fontSize(14).text('Booking Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Check-in Date: ${booking.date}`);
    doc.text(`Number of Rooms: ${booking.rooms}`);
    doc.text(`Room Numbers: ${booking.roomNumbers.join(', ')}`);
    doc.text(`Payment: ${booking.payment}`);
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).text('Thank you for choosing ' + HOTEL_NAME, { align: 'center', color: 'gray' });
    doc.text('For any queries, please contact us at ' + HOTEL_EMAIL, { align: 'center', color: 'gray' });

    doc.end();

    stream.on('finish', () => resolve({ fileName, filePath }));
    stream.on('error', reject);
  });
}

// Send email with receipt
async function sendBookingEmail(booking, receiptPath) {
  if (!transporter) {
    console.log('Email not configured, skipping email send');
    return { sent: false, reason: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: `"${HOTEL_NAME}" <${EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Confirmation - ${HOTEL_NAME}`,
      html: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${booking.name},</p>
        <p>Thank you for your booking at ${HOTEL_NAME}. Your booking has been confirmed.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.id}</li>
          <li><strong>Check-in Date:</strong> ${booking.date}</li>
          <li><strong>Room Numbers:</strong> ${booking.roomNumbers.join(', ')}</li>
          <li><strong>Number of Rooms:</strong> ${booking.rooms}</li>
          <li><strong>Payment:</strong> ${booking.payment}</li>
        </ul>
        
        <p>Please find your receipt attached to this email.</p>
        <p>We look forward to welcoming you!</p>
        
        <p>Best regards,<br>${HOTEL_NAME}</p>
      `,
      attachments: receiptPath ? [{
        filename: `receipt-${booking.id}.pdf`,
        path: receiptPath
      }] : []
    };

    await transporter.sendMail(mailOptions);
    return { sent: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { sent: false, error: error.message };
  }
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
app.post('/api/bookings', upload.single('document'), async (req, res) => {
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
    receiptGenerated: false,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  writeBookings(bookings);

  // Generate receipt and send email asynchronously
  (async () => {
    try {
      const receipt = await generateReceipt(booking);
      booking.receipt = receipt.fileName;
      booking.receiptGenerated = true;
      
      // Update booking with receipt info
      const updatedBookings = readBookings();
      const bookingIndex = updatedBookings.findIndex(b => b.id === booking.id);
      if (bookingIndex !== -1) {
        updatedBookings[bookingIndex] = booking;
        writeBookings(updatedBookings);
      }

      // Send email
      if (email) {
        await sendBookingEmail(booking, receipt.filePath);
      }
    } catch (error) {
      console.error('Receipt/Email error:', error);
    }
  })();

  res.status(201).json(booking);
});

// Offline booking creation (admin)
app.post('/api/admin/bookings/offline', authMiddleware, upload.single('document'), async (req, res) => {
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
    receiptGenerated: false,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  writeBookings(bookings);

  // Generate receipt
  (async () => {
    try {
      const receipt = await generateReceipt(booking);
      booking.receipt = receipt.fileName;
      booking.receiptGenerated = true;
      
      const updatedBookings = readBookings();
      const bookingIndex = updatedBookings.findIndex(b => b.id === booking.id);
      if (bookingIndex !== -1) {
        updatedBookings[bookingIndex] = booking;
        writeBookings(updatedBookings);
      }
    } catch (error) {
      console.error('Receipt generation error:', error);
    }
  })();

  res.status(201).json(booking);
});

// List bookings (admin)
app.get('/api/admin/bookings', authMiddleware, (req, res) => {
  res.json(readBookings());
});

// Get single booking (public - for receipt page)
app.get('/api/public/booking/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const bookings = readBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  res.json(booking);
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

// Download receipt endpoint
app.get('/api/receipts/:bookingId', authMiddleware, (req, res) => {
  const { bookingId } = req.params;
  const fileName = `receipt-${bookingId}.pdf`;
  const filePath = path.join(receiptsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Receipt not found' });
  }
  
  res.download(filePath, fileName);
});

// Generate receipt on demand
app.post('/api/admin/generate-receipt/:bookingId', authMiddleware, async (req, res) => {
  const { bookingId } = req.params;
  const bookings = readBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  try {
    const receipt = await generateReceipt(booking);
    booking.receipt = receipt.fileName;
    booking.receiptGenerated = true;
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    bookings[bookingIndex] = booking;
    writeBookings(bookings);
    
    res.json({ success: true, receipt: receipt.fileName });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Serve uploaded documents
app.use('/api/uploads', express.static(uploadDir));
app.use('/api/receipts-view', express.static(receiptsDir));

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
