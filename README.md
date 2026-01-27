# ParikshaX - Secure Exam Browser

## 🎯 Overview

ParikshaX is a **privacy-first, tamper-proof, and fair** secure exam browser designed for universities, government exams, and large institutions. The system prevents cheating, detects suspicious behavior, and produces explainable exam integrity proof without violating student privacy.

## 🧠 Core Philosophy

- **Do not spy, do not auto-punish**
- Analyze behavior patterns, not single actions
- Ensure human-reviewable decisions
- Follow privacy-by-design principles
- Be legally safe and explainable
- **Never declare "cheating" automatically**

## 🏗️ System Architecture

### Frontend (React + Tailwind CSS)
- **Landing Page**: Introduction to the platform
- **Exam Page**: Secure exam environment with real-time monitoring
- **Admin Dashboard**: Session management and integrity reports
- **Components**:
  - ConsentModal: Transparent disclosure of monitoring
  - IntegrityReport: Detailed, tamper-proof exam reports

### Backend (Node.js + Express + MongoDB)
- **Session Management**: Track exam sessions with privacy-first logging
- **Event Logging**: Record behavioral events without storing sensitive data
- **Integrity Scoring**: Multi-signal correlation engine
- **Tamper-Proof Reports**: Cryptographic signing and verification

## 🔐 Key Features

### 1️⃣ Environment Lockdown
- Fullscreen enforcement
- Tab switching detection
- Window focus monitoring
- Copy/paste blocking
- Right-click prevention
- DevTools blocking
- Screen capture prevention

### 2️⃣ Tab Switching & Focus Monitoring
- Continuous focus awareness
- Duration and frequency tracking
- Time-based, configurable rules
- No instant penalties

### 3️⃣ Gaze Detection (Concept)
- Eye direction monitoring (center/left/right/down)
- Prolonged looking away detection
- Baseline calibration
- **No video, images, or biometric storage**

### 4️⃣ Face Presence & Continuity
- Face visibility detection
- Camera obstruction alerts
- **No facial recognition or identification**
- Prevents impersonation

### 5️⃣ Audio Activity Monitoring (Optional)
- Speech pattern detection
- Background noise filtering
- Timestamp and duration logging only
- **No audio recording or storage**

### 6️⃣ Multi-Signal Correlation Engine
- Combines multiple behavioral signals
- Risk score calculation
- Avoids single-event judgment
- Human review required for final decisions

### 7️⃣ Soft Warning System
- Gentle, non-threatening warnings
- Deterrence without anxiety
- No auto-submission

### 8️⃣ Privacy-First Event Logging
Logs ONLY:
- Event type
- Timestamp
- Duration

Does NOT log:
- Screenshots
- Videos
- Raw biometric data
- Personal identifiable information

### 9️⃣ Exam Integrity Report
Generated after exam completion:
- Exam duration
- Tab switching summary
- Attention deviation count
- Face presence percentage
- Overall integrity risk level (Low/Medium/High)
- Explainable and human-readable
- Auditable

### 🔟 Tamper-Proof Verification
- Digital signature on reports
- SHA-256 hashing
- HMAC verification
- Modification detection
- Optional blockchain integration

## ⚖️ Legal & Ethical Compliance

- ✅ Explicit student consent required
- ✅ Transparent monitoring disclosure
- ✅ Configurable data retention
- ✅ Opt-out/fallback modes available
- ✅ GDPR/data protection law compliance

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd ParikashX
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**
Create `.env` in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/parikshax
PORT=5000
REPORT_SECRET=your-secret-key-here
```

5. **Start MongoDB**
```bash
mongod
```

6. **Start the backend server**
```bash
cd server
npm run dev
```

7. **Start the frontend**
```bash
cd client
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Dashboard: http://localhost:5173/admin

## 📁 Project Structure

```
ParikashX/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── ConsentModal.jsx
│   │   │   └── IntegrityReport.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ExamPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
└── server/                # Node.js backend
    ├── models/            # MongoDB models
    │   ├── User.js
    │   ├── Exam.js
    │   └── ExamSession.js
    ├── controllers/       # Business logic
    │   ├── examController.js
    │   └── sessionController.js
    ├── routes/            # API routes
    │   ├── exam.js
    │   └── session.js
    ├── index.js           # Server entry point
    └── package.json
```

## 🔌 API Endpoints

### Session Management
- `POST /api/sessions/start` - Start exam session
- `POST /api/sessions/:sessionId/event` - Log behavioral event
- `POST /api/sessions/:sessionId/answer` - Submit answer
- `POST /api/sessions/:sessionId/end` - End session and generate report
- `GET /api/sessions/:sessionId` - Get session details
- `GET /api/sessions/:sessionId/verify` - Verify report integrity

### Exam Management
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create new exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

## 📊 Integrity Scoring Algorithm

The system calculates an integrity score (0-100) based on:

- **Tab Switches**: -5 points each (max -30)
- **Focus Lost Duration**: -2 points per 10 seconds (max -20)
- **Face Absent Events**: -3 points each (max -20)
- **Gaze Deviations**: -2 points each (max -15)
- **Audio Spikes**: -2 points each (max -15)

**Risk Levels**:
- **Low**: Score ≥ 80
- **Medium**: Score 60-79
- **High**: Score < 60

## 🎨 UI/UX Design Principles

- Modern, premium dark theme
- Glassmorphism effects
- Smooth animations and transitions
- Clear visual feedback
- Accessible and user-friendly
- Non-threatening warning messages
- Professional admin interface

## 🔒 Security Features

1. **Client-Side**:
   - Fullscreen enforcement
   - Event listeners for tab/window changes
   - Copy/paste prevention
   - Right-click blocking

2. **Server-Side**:
   - Event validation
   - Session management
   - Cryptographic hashing
   - Digital signatures

3. **Data Protection**:
   - No PII storage
   - Encrypted event logs
   - Append-only logging
   - Tamper-resistant reports

## 🧪 Testing

### Test the Exam Flow
1. Navigate to http://localhost:5173
2. Click "Start Exam Demo"
3. Accept the consent modal
4. Enter fullscreen mode
5. Try switching tabs (will be logged)
6. Submit the exam to see the integrity report

### Test the Admin Dashboard
1. Navigate to http://localhost:5173/admin
2. View session statistics
3. Filter by risk level
4. Search for specific students/exams

## 🚧 Future Enhancements

- [ ] Real webcam integration with face detection
- [ ] Eye tracking using WebGazer.js
- [ ] Audio level monitoring
- [ ] Blockchain-based report storage
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] AI-powered behavior analysis
- [ ] Integration with LMS platforms
- [ ] Proctoring video review interface

## 📝 License

This project is designed for educational and institutional use.

## 👥 Contributors

Built with ❤️ for secure, fair, and privacy-respecting online examinations.

## 📞 Support

For issues, questions, or contributions, please contact the development team.

---

**Remember**: This system provides behavioral indicators only. It does NOT constitute proof of cheating. All flagged sessions require human review and consideration of context before any academic action is taken.
#   P a r i k s h a X - A - s a f e - E x a m - B r o w s e r  
 