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

// Mongoose Cache for Serverless (Vercel)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // 1. Return active connection
    if (cached.conn) {
        return cached.conn;
    }

    // 2. Establish new connection if not connecting
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Fail fast if not connected
            serverSelectionTimeoutMS: 30000, // Increased to 30s
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4 compatibility
        };

        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI is missing');

        console.log('Connecting to MongoDB...');
        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log('MongoDB connection established');
            return mongoose;
        });
    }

    // 3. Await connection
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB Connection Error:', e);
        throw e;
    }

    return cached.conn;
};

// Global Mongoose settings
mongoose.set('bufferCommands', false);

// Middleware to ensure DB is ready for every request
app.use(async (req, res, next) => {
    // Skip health check to avoid recursion
    if (req.path === '/api/health') return next();

    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Request blocked due to DB connection failure:', error);
        res.status(503).json({
            success: false,
            error: 'Service Unavailable - DB Connection Failed',
            details: error.message
        });
    }
});

// Initial connection attempt with error handling
connectDB().catch(err => console.error('Initial DB connection failed:', err));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

module.exports = app;
