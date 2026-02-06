const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'zamtaxi.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users Table
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT CHECK (role IN ('passenger', 'driver', 'admin')) NOT NULL, phone_number TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

  // Drivers Table
  db.run("CREATE TABLE IF NOT EXISTS drivers (user_id INTEGER PRIMARY KEY, license_number TEXT, vehicle_details TEXT, status TEXT DEFAULT 'pending', FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)");

  // Rides Table
  db.run("CREATE TABLE IF NOT EXISTS rides (id INTEGER PRIMARY KEY AUTOINCREMENT, passenger_id INTEGER, driver_id INTEGER, pickup_location TEXT, dropoff_location TEXT, status TEXT DEFAULT 'requested', fare REAL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(passenger_id) REFERENCES users(id), FOREIGN KEY(driver_id) REFERENCES users(id))");

  // Routes Table
  db.run("CREATE TABLE IF NOT EXISTS routes (id INTEGER PRIMARY KEY AUTOINCREMENT, origin TEXT NOT NULL, destination TEXT NOT NULL, estimated_duration TEXT, base_price REAL NOT NULL)");

  // Trips Table
  db.run("CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY AUTOINCREMENT, route_id INTEGER, departure_time TIMESTAMP NOT NULL, bus_details TEXT, total_seats INTEGER DEFAULT 14, available_seats INTEGER DEFAULT 14, status TEXT DEFAULT 'scheduled', FOREIGN KEY(route_id) REFERENCES routes(id))");

  // Tickets Table
  db.run("CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER, passenger_id INTEGER, seat_number INTEGER, booking_status TEXT DEFAULT 'confirmed', qr_code TEXT UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(trip_id) REFERENCES trips(id), FOREIGN KEY(passenger_id) REFERENCES users(id))");

  console.log('Database initialized successfully with complete schema.');
});

db.close();
