const express = require('express');
const {getAllBusiness, getBusinessById, createBusiness, updateBusiness, deleteBusiness} = require ('../controllers/businessController');
const authenticateToken = require ('../middlewares/authmiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAllBusiness);
router.get('/:id', authenticateToken, getBusinessById);
router.post('/', authenticateToken, createBusiness);
router.put('/:id', authenticateToken, updateBusiness);
router.delete('/:id', authenticateToken, deleteBusiness);

module.exports = router;

