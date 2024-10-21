const express = require('express')
const authController = require('../controllers/auth.controller');
const passport = require('passport');

const router = express.Router();

router.get('/github', authController.githubAuth);
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), authController.githubCallback);
router.get('/user', authController.userAuth);
router.delete('/user', authController.deleteAuthUser);



module.exports =  router 