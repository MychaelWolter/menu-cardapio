const express = require('express');
const router = express.Router();
const { createComanda, listComandas } = require('../controllers/comandaController');

router.post('/', createComanda);
router.get('/', listComandas);

module.exports = router;
