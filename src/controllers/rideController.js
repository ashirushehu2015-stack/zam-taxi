const db = require('../config/db');
const calculateFare = require('../utils/fareCalculator');

// @desc    Request a Ride
// @route   POST /api/rides/request
// @access  Private (Passenger)
const requestRide = async (req, res) => {
  const { pickup_location, dropoff_location, distance_km } = req.body;

  try {
    // 1. Calculate Estimated Fare
    const fare = calculateFare(distance_km, 'normal');

    // 2. Mock Driver Matching: Find first available driver
    const availableDriver = await db.query(
        "SELECT * FROM drivers WHERE status = 'active' LIMIT 1"
    );

    let rideStatus = 'requested';
    let driverId = null;

    if (availableDriver.rows.length > 0) {
        // Auto-assign for MVP
        driverId = availableDriver.rows[0].user_id; 
        rideStatus = 'accepted'; 
        
        // Update driver status to busy
        await db.query("UPDATE drivers SET status = 'busy' WHERE user_id = ?", [driverId]);
    }

    // 3. Create Ride Record
    const result = await db.query(
      'INSERT INTO rides (passenger_id, driver_id, pickup_location, dropoff_location, status, fare) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, driverId, pickup_location, dropoff_location, rideStatus, fare]
    );

    const rideId = result.lastID;
    const newRide = await db.query('SELECT * FROM rides WHERE id = ?', [rideId]);

    res.status(201).json({
      message: driverId ? 'Ride booked successfully' : 'Ride requested, searching for drivers...',
      ride: newRide.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Ride Details
// @route   GET /api/rides/:id
// @access  Private
const getRideDetails = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rides WHERE id = ?', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ride not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Update Ride Status (Driver)
// @route   PUT /api/rides/:id/status
// @access  Private (Driver)
const updateRideStatus = async (req, res) => {
    const { status } = req.body; // accepted, ongoing, completed, cancelled
    const rideId = req.params.id;

    try {
        await db.query('UPDATE rides SET status = ? WHERE id = ?', [status, rideId]);
        
        const ride = await db.query('SELECT * FROM rides WHERE id = ?', [rideId]);
        
        if (ride.rows.length === 0) {
             return res.status(404).json({ message: 'Ride not found' });
        }

        // If completed or cancelled, free up the driver
        if (status === 'completed' || status === 'cancelled') {
             await db.query("UPDATE drivers SET status = 'active' WHERE user_id = ?", [req.user.id]);
        }

        res.json(ride.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get My Rides (Passenger)
// @route   GET /api/rides/my-rides
// @access  Private
const getMyRides = async (req, res) => {
    try {
        // Check if user is driver or passenger to filter correctly?
        // For now, assuming passenger history requests
        const result = await db.query('SELECT * FROM rides WHERE passenger_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
  requestRide,
  getRideDetails,
  updateRideStatus,
  getMyRides
};
