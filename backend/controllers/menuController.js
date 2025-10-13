const MenuItem = require('../models/MenuItem');

// Listar cardápio
exports.getMenu = async (req, res) => {
    const items = await MenuItem.find();
    res.json(items);
};

// Criar item
exports.createMenuItem = async (req, res) => {
    const { name, description, price } = req.body;
    const item = await MenuItem.create({ name, description, price });
    res.json(item);
};

// Atualizar item
exports.updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedItem);
};

// Deletar item
exports.deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    await MenuItem.findByIdAndDelete(id);
    res.json({ message: 'Item deletado' });
};
