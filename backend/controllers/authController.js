const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, type: 'admin' });
    if(!user) return res.status(401).json({ message: 'Admin não encontrado' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({ message: 'Senha inválida' });
    const token = jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET);
    res.json({ token, type: user.type });
  } catch (err) { res.status(500).json({ message: err.message }) }
};

const mesaLogin = async (req, res) => {
  const { mesaNumber } = req.body;
  try {
    let mesaUser = await User.findOne({ mesaNumber, type: 'mesa' });
    if(!mesaUser) {
      mesaUser = await User.create({ username: `mesa${mesaNumber}`, type: 'mesa', mesaNumber });
    }
    // sem senha pra mesa; retornamos token simples
    const token = jwt.sign({ id: mesaUser._id, type: mesaUser.type, mesaNumber }, process.env.JWT_SECRET);
    res.json({ token, type: mesaUser.type, mesaNumber });
  } catch (err) { res.status(500).json({ message: err.message }) }
};

module.exports = { adminLogin, mesaLogin };
