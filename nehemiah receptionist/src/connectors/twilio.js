const env = require('../config/env');
const log = require('../utils/logger');

let _client = null;
function client() {
  if (_client) return _client;
  _client = require('twilio')(env.twilio.sid, env.twilio.auth);
  return _client;
}

// NOTE: SMS confirmations only. System never places outbound voice calls.
async function sendSMS({ to, body }) {
  if (env.DEMO_MODE || !env.twilio.sid) {
    log.info('sms.demo.send', { to, body });
    return { demo: true, to, body };
  }
  const msg = await client().messages.create({ from: env.twilio.number, to, body });
  return { demo: false, sid: msg.sid };
}

module.exports = { sendSMS };
