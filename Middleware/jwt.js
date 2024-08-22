const jwt = require('jsonwebtoken');
require('dotenv').config();


const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Correctly split the token

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET should be defined in your environment variables

        // Attach the user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' }); // Unauthorized status for invalid token
    }
};

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Set an expiration time
};


const adminAuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.isAdmin) { // Check if user is an admin
            req.user = decoded; // Attach the decoded user info to the request object
            next(); // Proceed to the next middleware or route handler
        } else {
            res.status(403).json({ message: 'Access denied. Admins only.' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Invalid token', error: err.message });
    }
};


module.exports = { jwtAuthMiddleware, generateToken, adminAuthMiddleware };
