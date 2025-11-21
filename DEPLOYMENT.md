# Deployment Guide for Render

## Prerequisites
- GitHub account with repository pushed
- Render account (free tier available at https://render.com)

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Create New Blueprint on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository (indraprasta)
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables**
   - Backend service will auto-generate JWT_SECRET
   - Set ADMIN_PASS in Render dashboard (Backend service → Environment)
   - Frontend VITE_API_URL will auto-link to backend URL

### Option 2: Manual Setup

#### Backend Deployment
1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name**: hotel-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT` = 4000
     - `NODE_ENV` = production
     - `JWT_SECRET` = (generate random string)
     - `ADMIN_USER` = admin
     - `ADMIN_PASS` = secret123 (change this!)
     - `EMAIL_SERVICE` = gmail (optional)
     - `EMAIL_USER` = your-email@gmail.com (optional)
     - `EMAIL_PASS` = your-app-password (optional)
     - `HOTEL_NAME` = Your Hotel Name
     - `HOTEL_EMAIL` = your-hotel@example.com

#### Frontend Deployment
1. Wait for backend to deploy, copy its URL (e.g., https://hotel-backend-xyz.onrender.com)
2. Create new Static Site:
   - **Name**: hotel-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = (paste backend URL from step 1)

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spindown takes ~30 seconds
- No persistent disk storage (uploads will be lost on restart)

### Data Persistence
For production use, consider:
- Upgrading to paid tier for persistent disk
- Using external database (MongoDB Atlas, PostgreSQL)
- Using cloud storage (AWS S3, Cloudinary) for uploads

### Email Configuration (Optional)

To enable automatic email confirmations with receipts:

1. **For Gmail:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use this app password (not your regular password) for `EMAIL_PASS`

2. **Set Environment Variables:**
   - `EMAIL_SERVICE` = gmail
   - `EMAIL_USER` = your-email@gmail.com
   - `EMAIL_PASS` = your-16-character-app-password
   - `HOTEL_NAME` = Your Hotel Name
   - `HOTEL_EMAIL` = contact email shown in receipts

3. **Without Email:**
   - Leave EMAIL_USER and EMAIL_PASS empty
   - Receipts will still be generated and downloadable
   - No emails will be sent

### Security
1. **Change default admin password** in Render dashboard
2. Generate strong JWT_SECRET
3. Set proper CORS origins in production
4. Never commit .env files with real credentials

## Post-Deployment

### Update CORS (if needed)
If frontend and backend have different domains, update `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-url.onrender.com'
}));
```

### Test the Deployment
1. Visit your frontend URL
2. Try booking a room
3. Login to admin panel (admin / your-password)
4. Test room management

## Troubleshooting

### Backend not responding
- Check Render logs for errors
- Verify environment variables are set
- Ensure PORT is 4000 or use process.env.PORT

### Frontend can't connect to backend
- Verify VITE_API_URL is correctly set
- Check Network tab in browser DevTools
- Ensure backend is running (check Render dashboard)

### Uploads not working
- Free tier has no persistent storage
- Files uploaded will disappear on restart
- Consider upgrading or using external storage

## Monitoring
- View logs in Render dashboard under each service
- Set up alerts for service failures
- Monitor response times

## Costs
- Free tier: $0/month (with limitations)
- Starter tier: $7/month per service (persistent disk, no spindown)
