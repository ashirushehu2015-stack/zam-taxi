const express = require('express');
const router = express.Router();
const { 
    createRoute, 
    createTrip, 
    getTrips, 
    bookTicket, 
    getMyTickets 
} = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.get('/trips', getTrips);

// Protected (Passenger)
router.post('/book', protect, bookTicket);
router.get('/my-tickets', protect, getMyTickets);

// Admin
router.post('/admin/routes', protect, admin, createRoute);
router.post('/admin/trips', protect, admin, createTrip);

module.exports = router;
