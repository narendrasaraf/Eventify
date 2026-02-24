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
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("294215027727-0pg1fdjv8hen09ikhtf61c5t0tp6mr6p.apps.googleusercontent.com");
const { google } = require('googleapis');

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

// Google Calendar Configuration
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const privateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '';

const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  privateKey,
  SCOPES
);

const calendar = google.calendar({
  version: 'v3',
  project: process.env.GOOGLE_PROJECT_NUMBER,
  auth: jwtClient,
});

const createGoogleMeet = async (summary, description, startTime, endTime) => {
  try {
    console.log(`[DEBUG] Attempting to create Google Meet for: ${summary}`);
    const event = {
      summary: summary,
      description: description,
      start: { dateTime: new Date(startTime).toISOString() },
      end: { dateTime: new Date(endTime).toISOString() },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = result.data.conferenceData?.entryPoints?.[0]?.uri || result.data.hangoutLink;
    console.log(`[DEBUG] Google Meet Link Generated: ${meetLink}`);
    return meetLink;
  } catch (error) {
    console.error("[ERROR] Google Meet creation failed:", error);
    return null;
  }
};

const createJitsiMeet = (eventName) => {
  const sanitizedName = eventName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  const randomStr = Math.random().toString(36).substring(7);
  return `https://meet.jit.si/eventify-${sanitizedName}-${randomStr}`;
};

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 5000;

// Security Middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Standard Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/userSignupDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ===== SCHEMAS =====

// User Schema
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  phoneNumber: String,
  dob: String,
  agreeTerms: Boolean,
  googleId: String,
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
});
const User = mongoose.model('User', UserSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
  eventName: String,
  description: String,
  type: String,
  mode: String,
  meetingPlatform: String,
  category: String,
  startDate: String,
  endDate: String,
  language: String,
  posterPath: String,
  posterUrl: String, // Cloudinary URL
  organizerName: String,
  organizerEmail: String,
  contactNumber: String,
  ticketType: String,
  ticketPrice: { type: Number, default: 0 },
  attendeeLimit: String,
  registrationDeadline: String,
  venueName: String,
  venueAddress: String,
  googleMapLink: String,
  paymentMethod: String,
  beneficiaryName: String,
  accountNumber: String,
  bankName: String,
  ifsc: String,
  upiId: String,
  paypalEmail: String,
  meetingLink: String
});
const Event = mongoose.model('Event', EventSchema);

// Booking Schema
const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Confirmed' },
  paymentId: String,
  orderId: String,
});
const Booking = mongoose.model('Booking', BookingSchema);

// ===== AUTH MIDDLEWARE =====
const protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'User role not authorized to access this route' });
    }
    next();
  };
};

// Helper: Sign JWT and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '30d'
  });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      message: 'Success',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
};

// ===== ROUTES =====

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { password, email, fullName, role, ...rest } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...rest, fullName, email, password: hashedPassword, role: role || 'user' });
    await newUser.save();

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ message: 'User logged out' });
});

// Google Auth Route
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "294215027727-0pg1fdjv8hen09ikhtf61c5t0tp6mr6p.apps.googleusercontent.com",
    });
    const { name, email, sub } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        fullName: name,
        email,
        googleId: sub,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
        agreeTerms: true
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Invalid Google Token' });
  }
});

// Create Event (with Cloudinary)
app.post('/api/events', protect, upload.single('poster'), async (req, res) => {
  try {
    const {
      eventName, description, type, mode, meetingPlatform, category, startDate, endDate, language,
      organizerName, organizerEmail, contactNumber, ticketType, ticketPrice, attendeeLimit,
      registrationDeadline, venueName, venueAddress, googleMapLink, paymentMethod,
      beneficiaryName, accountNumber, bankName, ifsc, upiId, paypalEmail
    } = req.body;

    let posterUrl = null;
    let posterPath = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eventify_posters'
      });
      posterUrl = result.secure_url;
      posterPath = `/uploads/${req.file.filename}`;
    }

    let meetingLink = "";
    if (mode === 'Online') {
      if (meetingPlatform === 'Jitsi') {
        meetingLink = createJitsiMeet(eventName);
      } else {
        const meetLink = await createGoogleMeet(eventName, description, startDate, endDate);
        if (meetLink) meetingLink = meetLink;
      }
    }

    const newEvent = new Event({
      eventName, description, type, mode, meetingPlatform, category, startDate, endDate, language,
      organizerName, organizerEmail, contactNumber, ticketType, ticketPrice: ticketPrice || 0, attendeeLimit,
      registrationDeadline, venueName, venueAddress,
      googleMapLink, meetingLink, paymentMethod,
      beneficiaryName, accountNumber, bankName, ifsc, upiId, paypalEmail,
      posterPath, posterUrl
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Razorpay: Create Order
app.post('/api/payment/create-order', protect, async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Razorpay: Verify Payment
app.post('/api/payment/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    // Payment verified
    const booking = new Booking({
      userId: req.user._id,
      eventId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'Paid'
    });
    await booking.save();
    res.json({ message: 'Payment verified and booking confirmed', booking });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});

// Get Current User
app.get('/api/users/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// Update User Profile
app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const { fullName, phoneNumber, dob } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (dob) updates.dob = dob;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// Get Single Event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Book Event (Free)
app.post('/api/book', protect, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({ error: 'Invalid Event ID. Predefined demo events cannot be booked in the database.' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const newBooking = new Booking({ userId: req.user._id, eventId });
    await newBooking.save();
    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get User Bookings
app.get('/api/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate('eventId');
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Email Sending (MailHog)
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false,
  auth: null
});

app.post('/send-email', async (req, res) => {
  const { recipient = "test@example.com", subject = "Hello from Express!", body = "This is a test email sent via MailHog." } = req.body;

  const mailOptions = {
    from: 'no-reply@eventify.com',
    to: recipient,
    subject: subject,
    text: body
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Eventify Backend Running" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});