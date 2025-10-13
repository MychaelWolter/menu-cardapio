const express = require('express');
const router = express.Router();
const { createItem, getAll, updateItem, deleteItem } = require('../controllers/menuController');

router.get('/', getAll);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
