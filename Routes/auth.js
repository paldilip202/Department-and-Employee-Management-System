const express = require('express');
const Employee = require('../models/employee');
const { generateToken } = require('../Middleware/jwt'); // Import the generateToken function
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const person = await Employee.findOne({ email: email });
        if (!person) {
            return res.status(404).json({ message: 'Invalid email id' });
        }

        const isMatchPassword = await person.comparePassword(password);

        if (!isMatchPassword) {
            return res.status(404).json({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = generateToken({
            userId: person._id,
            email: person.email,
            isAdmin: person.isAdmin || false // Default to false if isAdmin is not present
        });

        // Respond with the token
        res.status(200).json({ token });

    } catch (err) {
        console.error('Error in /auth/login route:', err); // Log the error for debugging
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


 //Log out the user and invalidate the session/token
 router.post('/logout', async (req, res) => {
    try {
        // Since JWT is stateless, logging out is typically handled on the client side
        // by simply deleting the token.
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json(err);
    }
});
 module.exports = router;