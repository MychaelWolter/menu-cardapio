const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    type: { type: String, enum: ['admin', 'mesa'], required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String }, // apenas admin tem senha
    tableNumber: { type: Number } // apenas mesas
});

module.exports = mongoose.model('User', userSchema);
