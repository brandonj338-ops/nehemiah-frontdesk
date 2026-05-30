require('dotenv').config();

const bool = (v, d = false) =>
  v === undefined ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_KEY: process.env.API_KEY || '',
  DEMO_MODE: bool(process.env.DEMO_MODE, true),

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || '',
    sheetsId: process.env.GOOGLE_SHEETS_ID || '',
  },
  twilio: {
    sid: process.env.TWILIO_SID || '',
    auth: process.env.TWILIO_AUTH || '',
    number: process.env.TWILIO_NUMBER || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'info@project-nehemiah.com',
  },
  staff: {
    email: process.env.STAFF_ALERT_EMAIL || 'info@project-nehemiah.com',
    sms: process.env.STAFF_ALERT_SMS || '',
  },
  vapi: {
    apiKey: process.env.VAPI_API_KEY || '',
    assistantId: process.env.VAPI_ASSISTANT_ID || '',
  },
};

module.exports = env;
