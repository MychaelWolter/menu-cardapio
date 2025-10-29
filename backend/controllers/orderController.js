const Order = require('../models/Order');

// ✅ Criar pedido
exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, items } = req.body;
    const order = await Order.create({ tableNumber, items });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido', error });
  }
};

// ✅ Listar todos os pedidos
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.menuItem');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar pedidos', error });
  }
};

// ✅ Buscar pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.menuItem');
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedido', error });
  }
};

// ✅ Atualizar pedido
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true }).populate('items.menuItem');
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar pedido', error });
  }
};

// ✅ Deletar pedido
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.status(200).json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar pedido', error });
  }
};
