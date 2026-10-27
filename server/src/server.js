require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const Room = require('./models/Room');
const User = require('./models/User');

// ---- Required environment variables ----
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it in .env (local) or Render Environment (live).');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it in .env (local) or Render Environment (live).');
  process.exit(1);
}

const app = express();

// ---- CORS: allow one or more frontend URLs (comma-separated in CLIENT_URL) ----
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // allow tools like curl/Postman (no origin) and listed frontends
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  }
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', app: 'HotelPro API' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'HotelPro API' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'That value is already in use.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID or value.' });
  res.status(500).json({ message: 'Unexpected server error. Check the backend terminal.' });
});

const sampleRooms = [
  { name: 'The Garden Studio', type: 'Single', description: 'A calm, thoughtfully designed room with warm natural textures and everything needed for a restful stay.', pricePerNight: 2499, capacity: 1, imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'Work desk', 'Breakfast'] },
  { name: 'City Double', type: 'Double', description: 'A bright, comfortable room for two with a soft lounge corner and a view over the city.', pricePerNight: 3499, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast'] },
  { name: 'Signature Deluxe', type: 'Deluxe', description: 'Extra room to unwind, premium bedding, elegant finishes and a spacious modern bathroom.', pricePerNight: 5299, capacity: 3, imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'King bed', 'Mini bar', 'Breakfast'] },
  { name: 'The Grand Suite', type: 'Suite', description: 'A generous suite with a separate sitting area, elevated comforts and space for a special occasion.', pricePerNight: 8999, capacity: 4, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85', amenities: ['Wi-Fi', 'Living area', 'King bed', 'Breakfast'] }
];

// Creates the admin account on startup if ADMIN_EMAIL and ADMIN_PASSWORD are set
async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin creation.');
    return;
  }
  if (await User.findOne({ email })) {
    console.log('Admin already exists:', email);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name: 'HotelPro Admin', email, passwordHash, role: 'admin' });
  console.log('Admin account created:', email);
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('MongoDB connected');
    if (await Room.countDocuments() === 0) {
      await Room.insertMany(sampleRooms);
      console.log('Sample rooms inserted');
    }
    await ensureAdmin();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`HotelPro API listening on port ${port}`));
  } catch (err) {
    console.error('Could not start server:', err.message);
    process.exit(1);
  }
}
start();