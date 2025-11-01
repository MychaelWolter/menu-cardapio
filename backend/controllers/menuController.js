const MenuItem = require('../models/MenuItem');
const fs = require('fs');

exports.getMenu = async (req, res) => {
    const items = await MenuItem.find();
    res.json(items);
};

exports.createMenuItem = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        let image = null;

        if (req.file) {
            const img = fs.readFileSync(req.file.path);
            image = `data:${req.file.mimetype};base64,${img.toString('base64')}`;
            fs.unlinkSync(req.file.path); // remove o arquivo temporário
        }

        const item = await MenuItem.create({ name, description, price, image });
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar item do cardápio' });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };

        if (req.file) {
            const img = fs.readFileSync(req.file.path);
            updateData.image = `data:${req.file.mimetype};base64,${img.toString('base64')}`;
            fs.unlinkSync(req.file.path);
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar item' });
    }
};

exports.deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    await MenuItem.findByIdAndDelete(id);
    res.json({ message: 'Item deletado' });
};
