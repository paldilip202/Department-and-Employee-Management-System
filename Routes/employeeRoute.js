const express = require('express');
const router = express.Router();

const Department = require('../models/department');
const Employee = require('../models/employee');
const Task = require('../models/taskSchema');
const { jwtAuthMiddleware } = require('../Middleware/jwt');

// Retrieve a list of tasks assigned to the employee
/**
 * Route to get all tasks assigned to a specific employee.
 * @route GET /:employeeId/tasks
 * @param {string} employeeId - The ID of the employee.
 * @returns {Array<Task>} - List of tasks assigned to the employee.
 * @throws {Error} - Returns a 404 status code if no tasks are found or a 500 status code for other errors.
 */
router.get('/:employeeId/tasks',jwtAuthMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Find tasks assigned to the specific employee
        const tasks = await Task.find({ assignedTo: employeeId });

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this employee' });
        }

        // Respond with the list of tasks
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve the employee's profile details
/**
 * Route to get the profile details of a specific employee.
 * @route GET /:employeeId/profile
 * @param {string} employeeId - The ID of the employee.
 * @returns {Object} - The employee's profile details.
 * @throws {Error} - Returns a 404 status code if the employee is not found or a 500 status code for other errors.
 */
router.get('/:employeeId/profile',jwtAuthMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Find the employee by ID
        const employee = await Employee.findById(employeeId);

        // Check if employee exists
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Respond with the employee's profile details
        res.status(200).json(employee.profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update the employee's profile details
/**
 * Route to update the profile details of a specific employee.
 * @route PUT /:employeeId/profile
 * @param {string} employeeId - The ID of the employee.
 * @param {Object} profile - The new profile data to update.
 * @returns {Object} - The updated employee profile details.
 * @throws {Error} - Returns a 400 status code if profile data is missing, a 404 status code if the employee is not found, or a 500 status code for other errors.
 */
router.put('/:employeeId/profile',jwtAuthMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { profile } = req.body;

        if (!profile) {
            return res.status(400).json({ message: 'Profile data is required' });
        }

        // Find the employee by ID and update the profile
        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            { profile }, // Update profile field
            { new: true, runValidators: true } // Return the updated document and validate
        );

        // Check if employee exists
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Respond with the updated employee profile
        res.status(200).json(employee.profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
