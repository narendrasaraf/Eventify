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
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("294215027727-0pg1fdjv8hen09ikhtf61c5t0tp6mr6p.apps.googleusercontent.com");
const { google } = require('googleapis');

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

    return result.data.hangoutLink;
  } catch (error) {
    console.error("Google Meet creation failed:", error);
    return null;
  }
};

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Added for consistency
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
});
const User = mongoose.model('User', UserSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
  eventName: String,
  description: String,
  type: String,
  mode: String,
  category: String,
  startDate: String,
  endDate: String,
  language: String,
  posterPath: String,
  organizerName: String,
  organizerEmail: String,
  contactNumber: String,
  ticketType: String,
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
  paypalEmail: String
});
const Event = mongoose.model('Event', EventSchema);

// Booking Schema
const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Confirmed' }
});
const Booking = mongoose.model('Booking', BookingSchema);

// ===== ROUTES =====

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { password, email, ...rest } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...rest, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered!' });
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

    // Generate JWT Token (Optional but recommended for future)
    // const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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

    res.status(200).json({ message: 'Google Login successful', user });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Invalid Google Token' });
  }
});

// Update User Profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { dob, password } = req.body;
    const updates = {};
    if (dob) updates.dob = dob;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create Event 

app.post('/api/events', upload.single('poster'), async (req, res) => {
  try {
    const {
      eventName, description, type, mode, category, startDate, endDate, language,
      organizerName, organizerEmail, contactNumber, ticketType, attendeeLimit,
      registrationDeadline, venueName, venueAddress, googleMapLink, paymentMethod,
      beneficiaryName, accountNumber, bankName, ifsc, upiId, paypalEmail
    } = req.body;

    const posterPath = req.file ? `/uploads/${req.file.filename}` : null;

    let finalGoogleMapLink = googleMapLink;

    if (mode === 'Online') {
      console.log("Generating Google Meet link...");
      const meetLink = await createGoogleMeet(eventName, description, startDate, endDate);
      if (meetLink) {
        finalGoogleMapLink = meetLink;
        console.log("Google Meet Link Generated:", meetLink);
      }
    }

    const newEvent = new Event({
      eventName, description, type, mode, category, startDate, endDate, language,
      organizerName, organizerEmail, contactNumber, ticketType, attendeeLimit,
      registrationDeadline, venueName, venueAddress,
      googleMapLink: finalGoogleMapLink,
      paymentMethod,
      beneficiaryName, accountNumber, bankName, ifsc, upiId, paypalEmail,
      posterPath
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully' });
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(500).json({ error: 'Failed to create event' });
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

// Book Event
app.post('/api/book', async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) return res.status(400).json({ error: 'Missing userId or eventId' });

    const newBooking = new Booking({ userId, eventId });
    await newBooking.save();
    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get User Bookings
app.get('/api/my-bookings/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate('eventId');
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