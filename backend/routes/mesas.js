const express = require('express');
const router = express.Router();
const { createMesa, listMesas } = require('../controllers/mesaController');

router.post('/', createMesa);
router.get('/', listMesas);

module.exports = router;
