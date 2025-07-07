const pool = require('../config/database');

// Get all barangays
const getAllBarangay = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM barangay');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get barangay by ID
const getBarangayById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM barangay WHERE brgy_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Barangay not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new barangay
const createBarangay = async (req, res) => {
  const { brgy_code, brgy_name, captain, population } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO barangay (brgy_code, brgy_name, captain, population) VALUES (?, ?, ?, ?)',
      [brgy_code, brgy_name, captain, population || 0]
    );
    res.status(201).json({ id: result.insertId, brgy_code, brgy_name, captain, population: population || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a barangay
const updateBarangay = async (req, res) => {
  const { id } = req.params;
  const { brgy_code, brgy_name, captain, population } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE barangay SET brgy_code = ?, brgy_name = ?, captain = ?, population = ? WHERE brgy_id = ?',
      [brgy_code, brgy_name, captain, population, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Barangay not found' });
    res.json({ message: 'Barangay updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a barangay
const deleteBarangay = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM barangay WHERE brgy_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Barangay not found' });
    res.json({ message: 'Barangay deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllBarangay,
  getBarangayById,
  createBarangay,
  updateBarangay,
  deleteBarangay,
};
