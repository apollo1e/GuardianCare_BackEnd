const express = require('express');
const router = express.Router();
const elderlyController = require('../controllers/elderlyController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * @route   POST /api/elderly/assign
 * @desc    Assign elderly to caretaker
 * @access  Private (Caretakers only)
 */
router.post('/assign', elderlyController.assignCaretaker);

/**
 * @route   POST /api/elderly/remove-caretaker
 * @desc    Remove caretaker assignment
 * @access  Private (Caretakers only)
 */
router.post('/remove-caretaker', elderlyController.removeCaretaker);

/**
 * @route   GET /api/elderly/caretaker/:caretakerId
 * @desc    Get all elderly assigned to a caretaker
 * @access  Private (Caretaker access only)
 */
router.get('/caretaker/:caretakerId', elderlyController.getCaretakerElderly);

/**
 * @route   GET /api/elderly/:elderlyId/caretaker
 * @desc    Get elderly's caretaker details
 * @access  Private
 */
router.get('/:elderlyId/caretaker', elderlyController.getElderlyCaretaker);

module.exports = router;
