const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken, restrictTo } = require('../middleware/auth');

// Public client submission
router.post('/', requestController.createRequest);

// Protected Admin Controls
router.get('/admin', verifyToken, restrictTo('admin'), requestController.adminGetRequests);
router.put('/admin/:id', verifyToken, restrictTo('admin'), requestController.adminUpdateRequest);

module.exports = router;