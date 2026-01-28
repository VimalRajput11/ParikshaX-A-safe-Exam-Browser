const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Import Routes
const examRoutes = require('./routes/exam');
const sessionRoutes = require('./routes/session');

// Basic Route
app.get('/', (req, res) => {
    res.send('ParikshaX API is running');
});


// API Routes
app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', require('./routes/student'));

// MongoDB Connection Utility for Serverless
// MongoDB Connection Utility
const connectDB = async () => {
    // If already connected, do nothing
    if (mongoose.connection.readyState === 1) return;

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
        const maskedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
        console.log(`Connecting to MongoDB: ${maskedUri}`);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            bufferCommands: false, // Disable buffering to see real errors immediately
        });
        console.log('MongoDB database connection established successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
};

// Global Mongoose settings
mongoose.set('bufferCommands', false);

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
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
