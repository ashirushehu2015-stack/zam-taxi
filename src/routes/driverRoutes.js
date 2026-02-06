const express = require('express');
const router = express.Router();
const { 
    getDriverProfile, 
    updateDriverProfile, 
    uploadDriverDoc,
    approveDriver,
    getAllDrivers
} = require('../controllers/driverController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/profile')
    .get(protect, getDriverProfile)
    .put(protect, updateDriverProfile);

router.post('/upload-doc', protect, upload.single('document'), uploadDriverDoc);

// Admin Routes
router.put('/approve/:id', protect, admin, approveDriver);
router.get('/admin/all', protect, admin, getAllDrivers);

module.exports = router;
