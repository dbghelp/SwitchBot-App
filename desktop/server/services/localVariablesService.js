const db = require('../config/localDB');

function setKeyValue(key, value) {
    const stmt = db.prepare(`
        INSERT INTO variables (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);
    const info = stmt.run(key, value);
    return info.changes > 0;
}

function getValueByKey(key) {
    const stmt = db.prepare('SELECT value FROM variables WHERE key = ?');
    const row = stmt.get(key);
    return row ? row.value : null;
}

function getAllVariables() {
    const stmt = db.prepare('SELECT * FROM variables');
    return stmt.all();
}

function deleteVariable(key) {
    const stmt = db.prepare('DELETE FROM variables WHERE key = ?');
    const info = stmt.run(key);
    return info.changes > 0;
}

function dropVariablesTable() {
    const stmt = db.prepare('DROP TABLE IF EXISTS variables');
    stmt.run();
}

module.exports = {
    setKeyValue,
    getValueByKey,
    getAllVariables,
    deleteVariable,
    dropVariablesTable
};