const express = require('express');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// Public
router.get('/', complaintController.getAllComplaints);
router.get('/stats', complaintController.getStats);

// Protected
router.post('/', authMiddleware.protect, complaintController.createComplaint);
router.get('/mine', authMiddleware.protect, complaintController.getMyComplaints);

module.exports = router;
