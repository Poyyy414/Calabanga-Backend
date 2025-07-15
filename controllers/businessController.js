const pool = require('../config/database');

// Get all businesses with owner and barangay info
const getAllBusiness = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.business_id,
        b.business_name,
        b.business_type,
        b.permit_number,
        b.email,
        b.phone_num,
        b.logo,
        b.status,
        b.date_applied,
        b.created_at,
        b.updated_at,
        bo.owner_id,
        bo.first_name AS owner_first_name,
        bo.last_name AS owner_last_name,
        br.brgy_name
      FROM business b
      JOIN business_owner bo ON b.owner_id = bo.owner_id
      LEFT JOIN barangay br ON b.brgy_name = br.brgy_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get business by ID
const getBusinessById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT * FROM business WHERE business_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new business
const createBusiness = async (req, res) => {
  const {
    owner_id,
    brgy_name,
    business_name,
    business_type,
    permit_number,
    email,
    phone_num,
    logo
  } = req.body;

  try {
    // Check if brgy_name exists in barangay table
    const [barangayCheck] = await pool.query(`SELECT * FROM barangay WHERE brgy_name = ?`, [brgy_name]);
    if (barangayCheck.length === 0) {
      return res.status(400).json({ error: 'Barangay not found' });
    }

    const [result] = await pool.query(`
      INSERT INTO business (owner_id, brgy_name, business_name, business_type, permit_number, email, phone_num, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [owner_id, brgy_name, business_name, business_type, permit_number, email, phone_num, logo]);

    res.status(201).json({
      id: result.insertId,
      message: 'Business registered successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update business
const updateBusiness = async (req, res) => {
  const { id } = req.params;
  const {
    owner_id,
    brgy_name,
    business_name,
    business_type,
    permit_number,
    email,
    phone_num,
    logo,
    status
  } = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE business SET 
        owner_id = ?,
        brgy_name = ?,
        business_name = ?,
        business_type = ?,
        permit_number = ?,
        email = ?,
        phone_num = ?,
        logo = ?,
        status = ?
      WHERE business_id = ?
    `, [owner_id, brgy_name, business_name, business_type, permit_number, email, phone_num, logo, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ message: 'Business updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete business
const deleteBusiness = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM business WHERE business_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ message: 'Business deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllBusiness,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness
};
