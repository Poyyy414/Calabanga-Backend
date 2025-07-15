const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all residents
const getAllResident = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.resident_id, r.first_name, r.last_name, r.age, r.gender, r.voter_status,
             b.brgy_name AS barangay_name, r.username, r.phone_num, r.created_at, r.updated_at
      FROM resident r
      JOIN barangay b ON r.barangay_id = b.brgy_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get resident by ID
const getResidentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT r.resident_id, r.first_name, r.last_name, r.age, r.gender, r.voter_status,
             b.brgy_name AS barangay_name, r.username, r.phone_num, r.created_at, r.updated_at
      FROM resident r
      JOIN barangay b ON r.barangay_id = b.brgy_id
      WHERE r.resident_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found!' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create resident using brgy_name (with transaction and validation)
const createResident = async (req, res) => {
  const {
    first_name, last_name, age, gender,
    voter_status, brgy_name, username, password, phone_num
  } = req.body;

  // Validate required fields
  const requiredFields = {
    first_name, last_name, age, gender,
    voter_status, brgy_name, username, password, phone_num
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || value.toString().trim() === '') {
      return res.status(400).json({ error: `${field.replace('_', ' ')} is required.` });
    }
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [barangayRows] = await conn.query(
      'SELECT brgy_id FROM barangay WHERE brgy_name = ?',
      [brgy_name]
    );

    if (barangayRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Barangay not found' });
    }

    const barangay_id = barangayRows[0].brgy_id;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await conn.query(`
      INSERT INTO resident 
        (first_name, last_name, age, gender, voter_status, barangay_id, username, password, phone_num)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, last_name, age, gender, voter_status,
      barangay_id, username, hashedPassword, phone_num
    ]);

    await conn.query(
      'UPDATE barangay SET population = population + 1 WHERE brgy_id = ?',
      [barangay_id]
    );

    await conn.commit();

    res.status(201).json({
      id: result.insertId,
      message: 'Resident added and population updated successfully.'
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Update resident using brgy_name
const updateResident = async (req, res) => {
  const { id } = req.params;
  const {
    first_name, last_name, age, gender,
    voter_status, brgy_name, username, password, phone_num
  } = req.body;

  try {
    const [barangayRows] = await pool.query(
      'SELECT brgy_id FROM barangay WHERE brgy_name = ?',
      [brgy_name]
    );

    if (barangayRows.length === 0) {
      return res.status(400).json({ error: 'Barangay not found' });
    }

    const barangay_id = barangayRows[0].brgy_id;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(`
      UPDATE resident
      SET first_name = ?, last_name = ?, age = ?, gender = ?, voter_status = ?, 
          barangay_id = ?, username = ?, password = ?, phone_num = ?
      WHERE resident_id = ?
    `, [
      first_name, last_name, age, gender, voter_status,
      barangay_id, username, hashedPassword, phone_num, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json({ message: 'Resident updated successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete resident and update population
const deleteResident = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT barangay_id FROM resident WHERE resident_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    const barangay_id = rows[0].barangay_id;

    await pool.query('DELETE FROM resident WHERE resident_id = ?', [id]);
    await pool.query('UPDATE barangay SET population = population - 1 WHERE brgy_id = ?', [barangay_id]);

    res.json({ message: 'Resident deleted and population updated.' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login resident
const loginResident = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM resident WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const resident = rows[0];
    const isMatch = await bcrypt.compare(password, resident.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        resident_id: resident.resident_id,
        username: resident.username,
        barangay_id: resident.barangay_id
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
  getAllResident,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  loginResident
};
