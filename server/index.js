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

// MongoDB Connection Utility for Serverless
// MongoDB Connection Utility for Serverless
const connectDB = async () => {
    // If already connected, do nothing
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB is already connected');
        return;
    }

    // If connecting, wait for it to finish (max 5s)
    if (mongoose.connection.readyState === 2) {
        console.log('DB is connecting... waiting...');
        return new Promise((resolve) => {
            let attempts = 0;
            const check = setInterval(() => {
                attempts++;
                if (mongoose.connection.readyState === 1 || attempts > 50) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        });
    }

    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI environment variable is undefined');
        }

        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
        console.log(`Connecting to MongoDB: ${maskedUri}`);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            bufferCommands: false, // Disable buffering to see real errors immediately
        });
        console.log('MongoDB database connection established successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // We do NOT rethrow here to allow the middleware to handle the state check
    }
};

// Global Mongoose settings
mongoose.set('bufferCommands', false);

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    // Skip DB check for health route
    if (req.path === '/api/health') return next();

    if (mongoose.connection.readyState !== 1) {
        console.log('DB not ready (State: ' + mongoose.connection.readyState + '), attempting reconnect...');
        await connectDB();

        // Double check after attempt
        if (mongoose.connection.readyState !== 1) {
            console.error('CRITICAL: Database connection failed. Returning 503.');
            return res.status(503).json({
                success: false,
                error: 'Service Unavailable',
                message: 'Database connection could not be established',
                dbState: mongoose.connection.readyState
            });
        }
    }
    next();
});

// Initial connection attempt with error handling
connectDB().catch(err => console.error('Initial DB connection failed:', err));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

module.exports = app;
