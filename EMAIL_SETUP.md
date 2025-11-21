# Email & Receipt Setup Guide

## Features Added ✨

1. **Automatic Email Confirmation**
   - Customers receive booking confirmation emails
   - Email includes PDF receipt attachment
   - Professional HTML email template

2. **PDF Receipt Generation**
   - Automatically generated for every booking
   - Contains all booking details
   - Downloadable from admin panel and receipt page

3. **Receipt Page**
   - Beautiful confirmation page after booking
   - Shows all booking details
   - Download PDF receipt button
   - Access via `/receipt/{bookingId}`

## Setup Instructions

### 1. Gmail Setup (Recommended)

#### Enable App Password:
1. Go to your Google Account: https://myaccount.google.com
2. Select **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords**: https://myaccount.google.com/apppasswords
5. Select "Mail" and your device
6. Generate password (16-character code)
7. Copy this password

#### Set Environment Variables:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # Your 16-character app password
HOTEL_NAME=Indraprasta Hotel
HOTEL_EMAIL=info@indraprasta.com
```

### 2. Other Email Services

#### Outlook/Hotmail:
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo:
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP:
For custom SMTP servers, modify `server.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourprovider.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});
```

### 3. Local Development

#### Without Email (Testing):
- Leave `EMAIL_USER` and `EMAIL_PASS` empty
- Receipts will still be generated
- Check console logs for email content
- PDFs saved in `backend/receipts/`

#### With Email (Full Testing):
1. Create `backend/.env` file:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=test@gmail.com
   EMAIL_PASS=your-app-password
   HOTEL_NAME=Test Hotel
   HOTEL_EMAIL=test@hotel.com
   ```

2. Restart backend server
3. Make a test booking
4. Check email inbox

### 4. Render Deployment

#### Set Environment Variables in Render:
1. Go to your backend service
2. Navigate to **Environment** tab
3. Add these variables:
   ```
   EMAIL_SERVICE = gmail
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-app-password
   HOTEL_NAME = Indraprasta Hotel
   HOTEL_EMAIL = info@indraprasta.com
   ```
4. Save changes
5. Service will auto-restart

## Testing

### Test Email Locally:
```bash
cd backend
# Set environment variables in .env file
npm start
```

### Test Booking Flow:
1. Go to `/booking` page
2. Fill form with your email
3. Select rooms and submit
4. You'll be redirected to receipt page
5. Check your email for confirmation
6. Click "Download PDF Receipt"

### Admin Panel:
1. Login to `/admin`
2. View "All Bookings" table
3. Click "📄 PDF" link to download any receipt
4. Email column shows customer emails

## Troubleshooting

### Email Not Sending:

**Check 1: Gmail App Password**
- Must use App Password, not regular password
- 2FA must be enabled
- Password should be 16 characters (4 groups of 4)

**Check 2: Environment Variables**
```bash
# Backend logs should show:
"Email not configured, skipping email send"  # If vars not set
# OR
"Email send error: [error message]"  # If sending failed
```

**Check 3: Gmail Account Settings**
- Less secure app access might be blocked
- Use App Passwords instead

**Check 4: Firewall/Network**
- Port 587 must be open for SMTP
- Check with your hosting provider

### PDF Not Generating:

**Check 1: File Permissions**
```bash
# Ensure receipts directory exists and is writable
mkdir backend/receipts
chmod 755 backend/receipts
```

**Check 2: Dependencies**
```bash
cd backend
npm install pdfkit
```

**Check 3: Logs**
- Check backend console for errors
- Look for "Receipt generation error"

### Receipt Page 404:

**Check 1: Route Added**
- Verify Receipt component is imported in App.jsx
- Route `/receipt/:bookingId` should exist

**Check 2: Booking ID**
- Must be valid UUID
- Check URL in browser

## Email Template Customization

Edit email HTML in `backend/server.js`:

```javascript
async function sendBookingEmail(booking, receiptPath) {
  const mailOptions = {
    subject: `Booking Confirmation - ${HOTEL_NAME}`,
    html: `
      <!-- Customize your email template here -->
      <h2>Your Custom Header</h2>
      <p>Custom content...</p>
    `
  };
}
```

## PDF Customization

Edit PDF generation in `backend/server.js`:

```javascript
function generateReceipt(booking) {
  // Customize PDF styling
  doc.fontSize(24).fillColor('blue').text('Custom Header');
  // Add logo, colors, layout, etc.
}
```

## Production Best Practices

1. **Use Environment Variables**
   - Never commit email credentials
   - Use Render environment settings

2. **Email Rate Limits**
   - Gmail: ~500 emails/day
   - Consider SendGrid/Mailgun for high volume

3. **Receipt Storage**
   - On free tier, receipts are temporary
   - Upgrade to paid tier for persistent storage
   - Or use cloud storage (S3, Cloudinary)

4. **Error Handling**
   - Emails fail silently (don't block bookings)
   - Receipts always generated
   - Admin can re-send via "Generate Receipt" button

## Support

- Email not sending? Check Gmail app password setup
- PDF issues? Verify pdfkit installation
- Deployment issues? Check Render environment variables
- Custom SMTP? Update transporter configuration

## Features Summary

✅ Automatic email confirmations
✅ PDF receipt generation
✅ Beautiful receipt page
✅ Admin receipt downloads
✅ Email with PDF attachment
✅ Works without email (PDFs only)
✅ Professional templates
✅ Error handling & logging
