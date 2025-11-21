# Hotel Backend (Standalone)

Moved outside `frontend/` for clearer separation.

## Endpoints
- POST /api/admin/login
- POST /api/bookings
- POST /api/admin/bookings/offline
- GET /api/admin/bookings
- GET /api/admin/availability?date=YYYY-MM-DD
- GET /api/uploads/<filename>

## Run
```bash
npm install
npm run dev
```
Backend port: 4000 (configure via PORT env).

## Environment
ADMIN_USER=admin
ADMIN_PASS=secret123
JWT_SECRET=devsecret
TOTAL_ROOMS=30 (constant in code)

Bookings stored in `data/bookings.json`.
Uploads saved under `uploads/`.
