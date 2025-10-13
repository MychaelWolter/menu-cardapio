const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: String,
  type: { type: String, enum: ['admin', 'mesa'], default: 'mesa' },
  mesaNumber: Number
});

module.exports = mongoose.model('User', UserSchema);
