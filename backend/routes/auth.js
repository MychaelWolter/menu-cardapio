const express = require('express');
const router = express.Router();
const { adminLogin, mesaLogin } = require('../controllers/authController');

router.post('/admin', adminLogin);
router.post('/mesa', mesaLogin);

module.exports = router;
