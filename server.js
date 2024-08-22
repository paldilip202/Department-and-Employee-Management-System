// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./DB/db'); // Database connection file

// Initialize express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Import route files
const AdminRoutes = require('./Routes/admin');
const DepartmentRoute = require('./Routes/departmentRoute');
const EmployeeRoute = require('./Routes/employeeRoute');
const AuthRoute = require('./Routes/auth');

// Use routes with specific paths
app.use('/admin', AdminRoutes);        // Admin related routes
app.use('/department', DepartmentRoute); // Department related routes
app.use('/employee', EmployeeRoute);    // Employee related routes
app.use('/auth', AuthRoute);            // Authentication related routes

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
