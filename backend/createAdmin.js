const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        const email = 'admin@eventify.in';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Creating new admin user...');
            const newAdmin = new User({
                fullName: 'System Admin',
                email,
                password: hashedPassword,
                phoneNumber: '0000000000',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('Admin user created successfully.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
