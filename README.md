# Hotel Booking System

A full-stack hotel booking application with admin panel for managing room occupancy.

## Features

### Customer Portal
- 📅 Book rooms for specific dates
- 🏠 Visual room selection (30 rooms available)
- 📱 Real-time availability checking
- 📄 Document upload for ID proof
- 💳 Payment reference tracking
- 📧 Automatic email confirmation with PDF receipt
- 🧾 Beautiful receipt page after booking

### Admin Panel
- 🔐 Secure authentication with JWT
- 🏨 Room occupancy management
- ✅ Toggle rooms between occupied/available
- 📊 View all bookings with email addresses
- 📥 Download PDF receipts for any booking
- 🔄 Offline booking creation
- 🔑 Password management
- 📄 Automatic receipt generation

## Tech Stack

**Frontend:**
- React 19 with React Router
- Vite for build tooling
- Modern CSS with clean UI

**Backend:**
- Node.js with Express
- JWT authentication
- Multer for file uploads
- JSON file-based storage

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaleamraju/indraprasta.git
   cd indraprasta
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   # Server runs on http://localhost:4000
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Default Admin Credentials**
   - Username: `admin`
   - Password: `secret123`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Render deployment instructions.

Quick deploy to Render:
1. Push code to GitHub
2. Go to Render Dashboard → New Blueprint
3. Connect repository and apply `render.yaml`

## Environment Variables

### Backend
```env
PORT=4000
NODE_ENV=production
JWT_SECRET=your-secret-key
ADMIN_USER=admin
ADMIN_PASS=your-secure-password

# Email (optional - for booking confirmations)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
HOTEL_NAME=Your Hotel Name
HOTEL_EMAIL=contact@yourhotel.com
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## Project Structure

```
indraprasta/
├── backend/
│   ├── server.js           # Express server
│   ├── data/              # JSON storage
│   └── uploads/           # File uploads
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   └── api/          # API client
│   └── public/           # Static assets
└── render.yaml           # Render deployment config
```

## API Endpoints

### Public
- `POST /api/bookings` - Create booking
- `GET /api/rooms/status?date=YYYY-MM-DD` - Get room availability

### Admin (requires JWT)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/bookings` - List all bookings
- `POST /api/admin/bookings/offline` - Create offline booking
- `POST /api/admin/rooms/toggle` - Toggle room occupancy
- `POST /api/admin/change-password` - Change admin password
- `POST /api/admin/reset-password` - Reset password

## Room Management System

The system uses **permanent occupancy** logic:
- When a room is marked as "occupied", it becomes unavailable for ALL dates
- When a room is marked as "available" (checkout), it becomes available for ALL dates
- This simulates real hotel occupancy where rooms stay occupied until checkout

## License

UNLICENSED - Private project

## Support

For issues or questions, please open an issue on GitHub.
