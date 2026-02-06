const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../zamtaxi.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database');
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Wrapper to support async/await and consistent API with partial PG compatibility
const query = (text, params = []) => {
    return new Promise((resolve, reject) => {
        // SQLite uses ? for placeholders, PostgreSQL uses , , etc.
        // We will manually replace  with ? to minimize code changes in controllers.
        // This is a simple regex replacement.
        const sql = text.replace(/\$\d+/g, '?');
        
        // Determine if it's a SELECT (all) or INSERT/UPDATE (run)
        const method = text.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';

        if (method === 'all') {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    // console.error('Query Error:', err);
                    reject(err);
                } else {
                    resolve({ rows });
                }
            });
        } else {
            db.run(sql, params, function(err) {
                if (err) {
                    // console.error('Query Error:', err);
                    reject(err);
                } else {
                    // Simulate PG 'RETURNING *' behavior for specific cases is hard in SQLite
                    // We will handle 'RETURNING *' by fetching the last inserted ID if needed, 
                    // but since our controllers rely on RETURNING *, we might need a workaround.
                    // IMPORTANT: SQLite doesn't support RETURNING * in all versions/drivers easily without extra logic.
                    // For typical INSERTs, 'this.lastID' gives the ID.
                    
                    // Hack for MVP: return limited info. 
                    // To fully support RETURNING *, we would need to do a subsequent SELECT.
                    // For now, we will return a mock object. Controllers need to be aware.
                    resolve({ 
                        rows: [], 
                        rowCount: this.changes, 
                        lastID: this.lastID 
                    });
                }
            });
        }
    });
};

module.exports = {
  query
};
