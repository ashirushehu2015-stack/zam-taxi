const db = require('../config/db');

// @desc    Get Driver Profile
// @route   GET /api/driver/profile
// @access  Private (Driver)
const getDriverProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT u.name, u.email, u.phone_number, d.license_number, d.vehicle_details, d.status FROM drivers d JOIN users u ON d.user_id = u.id WHERE d.user_id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Driver Profile (Vehicle Details)
// @route   PUT /api/driver/profile
// @access  Private (Driver)
const updateDriverProfile = async (req, res) => {
  const { vehicle_details, license_number } = req.body;

  try {
    await db.query(
      'UPDATE drivers SET vehicle_details = ?, license_number = ? WHERE user_id = ?',
      [vehicle_details, license_number, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload Driver Documents
// @route   POST /api/driver/upload-doc
// @access  Private (Driver)
const uploadDriverDoc = async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
  }
  
  // Normalize path separators to forward slashes
  const filePath = req.file.path.replace(/\\\\/g, '/');

  res.json({ 
      message: 'Document uploaded successfully',
      path: '/' + filePath
  });
};

// @desc    Admin Approve Driver
// @route   PUT /api/driver/approve/:id
// @access  Private (Admin)
const approveDriver = async (req, res) => {
    const driverId = req.params.id;

    try {
        const result = await db.query(
            'UPDATE drivers SET status = ? WHERE user_id = ?',
            ['approved', driverId]
        );

        if (result.rowCount === 0) {
             // In SQLite wrapper, result.rowCount is valid for changes
             // Need to double check if wrapper returns rowCount (this.changes)
             // Yes, 'rowCount: this.changes' in wrapper
             // So if changes == 0, driver not found or not updated
             // But if status was already approved, changes might be 0? 
             // Safest to just Select after.
        }

        const updatedDriver = await db.query('SELECT * FROM drivers WHERE user_id = ?', [driverId]);

        if (updatedDriver.rows.length === 0) {
             return res.status(404).json({ message: 'Driver not found' });
        }

        res.json({ message: 'Driver approved successfully', driver: updatedDriver.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get All Drivers (Admin)
// @route   GET /api/driver/admin/all
// @access  Private (Admin)
const getAllDrivers = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT u.id, u.name, u.email, d.status, d.license_number FROM drivers d JOIN users u ON d.user_id = u.id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
  getDriverProfile,
  updateDriverProfile,
  uploadDriverDoc,
  approveDriver,
  getAllDrivers
};
