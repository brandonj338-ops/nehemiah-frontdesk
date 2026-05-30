const env = require('../config/env');
const log = require('../utils/logger');

let _transport = null;
function transport() {
  if (_transport) return _transport;
  const nodemailer = require('nodemailer');
  _transport = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return _transport;
}

async function sendEmail({ to, subject, text, html }) {
  if (env.DEMO_MODE || !env.smtp.user) {
    log.info('email.demo.send', { to, subject });
    return { demo: true, to, subject };
  }
  const info = await transport().sendMail({ from: env.smtp.from, to, subject, text, html });
  return { demo: false, messageId: info.messageId };
}

module.exports = { sendEmail };
