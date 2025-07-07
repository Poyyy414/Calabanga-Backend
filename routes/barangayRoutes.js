const express = require('express');
const {getAllBarangay,getBarangayById, createBarangay, updateBarangay, deleteBarangay} = require('../controllers/barangayController');
const authenticateToken = require ('../middlewares/authmiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAllBarangay);
router.get('/:id', authenticateToken, getBarangayById);
router.post('/', authenticateToken, createBarangay);
router.put('/:id', authenticateToken, updateBarangay);
router.delete('/:id', authenticateToken, deleteBarangay);

module.exports = router;

