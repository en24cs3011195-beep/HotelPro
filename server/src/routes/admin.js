const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(auth, adminOnly);
router.get('/overview', async (req, res, next) => {
  try {
    const [users, rooms, bookings, confirmed, revenue] = await Promise.all([
      User.countDocuments({ role: 'guest' }),
      Room.countDocuments({ active: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ]);
    res.json({ stats: { users, rooms, bookings, confirmed, revenue: revenue[0]?.total || 0 } });
  } catch (err) { next(err); }
});
router.get('/users', async (req, res, next) => {
  try { res.json({ users: await User.find({ role: 'guest' }).select('name email phone createdAt').sort({ createdAt: -1 }) }); } catch (err) { next(err); }
});
module.exports = router;
