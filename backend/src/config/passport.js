'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const config = require('./index');
const logger = require('../utils/logger');
const UserRepository = require('../features/auth/auth.repository');

/**
 * Configures Passport with Google OAuth2 strategy.
 * Uses the UserRepository for clean data access.
 * Exported as an initializer — call once during app startup.
 */
const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;

          if (!email) {
            return done(new Error('No email returned from Google'), null);
          }

          // Find or create user
          let user = await UserRepository.findByGoogleId(profile.id);

          if (!user) {
            user = await UserRepository.findByEmail(email);
          }

          if (!user) {
            user = await UserRepository.create({
              googleId: profile.id,
              name: profile.displayName,
              email,
              profilePicture:
                profile.photos && profile.photos[0]
                  ? profile.photos[0].value
                  : '',
              authProvider: 'google',
            });
            logger.info(`New user created via Google OAuth: ${email}`);
          } else if (!user.googleId) {
            // Existing local user — link their Google account
            user = await UserRepository.updateById(user._id, {
              googleId: profile.id,
              authProvider: 'google',
            });
            logger.info(`Linked Google account for existing user: ${email}`);
          }

          return done(null, user);
        } catch (error) {
          logger.error(`Google OAuth error: ${error.message}`);
          return done(error, null);
        }
      }
    )
  );

  // Session serialization (used only for OAuth flow handshake)
  passport.serializeUser((user, done) => done(null, user._id.toString()));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserRepository.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = configurePassport;
