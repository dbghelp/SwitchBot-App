const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const databaseFolder = path.resolve(__dirname, '../database');
if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder);
}

const dbPath = path.resolve(databaseFolder, 'localDB.sqlite');

const db = new Database(dbPath);

const initializeDatabase = () => {
    try {
        db.prepare(`
            CREATE TABLE IF NOT EXISTS variables (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `).run();

        console.log('Table "variables" is ready.');
    } catch (err) {
        console.error('Error initializing the database:', err.message);
        throw err;
    }
};

initializeDatabase();

module.exports = db;