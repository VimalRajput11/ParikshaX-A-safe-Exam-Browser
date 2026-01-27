const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// Get all exams
router.get('/', examController.getAllExams);

// Get exam by ID
router.get('/:id', examController.getExamById);

// Create new exam
router.post('/', examController.createExam);

// Update exam
router.put('/:id', examController.updateExam);

// Delete exam
router.delete('/:id', examController.deleteExam);

module.exports = router;
