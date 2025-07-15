const express = require('express');
const { register, login } = require('../controllers/authController');
const { createTourist, loginTourist } = require('../controllers/touristController');
const { createResident, loginResident } = require('../controllers/residentController');
const { createBusinessOwner, loginBusinessOwner } = require('../controllers/business_ownerController');

const router = express.Router();

// Admin/User Auth
router.post('/register', register);
router.post('/login', login);

// Tourist Auth
router.post('/register/tourist', createTourist);
router.post('/login/tourist', loginTourist);

// Resident Auth
router.post('/register/resident', createResident);
router.post('/login/resident', loginResident);

router.post('/register/owner', createBusinessOwner);
router.post('/login/owner', loginBusinessOwner);

module.exports = router;
