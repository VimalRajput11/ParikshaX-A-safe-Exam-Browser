const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get all students
router.get('/', studentController.getAllStudents);

// Create new student
router.post('/', studentController.createStudent);

// Verify student
router.post('/verify', studentController.verifyStudent);

// Assign students to exam
router.post('/assign', studentController.assignStudentsToExam);

// Get students by exam
router.get('/exam/:examId', studentController.getStudentsByExam);

// Delete student
router.delete('/:id', studentController.deleteStudent);

// Delete all students for specific exam
router.post('/delete-many', studentController.deleteStudentsByExam);

// Resend Credentials
router.post('/send-credentials', studentController.sendCredentials);

module.exports = router;
