# CIPHERVILLE V3 - DEPLOYMENT & TROUBLESHOOTING GUIDE

## 🚀 LOCAL DEPLOYMENT (Development)

### Step 1: MongoDB Setup
```bash
# Option A: MongoDB Atlas Cloud
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create a free cluster
# 3. Get connection string (mongodb+srv://...)
# 4. Add to backend/.env as MONGO_URI

# Option B: Local MongoDB
# Install and run locally
mongod --dbpath /path/to/data
```

### Step 2: Backend Start
```bash
cd backend
npm install
# Configure backend/.env with:
# - MONGO_URI
# - JWT_SECRET (any random string)
# - ADMIN_DEFAULT_USER=admin
# - ADMIN_DEFAULT_PASS=confidential
npm run dev
# Should see: "Cipherville API running on 4000"
```

### Step 3: Frontend Start (separate terminal)
```bash
cd frontend
npm install
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Step 4: Test
Visit http://localhost:5173
- Login with any Roll Number and Name
- Should see error about room not existing (expected)

---

## 🛠️ TROUBLESHOOTING

### Issue: "Cannot find module 'mongoose'"
**Solution:** `cd backend && npm install`

### Issue: "MONGO_URI is required"
**Solution:** Check backend/.env file exists and has MONGO_URI value

### Issue: CORS error from frontend
**Solution:** Check CLIENT_ORIGIN in backend/.env matches frontend URL (http://localhost:5173)

### Issue: API requests failing with 401
**Solution:** Clear localStorage and login again
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Issue: Socket.io not connecting
**Solution:** Check VITE_SOCKET_URL in frontend/.env matches backend (http://localhost:4000)

### Issue: Phase 1 progress lost on refresh
**Solution:** This should NOT happen in V3. If it does:
1. Check MongoDB connection (is data actually saving?)
2. Check browser console for API errors
3. Check backend console for error logs
4. Verify User model has `phase1Progress` field

---

## 📦 PRODUCTION DEPLOYMENT

### Option A: Vercel (Frontend) + VPS (Backend)

**Frontend (Vercel):**
```bash
# In frontend directory:
npm run build  # Creates dist/
# Push to GitHub
# Connect repo to Vercel in dashboard
# Set environment variables:
#   VITE_API_URL=https://your-api.com/api
#   VITE_SOCKET_URL=https://your-api.com
```

**Backend (VPS):**
```bash
# On your VPS (Ubuntu):
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <repo-url>
cd backend
npm install

# Create .env with production values
nano .env
# Set:
# PORT=4000
# MONGO_URI=<production-mongo>
# JWT_SECRET=<secure-random-string>
# CLIENT_ORIGIN=<frontend-url>
# etc.

# Install PM2 to keep running
npm install -g pm2
pm2 start src/index.js --name cipherville-api
pm2 save
pm2 startup  # Auto-restart on reboot

# Setup nginx reverse proxy (optional but recommended)
```

### Option B: Docker

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]
```

```bash
# Build and run
docker build -t cipherville-api .
docker run -e MONGO_URI=<url> -p 4000:4000 cipherville-api
```

---

## 👥 RUNNING FOR THE EVENT

### Before Event:
```bash
# 1. Test everything locally
npm run dev (backend)
npm run dev (frontend)

# 2. Create sample data
# Add officers, stories, puzzles to MongoDB
# (Provide admin UI for this, or pre-load data)

# 3. Set up admin account
# Default: admin / confidential
# Change password immediately

# 4. Test game flow end-to-end
# Create test room, join, complete game
```

### During Event:
```bash
# 1. Backend running on server
# 2. Frontend deployed publicly
# 3. Students get room ID to join
# 4. Admin monitors in real-time dashboard
# 5. Collect logs/analytics after event
```

### Sample Admin Workflow:
```
1. Admin logs in at /admin/login
2. Creates room (gets unique ID like ABC123)
3. Invites participants: "Enter room ABC123"
4. Monitor participants' progress
5. Start game when all ready
6. Timer counts down for all
7. End game when done or time expires
8. View completion statistics
```

---

## 📊 MONITORING & ANALYTICS

### Logs
All events logged to MongoDB `logs` collection:
- User logins/logouts
- Room creation/start/end
- QR scans, puzzle completion, route answers
- DB logins, case submissions
- Socket connections/disconnections

### Queries to Monitor:
```javascript
// Active games
db.rooms.find({ status: "started" });

// Game completions
db.users.find({ completedAt: { $exists: true } });

// Drop rates by phase
db.users.aggregate([
  { $group: { _id: "$phase", count: { $sum: 1 } } }
]);
```

---

## 🔐 SECURITY CHECKLIST

- [ ] JWT_SECRET is strong (not "secret")
- [ ] MONGODB_URI uses strong password
- [ ] ADMIN_DEFAULT_PASS is changed immediately
- [ ] CORS only allows expected origins
- [ ] Rate limiting enabled on /auth endpoints
- [ ] HTTPS enabled in production
- [ ] Helmet security headers configured
- [ ] No sensitive data in logs
- [ ] Regular backups of MongoDB

---

## 📱 RUNNING ON DIFFERENT PORTS

If port 4000/5173 already in use:

**Backend (different port):**
```bash
# backend/.env
PORT=5000  # Change to any available port
```

**Frontend (different port):**
```bash
# vite.config.js
export default {
  server: {
    port: 4173  // Change to any available port
  }
}
```

Then update **frontend/.env**:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🛠️ DEVELOPMENT COMMANDS

```bash
# Backend
npm run dev      # Start development server with nodemon
npm run build    # Build (if applicable)
npm run start    # Start production server

# Frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

---

## 📚 API ENDPOINTS QUICK REFERENCE

### Authentication
- `POST /api/auth/participant-login` - Participant login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/participant-logout` - Logout

### Game
- `POST /api/rooms/` - Create room (admin)
- `POST /api/rooms/join` - Join room
- `GET /api/rooms/:roomId` - Get room status
- `POST /api/rooms/:roomId/start` - Start game (admin)
- `POST /api/rooms/:roomId/end` - End game (admin)

### Participants
- `POST /api/participants/assign-officer` - Get assigned officer
- `POST /api/participants/scan-qr` - Scan QR code
- `POST /api/participants/verify-puzzle` - Verify puzzle
- `POST /api/participants/answer-route` - Answer route challenge
- `POST /api/participants/db-login` - DB login
- `GET /api/participants/phase2/questions` - Get phase 2 questions
- `POST /api/participants/phase2/answer` - Answer question
- `POST /api/participants/submit-case` - Submit case

---

## 🎓 USEFUL LINKS

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Node.js: https://nodejs.org/
- Express: https://expressjs.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Socket.io: https://socket.io/
- TailwindCSS: https://tailwindcss.com/

---

## 📞 SUPPORT

If issues arise:
1. Check error in browser console (F12)
2. Check backend console for server errors
3. Check MongoDB connection
4. Verify all environment variables
5. Check network tab (API calls failing?)
6. Clear localStorage and try fresh login
7. Restart both backend and frontend

---

**Version 3 is ready to go! Good luck with your event! 🎮**
