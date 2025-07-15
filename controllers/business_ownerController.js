const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Get all business owners
const getAllBusinessOwner = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT owner_id, first_name, last_name, username, email, phone_num, business_type, business_name, created_at, updated_at 
      FROM business_owner
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get business owner by ID
const getBusinessOwnerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM business_owner WHERE owner_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Owner not found!' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create business owner (Register + Add Business)
const createBusinessOwner = async (req, res) => {
  const {
    first_name,
    last_name,
    username,
    email,
    phone_num,
    password,
    business_type,
    business_name,
    brgy_name,
    permit_number,
    logo
  } = req.body;

  // 1. Validate required fields before DB access
  const requiredFields = {
    first_name,
    last_name,
    username,
    email,
    phone_num,
    password,
    business_type,
    business_name
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || value.trim() === '') {
      return res.status(400).json({ error: `${key.replace('_', ' ')} is required.` });
    }
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 2. Validate barangay
    const [barangayCheck] = await conn.query(
      'SELECT brgy_id FROM barangay WHERE brgy_name = ?',
      [brgy_name]
    );

    if (barangayCheck.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Barangay not found in database.' });
    }

    const barangay_id = barangayCheck[0].brgy_id;

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert into business_owner
    const [ownerResult] = await conn.query(
      `INSERT INTO business_owner 
      (first_name, last_name, username, email, phone_num, password, business_type, business_name, barangay_id, profile_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        username,
        email,
        phone_num,
        hashedPassword,
        business_type,
        business_name,
        barangay_id,
        logo || null
      ]
    );

    const owner_id = ownerResult.insertId;

    // 5. Insert into business
    await conn.query(
      `INSERT INTO business 
      (owner_id, brgy_name, business_name, business_type, permit_number, email, phone_num, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner_id,
        brgy_name,
        business_name,
        business_type,
        permit_number || null,
        email,
        phone_num,
        logo || null
      ]
    );

    await conn.commit();

    res.status(201).json({
      owner_id,
      message: 'Business owner and business registered successfully.'
    });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Update business owner
const updateBusinessOwner = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    username,
    email,
    phone_num,
    password,
    business_type,
    business_name
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'UPDATE business_owner SET first_name = ?, last_name = ?, username = ?, email = ?, phone_num = ?, password = ?, business_type = ?, business_name = ? WHERE owner_id = ?',
      [first_name, last_name, username, email, phone_num, hashedPassword, business_type, business_name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    res.json({ message: 'Business owner updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete business owner
const deleteBusinessOwner = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM business_owner WHERE owner_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Owner not found!' });
    }

    res.json({ message: 'Business owner deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login business owner
const loginBusinessOwner = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM business_owner WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const owner = rows[0];
    const isMatch = await bcrypt.compare(password, owner.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        owner_id: owner.owner_id,
        username: owner.username
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
  getAllBusinessOwner,
  getBusinessOwnerById,
  createBusinessOwner,
  updateBusinessOwner,
  deleteBusinessOwner,
  loginBusinessOwner
};
