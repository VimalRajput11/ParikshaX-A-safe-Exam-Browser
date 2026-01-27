# ParikshaX System Architecture & Design Document

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Privacy Design](#privacy-design)
7. [Scalability Considerations](#scalability-considerations)

## 🎯 System Overview

ParikshaX is a three-tier application designed to provide secure exam proctoring while maintaining student privacy.

### Technology Stack
- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: WebSocket (future enhancement)
- **Security**: Crypto (SHA-256, HMAC)

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │  Exam Page   │  │    Admin     │      │
│  │     Page     │  │  (Lockdown)  │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │  React Router   │                       │
│                   └────────┬────────┘                       │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │  API Service    │                       │
│                   │  (Fetch/Axios)  │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    HTTPS/REST API
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                     SERVER LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js Application                   │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                     │
│  ┌──────▼──────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Routes    │  │ Controllers  │  │ Middleware   │       │
│  │             │  │              │  │              │       │
│  │ - /exams    │  │ - Exam       │  │ - CORS       │       │
│  │ - /sessions │  │ - Session    │  │ - Auth       │       │
│  └──────┬──────┘  └──────┬───────┘  │ - Validator  │       │
│         │                │           └──────────────┘       │
│         └────────────────┘                                   │
│                  │                                           │
│         ┌────────▼────────┐                                 │
│         │  Business Logic │                                 │
│         │  - Event Logger │                                 │
│         │  - Score Calc   │                                 │
│         │  - Report Gen   │                                 │
│         └────────┬────────┘                                 │
└──────────────────┼──────────────────────────────────────────┘
                   │
              MongoDB Driver
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │    Exams     │  │   Sessions   │      │
│  │  Collection  │  │  Collection  │  │  Collection  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  MongoDB - Document Store                                    │
│  - Indexes for performance                                   │
│  - Encryption at rest                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Component Details

### Frontend Components

#### 1. Landing Page
**Purpose**: Marketing and information
**Features**:
- Hero section with value proposition
- Feature showcase
- Call-to-action buttons
- Responsive design

#### 2. Exam Page (Lockdown Environment)
**Purpose**: Secure exam taking environment
**Features**:
- Consent modal (mandatory)
- Environment check
- Fullscreen enforcement
- Real-time monitoring
- Event logging
- Integrity score display
- Warning system

**Monitoring Capabilities**:
- Tab switching detection
- Window focus tracking
- Copy/paste prevention
- Right-click blocking
- Time tracking

#### 3. Admin Dashboard
**Purpose**: Session management and reporting
**Features**:
- Session statistics
- Real-time filtering
- Search functionality
- Integrity report viewing
- Risk level indicators

#### 4. Consent Modal
**Purpose**: Legal compliance and transparency
**Features**:
- Detailed monitoring disclosure
- Privacy guarantees
- Student rights information
- Mandatory acceptance

#### 5. Integrity Report
**Purpose**: Tamper-proof exam report
**Features**:
- Behavioral metrics
- Integrity score
- Risk level
- Cryptographic verification
- Download capability

### Backend Components

#### 1. Models

**User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'admin', 'instructor'],
  institution: String,
  createdAt: Date
}
```

**Exam Model**
```javascript
{
  title: String,
  description: String,
  duration: Number (minutes),
  scheduledDate: Date,
  questions: Array,
  createdBy: ObjectId (User),
  createdAt: Date
}
```

**ExamSession Model**
```javascript
{
  examId: ObjectId (Exam),
  studentId: ObjectId (User),
  startTime: Date,
  endTime: Date,
  status: Enum ['in_progress', 'completed', 'submitted', 'terminated'],
  
  eventLogs: [{
    eventType: Enum,
    timestamp: Date,
    duration: Number,
    severity: Enum
  }],
  
  metrics: {
    tabSwitchCount: Number,
    totalFocusLostDuration: Number,
    faceAbsentCount: Number,
    gazeDeviationCount: Number,
    audioSpikeCount: Number,
    warningsShown: Number
  },
  
  integrityScore: Number (0-100),
  riskLevel: Enum ['low', 'medium', 'high'],
  
  consentGiven: Boolean,
  consentTimestamp: Date,
  
  reportHash: String (SHA-256),
  reportSignature: String (HMAC),
  
  answers: Array,
  createdAt: Date
}
```

#### 2. Controllers

**Session Controller**
- `startSession()`: Initialize exam session with consent
- `logEvent()`: Record behavioral events
- `submitAnswer()`: Store exam answers
- `endSession()`: Generate integrity report
- `getSession()`: Retrieve session details
- `verifyReport()`: Validate report authenticity

**Exam Controller**
- `getAllExams()`: List all exams
- `getExamById()`: Get specific exam
- `createExam()`: Create new exam
- `updateExam()`: Modify exam
- `deleteExam()`: Remove exam

## 🔄 Data Flow

### Exam Taking Flow

```
1. Student visits Landing Page
   ↓
2. Clicks "Start Exam Demo"
   ↓
3. Consent Modal appears
   ↓
4. Student reads and accepts consent
   ↓
5. POST /api/sessions/start
   - Creates session in DB
   - Returns sessionId
   ↓
6. Environment Setup Check
   - Camera/Mic verification
   - Consent confirmation
   ↓
7. Enter Fullscreen Mode
   - Activate monitoring
   - Start event listeners
   ↓
8. Exam in Progress
   - Answer questions
   - Events logged in real-time
   - POST /api/sessions/:id/event
   ↓
9. Submit Exam
   - POST /api/sessions/:id/end
   - Generate integrity report
   - Calculate final score
   - Create cryptographic signature
   ↓
10. Display Integrity Report
    - Show metrics
    - Display risk level
    - Provide download option
```

### Event Logging Flow

```
Browser Event (Tab Switch, Focus Lost, etc.)
   ↓
Event Handler (React useEffect)
   ↓
Update Local State (UI feedback)
   ↓
API Call: POST /api/sessions/:id/event
   ↓
Server Validation
   ↓
Update Session Document
   - Add to eventLogs array
   - Update metrics object
   ↓
Recalculate Integrity Score (pre-save hook)
   ↓
Save to MongoDB
   ↓
Return Updated Score to Client
   ↓
Update UI with New Score
```

## 🔒 Security Architecture

### Client-Side Security

1. **Environment Lockdown**
   - Fullscreen API enforcement
   - Event listener for fullscreen exit
   - Visibility API for tab detection
   - Focus/blur event tracking

2. **Input Protection**
   - Copy/paste event prevention
   - Right-click context menu blocking
   - Keyboard shortcut interception

3. **Data Transmission**
   - HTTPS only
   - No sensitive data in localStorage
   - Session-based authentication

### Server-Side Security

1. **Input Validation**
   - Request body validation
   - Type checking
   - Sanitization

2. **Authentication & Authorization**
   - JWT tokens (future)
   - Role-based access control
   - Session verification

3. **Data Integrity**
   - SHA-256 hashing for reports
   - HMAC digital signatures
   - Tamper detection

4. **Rate Limiting**
   - API request throttling
   - DDoS protection

### Database Security

1. **Access Control**
   - MongoDB authentication
   - Role-based permissions
   - Network isolation

2. **Data Protection**
   - Encryption at rest
   - Encrypted connections (TLS)
   - Regular backups

## 🔐 Privacy Design

### Privacy-First Principles

1. **Data Minimization**
   - Only log event types, timestamps, durations
   - No screenshots or screen recordings
   - No video or audio storage
   - No biometric data retention

2. **Purpose Limitation**
   - Data used only for integrity verification
   - No secondary use without consent
   - Clear retention policies

3. **Transparency**
   - Explicit consent modal
   - Clear monitoring disclosure
   - Accessible privacy policy

4. **User Rights**
   - Data deletion requests
   - Report access
   - Appeal process

### GDPR Compliance

- ✅ Lawful basis: Consent
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Storage limitation
- ✅ Integrity and confidentiality
- ✅ Accountability

## 📈 Scalability Considerations

### Horizontal Scaling

1. **Load Balancing**
   - Multiple server instances
   - Nginx/HAProxy
   - Session affinity

2. **Database Sharding**
   - Shard by institution
   - Replica sets for read scaling
   - MongoDB Atlas for managed scaling

3. **Caching**
   - Redis for session data
   - CDN for static assets
   - API response caching

### Performance Optimization

1. **Database Indexes**
   - Index on sessionId
   - Index on studentId + examId
   - Index on createdAt for time-based queries

2. **Query Optimization**
   - Projection to limit fields
   - Aggregation pipelines
   - Pagination

3. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Asset compression

### Monitoring & Observability

1. **Logging**
   - Structured logging (Winston/Bunyan)
   - Centralized log aggregation
   - Error tracking (Sentry)

2. **Metrics**
   - API response times
   - Database query performance
   - System resource usage

3. **Alerting**
   - Uptime monitoring
   - Error rate thresholds
   - Performance degradation

## 🚀 Deployment Architecture

### Development
```
Local Machine
├── MongoDB (localhost:27017)
├── Node.js Server (localhost:5000)
└── Vite Dev Server (localhost:5173)
```

### Production (Recommended)
```
Cloud Infrastructure (AWS/Azure/GCP)
├── Load Balancer
├── Application Servers (Auto-scaling)
│   └── Docker Containers
│       └── Node.js + Express
├── Database Cluster
│   └── MongoDB Atlas (Managed)
├── CDN (CloudFlare/CloudFront)
│   └── Static Assets
└── Monitoring Stack
    ├── Prometheus
    ├── Grafana
    └── ELK Stack
```

## 🔮 Future Enhancements

1. **Real-time Communication**
   - WebSocket for live updates
   - Server-sent events for notifications

2. **Advanced Monitoring**
   - WebRTC for camera access
   - WebGazer.js for eye tracking
   - Web Audio API for audio monitoring

3. **AI/ML Integration**
   - Anomaly detection
   - Behavioral pattern analysis
   - Risk prediction models

4. **Blockchain Integration**
   - Immutable report storage
   - Smart contracts for verification
   - Decentralized trust

5. **Mobile Support**
   - React Native app
   - Mobile-optimized UI
   - Touch-based interactions

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-26  
**Status**: Active Development
