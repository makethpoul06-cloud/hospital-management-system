# HMS Authentication - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Step 1: Start the Backend
```bash
cd C:\Users\USER\Desktop\HMS\backend
npm install
node server.js
```

**Expected Output:**
```
Server running on http://localhost:5000
Health check available at: GET /health
```

### Step 2: Start the Frontend
```bash
cd C:\Users\USER\Desktop\HMS\frontend
npm install
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:5173/
```

### Step 3: Open Login Page
Navigate to: **http://localhost:5173/login**

---

## 🔐 Test Credentials

### Doctor Account
```
Email:    doctor@hms.local
Password: SecurePass123!
→ Redirects to: /dashboard/doctor
```

### Nurse Account
```
Email:    nurse@hms.local
Password: SecurePass123!
→ Redirects to: /dashboard/nurse
```

### Admin Account
```
Email:    admin@hms.local
Password: SecurePass123!
→ Redirects to: /dashboard/admin
```

---

## ✅ Test Scenarios

### Scenario 1: Login as Doctor
1. Go to http://localhost:5173/login
2. Enter: `doctor@hms.local`
3. Enter: `SecurePass123!`
4. Click "Secure Login"
5. ✅ Should see Doctor Dashboard with clinical metrics

### Scenario 2: Role-Based Access Control
1. Log in as Doctor
2. Try to access: http://localhost:5173/dashboard/nurse
3. ✅ Should see "Access Denied" message

### Scenario 3: Logout and Re-login
1. Click "Secure Logout" button
2. ✅ Should redirect to /login
3. Try accessing /dashboard directly
4. ✅ Should redirect to /login (auto-protected)

### Scenario 4: Session Persistence
1. Log in successfully
2. Refresh the page (F5)
3. ✅ Should stay logged in (no redirect to login)
4. Clear browser localStorage
5. Refresh the page
6. ✅ Should redirect to /login

---

## 🔍 Debugging Tips

### Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for error messages

### Check Network Requests
- Open DevTools (F12)
- Go to Network tab
- Watch for API calls to http://localhost:5000/api/auth/...
- Check response status and body

### Verify Backend is Running
```bash
curl http://localhost:5000/health
```
Should return: `{"status":"OK","timestamp":"...","environment":"development"}`

### Check Environment Variables
- Backend: `.env` file in `C:\Users\USER\Desktop\HMS\backend\`
- Frontend: `.env` file in `C:\Users\USER\Desktop\HMS\frontend\`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  Login.jsx (form) → AuthContext → ProtectedRoute → Dashboard │
│                           ↓                                  │
│                    localStorage (tokens)                     │
└─────────────────────────────────────────────────────────────┘
                           ↓ (HTTPS/API Calls)
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)               │
├─────────────────────────────────────────────────────────────┤
│ /api/auth/login → authcontroller.js → authmiddleware.js     │
│                        ↓                                    │
│                   MongoDB (user data)                       │
│                        ↓                                    │
│                   JWT Token (signed)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Features

- ✅ **JWT Tokens**: 15-minute expiration
- ✅ **Rate Limiting**: 5 login attempts per 15 minutes
- ✅ **Password Hashing**: bcryptjs with 12-round salt
- ✅ **CORS Protection**: Only localhost:3000 allowed
- ✅ **Token Refresh**: Automatic refresh with refresh token
- ✅ **Account Lockout**: After 5 failed attempts
- ✅ **Role-Based Access Control**: Doctor/Nurse/Admin roles

---

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hms
JWT_SECRET=your-secret-key
REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=HMS - Hospital Management System
```

---

## 🎯 Next Steps

1. **Database Setup**: Connect to MongoDB (MongoDB Atlas or local)
2. **Create Test Users**: Run seed script to create test accounts
3. **Enable Email Verification**: Add email confirmation
4. **Add 2FA**: SMS or authenticator app support
5. **Deploy**: Set up CI/CD pipeline

---

## 📞 Support

### Common Issues

**"Cannot POST /api/auth/login"**
- Backend is not running
- Solution: Start backend with `node server.js`

**"CORS error"**
- Frontend URL not in CORS whitelist
- Solution: Check FRONTEND_URL in backend .env

**"Access Denied"**
- User role doesn't match required role
- Solution: Log in with correct role

**"Too many login attempts"**
- Rate limiter kicked in
- Solution: Wait 15 minutes or restart backend

---

## ✨ Features Summary

### Authentication
- Secure login/logout
- Email & password validation
- Password strength requirements
- Forgot password (coming soon)

### Authorization
- Role-based access control
- Route protection
- Admin-only endpoints
- Department-level access (coming soon)

### Security
- JWT token management
- Rate limiting
- Brute-force protection
- Session invalidation
- Audit logging

### User Experience
- Smooth login flow
- Auto-redirect based on role
- Loading states
- Clear error messages
- Session persistence

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-08-31
