const express = require('express');
const {getAllTourist, getTouristById, createTourist, updateTourist, deleteTourist} = require('../controllers/userController');
const authenticateToken = require ('../middlewares/authmiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAllTourist);
router.get('/:id', authenticateToken, getTouristById);
router.post('/', authenticateToken, createTourist);
router.put('/:id', authenticateToken, updateTourist);
router.delete('/:id', authenticateToken, deleteTourist);

module.exports = router;

