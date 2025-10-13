const Comanda = require('../models/Comanda');
const MenuItem = require('../models/MenuItem');

const createComanda = async (req,res) => {
  try {
    const { mesaNumber, items } = req.body;
    // items: [{ itemId, qty }]
    const populated = [];
    let total = 0;
    for(const it of items){
      const menu = await MenuItem.findById(it.itemId);
      const priceAtOrder = menu.price;
      const qty = it.qty || 1;
      populated.push({ item: menu._id, qty, priceAtOrder });
      total += priceAtOrder * qty;
    }
    const comanda = await Comanda.create({ mesaNumber, items: populated, total });
    res.json(comanda);
  } catch(err){ res.status(500).json({ message: err.message }) }
};

const listComandas = async (req,res) => {
  try {
    const comandas = await Comanda.find().populate('items.item').sort('-createdAt');
    res.json(comandas);
  } catch(err){ res.status(500).json({ message: err.message }) }
};

module.exports = { createComanda, listComandas };
