import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { config } from 'dotenv';
import oauthUserModel from '../models/auth/users/oauth-user.model.js';
import notifyModel from '../models/auth/users/notify.model.js';
import settingsModel from '../models/auth/users/settings.model.js';
config();
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
// console.log(google_client_id);
// console.log(google_client_secret);
const facebook_client_id = process.env.FACEBOOK_CLIENT_ID;
const facebook_client_secret = process.env.FACEBOOK_CLIENT_SECRET;
passport.use(
  new GoogleStrategy(
    {
      clientID: google_client_id,
      clientSecret: google_client_secret,
      callbackURL: `${process.env.APP_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      const { displayName, emails, photos, provider } = profile;
      try {
        const existedUser = await oauthUserModel.findOne({
          email: emails[0].value,
        });
        if (!existedUser) {
          const allSettingsNotify = await notifyModel.find().lean();
          const newUser = new oauthUserModel({
            username: emails[0].value,
            name: displayName,
            image: photos[0].value,
            email: emails[0].value,
            oauthProvider: provider,
          });
          await newUser.save();
          await settingsModel.create({
            user: newUser._id,
            notifications: [...allSettingsNotify],
          });
          return done(null, newUser);
        } else {
          return done(null, existedUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
passport.use(
  new FacebookStrategy(
    {
      clientID: facebook_client_id,
      clientSecret: facebook_client_secret,
      callbackURL: `${process.env.APP_URL}/api/auth/facebook/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      const { displayName, emails, photos, provider } = profile;
      try {
        const existedUser = await oauthUserModel.findOne({
          email: emails[0].value,
        });
        if (!existedUser) {
          const newUser = new oauthUserModel({
            username: emails[0].value,
            name: displayName,
            image: photos[0].value,
            email: emails[0].value,
            oauthProvider: provider,
          });
          await newUser.save();
          await settingsModel.create({
            user: newUser._id,
            notifications: [...allSettingsNotify],
          });
          return done(null, newUser);
        } else {
          return done(null, existedUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
