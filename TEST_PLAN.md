# HMS Authentication System - Test Plan

## Test Environment
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Database**: MongoDB (local or Atlas)
- **Browser**: Chrome/Firefox/Edge with DevTools

---

## Test Suite 1: Login Flow

### TC1.1: Successful Login - Doctor
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `doctor@hms.local`
3. Enter password: `SecurePass123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ No error message
- ✅ Page redirects to `/dashboard/doctor`
- ✅ Doctor Dashboard loads with clinical metrics
- ✅ localStorage contains: `hms_access_token`, `hms_refresh_token`, `hms_user`

### TC1.2: Successful Login - Nurse
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `nurse@hms.local`
3. Enter password: `SecurePass123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ Page redirects to `/dashboard/nurse`
- ✅ Nurse Dashboard loads with ward metrics

### TC1.3: Successful Login - Admin
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `admin@hms.local`
3. Enter password: `SecurePass123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ Page redirects to `/dashboard/admin`
- ✅ Admin Dashboard loads with system metrics

### TC1.4: Invalid Email Format
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `not-an-email`
3. Enter password: `SecurePass123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ Error message: "Please enter a valid email address"
- ✅ Form doesn't submit
- ✅ User stays on login page

### TC1.5: Empty Email
**Steps:**
1. Navigate to http://localhost:5173/login
2. Leave email empty
3. Enter password: `SecurePass123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ Error message: "Email is required"
- ✅ Form doesn't submit

### TC1.6: Empty Password
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `doctor@hms.local`
3. Leave password empty
4. Click "Secure Login"

**Expected Result:**
- ✅ Error message: "Password is required"
- ✅ Form doesn't submit

### TC1.7: Wrong Password
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `doctor@hms.local`
3. Enter password: `WrongPassword123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ Error message: "Invalid credentials" or similar
- ✅ User stays on login page
- ✅ No tokens stored

### TC1.8: Non-existent User
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter email: `nonexistent@hms.local`
3. Enter password: `SecurePass123!`
4. Click "Secure Login"

**Expected Result:**
- ✅ Error message: "Invalid credentials" or similar
- ✅ User stays on login page

### TC1.9: Password Visibility Toggle
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter password: `SecurePass123!`
3. Verify password shows as dots (masked)
4. Click eye icon
5. Verify password is now visible as text
6. Click eye icon again
7. Verify password is masked again

**Expected Result:**
- ✅ Password correctly toggles between visible and masked
- ✅ Form remains filled during toggle

### TC1.10: Rate Limiting (5 attempts per 15 minutes)
**Steps:**
1. Navigate to http://localhost:5173/login
2. Attempt login 5 times with wrong password
3. Attempt 6th login

**Expected Result:**
- ✅ First 5 attempts show "Invalid credentials"
- ✅ 6th attempt shows: "Too many login attempts. Please try again after 15 minutes."
- ✅ Button becomes disabled

---

## Test Suite 2: Protected Routes

### TC2.1: Access Protected Route While Logged Out
**Steps:**
1. Open browser DevTools → Application → localStorage
2. Clear localStorage
3. Navigate to http://localhost:5173/dashboard

**Expected Result:**
- ✅ Redirected to http://localhost:5173/login
- ✅ No access to protected content

### TC2.2: Access Dashboard While Logged In
**Steps:**
1. Login successfully
2. Navigate to http://localhost:5173/dashboard
3. Try all role-specific dashboards

**Expected Result:**
- ✅ General dashboard accessible
- ✅ Own role dashboard accessible
- ✅ Other role dashboards show "Access Denied"

### TC2.3: Doctor Accessing Nurse Dashboard
**Steps:**
1. Login as doctor@hms.local
2. Navigate to http://localhost:5173/dashboard/nurse
3. Click browser back button

**Expected Result:**
- ✅ Shows "Access Denied" with 🔐 icon
- ✅ Message: "Your role (DOCTOR) does not have access"
- ✅ Lists required roles

### TC2.4: Nurse Accessing Admin Dashboard
**Steps:**
1. Login as nurse@hms.local
2. Navigate to http://localhost:5173/dashboard/admin

**Expected Result:**
- ✅ Shows "Access Denied" message
- ✅ Cannot access admin content

### TC2.5: Direct URL Access to Non-existent Route
**Steps:**
1. Login successfully
2. Navigate to http://localhost:5173/non-existent-route

**Expected Result:**
- ✅ Redirected to http://localhost:5173/dashboard
- ✅ User stays logged in

---

## Test Suite 3: Logout Flow

### TC3.1: Logout Button Functionality
**Steps:**
1. Login successfully
2. Click "Secure Logout" button
3. Verify page redirects to /login

**Expected Result:**
- ✅ Redirected to http://localhost:5173/login
- ✅ localStorage is cleared (no tokens)
- ✅ Browser back button doesn't go back to dashboard

### TC3.2: Logout Disables Access to Protected Routes
**Steps:**
1. Login and note the URL (should be /dashboard/role)
2. Click "Secure Logout"
3. Navigate directly to /dashboard

**Expected Result:**
- ✅ Redirected to /login immediately
- ✅ Cannot access dashboard

### TC3.3: Logout Button Shows Loading State
**Steps:**
1. Login successfully
2. Click "Secure Logout"
3. Observe button during logout

**Expected Result:**
- ✅ Button text changes to "Logging out..."
- ✅ Button is disabled during logout
- ✅ Returns to "Secure Logout" after completion

### TC3.4: Backend Receives Logout Request
**Steps:**
1. Login successfully
2. Open DevTools → Network tab
3. Click "Secure Logout"
4. Check network requests

**Expected Result:**
- ✅ POST request to `/api/auth/logout`
- ✅ Request includes Authorization header with token
- ✅ Response status is 200 OK

---

## Test Suite 4: Session Persistence

### TC4.1: Session Persists After Page Refresh
**Steps:**
1. Login successfully
2. Verify on dashboard
3. Press F5 to refresh page
4. Observe page behavior

**Expected Result:**
- ✅ Page stays on same dashboard (no redirect to login)
- ✅ User info still displayed
- ✅ No loading spinner after refresh

### TC4.2: Session Persists After Browser Tab Switch
**Steps:**
1. Login successfully
2. Open new browser tab
3. Navigate to http://localhost:5173/login
4. Verify current state

**Expected Result:**
- ✅ If tokens still valid in localStorage, should redirect to dashboard
- ✅ Or shows login form if localStorage cleared

### TC4.3: Session Cleared After localStorage Clear
**Steps:**
1. Login successfully
2. Open DevTools → Application → localStorage
3. Delete all HMS-related items
4. Refresh page

**Expected Result:**
- ✅ Redirected to /login
- ✅ No user info displayed

### TC4.4: Multiple Logins Don't Conflict
**Steps:**
1. Login as doctor
2. Logout
3. Login as nurse
4. Verify on nurse dashboard

**Expected Result:**
- ✅ Successfully switched to nurse
- ✅ User info updated correctly
- ✅ Dashboard metrics match nurse role

---

## Test Suite 5: API Integration

### TC5.1: Verify Access Token Sent with Protected Requests
**Steps:**
1. Login successfully
2. Open DevTools → Network tab
3. Navigate to any dashboard
4. Click on an action (e.g., Secure Logout)

**Expected Result:**
- ✅ Request includes `Authorization: Bearer <token>`
- ✅ Token is the same as in localStorage

### TC5.2: API Response Includes User Data
**Steps:**
1. Open DevTools → Network tab
2. Navigate to http://localhost:5173/login
3. Login successfully
4. Check the `/api/auth/login` response

**Expected Result:**
- ✅ Response includes: `accessToken`, `refreshToken`, `user`
- ✅ User object includes: `id`, `email`, `firstName`, `lastName`, `role`

### TC5.3: CORS Policy Respected
**Steps:**
1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:5173
3. Login successfully

**Expected Result:**
- ✅ No CORS errors in console
- ✅ API calls succeed with credentials

### TC5.4: Invalid Token Rejected
**Steps:**
1. Login successfully
2. Open DevTools → Application → localStorage
3. Modify the access token (change a character)
4. Refresh page

**Expected Result:**
- ✅ Protected route redirects to login
- ✅ Modified token is invalid

---

## Test Suite 6: Error Handling

### TC6.1: Backend Unavailable
**Steps:**
1. Stop the backend server
2. Try to login

**Expected Result:**
- ✅ Error message displayed: "Network error" or "Server unavailable"
- ✅ Clear error message to user

### TC6.2: Network Timeout
**Steps:**
1. Backend running very slowly
2. Attempt login
3. Wait for timeout

**Expected Result:**
- ✅ Timeout message displayed
- ✅ User can retry

### TC6.3: Corrupted localStorage Token
**Steps:**
1. Login successfully
2. Modify token in localStorage (corrupt it)
3. Refresh page

**Expected Result:**
- ✅ Redirected to login (invalid token detected)
- ✅ Clear error message or silent redirect

---

## Test Suite 7: User Experience

### TC7.1: Loading States Visible
**Steps:**
1. Add DevTools throttling (slow 3G)
2. Click login button
3. Observe UI during load

**Expected Result:**
- ✅ Button shows loading state ("Authenticating...")
- ✅ Button is disabled during request
- ✅ No frozen UI

### TC7.2: Clear Success/Error Messages
**Steps:**
1. Attempt various login scenarios
2. Check error/success messages

**Expected Result:**
- ✅ All messages are clear and actionable
- ✅ No technical error codes shown to user
- ✅ Messages indicate what to do next

### TC7.3: Accessibility
**Steps:**
1. Test with keyboard only (Tab, Enter)
2. Test form navigation without mouse

**Expected Result:**
- ✅ Can navigate between fields with Tab
- ✅ Can submit form with Enter
- ✅ Focus indicators visible

### TC7.4: Responsive Design
**Steps:**
1. Login on desktop view
2. Resize browser to mobile (375px width)
3. Test on mobile device

**Expected Result:**
- ✅ Login form responsive on mobile
- ✅ All buttons clickable on touch
- ✅ Text readable

---

## Test Execution Checklist

### Pre-Test
- [ ] MongoDB running and empty
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend server started (`node server.js`)
- [ ] Frontend dev server started (`npm run dev`)
- [ ] Browser DevTools open and console clear

### Execution
- [ ] Run Test Suite 1 (Login Flow)
- [ ] Run Test Suite 2 (Protected Routes)
- [ ] Run Test Suite 3 (Logout Flow)
- [ ] Run Test Suite 4 (Session Persistence)
- [ ] Run Test Suite 5 (API Integration)
- [ ] Run Test Suite 6 (Error Handling)
- [ ] Run Test Suite 7 (User Experience)

### Post-Test
- [ ] Document any failures
- [ ] Note any UI/UX improvements
- [ ] Check performance metrics
- [ ] Review security logs

---

## Test Results Template

```
Test Date: ___________
Tester Name: ___________
Environment: Development / Production / Staging

Test Suite: ___________
Total Tests: ___________
Passed: ___________
Failed: ___________
Skipped: ___________

Issues Found:
- [ ] Issue 1: ___________
- [ ] Issue 2: ___________
- [ ] Issue 3: ___________

Recommendations:
___________

Signed Off: __________ Date: __________
```

---

**Status**: ✅ Test Plan Complete
**Version**: 1.0
**Last Updated**: 2026-08-31
