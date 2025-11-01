const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String } // armazenará o Base64 da imagem
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
