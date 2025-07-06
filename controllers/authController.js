const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const {first_name, last_name, username, password } = req.body
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await pool.query ('INSERT INTO tourist (first_name, last_name, username, password) VALUES (?, ?, ?, ?)', [first_name, last_name, username, hashedPassword]);

        res.status(201).json({message: 'User Registers Successfully!'});
    } catch (err) {
        res.status(500).json({error: err.message})
    }

};

const login = async (req, res) => {
    const { username, password } =req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM tourist where username = ?', [username]);
        
        if (rows.length === 0) {
            return res.status(400).json ({error: 'Invalid Credentials'});
        }

        const tourist = rows[0];
        const isMatch = await bcrypt.compare(password, tourist.password);

        if (!isMatch) {
            return res.status(400).json({error: 'Invalid Credentials'});
        }

        const token = jwt.sign({tourist_id: tourist.tourist_id, username: tourist.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME});
        res.json({ token });

    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

module.exports = {register, login}
