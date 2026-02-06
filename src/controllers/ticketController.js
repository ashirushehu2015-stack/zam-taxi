const db = require('../config/db');

// @desc    Create a Route
// @route   POST /api/tickets/admin/routes
// @access  Private (Admin)
const createRoute = async (req, res) => {
    const { origin, destination, estimated_duration, base_price } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO routes (origin, destination, estimated_duration, base_price) VALUES (?, ?, ?, ?)',
            [origin, destination, estimated_duration, base_price]
        );
        
        const newRoute = await db.query('SELECT * FROM routes WHERE id = ?', [result.lastID]);
        res.status(201).json(newRoute.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Create a Trip
// @route   POST /api/tickets/admin/trips
// @access  Private (Admin)
const createTrip = async (req, res) => {
    const { route_id, departure_time, bus_details } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO trips (route_id, departure_time, bus_details) VALUES (?, ?, ?)',
            [route_id, departure_time, bus_details]
        );

        const newTrip = await db.query('SELECT * FROM trips WHERE id = ?', [result.lastID]);
        res.status(201).json(newTrip.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get All Trips (Search)
// @route   GET /api/tickets/trips
// @access  Public
const getTrips = async (req, res) => {
    try {
        // Simple select all for now, can add filtering by origin/dest later
        const result = await db.query(
            "SELECT t.*, r.origin, r.destination, r.base_price FROM trips t JOIN routes r ON t.route_id = r.id WHERE t.status = 'scheduled'"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Book a Ticket
// @route   POST /api/tickets/book
// @access  Private
const bookTicket = async (req, res) => {
    const { trip_id, seat_number } = req.body;

    try {
        // 1. Check seat availability
        const trip = await db.query('SELECT * FROM trips WHERE id = ?', [trip_id]);
        if (trip.rows.length === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        
        if (trip.rows[0].available_seats <= 0) {
            return res.status(400).json({ message: 'Trip is full' });
        }

        // 2. Generate Mock QR Code
        const qrCode = 'ZAMTAXI-' + req.user.id + '-' + trip_id + '-' + Date.now();

        // 3. Create Ticket
        const result = await db.query(
            'INSERT INTO tickets (trip_id, passenger_id, seat_number, qr_code) VALUES (?, ?, ?, ?)',
            [trip_id, req.user.id, seat_number, qrCode]
        );
        
        // 4. Update available seats
        await db.query('UPDATE trips SET available_seats = available_seats - 1 WHERE id = ?', [trip_id]);

        const newTicket = await db.query('SELECT * FROM tickets WHERE id = ?', [result.lastID]);
        
        res.status(201).json({
            message: 'Ticket booked successfully',
            ticket: newTicket.rows[0],
            qr_code: qrCode
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get My Tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT tk.*, t.departure_time, r.origin, r.destination FROM tickets tk JOIN trips t ON tk.trip_id = t.id JOIN routes r ON t.route_id = r.id WHERE tk.passenger_id = ?",
             [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
  createRoute,
  createTrip,
  getTrips,
  bookTicket,
  getMyTickets
};
