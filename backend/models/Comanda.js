const mongoose = require('mongoose');

const ComandaSchema = new mongoose.Schema({
  mesaNumber: { type: Number, required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    qty: { type: Number, default: 1 },
    priceAtOrder: Number
  }],
  total: Number,
  status: { type: String, enum: ['aberta','enviada','finalizada'], default: 'aberta' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comanda', ComandaSchema);
