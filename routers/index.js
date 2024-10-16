const express = require('express')
const authController = require('../controllers/auth.controller');
const orgController = require('../controllers/org.controller');
const passport = require('passport');

const router = express.Router();
router.get('/auth/github', authController.githubAuth);
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), authController.githubCallback);
router.get('/auth/user', authController.userAuth);
router.delete('/auth/user', authController.deleteAuthUser);
router.get('/user/org', orgController.getOrganizations);
router.get('/user/org/repo', orgController.getAllOrgRepo);
router.get('/user/org/repo/stats', orgController.getRepoStats);



module.exports =  router 