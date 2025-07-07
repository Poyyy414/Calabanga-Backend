const express = require('express');
const {getAllResident, getResidentById, createResident, updateResident, deleteResident} = require('../controllers/residentController');
const authenticateToken = require ('../middlewares/authmiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAllResident);
router.get('/:id', authenticateToken, getResidentById);
router.post('/', authenticateToken, createResident);
router.put('/:id', authenticateToken, updateResident);
router.delete('/:id', authenticateToken, deleteResident);

module.exports = router;

