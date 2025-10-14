const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.login = async (req, res) => {
    const { type, username, password, tableNumber } = req.body;

    if(type === 'admin') {
        if(username !== 'admin' || password !== '123456') {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const token = jwt.sign({ type: 'admin', username }, JWT_SECRET);
        return res.json({ token });
    }

    if(type === 'mesa') {
        let mesa = await User.findOne({ tableNumber });
        if(!mesa) {
            mesa = await User.create({ type: 'mesa', username: `mesa${tableNumber}`, tableNumber });
        }
        const token = jwt.sign({ type: 'mesa', tableNumber }, JWT_SECRET);
        return res.json({ token });
    }

    res.status(400).json({ message: 'Tipo de usuário inválido' });
};
