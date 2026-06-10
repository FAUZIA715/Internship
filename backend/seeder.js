require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB Connected');

    // Create Admin User
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@veriflow.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin created:', admin.email);
      console.log('   Password: admin123');
    }

    // Create HR User
    const existingHR = await User.findOne({ role: 'hr' });
    if (!existingHR) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('hr123', salt);

      const hr = await User.create({
        name: 'HR Manager',
        email: 'hr@veriflow.com',
        password: hashedPassword,
        role: 'hr',
        employeeId: 'HR001'
      });
      console.log('✅ HR created:', hr.email);
      console.log('   Password: hr123');
    }

    // Create Candidate User
    const existingCandidate = await User.findOne({ email: 'candidate@veriflow.com' });
    if (!existingCandidate) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('cand123', salt);

      const candidate = await User.create({
        name: 'John Candidate',
        email: 'candidate@veriflow.com',
        password: hashedPassword,
        role: 'candidate'
      });
      console.log('✅ Candidate created:', candidate.email);
      console.log('   Password: cand123');
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@veriflow.com / admin123');
    console.log('   HR: hr@veriflow.com / hr123');
    console.log('   Candidate: candidate@veriflow.com / cand123');
    process.exit();

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDatabase();