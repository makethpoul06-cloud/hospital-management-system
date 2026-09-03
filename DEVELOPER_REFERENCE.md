# HMS Authentication - Developer Quick Reference

## 🚀 Quick Start Command

```bash
# Terminal 1: Backend
cd C:\Users\USER\Desktop\HMS\backend && node server.js

# Terminal 2: Frontend
cd C:\Users\USER\Desktop\HMS\frontend && npm run dev
```

Then open: **http://localhost:5173/login**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Doctor | `doctor@hms.local` | `SecurePass123!` |
| Nurse | `nurse@hms.local` | `SecurePass123!` |
| Admin | `admin@hms.local` | `SecurePass123!` |

---

## 📁 Key Files

### Frontend
| File | Purpose |
|------|---------|
| `src/context/AuthContext.jsx` | Auth state management |
| `src/hooks/useAuth.js` | Custom hook for auth |
| `src/components/ProtectedRoute.jsx` | Route protection |
| `src/Pages/Login.jsx` | Login form |
| `src/App.jsx` | Routing setup |
| `src/.env` | Frontend env vars |

### Backend
| File | Purpose |
|------|---------|
| `middleware/rateLimiter.js` | Rate limiting |
| `middleware/authmiddleware.js` | JWT verification |
| `controllers/authcontroller.js` | Auth logic |
| `routes/auth.routes.js` | API endpoints |

---

## 🔑 Using Auth in Components

### Get User Info
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  return <h1>Hello, {user?.firstName}!</h1>;
}
```

### Logout User
```jsx
import { useAuth } from '../hooks/useAuth';

function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

### Check User Role
```jsx
import { useAuth } from '../hooks/useAuth';

function AdminPanel() {
  const { user } = useAuth();
  
  if (user?.role !== 'ADMIN') {
    return <p>Access Denied</p>;
  }
  
  return <div>Admin Content</div>;
}
```

---

## 🛣️ Route Protection

### Protect a Route
```jsx
// In App.jsx
<Route
  path="/admin-panel"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### Protect Multiple Roles
```jsx
<ProtectedRoute allowedRoles={['DOCTOR', 'NURSE']}>
  <MedicalDashboard />
</ProtectedRoute>
```

### Unprotected Route
```jsx
<Route path="/login" element={<Login />} />
```

---

## 🔌 API Integration

### Login API Call (handled by AuthContext)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hms.local",
  "password": "SecurePass123!"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "123456",
    "email": "doctor@hms.local",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DOCTOR"
  }
}
```

### Logout API Call (handled by AuthContext)
```
POST /api/auth/logout
Authorization: Bearer <access_token>

Response:
{
  "message": "Logged out successfully"
}
```

### Making Authenticated Requests
```jsx
// Method 1: Use useAuth hook for token
const { user } = useAuth();
const token = localStorage.getItem('hms_access_token');

fetch('http://localhost:5000/api/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});
```

---

## 🛡️ Security Features

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Sensitive Actions**: 10 requests per 1 hour
- **Global**: 200 requests per 15 minutes

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days (or longer)

### Password Requirements
- Minimum 8 characters
- Uppercase letter required
- Lowercase letter required
- Number required
- Special character required

---

## 🧪 Common Testing Tasks

### Test Login
1. Go to http://localhost:5173/login
2. Enter `doctor@hms.local` / `SecurePass123!`
3. Click "Secure Login"
4. Verify redirects to `/dashboard/doctor`

### Test Protected Route
1. Logout
2. Try to access `/dashboard`
3. Verify redirects to `/login`

### Test Role Access
1. Login as doctor
2. Try to access `/dashboard/nurse`
3. Verify shows "Access Denied"

### Test Token Refresh
1. Login successfully
2. Wait until token expires (15 minutes)
3. Try to access protected endpoint
4. Verify gets new token automatically

---

## 🐛 Debugging

### Check Auth State
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('hms_user'));
const token = localStorage.getItem('hms_access_token');
console.log({user, token});
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "XHR"
4. Check `/api/auth/` requests

### Check Errors
1. Open DevTools Console (F12)
2. Look for red error messages
3. Check error details in console

### Simulate Slow Network
1. Open DevTools (F12)
2. Go to Network tab
3. Select throttling speed (e.g., "Slow 3G")
4. Reload page to see loading states

---

## 📝 Common Tasks

### Add New Protected Route
```jsx
// In App.jsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute allowedRoles={['DOCTOR']}>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### Add New API Endpoint
```javascript
// In backend/routes/auth.routes.js
router.get('/new-endpoint', protect, restrictTo('DOCTOR'), (req, res) => {
  res.json({ data: 'only doctors can access' });
});
```

### Update Environment Variables
```
Frontend: src/.env
Backend: backend/.env

Then restart servers
```

### Clear User Session
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

## ⚙️ Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=HMS - Hospital Management System
VITE_SESSION_TIMEOUT=1800000
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hms
JWT_SECRET=your-secret-key
REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 Workflow

### Developer Workflow
```
1. Start backend: node server.js
2. Start frontend: npm run dev
3. Make changes to React files
4. Vite auto-reloads (HMR)
5. Test in browser
6. Build when ready: npm run build
```

### Adding a Feature
```
1. Create new component file
2. Use useAuth hook if needed
3. Protect routes with ProtectedRoute
4. Test with different roles
5. Run tests
6. Build and verify
```

### Fixing a Bug
```
1. Identify issue in console
2. Check Network tab for API errors
3. Review code in affected file
4. Make fix
5. Test fix in browser
6. Build to verify
```

---

## 📚 Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - Overview of what was built
- **AUTH_DOCUMENTATION.md** - Technical architecture details
- **QUICK_START.md** - Setup and testing guide
- **TEST_PLAN.md** - 50+ detailed test cases

---

## 🚀 Deployment Checklist

- [ ] Update backend .env with production secrets
- [ ] Update frontend VITE_API_URL to production backend
- [ ] Run backend tests
- [ ] Run frontend tests and build
- [ ] Set MongoDB connection to production DB
- [ ] Enable HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set up rate limiter appropriately
- [ ] Enable audit logging
- [ ] Test login flow in production
- [ ] Monitor logs for errors

---

## 💡 Pro Tips

1. **Use useAuth Hook** - Always use the hook instead of direct localStorage access
2. **Check Tokens in Console** - `localStorage.getItem('hms_access_token')`
3. **Network Tab is Your Friend** - Check API responses when things break
4. **Test All Roles** - Always test as each role to catch permission issues
5. **Read Error Messages** - Frontend shows clear error messages for debugging
6. **Restart on Changes** - Restart servers after changing .env files

---

## 📞 Need Help?

1. Check **AUTH_DOCUMENTATION.md** for technical details
2. Review **TEST_PLAN.md** for testing procedures
3. Check browser console for error messages
4. Check DevTools Network tab for API errors
5. Verify backend is running: `curl http://localhost:5000/health`
6. Clear localStorage and try again: `localStorage.clear()`

---

**Last Updated**: August 31, 2026
**Status**: ✅ Production Ready
