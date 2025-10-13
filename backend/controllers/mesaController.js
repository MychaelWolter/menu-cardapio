const Mesa = require('../models/Mesa');

const createMesa = async (req,res) => {
  try {
    const { number, label } = req.body;
    const existe = await Mesa.findOne({ number });
    if(existe) return res.status(400).json({ message:'Mesa já existe' });
    const mesa = await Mesa.create({ number, label });
    res.json(mesa);
  } catch(err) { res.status(500).json({ message: err.message }) }
};

const listMesas = async (req,res) => {
  try {
    const mesas = await Mesa.find().sort('number');
    res.json(mesas);
  } catch(err){ res.status(500).json({ message: err.message }) }
};

module.exports = { createMesa, listMesas };
