// Shared Google OAuth2 client for Calendar, Sheets, and Gmail.
const env = require('../config/env');

let _google = null;
function googleapis() {
  if (!_google) _google = require('googleapis').google; // lazy so demo mode needs no install at boot
  return _google;
}

function oauth() {
  const google = googleapis();
  const client = new google.auth.OAuth2(env.google.clientId, env.google.clientSecret);
  client.setCredentials({ refresh_token: env.google.refreshToken });
  return client;
}

module.exports = { googleapis, oauth };
