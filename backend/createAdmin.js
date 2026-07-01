'use strict';

const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    // Connect using active database connection logic
    await connectDB();

    const email = 'admin@eventify.in';
    const password = 'admin123';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email }).select('+password');

    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      existingAdmin.password = password; // pre-save hook will hash it with 12 rounds
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const newAdmin = new User({
        name: 'System Admin',
        email,
        password, // pre-save hook will hash it with 12 rounds
        phoneNumber: '0000000000',
        role: 'admin',
        isActive: true,
      });
      await newAdmin.save();
      console.log('Admin user created successfully.');
    }

    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
