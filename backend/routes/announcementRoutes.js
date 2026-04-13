const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Create announcement (admin only)
router.post('/', announcementController.createAnnouncement);

// Get all announcements
router.get('/', announcementController.getAnnouncements);

// Get specific announcement
router.get('/:id', announcementController.getAnnoucement);

// Update announcement (admin only)
router.put('/:id', announcementController.updateAnnouncement);

// Delete announcement (admin only)
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
