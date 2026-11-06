const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const examRoutes = require('./routes/exam');
const sessionRoutes = require('./routes/session');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');


const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);


const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:5173',
    'https://parikshax.vercel.app',
    'https://pariksha-x-a-safe-exam-browser.vercel.app',
    // Extra origins (comma-separated), e.g. a custom domain or preview URL
    ...(process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean)
]);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser clients (curl, server-to-server) and the Electron app (file://)
        if (!origin || origin === 'null' || origin.startsWith('file://') || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
    res.send('ParikshaX API is running');
});

app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    res.json({
        status: dbState === 1 ? 'ok' : 'error',
        dbState: states[dbState],
        timestamp: new Date()
    });
});

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Error:', error.message);
        throw error;
    }
};


app.use(async (req, res, next) => {
    if (req.path === '/' || req.path === '/api/health') return next();
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});


app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('🔥 Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// On Vercel the app is exported as a serverless handler; everywhere else, listen normally
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
