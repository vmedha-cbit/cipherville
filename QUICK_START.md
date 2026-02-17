# CIPHERVILLE V3 - QUICK START (5 MINUTES)

## 🏃 TL;DR - Get Running NOW

### 1. **Setup MongoDB** (2 min)
Go to https://www.mongodb.com/cloud/atlas → Create free cluster → Copy connection string

### 2. **Backend Start** (2 min)
```bash
cd backend
npm install
```
Create `backend/.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cipherville
JWT_SECRET=anyRandomSecretString
PORT=4000
ADMIN_DEFAULT_USER=admin
ADMIN_DEFAULT_PASS=confidential
CLIENT_ORIGIN=http://localhost:5173
```
```bash
npm run dev
# Wait for: "Cipherville API running on 4000"
```

### 3. **Frontend Start** (1 min)
Open new terminal:
```bash
cd frontend
npm install
npm run dev
# Wait for: "Local: http://localhost:5173"
```

### 4. **Test It**
Visit http://localhost:5173
- Login with Roll Number: `TEST001`, Any Name
- Should redirect to `/officer` page
- ✅ **Done!**

---

## 🎮 For Your Event

1. **Create Admin Account** (or use default admin/confidential)
2. **Create Room** (via admin dashboard or API)
3. **Get Room ID** (e.g., ABC123)
4. **Share with Students**: "Enter room ABC123 at login"
5. **Start Game** when all students joined
6. **Monitor Progress** in admin dashboard
7. **Game auto-ends** when timer expires

---

## 🆘 Issues?

| Issue | Fix |
|-------|-----|
| Module not found | `npm install` again |
| MongoDB error | Check MONGO_URI in .env |
| CORS error | Check CLIENT_ORIGIN in backend/.env |
| Version missing fixes | You have V3 - all fixes included ✅ |
| Page refresh loses progress | Fixed in V3 ✅ (loads from DB) |
| Session lost on browser close | Fixed in V3 ✅ (recovers on re-login) |

---

## 📚 Full Docs

- **Deployment**: See `DEPLOYMENT.md`
- **Testing**: See `TEST_CHECKLIST.md`
- **Architecture**: See `FIXES_AND_IMPROVEMENTS.md`
- **Game Flow**: See `README.md`

---

## 🚀 You're Ready!

All 4 critical fixes are built-in. Just add sample data (officers, puzzles, images) and run your event!

Need questions answered? Check relevant docs above. Need to add content? See admin dashboard in `/admin/login`.

**Good luck with your event! 🎮**
