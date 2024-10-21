const express = require('express')
const authRouter = require('./auth.router')
const orgRouter = require('./org.router')
const repoRouter = require('./repo.router')


const router = express.Router();

router.use('/auth', authRouter);
router.use('/org', orgRouter);
router.use('/repo', repoRouter);


module.exports =  router 