const MenuItem = require('../models/MenuItem');

const createItem = async (req,res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.json(item);
  } catch(err){ res.status(500).json({ message: err.message }) }
};

const getAll = async (req,res) => {
  try {
    const items = await MenuItem.find({}).sort('category');
    res.json(items);
  } catch(err){ res.status(500).json({ message: err.message }) }
};

const updateItem = async (req,res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch(err){ res.status(500).json({ message: err.message }) }
};

const deleteItem = async (req,res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message:'Removido' });
  } catch(err){ res.status(500).json({ message: err.message }) }
};

module.exports = { createItem, getAll, updateItem, deleteItem };
