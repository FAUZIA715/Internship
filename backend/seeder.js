const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const User = require('./models/User');

// DNS fix for Windows Node v24
require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1']);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ============ SEED DATA ============

// Users - 1 Candidate + 1 HR
const users = [
  {
    name: 'John Candidate',
    email: 'candidate@veriflow.com',
    password: 'cand123',
    role: 'candidate',
    isFirstLogin: false,
  },
  {
    name: 'HR Manager',
    email: 'hr@veriflow.com',
    password: 'hr123',
    role: 'hr',
    isFirstLogin: false,
  },
];

// ============ SEEDER FUNCTIONS ============

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed users
const seedUsers = async () => {
  console.log('📝 Seeding users...');
  
  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const hashedPassword = await hashPassword(userData.password);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      console.log(`  ✅ Created user: ${userData.name} (${userData.email})`);
    } else {
      console.log(`  ⏭️ User already exists: ${userData.name} (${userData.email})`);
    }
  }
};

// Seed everything
const seedAll = async () => {
  try {
    console.log('\n🚀 Starting database seeding...\n');

    // Seed users
    await seedUsers();

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Candidate: candidate@veriflow.com / cand123');
    console.log('  HR:        hr@veriflow.com / hr123');
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// ============ CLEAR DATABASE ============

const clearDatabase = async () => {
  try {
    console.log('\n🗑️ Clearing database...');
    await User.deleteMany({});
    console.log('✅ Database cleared!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
};

// ============ RUN SEEDER ============

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--clear') || args.includes('-c')) {
  clearDatabase();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  node seeder.js              # Seed database with test users
  node seeder.js --clear      # Clear all users from database
  node seeder.js --help       # Show this help message
  `);
  process.exit(0);
} else {
  seedAll();
}