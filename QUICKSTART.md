# ParikshaX Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Prerequisites
```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

### Step 2: Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 3: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Step 4: Configure Environment

Copy the example env file:
```bash
cd server
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux
```

Edit `.env` and update if needed (default values work for local development).

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
Server is running on port: 5000
MongoDB database connection established successfully
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

You should see:
```
VITE v7.3.1  ready in 561 ms
➜  Local:   http://localhost:5173/
```

### Step 6: Access the Application

Open your browser and navigate to:
- **Landing Page**: http://localhost:5173
- **Exam Demo**: http://localhost:5173/exam
- **Admin Dashboard**: http://localhost:5173/admin

## 🧪 Test the System

### Test 1: Student Exam Flow

1. Go to http://localhost:5173
2. Click "Start Exam Demo"
3. Read the consent modal
4. Check the "I have read and understood..." checkbox
5. Click "Accept & Continue"
6. Click "Enter Fullscreen Mode & Start Exam"
7. Try these actions to test monitoring:
   - Switch tabs (Alt+Tab) - Will be logged
   - Try to copy text (Ctrl+C) - Will be blocked
   - Right-click - Will be blocked
   - Click outside the window - Will be detected
8. Click "Submit Exam"
9. View your integrity report

### Test 2: Admin Dashboard

1. Go to http://localhost:5173/admin
2. View session statistics
3. Use the search bar to filter sessions
4. Click on different risk level filters (All, Low, Medium, High)
5. Click "View Report" on any session

## 📊 Understanding the Integrity Score

The system calculates a score from 0-100 based on:

| Behavior | Penalty | Max Impact |
|----------|---------|------------|
| Tab Switch | -5 points each | -30 points |
| Focus Lost (per 10s) | -2 points | -20 points |
| Face Absent | -3 points each | -20 points |
| Gaze Deviation | -2 points each | -15 points |
| Audio Spike | -2 points each | -15 points |

**Risk Levels:**
- 🟢 **Low Risk**: Score ≥ 80 (Excellent behavior)
- 🟡 **Medium Risk**: Score 60-79 (Some concerns)
- 🔴 **High Risk**: Score < 60 (Multiple violations)

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using the port or change the port in `.env`
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Fullscreen Not Working
**Solution**: Fullscreen API requires user interaction. Make sure you're clicking the button, not triggering it programmatically.

### CORS Errors
**Solution**: Make sure the backend is running and CORS is properly configured in `server/index.js`

## 📝 API Testing with Postman/cURL

### Start a Session
```bash
curl -X POST http://localhost:5000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "507f1f77bcf86cd799439011",
    "studentId": "507f1f77bcf86cd799439012",
    "consentGiven": true
  }'
```

### Log an Event
```bash
curl -X POST http://localhost:5000/api/sessions/<SESSION_ID>/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "tab_switch",
    "duration": 0,
    "severity": "medium"
  }'
```

### End Session
```bash
curl -X POST http://localhost:5000/api/sessions/<SESSION_ID>/end
```

## 🎯 Next Steps

1. **Customize the Exam**
   - Edit questions in `ExamPage.jsx`
   - Add more question types
   - Implement answer validation

2. **Add Authentication**
   - Implement JWT-based auth
   - Add login/signup pages
   - Protect admin routes

3. **Enhance Monitoring**
   - Integrate webcam access
   - Add eye tracking (WebGazer.js)
   - Implement audio monitoring

4. **Deploy to Production**
   - Set up MongoDB Atlas
   - Deploy backend to Heroku/AWS/Azure
   - Deploy frontend to Vercel/Netlify
   - Configure environment variables

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🆘 Need Help?

If you encounter any issues:
1. Check the console for error messages
2. Review the troubleshooting section
3. Check MongoDB and server logs
4. Ensure all dependencies are installed

---

**Happy Coding! 🎉**
