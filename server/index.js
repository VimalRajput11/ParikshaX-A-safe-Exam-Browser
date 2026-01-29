const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1); // Trust first proxy (Vercel)

app.use(cors({
    origin: '*',
    credentials: true
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Import Routes
const examRoutes = require('./routes/exam');
const sessionRoutes = require('./routes/session');

// Basic Route
app.get('/', (req, res) => {
    res.send('ParikshaX API is running');
});

// Health Check Route
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: dbState === 1 ? 'ok' : 'error',
        dbState: states[dbState] || 'unknown',
        timestamp: new Date()
    });
});

// API Routes
app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', require('./routes/student'));

// Simple MongoDB Connection
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
    }
};

// Middleware to ensure DB is ready for every request
app.use(async (req, res, next) => {
    if (req.path === '/api/health') return next();
    await connectDB();
    next();
});

// Final Error Handler to catch 500s
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Initial connection attempt with error handling
connectDB().catch(err => console.error('Initial DB connection failed:', err));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

module.exports = app;
