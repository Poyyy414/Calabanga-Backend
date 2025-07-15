const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all tourists
const getAllTourist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tourist_id, first_name, last_name, username, created_at, updated_at 
      FROM tourist
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tourist by ID
const getTouristById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT tourist_id, first_name, last_name, username, created_at, updated_at 
      FROM tourist WHERE tourist_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found!' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create tourist (Register)
const createTourist = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  // Validate required fields
  const requiredFields = { first_name, last_name, username, password };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || value.trim() === '') {
      return res.status(400).json({ error: `${key.replace('_', ' ')} is required.` });
    }
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Check if username already exists
    const [existing] = await conn.query('SELECT username FROM tourist WHERE username = ?', [username]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      `INSERT INTO tourist (first_name, last_name, username, password)
       VALUES (?, ?, ?, ?)`,
      [first_name, last_name, username, hashedPassword]
    );

    await conn.commit();

    res.status(201).json({ 
      message: 'Tourist Registered Enjoy your vacation in Calabanga'
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Update tourist
const updateTourist = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `UPDATE tourist 
       SET first_name = ?, last_name = ?, username = ?, password = ?
       WHERE tourist_id = ?`,
      [first_name, last_name, username, hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Tourist updated successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete tourist
const deleteTourist = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM tourist WHERE tourist_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found!' });
    }

    res.json({ message: 'Tourist deleted successfully.' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login tourist
const loginTourist = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM tourist WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const tourist = rows[0];
    const isMatch = await bcrypt.compare(password, tourist.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        tourist_id: tourist.tourist_id,
        username: tourist.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME || '12h' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTourist,
  getTouristById,
  createTourist,
  updateTourist,
  deleteTourist,
  loginTourist
};
