const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', createOrder);
router.get('/', authMiddleware, getOrders);

module.exports = router;
