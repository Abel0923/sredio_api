const axios = require('axios');

const getGitHubHeaders = (token) => ({
  Authorization: `token ${token}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
});

const getGitHubData = (url, headers) => axios.get(url, { headers });

module.exports = { getGitHubHeaders, getGitHubData };