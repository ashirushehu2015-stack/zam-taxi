CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    estimated_duration VARCHAR(50),
    base_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id),
    departure_time TIMESTAMP NOT NULL,
    bus_details VARCHAR(255),
    total_seats INTEGER DEFAULT 14,
    available_seats INTEGER DEFAULT 14,
    status VARCHAR(50) DEFAULT 'scheduled' -- scheduled, ongoing, completed, cancelled
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id),
    passenger_id INTEGER REFERENCES users(id),
    seat_number INTEGER,
    booking_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled
    qr_code VARCHAR(255) UNIQUE, -- Mock unique string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
