const express = require('express');
const {getAllBusinessOwner, getBusinessOwnerById, createBusinessOwner, updateBusinessOwner, deleteBusinessOwner} = require ('../controllers/business_ownerController');
const authenticateToken = require ('../middlewares/authmiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAllBusinessOwner);
router.get('/:id', authenticateToken, getBusinessOwnerById);
router.post('/', authenticateToken, createBusinessOwner);
router.put('/:id', authenticateToken, updateBusinessOwner);
router.delete('/:id', authenticateToken, deleteBusinessOwner);

module.exports = router;

