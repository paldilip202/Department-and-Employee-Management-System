const express = require('express');
const router = express.Router();

const Department = require('../models/department');
const Employee = require('../models/employee');
const { adminAuthMiddleware, jwtAuthMiddleware } = require('../Middleware/jwt');

// Retrieve a list of all departments
router.get('/department', adminAuthMiddleware, async (req, res) => {
    try {
        // Fetch all departments from the database
        const departments = await Department.find();

        // If no departments are found, return a 404 error
        if (!departments.length) {
            return res.status(404).json({ message: 'No departments found' });
        }

        // Return the list of departments with a 200 status
        res.status(200).json(departments);
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create a new department
router.post('/department',adminAuthMiddleware, async (req, res) => {
    try {
        // Extract name and description from the request body
        const { name, description } = req.body;

        // Create a new department instance
        const newDepartment = new Department({ name, description });

        // Save the new department to the database
        const savedDepartment = await newDepartment.save();

        // If saving fails, return a 500 error
        if (!savedDepartment) {
            return res.status(500).json({ message: 'Failed to save department' });
        }

        // Return the saved department with a 201 status
        res.status(201).json({ message: 'Successfully saved department', department: savedDepartment });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Retrieve details of a specific department by name
router.get('/department/:departmentName',adminAuthMiddleware, async (req, res) => {
    try {
        // Find a department by its name
        const department = await Department.findOne({ name: req.params.departmentName });

        // If the department is not found, return a 404 error
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Return the department details with a 200 status
        res.status(200).json(department);
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update details of a specific department by name
router.put('/department/:departmentName',adminAuthMiddleware, async (req, res) => {
    try {
        // Extract name and description from the request body
        const { name, description } = req.body;

        // Prepare update data object
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;

        // Find and update the department
        const updatedDepartment = await Department.findOneAndUpdate(
            { name: req.params.departmentName },
            updateData,
            { new: true, runValidators: true }
        );

        // If the department is not found, return a 404 error
        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Return the updated department with a 200 status
        res.status(200).json({ message: 'Department updated successfully', department: updatedDepartment });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Error updating department', error: err.message });
    }
});

// Delete a specific department by name
router.delete('/department/:departmentName',adminAuthMiddleware, async (req, res) => {
    try {
        // Find and delete the department by name
        const deletedDepartment = await Department.findOneAndDelete({ name: req.params.departmentName });

        // If the department is not found, return a 404 error
        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Return a success message with a 200 status
        res.status(200).json({ message: 'Department deleted successfully', department: deletedDepartment });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Retrieve a list of all employees
router.get('/employee',adminAuthMiddleware, async (req, res) => {
    try {
        // Fetch all employees and populate their department information
        const employees = await Employee.find()
            .populate({
                path: 'departmentId',
                select: 'name' // Select only the department name
            })
            .select('name profile departmentId'); // Select only employee name, profile, and departmentId

        // If no employees are found, return a 404 error
        if (employees.length === 0) {
            return res.status(404).json({ message: 'No employees found' });
        }

        // Format response to include department name
        const response = employees.map(employee => ({
            name: employee.name,
            profile: employee.profile,
            departmentName: employee.departmentId ? employee.departmentId.name : 'N/A'
        }));

        // Return the list of employees with a 200 status
        res.status(200).json(response);
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add a new employee
router.post('/employee',adminAuthMiddleware, async (req, res) => {
    try {
        // Extract employee data from the request body
        const employeeData = req.body;

        // Find the department by name
        const department = await Department.findOne({ name: employeeData.departmentName });

        // If the department is not found, return a 404 error
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Set departmentId in employee data
        employeeData.departmentId = department._id;
        delete employeeData.departmentName;

        // Create and save the new employee
        const newEmployee = new Employee(employeeData);
        const createdEmployee = await newEmployee.save();

        // If saving fails, return a 500 error
        if (!createdEmployee) {
            return res.status(500).json({ message: 'Error saving employee' });
        }

        // Return the created employee with a 201 status
        res.status(201).json({ message: 'Employee created successfully', employee: createdEmployee });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Retrieve details of a specific employee by email
router.get('/employee/:employee_Email',adminAuthMiddleware, async (req, res) => {
    try {
        // Find the employee by email and populate department information
        const employee = await Employee.findOne({ email: req.params.employee_Email })
            .populate({
                path: 'departmentId',
                select: 'name'
            })
            .select('name profile departmentId');

        // If the employee is not found, return a 404 error
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Format response to include department name
        const response = {
            name: employee.name,
            profile: employee.profile,
            departmentName: employee.departmentId ? employee.departmentId.name : 'N/A'
        };

        // Return the employee details with a 200 status
        res.status(200).json(response);
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update details of a specific employee by name
router.put('/employee/:employeeName',adminAuthMiddleware, async (req, res) => {
    try {
        // Extract departmentName and other update fields from the request body
        const { departmentName, ...updateFields } = req.body;

        // If a departmentName is provided, find the corresponding department and update the employee's departmentId
        if (departmentName) {
            const department = await Department.findOne({ name: departmentName });
            if (!department) {
                return res.status(404).json({ message: 'Department not found' });
            }
            updateFields.departmentId = department._id;
        }

        // Find and update the employee
        const updatedEmployee = await Employee.findOneAndUpdate(
            { name: req.params.employeeName },
            updateFields,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'departmentId',
                select: 'name'
            })
            .select('name profile departmentId');

        // If the employee is not found, return a 404 error
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Format response to include department name
        const response = {
            name: updatedEmployee.name,
            profile: updatedEmployee.profile,
            departmentName: updatedEmployee.departmentId ? updatedEmployee.departmentId.name : 'N/A'
        };

        // Return the updated employee details with a 200 status
        res.status(200).json({ message: 'Employee updated successfully', employee: response });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Error updating employee', error: err.message });
    }
});

// Delete a specific employee by name
router.delete('/employee/:employeeName',adminAuthMiddleware, async (req, res) => {
    try {
        // Find and delete the employee by name
        const deletedEmployee = await Employee.findOneAndDelete({ name: req.params.employeeName });

        // If the employee is not found, return a 404 error
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Return a success message with a 200 status
        res.status(200).json({ message: 'Employee deleted successfully', employee: deletedEmployee });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
