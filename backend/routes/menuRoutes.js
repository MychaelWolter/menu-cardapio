const express = require('express');
const router = express.Router();
const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', getMenu);
router.post('/', authMiddleware, createMenuItem);
router.put('/:id', authMiddleware, updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);

module.exports = router;
