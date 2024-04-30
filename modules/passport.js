import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { config } from 'dotenv';
import oauthUserModel from '../models/oauth-user.model.js';
config();
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
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
      const { id, displayName, emails, photos, provider } = profile;
      try {
        const existedUser = await oauthUserModel.findOne({
          id: id,
        });
        if (!existedUser) {
          const newUser = new oauthUserModel({
            id: id,
            username: emails[0]?.value || null,
            name: displayName,
            image: photos[0].value,
            email: emails[0]?.value || null,
            oauthProvider: provider,
          });
          await newUser.save();
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
      profileFields: ['id', 'displayName', 'name', 'gender', 'photos'],
      // enableProof: true,
    },
    async function (accessToken, refreshToken, profile, done) {
      const { id, displayName, photos, provider, username } = profile;
      try {
        const existedUser = await oauthUserModel.findOne({
          id: id,
        });
        if (!existedUser) {
          const newUser = new oauthUserModel({
            id: id,
            username: username || null,
            name: displayName,
            image: photos[0].value,
            email: null,
            oauthProvider: provider,
          });
          await newUser.save();
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
