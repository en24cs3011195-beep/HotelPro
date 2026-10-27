const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

function dayStart(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

router.get('/mine', auth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('room', 'name type imageUrl pricePerNight').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const checkIn = dayStart(req.body.checkIn);
    const checkOut = dayStart(req.body.checkOut);
    const guests = Number(req.body.guests || 1);
    if (!checkIn || !checkOut || checkOut <= checkIn) return res.status(400).json({ message: 'Check-out must be after check-in.' });
    if (checkIn < dayStart(new Date())) return res.status(400).json({ message: 'Check-in cannot be in the past.' });
    if (!Number.isInteger(guests) || guests < 1 || guests > 12) return res.status(400).json({ message: 'Enter a valid guest count.' });
    const room = await Room.findOne({ _id: req.body.roomId, active: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (guests > room.capacity) return res.status(400).json({ message: `This room supports up to ${room.capacity} guests.` });
    const conflict = await Booking.findOne({
      room: room._id, status: 'confirmed',
      checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn }
    });
    if (conflict) return res.status(409).json({ message: 'This room was just booked for some of those dates. Please choose another room or dates.' });
    const nights = Math.round((checkOut - checkIn) / 86400000);
    const booking = await Booking.create({ user: req.user._id, room: room._id, checkIn, checkOut, guests, nights, totalAmount: nights * room.pricePerNight });
    res.status(201).json({ booking: await booking.populate('room', 'name type imageUrl pricePerNight') });
  } catch (err) { next(err); }
});

router.patch('/:id/cancel', auth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'This booking is already cancelled.' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ booking, message: 'Booking cancelled.' });
  } catch (err) { next(err); }
});

router.get('/admin/all', auth, adminOnly, async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('room', 'name type').populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) { next(err); }
});
module.exports = router;
