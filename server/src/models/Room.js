const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['Single', 'Double', 'Deluxe', 'Suite'], default: 'Double' },
  description: { type: String, required: true, maxlength: 1200 },
  pricePerNight: { type: Number, required: true, min: 1 },
  capacity: { type: Number, default: 2, min: 1, max: 12 },
  imageUrl: { type: String, default: '' },
  amenities: [{ type: String }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
