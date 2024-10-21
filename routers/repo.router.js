const express = require('express')
const repoController = require('../controllers/repo.controller');

const router = express.Router();


router.post('/stats', repoController.getRepoStats);
router.post('/commits', repoController.getCommits);
router.post('/pr', repoController.getPullRequest);
router.post('/issues', repoController.getIssues);

module.exports =  router 