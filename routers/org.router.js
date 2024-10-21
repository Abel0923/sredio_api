const express = require('express')
const orgController = require('../controllers/org.controller');

const router = express.Router();

router.get('/', orgController.getOrganizations);
router.get('/repo', orgController.getAllOrgRepo);

module.exports =  router 