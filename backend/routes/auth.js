const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Passport Google Strategy Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "294215027727-0pg1fdjv8hen09ikhtf61c5t0tp6mr6p.apps.googleusercontent.com",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_secret",
    callbackURL: "/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    await user.save();
                } else {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profilePicture: profile.photos[0]?.value,
                        authProvider: 'google'
                    });
                }
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

// Serialize/Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});

// @route   POST /auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            authProvider: 'local'
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        res.status(201).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.authProvider !== 'local') {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /auth/google
// @desc    Authenticate with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /auth/google/callback
// @desc    Google auth callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        res.redirect('http://localhost:3000/dashboard');
    }
);

// @route   GET /auth/me
// @desc    Get current user
router.get('/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(401).json({ success: false });
    }
});

// @route   POST /auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = router;
