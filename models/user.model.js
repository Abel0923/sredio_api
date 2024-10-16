'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const userSchema = new mongoose.Schema({
    userId: { type: String},
    user: { type: String},
    org: {type: String},
    repo: {type: String},
    totalCommits: {
      type: Number,
      default: 0
    },
    totalPullRequests: {
      type: Number,
      default: 0
    },
    totalIssues: {
      type: Number,
      default: 0
    },
    lastSyncAt: { type: String, default: moment().valueOf()}
  });
  

  module.exports = mongoose.model('user', userSchema);