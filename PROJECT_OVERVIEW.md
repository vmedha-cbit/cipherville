# Cipherville - Interactive Detective Game Platform

## 🎯 Project Concept
Cipherville is a **real-time multiplayer detective investigation game** where participants race against time to solve crimes by analyzing evidence, cracking puzzles, querying databases, and identifying suspects. Admin manages multiple game rooms with real-time tracking of participant progress.

---

## 🏗️ Architecture

### **Tech Stack**
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + MongoDB
- **Real-time:** Socket.io
- **Database:** MongoDB (user/game data) + SQLite (evidence databases for SQL queries)

### **Project Structure**
```
Cipherville/
├── backend/               # Express API server
│   ├── src/
│   │   ├── models/       # MongoDB schemas (User, Room, Officer, Story, Admin, Log)
│   │   ├── controllers/  # Business logic (auth, admin, participants, rooms, stories, SQL)
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, rate limiting, error handling
│   │   ├── services/     # Phase management, officer assignment, logging, SQLite
│   │   ├── socket/       # Real-time game events (game-start, game-end)
│   │   └── utils/        # Constants, ID generation, time utilities
│   ├── storage/
│   │   ├── sqlite-templates/  # Pre-built evidence databases per story
│   │   └── sqlite-user/       # User-specific DB copies for isolation
│   └── sample-data/      # officers.json, stories.json
│
└── frontend/             # React SPA
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx              # Participant login
    │   │   ├── Lobby.jsx              # Waiting room
    │   │   ├── Officer.jsx            # Officer assignment screen
    │   │   ├── Phase1.jsx             # Three sub-phases (QR, Puzzle, Routes)
    │   │   ├── QRArticle.jsx          # News article from QR scan
    │   │   ├── RouteChallenge.jsx     # Route answer verification
    │   │   ├── YearReveal.jsx         # Reveals YYYY after correct route
    │   │   ├── RouteFail.jsx          # Dead-end route page
    │   │   ├── DbLogin.jsx            # Database password entry
    │   │   ├── Phase2.jsx             # SQL investigation & questions
    │   │   ├── CaseSubmit.jsx         # Case completion confirmation
    │   │   ├── Completion.jsx         # Final success screen
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx
    │   │       ├── AdminDashboard.jsx # Live participant tracking
    │   │       ├── RoomManagement.jsx # Create/start/end rooms
    │   │       ├── OfficerManagement.jsx
    │   │       └── StoryManagement.jsx
    │   ├── components/
    │   │   ├── TimerDisplay.jsx       # Countdown timer (participants only)
    │   │   ├── GameOverModal.jsx      # Time-up modal (participants only)
    │   │   ├── ProtectedRoute.jsx     # Participant auth guard
    │   │   └── AdminRoute.jsx         # Admin auth guard
    │   └── providers/
    │       ├── authContext.jsx        # Session/token management
    │       ├── socketContext.jsx      # Socket.io connection
    │       ├── timerContext.jsx       # Global timer state
    │       └── api.js                 # Axios instance
    └── public/
        ├── puzzle/       # Puzzle images for Phase 1 sub-phase 2
        └── qr/          # QR code images
```

---

## 🎮 Game Flow

### **Admin Workflow**
1. **Login** → Admin dashboard
2. **Create Room** (set timer duration, assign story)
3. **Manage Officers** (upload 10 officers with Phase 1 data: DOB, puzzles, jumbled words, routes)
4. **Manage Stories** (create stories with questions for Phase 2, upload SQLite evidence DBs)
5. **Start Game** → Timer begins for all participants in room
6. **Monitor Progress** → Real-time tracking of each participant's phase, attempts, progress timeline
7. **End Game** → Participants redirected to login screen
8. **View Analytics** → Completion rates, attempt counts, time tracking

### **Participant Workflow**

#### **Pre-Game**
1. **Login** (`/`) → Enter roll number + display name
2. **Lobby** (`/lobby`) → Wait for admin to start game + see room info

#### **Phase 1: Discover Officer's DOB (DD-MM-YYYY)** (`/phase1`)
**Sub-phase 1 - Reveal Day (DD):**
- Display: 10 QR codes (1 correct, 9 fake)
- Action: Scan QR codes with phone → Opens news article in browser
- Success: Article reveals day (DD) → Enter in Phase 1 input → Unlocks sub-phase 2

**Sub-phase 2 - Assemble Puzzle (MM):**
- Display: Grid with some pieces, missing "key" pieces on the side
- Action: Drag-and-drop key pieces into correct grid positions
- Success: Complete puzzle shows MM → Auto-extracts → Unlocks sub-phase 3

**Sub-phase 3 - Solve Route Challenge (YYYY):**
- Display: Jumbled SQL-related word + 3 route buttons
- Action: Click each route (opens in new tab) → Enter unscrambled word
  - Wrong answer: "Try again" (stays on same page)
  - Correct answer + Wrong route: RouteFail page (dead end)
  - Correct answer + Correct route: YearReveal page (shows YYYY)
- Success: Year revealed → localStorage flag set → Return to Phase 1 → Complete Phase 1

#### **Database Login** (`/db-login`)
- Enter password: `DDMMYYYY` (officer's DOB)
- 3 attempts max
- Success: Unlocks Phase 2

#### **Phase 2: SQL Investigation** (`/phase2`)
1. **Story Display:** Case title + description + assigned officer
2. **Database Schema:** View tables & columns
3. **SQL Console:** Run `SELECT` queries on evidence database
4. **Questions Section:** Answer case-specific questions (e.g., "Who was at the crime scene at 10 PM?")
   - Submit answers one by one
   - System validates against stored answers
   - Track correct/incorrect
5. **Success:** All questions correct → **Congratulations Modal** appears (full-screen, blocks UI)
   - Timer stops/pauses
   - "Proceed to Case Submission" button

#### **Case Submission** (`/case`)
- Simple confirmation screen
- "Proceed to Completion" button

#### **Completion** (`/complete`)
- Success screen
- Wait for admin action

---

## 📊 Data Models

### **User (Participant)**
```javascript
{
  rollNumber: String (unique),
  displayName: String,
  roomId: String,
  phase: "lobby" | "pre-story" | "phase1" | "db-login" | "phase2" | "case-submit" | "complete",
  activeSession: String (session ID),
  assignedOfficer: ObjectId (Officer),
  phase2Story: ObjectId (Story),
  phase2CorrectQuestions: [String] (question IDs),
  gameStatus: "timeout" | "completed",
  attempts: { dbLogin: Number, caseSubmit: Number, sqlQueries: Number },
  progressTracking: [{
    subphase: String,
    completedAt: Date,
    timeRemaining: Number,
    timeElapsed: Number
  }]
}
```

### **Room**
```javascript
{
  roomId: String (unique, e.g., "ROOM001"),
  participants: [ObjectId (User)],
  status: "waiting" | "started" | "ended",
  timerDuration: Number (seconds),
  startedAt: Date,
  currentPhase: String,
  assignedStory: ObjectId (Story)
}
```

### **Officer** (Phase 1 Content)
```javascript
{
  name: String,
  dob: String (DDMMYYYY format),
  background: String,
  story: String,
  lastCase: String,
  articleText: String (for QR scan),
  qrLinks: [String],
  puzzleFolder: String (e.g., "puzzle1"),
  jumbledWord: String (scrambled SQL word),
  answer: String (unscrambled word),
  routeOptions: [{
    label: String,
    content: String,
    isCorrect: Boolean
  }],
  storyId: ObjectId (Story)
}
```

### **Story** (Phase 2 Content)
```javascript
{
  title: String,
  description: String,
  sqliteTemplateId: String (DB filename),
  questions: [{
    prompt: String,
    answer: String
  }]
}
```

### **Admin**
```javascript
{
  username: String,
  passwordHash: String (bcrypt)
}
```

---

## 🔐 Authentication & Security

### **Participants**
- **Login:** JWT token with `rollNumber`, `sessionId`, `roomId`
- **Storage:** localStorage `cipherville-token`
- **Session Management:** Single active session per user (auto-logout previous)
- **Protected Routes:** `ProtectedRoute` component checks token

### **Admins**
- **Login:** JWT token with `username`, `role: "admin"`
- **Storage:** localStorage `cipherville-admin-token`
- **Protected Routes:** `AdminRoute` component checks admin token
- **Default Admin:** Username: `admin`, Password: `admin123` (set via env)

### **Middleware**
- `requireParticipantSession`: Validates participant JWT
- `requireAdmin`: Validates admin JWT
- Rate limiting on login/submit endpoints

---

## ⏱️ Timer System

### **How It Works**
1. Admin sets timer duration when creating room (default: 1800s = 30 min)
2. Admin clicks "Start Game" → `startedAt` timestamp saved
3. Timer calculates remaining time: `timerDuration - (now - startedAt)`
4. Socket.io emits `game-start` event to all participants in room
5. Frontend counts down every second
6. Timer stops when:
   - Time expires → Participants get `timeout` status + redirected to login
   - Admin clicks "End Game" → All participants redirected
   - Participant completes Phase 2 → Timer pauses for that user

### **Display**
- **Top-right corner** (participants only, NOT admins)
- **States:**
  - Green/Amber: Normal
  - Red pulsing: Last 5 minutes
  - "Time's Up!": Expired
- **GameOverModal:** Full-screen modal on timeout

---

## 🗄️ SQLite Evidence Database System

### **How It Works**
1. Admin uploads SQLite `.db` file via Story Management
2. File stored in `backend/storage/sqlite-templates/{sqliteTemplateId}.db`
3. When participant starts Phase 2:
   - Backend copies template to `backend/storage/sqlite-user/{userId}-{sqliteTemplateId}.db`
   - Ensures isolation (each user gets their own DB)
4. Participant runs SQL queries via `/sql/query` endpoint:
   - Backend uses `better-sqlite3` to execute query on user's DB
   - Only `SELECT` queries allowed (sanitized)
   - Returns rows to frontend
5. Schema endpoint `/sql/schema` returns table/column metadata

### **Security**
- Only `SELECT` statements allowed
- SQL injection protection via sanitization
- No `DROP`, `DELETE`, `UPDATE`, `INSERT` allowed
- Database size limits enforced

---

## 📡 Real-time Features (Socket.io)

### **Events**

**Server → Client:**
- `game-start` → Timer begins
- `game-end` → Room ended
- `room-update` → Room status changed
- `phase-update` → Participant advanced phase

**Client → Server:**
- `join-room` → Participant joins room
- `leave-room` → Participant leaves room

### **Namespaces**
- Default namespace for game events
- Room-based broadcasting

---

## 🎨 UI/UX Design

### **Theme**
- **Dark detective/noir aesthetic**
- Background: `bg-gradient-to-br from-ink via-steel to-black`
- Film grain overlay effect
- Evidence card style with amber/orange accents

### **Key Classes (Tailwind)**
- `.film-grain` - Texture overlay
- `.evidence-card` - Card with border + backdrop
- `.btn-investigate` - Primary action button (amber)
- Colors: `ember` (orange), `steel` (dark gray), `haze` (light gray)

### **Responsive**
- Mobile-first design
- Grid layouts adapt to screen size
- Modal overlays for mobile

---

## 📈 Admin Dashboard Features

### **Live Participant Tracking**
- Table showing all participants:
  - Roll number, name, room, current phase
  - Status badges (TIMEOUT, COMPLETE, PLAYING)
  - "View Details" button

### **Participant Details Modal** (scrollable)
- Basic info (name, roll, room, phase, status)
- Progress timeline (all completed sub-phases with timestamps + time data)
- Attempt counts (DB login, case submit, SQL queries)

### **Room Management**
- Create room (ID, timer, story assignment)
- View room members + their phases
- Start game (broadcasts to all participants)
- End game (force-stop + redirect all)

### **Officer Management**
- CRUD officers
- Upload puzzle images
- Configure jumbled words, routes, QR links

### **Story Management**
- CRUD stories
- Add/delete questions (single or bulk JSON import)
- Upload SQLite template databases

---

## 🔄 Phase Progression Logic

### **Phase Transitions**
```
login → lobby (join room)
lobby → officer (admin starts game)
officer → phase1 (officer assigned)
phase1 → db-login (all 3 sub-phases complete)
db-login → phase2 (correct password)
phase2 → case-submit (all questions correct)
case-submit → complete (case submitted)
```

### **Phase Locking**
- Cannot skip phases
- Backend validates phase progression on each API call
- Progress tracking saved for analytics

---

## 🛡️ Error Handling

### **Frontend**
- Try-catch blocks on all API calls
- User-friendly error messages
- Toast notifications for failures

### **Backend**
- Global error handler middleware
- Validation on all inputs
- Mongoose schema validation
- HTTP status codes (400, 401, 403, 404, 500)

### **Logging**
- All major events logged to `Log` collection:
  - Logins, phase transitions, submissions, errors
  - Includes userId, roomId, timestamp, event type

---

## 🚀 Deployment Considerations

### **Environment Variables**
```
MONGO_URI=mongodb://...
PORT=3000
JWT_SECRET=...
ADMIN_DEFAULT_USER=admin
ADMIN_DEFAULT_PASS=admin123
```

### **File Storage**
- Puzzle images: `frontend/public/puzzle/`
- QR codes: `frontend/public/qr/`
- SQLite DBs: `backend/storage/sqlite-templates/` + `backend/storage/sqlite-user/`

### **Scaling**
- Horizontal scaling with session store (Redis recommended)
- Socket.io adapter for multi-server (Redis adapter)
- Database indexing on `rollNumber`, `roomId`, `sessionId`

---

## 🧪 Testing Workflow

1. **Admin Setup:**
   - Login as admin
   - Create room "TEST001"
   - Upload 1 officer with all Phase 1 data
   - Create 1 story with 3 questions + upload SQLite DB

2. **Participant Flow:**
   - Login as participant
   - Join room TEST001
   - Admin starts game
   - Complete Phase 1 (all 3 sub-phases)
   - Login to database with officer DOB
   - Complete Phase 2 (answer all questions)
   - Submit case

3. **Verify:**
   - Admin dashboard shows progress
   - Timer counts down
   - Socket events fire correctly
   - Database queries work
   - Modal appears on completion

---

## 🐛 Known Features & Behaviors

1. **Timer stops on Phase 2 completion** (intentional - via `pauseTimer()`)
2. **Admin doesn't see timer/modals** (filtered by `session.rollNumber` check)
3. **One correct route in Phase 1 sub-phase 3** (2 dead-ends, 1 correct)
4. **SQL queries limited to SELECT** (security)
5. **3 DB login attempts max** (then locked)
6. **Room participants frozen after game starts** (can't join mid-game)

---

## 📝 Summary

**Cipherville** is a complete gamified learning platform for SQL investigation and detective reasoning. It combines:
- **Phase 1:** Physical QR scanning + visual puzzle assembly + logical route solving
- **Phase 2:** SQL querying + critical thinking questions
- **Admin Panel:** Real-time orchestration + analytics
- **Competitive Element:** Timer + leaderboard potential
- **Educational Value:** Teaches SQL, pattern recognition, deductive reasoning

The system is built for **classrooms, workshops, or team-building events** where multiple participants compete or collaborate to solve cases under time pressure, while admins control the game flow and monitor progress.
