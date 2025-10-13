const mongoose = require('mongoose');

const MesaSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  label: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Mesa', MesaSchema);
