require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro');
    const email = 'admin@hotelpro.local';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email, '(existing password was not changed)');
    } else {
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      await User.create({ name: 'HotelPro Admin', email, passwordHash, role: 'admin' });
      console.log('Admin created. Email:', email, 'Password: Admin123!');
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
})();
