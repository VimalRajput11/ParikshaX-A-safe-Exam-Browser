const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const examRoutes = require('./routes/exam');
const sessionRoutes = require('./routes/session');
const studentRoutes = require('./routes/student');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);


app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://parikshax.vercel.app',
        'https://pariksha-x-a-safe-exam-browser.vercel.app'
    ],
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
    if (req.path === '/api/health') return next();
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

app.use((err, req, res, next) => {
    console.error('🔥 Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
