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

async function addUser(req, res) {
  const { name, age } = req.body;
  try {
    const [result] = await db.query('INSERT INTO users (name, age) VALUES (?, ?)', [name, age]);
    res.status(201).json({ id: result.insertId, name, age });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { getAllUsers, addUser };