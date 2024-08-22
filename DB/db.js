const mongoose = require('mongoose');

const mongoURL = 'mongodb://127.0.0.1:27017/company';

// Connect to MongoDB
mongoose.connect(mongoURL)
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

// Database connection event handlers
const db = mongoose.connection;

db.on('error', (err) => {
    console.error('Database error:', err);
});

db.on('disconnected', () => {
    console.log('Database disconnected');
});

module.exports = db;
