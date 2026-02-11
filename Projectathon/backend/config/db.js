const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use a file-based database for persistence
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
    }
});

// Helper to convert Postgres style queries ($1, $2) to SQLite style (?, ?)
const convertQuery = (text) => {
    let i = 0;
    return text.replace(/\$\d+/g, () => '?');
};

module.exports = {
    query: (text, params = []) => {
        return new Promise((resolve, reject) => {
            const sql = convertQuery(text);

            // Log for debugging
            // console.log('Executing:', sql, params);

            // Use db.all for SELECT or RETURNING clauses to get rows
            // Use db.run for others if no rows expected, but db.all handles both mostly fine if we don't need changes count for SELECT
            // However, for consistency with pg 'rows' return, db.all is best for SELECT/RETURNING.
            // For simple INSERT/UPDATE without RETURNING, db.all returns empty array, which matches pg behavior (empty rows).

            // Check if it's an INSERT/UPDATE/DELETE without RETURNING to use db.run to get changes/lastID?
            // pg.query returns { rows: [], rowCount: n }
            // sqlite3 db.all returns rows. db.run provides this.lastID/this.changes in callback.

            // To be safe and support RETURNING:
            db.all(sql, params, function (err, rows) {
                if (err) {
                    // Try to handle "RETURNING" not supported error if it happens?
                    // But standard SQLite builds now support RETURNING.
                    console.error('Query Error:', err.message, sql);
                    return reject(err);
                }

                // Construct result object similar to pg
                const result = {
                    rows: rows || [],
                    rowCount: this.changes || (rows ? rows.length : 0),
                    // pg also returns command, oid, fields etc but we probably don't need them
                };
                resolve(result);
            });
        });
    },
    // Expose close/other methods if needed
    close: () => db.close()
};
