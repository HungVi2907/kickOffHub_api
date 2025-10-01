const db = require('../data/db');

// Example: Get all users
async function getAllUsers(req, res) {
  try {
    const [rows] = await db.query('SELECT id, name, age FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { getAllUsers };