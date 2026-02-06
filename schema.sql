CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('passenger', 'driver', 'admin')) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    vehicle_details JSONB,
    status VARCHAR(50) DEFAULT 'pending' -- pending, approved, active, busy
);

CREATE TABLE rides (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER REFERENCES users(id),
    driver_id INTEGER REFERENCES users(id),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'requested', -- requested, accepted, ongong, completed, cancelled
    fare DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
