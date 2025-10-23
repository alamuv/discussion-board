const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../utils/logger');

module.exports = (User) => {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    logger.debug(`Serializing user: ${user.id}`);
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      logger.debug(`Deserializing user: ${id}`);
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      logger.error('Error deserializing user', { error: error.message });
      done(error);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.info(`Google OAuth callback for user: ${profile.id}`);

          // Find or create user
          const [user, created] = await User.findOrCreate({
            where: { googleId: profile.id },
            defaults: {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos[0]?.value || null,
            },
          });

          if (created) {
            logger.info(`New user created: ${user.id} (${user.email})`);
          } else {
            logger.info(`Existing user logged in: ${user.id} (${user.email})`);
          }

          return done(null, user);
        } catch (error) {
          logger.error('Error in Google OAuth strategy', { error: error.message });
          return done(error);
        }
      }
    )
  );
};

