const express = require('express');
const router = express.Router();
const { 
    requestRide, 
    getRideDetails, 
    updateRideStatus,
    getMyRides
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, requestRide);
router.get('/my-rides', protect, getMyRides);
router.get('/:id', protect, getRideDetails);
router.put('/:id/status', protect, updateRideStatus);

module.exports = router;
