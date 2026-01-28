const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Start exam session
router.post('/start', sessionController.startSession);

// Get all sessions
router.get('/', sessionController.getAllSessions);

// Log event during exam
router.post('/:sessionId/event', sessionController.logEvent);

// Update live snapshot
router.post('/:sessionId/snapshot', sessionController.updateSnapshot);

// Submit answer
router.post('/:sessionId/answer', sessionController.submitAnswer);

// End session and generate report
router.post('/:sessionId/end', sessionController.endSession);

// Get session details
router.get('/:sessionId', sessionController.getSession);

// Verify report integrity
router.get('/:sessionId/verify', sessionController.verifyReport);

// Delete all sessions
router.delete('/all', sessionController.deleteAllSessions);
router.post('/email-results', sessionController.emailResults);

// Delete session
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
