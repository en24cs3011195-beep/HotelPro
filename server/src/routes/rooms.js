const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, search, checkIn, checkOut, guests } = req.query;
    const filter = { active: true };
    if (type && type !== 'All') filter.type = type;
    if (guests) filter.capacity = { $gte: Number(guests) };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    let rooms = await Room.find(filter).sort({ pricePerNight: 1 });
    if (checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) {
      const conflicts = await Booking.find({
        status: 'confirmed',
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }).select('room');
      const unavailable = new Set(conflicts.map(b => String(b.room)));
      rooms = rooms.filter(room => !unavailable.has(String(room._id)));
    }
    res.json({ rooms });
  } catch (err) { next(err); }
});

router.get('/admin/all', auth, adminOnly, async (req, res, next) => {
  try { res.json({ rooms: await Room.find().sort({ createdAt: -1 }) }); } catch (err) { next(err); }
});

router.post('/', auth, adminOnly, async (req, res, next) => {
  try {
    const { name, type, description, pricePerNight, capacity, imageUrl, amenities } = req.body;
    if (!name || !description || !Number.isFinite(Number(pricePerNight)) || Number(pricePerNight) <= 0) {
      return res.status(400).json({ message: 'Name, description and a positive price are required.' });
    }
    const room = await Room.create({ name, type, description, pricePerNight: Number(pricePerNight), capacity: Number(capacity || 2), imageUrl, amenities: Array.isArray(amenities) ? amenities : [] });
    res.status(201).json({ room });
  } catch (err) { next(err); }
});

router.put('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ room });
  } catch (err) { next(err); }
});

router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room hidden from guest listings.' });
  } catch (err) { next(err); }
});

module.exports = router;
