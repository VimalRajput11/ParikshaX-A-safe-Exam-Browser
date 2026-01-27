const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB database connection established successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Do not throw here, let the request fail gracefully later or retry
    }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Initial connection attempt
connectDB();

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

module.exports = app;
