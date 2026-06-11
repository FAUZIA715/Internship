require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// DNS fix for Windows Node v24
require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1']);

const User = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
};

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    console.log('Cleared existing users');

    const salt = await bcrypt.genSalt(10);

    // HR user — strong password
    const hrPassword = await bcrypt.hash('Hr@Veri2026!', salt);
    await User.create({
      name: 'HR Manager',
      email: 'idlikekps@gmail.com',
      password: hrPassword,
      role: 'hr',
      isFirstLogin: false
    });

    // Candidate user — temp password (isFirstLogin: true)
    const candidatePassword = await bcrypt.hash('Cand@Temp2026!', salt);
    await User.create({
      name: 'Test Candidate',
      email: 'poddarsrinjoy70@gmail.com',
      password: candidatePassword,
      role: 'candidate',
      isFirstLogin: true
    });

    console.log('\n✅ Seeding complete\n');
    console.log('HR User:');
    console.log('  Email:    idlikekps@gmail.com');
    console.log('  Password: Hr@Veri2026!');
    console.log('  Portal:   localhost:5173/hr/login\n');
    console.log('Candidate User:');
    console.log('  Email:    poddarsrinjoy70@gmail.com');
    console.log('  Password: Cand@Temp2026!');
    console.log('  Portal:   localhost:5173/candidate/login');
    console.log('  Note:     isFirstLogin = true (forced password change)\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
