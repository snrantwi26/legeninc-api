const express = require('express');
const router = express.Router();
const artisanController = require('../controllers/artisanController');
const { verifyToken, restrictTo } = require('../middleware/auth');

// Public Access
router.get('/', artisanController.getArtisans);
router.get('/:id', artisanController.getArtisanById);

// Artisan Access
router.put('/:id', verifyToken, restrictTo('artisan'), artisanController.updateProfile);

// Admin Control Access
router.get('/admin/all', verifyToken, restrictTo('admin'), artisanController.adminGetAllArtisans);
router.put('/admin/:id/verify', verifyToken, restrictTo('admin'), artisanController.verifyArtisan);

module.exports = router;