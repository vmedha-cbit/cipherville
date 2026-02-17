# CIPHERVILLE V3 - TEST CHECKLIST

Use this checklist to verify all systems working before the event.

---

## ✅ SETUP VERIFICATION

### Environment Files
- [ ] `backend/.env` exists with:
  - MONGO_URI set to a valid MongoDB connection string
  - JWT_SECRET set to any random string
  - PORT=4000
  - ADMIN_DEFAULT_USER=admin
  - ADMIN_DEFAULT_PASS=confidential
  - CLIENT_ORIGIN=http://localhost:5173

- [ ] `frontend/.env` exists with:
  - VITE_API_URL=http://localhost:4000/api
  - VITE_SOCKET_URL=http://localhost:4000

### Dependencies Installed
- [ ] `backend/node_modules/` exists
- [ ] `frontend/node_modules/` exists
- [ ] No npm install errors in console

### Servers Running
- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:5173
- [ ] Backend console shows: "Cipherville API running on 4000"
- [ ] Frontend console shows: "VITE v..." and "Local: http://localhost:5173"

---

## ✅ CONNECTION TESTS

### MongoDB Connection
```bash
# Backend console should show:
# "MongoDB connected successfully"
```
- [ ] Verified in backend console

### API Health Check
```bash
# In browser console:
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```
- [ ] Returns `{ status: "ok" }`

### Socket.io Connection
```bash
# In frontend console, should show:
# "Socket connected: <socket-id>"
```
- [ ] Verified in frontend console (open F12)

---

## ✅ LOGIN & SESSION TESTS

### Test 1: New User Login
1. Go to http://localhost:5173
2. Enter Roll Number: `TEST001`
3. Enter Display Name: `Test Student`
4. Click Login
5. Should redirect to `/officer` page
- [ ] Login succeeded
- [ ] Data saved in localStorage
- [ ] No error messages

### Test 2: Session Recovery (Browser Refresh)
1. Page at `/officer` (from Test 1)
2. Press F5 to refresh
3. Should stay on `/officer` (session maintained)
- [ ] Page didn't redirect to login
- [ ] Session token still valid in localStorage

### Test 3: Session Recovery (Login After Close)
1. Close browser completely
2. Reopen browser
3. Go to http://localhost:5173
4. Enter same Roll Number: `TEST001`
5. Enter any Display Name: `Test Student 2`
6. Click Login
7. Should navigate to `/officer` (resume session)
8. Console should show: `status: "resume-session"`
- [ ] Redirected to correct page
- [ ] Shows resume-session in network tab

### Test 4: Game Already Completed (Rejection)
1. In MongoDB, find user `TEST001`
2. Set `completedAt` to any date
3. Try to login again with same roll number
4. Should show error: "You've already completed this game"
- [ ] Login rejected
- [ ] Error message clear

---

## ✅ ROOM MANAGEMENT TESTS

### Test 5: Create Room (Admin)
1. Backend route: `POST /api/rooms/`
2. Body: `{ timerDuration: 120 }`
3. Should return `{ ok: true, roomId: "ABC123", ... }`
- [ ] Room created successfully
- [ ] Have roomId for next test

### Test 6: Join Room (Participant)
1. Frontend: Enter roomId from Test 5
2. Click "Join Room"
3. Should navigate to `/lobby`
- [ ] Room joined successfully
- [ ] No errors

### Test 7: Room Status Check (Late Joiner)
1. Admin starts room before late joiner joins
2. Late joiner should skip "Waiting for Host" and proceed directly
- [ ] Late joiner detected correctly
- [ ] Auto-navigates to `/officer`

### Test 8: Auto-End Previous Rooms
1. Start Game in Room 1
2. While Room 1 is started, admin creates Room 2
3. Room 1 should auto-end, notifying all participants
4. All participants should be kicked from Room 1
- [ ] Room 1 ended successfully
- [ ] Participants notified

---

## ✅ PHASE 1 TESTS (Progress Persistence - FIX #1)

### Test 9: Sub-phase 0 - QR Code Scanning
1. At `/phase1`, Sub-phase 0
2. Click any QR button (should have one correct, 9 dummy)
3. Check browser console for POST to `/api/participants/scan-qr`
4. **CRITICAL**: Refresh page (F5) immediately
5. Should still show Sub-phase 1, progress bar should reflect completion
6. MongoDB `users` collection should show `phase1Progress.subphase0_completed: true`
- [ ] QR scan recognized
- [ ] Progress persisted to database
- [ ] Refresh didn't lose progress

### Test 10: Sub-phase 1 - Puzzle Completion
1. At `/phase1`, Sub-phase 1
2. Enter month value (01-12)
3. Click Submit
4. Check `/api/participants/verify-puzzle` POST call
5. **CRITICAL**: Refresh page (F5) immediately
6. Should stay on Sub-phase 2 (not go back to Sub-phase 1)
7. MongoDB should show `phase1Progress.subphase1_completed: true` and `mm_value: XX`
- [ ] Puzzle accepted
- [ ] Progress persisted to database
- [ ] Refresh didn't cause regression

### Test 11: Sub-phase 2 - Route Selection
1. At `/phase1`, Sub-phase 2
2. Select any route (only one has key, others are dummy)
3. Check `/api/participants/answer-route` POST
4. On correct route: button becomes disabled and success message shows
5. **CRITICAL**: Refresh page (F5) immediately
6. Should still show route as completed
7. MongoDB should show `phase1Progress.subphase2_completed: true` and `yyyy_value: YYYY`
- [ ] Route answer accepted
- [ ] Progress persisted to database
- [ ] Refresh maintained state

### Test 12: Full Refresh During Phase 1
1. Complete Sub-phases 0 and 1
2. **At Sub-phase 2**: Refresh page (F5)
3. Page should load `/phase1` and automatically jump to Sub-phase 2
4. Previous progress should be visible (progress bar shows 2/3 completed)
- [ ] Progress bar shows correct completion status
- [ ] Correct sub-phase displayed
- [ ] All previous data loaded from DB

---

## ✅ PHASE 2 TESTS

### Test 13: Database Login
1. At `/phase1`, all 3 sub-phases complete
2. Button to "Database Login" should appear
3. Click button → navigate to `/db-login`
4. Try wrong credentials (Officer Name: "Wrong", DOB: "01011990")
5. Should show error
6. Try correct credentials from Phase 1 (Officer assigned during login)
7. Should POST to `/api/participants/db-login`
8. Should navigate to `/phase2`
- [ ] Database login form working
- [ ] Validation working
- [ ] Correct credentials accepted

### Test 14: Phase 2 Questions
1. At `/phase2`
2. Should show 5+ questions
3. Answer a question
4. Should POST to `/api/participants/phase2/answer`
5. Should show checkmark next to answered question
6. Answer all remaining questions
7. After last correct answer, should auto-navigate to `/completion`
- [ ] Questions load correctly
- [ ] Answers submit and validate
- [ ] Progress bar updates
- [ ] Auto-transition on completion

---

## ✅ GAME COMPLETION TESTS

### Test 15: Completion Page
1. After Phase 2 complete, at `/completion`
2. Should show victory message
3. Should show checklist of all completed tasks:
   - [ ] Scanned QR code
   - [ ] Completed puzzle
   - [ ] Answered route
   - [ ] Database login
   - [ ] Answered all questions
4. Click "Return to Login"
5. Should navigate to `/`, clear localStorage, localStorage should be empty
- [ ] All checklist items present
- [ ] Navigation working
- [ ] Session cleared

---

## ✅ TIMER TESTS

### Test 16: Timer Display
1. At any game page (`/officer`, `/phase1`, `/phase2`)
2. Top-right corner should show countdown
3. Format: MM:SS
4. Should decrease every second
- [ ] Timer visible
- [ ] Countdown working
- [ ] Format correct

### Test 17: Timer Expiry
1. Set room timer to 10 seconds (very short for testing)
2. Join game
3. Wait for countdown to reach 0:00
4. Modal should appear: "Time's up!"
5. Game should POST to `/api/participants/end-game` with reason="timeout"
6. Should navigate to `/completion` or login
- [ ] Expiry modal appears
- [ ] Auto-end triggered
- [ ] Game marked as ended

---

## ✅ ADMIN TESTS

### Test 18: Admin Login
1. Go to http://localhost:5173/admin/login
2. Username: `admin`
3. Password: `confidential`
4. Click Login
5. Should navigate to `/admin/dashboard`
- [ ] Admin login working
- [ ] JWT token set

### Test 19: Admin Dashboard
1. At `/admin/dashboard`
2. Should show list of rooms with:
   - Room ID
   - Status (waiting/started/ended)
   - Participant count
   - Timer duration
- [ ] Room list displays correctly
- [ ] Status information accurate

---

## ✅ ERROR HANDLING TESTS

### Test 20: No Session (Access Game Page)
1. Clear localStorage: `localStorage.clear()`
2. Try to navigate to `/phase1` directly
3. Should redirect to `/` (login page)
- [ ] ProtectedRoute working
- [ ] Unauthorized access blocked

### Test 21: Invalid API Response
1. Backend: Stop MongoDB connection (e.g., pull network cable)
2. Try any action (login, scan QR, etc.)
3. Should show error toast/modal
4. Should not crash frontend
- [ ] Error handled gracefully
- [ ] User sees message
- [ ] App doesn't crash

### Test 22: Server Crash Recovery
1. Close backend server
2. Try action from frontend
3. Should show error message
4. Restart backend server
5. Retry action
6. Should work normally
- [ ] Graceful error handling
- [ ] No stuck states

---

## ✅ DATA PERSISTENCE TESTS

### Test 23: User Profile in MongoDB
1. After completing game, check MongoDB
2. Collection: `users`
3. Find user by rollNo
4. Verify fields present:
   - rollNo
   - displayName
   - assignedOfficer (ObjectId)
   - phase1Progress (object with all 3 sub-phases)
   - phase2CorrectQuestions (array of IDs)
   - completedAt (date)
- [ ] All fields present
- [ ] Data correctly formatted

### Test 24: Room in MongoDB
1. Collection: `rooms`
2. Find room by roomId
3. Verify fields:
   - roomId
   - status
   - timerDuration
   - participants (array of user IDs)
   - startedAt
   - endedAt
- [ ] Room record created
- [ ] All timestamps correct

### Test 25: Logs in MongoDB
1. Collection: `logs`
2. Should have entries for:
   - Login entries
   - QR scans
   - Phase 2 answers
   - Game completion
3. Each log should have timestamp and event type
- [ ] Logging working
- [ ] Event types correct
- [ ] Timestamps accurate

---

## 🎯 SUMMARY

**All 25 tests passed? Great! Your instance is ready for the event.**

| Category | Tests | Passed |
|----------|-------|--------|
| Setup | 3 | ☐ |
| Connection | 3 | ☐ |
| Login/Session | 4 | ☐ |
| Rooms | 4 | ☐ |
| Phase 1 (FIX #1) | 4 | ☐ |
| Phase 2 | 2 | ☐ |
| Completion | 1 | ☐ |
| Timer | 2 | ☐ |
| Admin | 2 | ☐ |
| Error Handling | 3 | ☐ |
| Data | 3 | ☐ |
| **TOTAL** | **25** | **☐** |

---

**Ready to run your event? Good luck! 🎮🏆**
