const express = require('express');
const router = express.Router();
const { DateTime } = require('luxon');

const Department = require('../models/department');
const Employee = require('../models/employee');
const Task = require('../models/taskSchema');
const { adminAuthMiddleware, jwtAuthMiddleware } = require('../Middleware/jwt');

// Function to find a department by name
/**
 * Finds a department by its name.
 * @param {string} departmentName - The name of the department to find.
 * @returns {Promise<Department>} - The department object.
 * @throws {Error} - Throws an error if the department is not found.
 */
async function findDepartmentByName(departmentName) {
    const department = await Department.findOne({ name: departmentName });
    if (!department) {
        throw new Error('Department not found');
    }
    return department;
}

// Retrieve a list of employees within the department
/**
 * Route to get all employees in a specific department.
 * @route GET /:departmentName/employee
 * @param {string} departmentName - The name of the department.
 * @returns {Array<Employee>} - List of employees in the department.
 * @throws {Error} - Returns a 500 status code if there's a server error.
 */
router.get('/:departmentName/employee',adminAuthMiddleware, async (req, res) => {
    try {
        const { departmentName } = req.params;

        const department = await findDepartmentByName(departmentName);
        const departmentId = department._id;

        const employees = await Employee.find({ departmentId: departmentId });

        if (employees.length === 0) {
            return res.status(404).json({ message: 'No employees found in this department' });
        }

        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Function to select an employee with the least number of tasks
/**
 * Selects an employee with the least number of tasks.
 * @param {string} departmentId - The ID of the department.
 * @returns {Promise<Employee>} - The employee with the least tasks.
 */
async function selectEmployee(departmentId) {
    const employees = await Employee.find({ departmentId: departmentId });

    if (employees.length === 0) {
        return null;
    }

    let selectedEmployee = null;
    let minTaskCount = Infinity;
    let minPendingTasks = Infinity;

    for (const employee of employees) {
        const totalTasks = await Task.countDocuments({ assignedTo: employee._id });
        const pendingTasks = await Task.countDocuments({ assignedTo: employee._id, status: { $in: ['pending', 'in-progress'] } });

        if (totalTasks < minTaskCount || (totalTasks === minTaskCount && pendingTasks < minPendingTasks)) {
            selectedEmployee = employee;
            minTaskCount = totalTasks;
            minPendingTasks = pendingTasks;
        }
    }

    if (!selectedEmployee) {
        selectedEmployee = employees[0];
    }

    return selectedEmployee;
}

// Create a new task within the department
/**
 * Route to create a new task in a specific department.
 * @route POST /:departmentName/task
 * @param {string} departmentName - The name of the department.
 * @param {Object} taskData - The task data including title and description.
 * @returns {Task} - The newly created task.
 * @throws {Error} - Returns a 404 status code if the department is not found or a 500 status code for other errors.
 */
router.post('/:departmentName/task',jwtAuthMiddleware, async (req, res) => {
    try {
        const { departmentName } = req.params;
        const { title, description } = req.body;

        const dueDateLuxon = DateTime.now().plus({ days: 7 });
        const dueDate = dueDateLuxon.toJSDate();

        const department = await findDepartmentByName(departmentName);
        const selectedEmployee = await selectEmployee(department._id);

        if (!selectedEmployee) {
            return res.status(500).json({ message: 'Unable to assign task' });
        }

        const task = new Task({
            title,
            description,
            departmentId: department._id,
            assignedTo: selectedEmployee._id,
            dueDate
        });

        await task.save();

        res.status(201).json(task);
    } catch (err) {
        if (err.message === 'Department not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

// Retrieve a list of tasks within the department
/**
 * Route to get all tasks in a specific department.
 * @route GET /:departmentName/task
 * @param {string} departmentName - The name of the department.
 * @returns {Array<Task>} - List of tasks in the department.
 * @throws {Error} - Returns a 500 status code if there's a server error.
 */
router.get('/:departmentName/task',adminAuthMiddleware, async (req, res) => {
    try {
        const { departmentName } = req.params;

        const department = await findDepartmentByName(departmentName);
        const departmentId = department._id;

        const tasks = await Task.find({ departmentId: departmentId });

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found in this department' });
        }

        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve details of a specific task
/**
 * Route to get details of a specific task in a department.
 * @route GET /:departmentName/task/:taskId
 * @param {string} departmentName - The name of the department.
 * @param {string} taskId - The ID of the task.
 * @returns {Task} - Details of the specified task.
 * @throws {Error} - Returns a 404 status code if the task is not found or a 500 status code for other errors.
 */
router.get('/:departmentName/task/:taskId',jwtAuthMiddleware, async (req, res) => {
    try {
        const { departmentName, taskId } = req.params;

        const department = await findDepartmentByName(departmentName);

        const task = await Task.findOne({
            _id: taskId,
            departmentId: department._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found in this department' });
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a specific task
/**
 * Route to update a specific task in a department.
 * @route PUT /:departmentName/task/:taskId
 * @param {string} departmentName - The name of the department.
 * @param {string} taskId - The ID of the task.
 * @param {Object} updateData - Data to update the task (title, description, status, dueDate).
 * @returns {Task} - The updated task.
 * @throws {Error} - Returns a 404 status code if the task is not found or a 500 status code for other errors.
 */
router.put('/:departmentName/task/:taskId',jwtAuthMiddleware, async (req, res) => {
    try {
        const { departmentName, taskId } = req.params;
        const { title, description, status, dueDate } = req.body;

        const department = await findDepartmentByName(departmentName);

        const task = await Task.findOne({
            _id: taskId,
            departmentId: department._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found in this department' });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (dueDate) task.dueDate = new Date(dueDate);

        await task.save();

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a specific task
/**
 * Route to delete a specific task in a department.
 * @route DELETE /:departmentName/task/:taskId
 * @param {string} departmentName - The name of the department.
 * @param {string} taskId - The ID of the task.
 * @returns {Object} - Success message.
 * @throws {Error} - Returns a 404 status code if the task is not found or a 500 status code for other errors.
 */
router.delete('/:departmentName/task/:taskId',adminAuthMiddleware, async (req, res) => {
    try {
        const { departmentName, taskId } = req.params;

        const department = await findDepartmentByName(departmentName);

        const task = await Task.findOneAndDelete({
            _id: taskId,
            departmentId: department._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found in this department' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
``
