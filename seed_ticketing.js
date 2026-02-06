const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

const seedTicketing = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'ticketing_schema.sql'), 'utf8');
    await db.query(schema);
    console.log('Ticketing tables created successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedTicketing();
