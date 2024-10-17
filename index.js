require('dotenv').config()
require('./helpers/db')
const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const users = require('./models/github-integration.model');
const cors = require('cors');
const router = require('./routers');
const app = express();
const { json, urlencoded } = require('body-parser')
app.use(session({ secret: 'a980098c017fe065a9eef539f19643c37cf0e501', resave: false, saveUninitialized: false }));
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(json())
app.use(urlencoded())
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);

passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


passport.use(new GitHubStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, { profile, accessToken});
  }
));

let port = process.env.PORT
app.listen(port, () =>{
    console.log(`API START AT PORT ${port} `)
})



