const { exec } = require('child_process');
require('dotenv').config(); // Load .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

// Connect to Database
connectDB();

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 5000;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// Middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', authRoutes);

// Auth Middleware (Internal)
const protect = async (req, res, next) => {
  let token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized' });
  }
};

// ===== DATA SCHEMAS (Simplified) =====
const EventSchema = new mongoose.Schema({
  eventName: String,
  description: String,
  type: String,
  mode: String,
  meetingPlatform: String,
  category: String,
  startDate: String,
  endDate: String,
  posterUrl: String,
  organizerName: String,
  organizerEmail: String,
  ticketPrice: { type: Number, default: 0 },
  meetingLink: String
});
const Event = mongoose.model('Event', EventSchema);

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Confirmed' }
});
const Booking = mongoose.model('Booking', BookingSchema);

// Existing Event Routes (Updated to use User model and routes)
app.get('/api/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post('/api/events', protect, upload.single('poster'), async (req, res) => {
  // simplified for brevity, keeping core logic
  try {
    const newEvent = new Event({ ...req.body });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.post('/api/book', protect, async (req, res) => {
  try {
    const { eventId } = req.body;
    const booking = new Booking({ userId: req.user._id, eventId });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

app.get('/api/my-bookings', protect, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate('eventId');
  res.json(bookings);
});

app.get('/api/users/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Eventify Backend Running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});