const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // pasta temporária

const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', getMenu);
router.post('/', authMiddleware, upload.single('image'), createMenuItem);
router.put('/:id', authMiddleware, upload.single('image'), updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);

module.exports = router;
