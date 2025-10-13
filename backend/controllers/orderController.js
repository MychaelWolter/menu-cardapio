const Order = require('../models/Order');

// Criar pedido
exports.createOrder = async (req, res) => {
    const { tableNumber, items } = req.body;
    const order = await Order.create({ tableNumber, items });
    res.json(order);
};

// Listar pedidos
exports.getOrders = async (req, res) => {
    const orders = await Order.find().populate('items.menuItem');
    res.json(orders);
};
