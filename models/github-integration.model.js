'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const githubIntegrationSchema = new Schema({
    id: { type: String },
    displayName: { type: String },
    username: { type: String },
    accessToken: {type: String},
    connectedAt: { type: String, default: moment().valueOf()}
})

module.exports = mongoose.model('github-integration', githubIntegrationSchema);