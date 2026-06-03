require('dotenv').config();
require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit();
    }

    // Create first admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@2026', salt);

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@bgv.com',
      password: hashedPassword,
      role: 'admin',
      isFirstLogin: false
    });

    console.log('✅ Super Admin created:');
    console.log('Email:', admin.email);
    console.log('Password: Admin@2026');
    console.log('Change this password after first login!');
    process.exit();

  } catch (err) {
    console.error('Seeder error:', err.message);
    process.exit(1);
  }
};

seedAdmin();