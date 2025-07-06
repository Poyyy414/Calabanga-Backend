const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAllTourist = async (req, res) => {
    try {

        const [rows] = await pool.query('SELECT tourist_id, first_name, last_name, username, created_at, updated_at FROM tourist');
        res.json(rows);

    }catch (err) {
        res.status(500).json({error: err.message});
    }
};

const getTouristById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT tourist_id, first_name, last_name, username, created_at, updated_at FROM tourist WHERE tourist_id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User Not Found!'});
        }

        res.json(rows[0]);
      }catch (err) {
        res.status(500).json ({error: err.message});
      }
    };

const createTourist = async (req, res) => {
    const {first_name, last_name, username, password} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO tourist (first_name, last_name, username, password) VALUES (?, ?, ?, ?)', [first_name, last_name, username, hashedPassword]);
        res.status(201).json({id: result.insertId, first_name, last_name, username, password});
       
      }catch (err) {
        res.status(500).json({ error: err.message});
      }
    };

const updateTourist = async (req, res) => {
    const { id } = req.params;
    const {first_name, last_name, username, password} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('UPDATE tourist SET first_name = ?, last_name = ?, username = ?, password = ? WHERE tourist_id = ?', [first_name, last_name, username, hashedPassword, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json ({error: 'User not found'});
        }

        res.json({ message: 'User updated successfully'});
       }catch (err) {
        res.status(500).json({error: err.message});
       }
    };

const deleteTourist = async (req, res) => {
    const { id } = req.params;

   try{
    const [result] = await pool.query('DELETE FROM tourist WHERE tourist_id = ?,' [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json ({error: 'User Not Found!'});
    }

    res.json({ message: 'User Deleted Successfully!'});

   }catch (err) {
    res.status(500).json({error: err.message});
   }
};

module.exports = {getAllTourist, getTouristById, createTourist, updateTourist, deleteTourist};

