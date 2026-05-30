const sheets = require('../connectors/googleSheets');
const gmail = require('../connectors/gmail');
const twilio = require('../connectors/twilio');
const env = require('../config/env');
const { requireFields } = require('../utils/validate');

// Takes a message / routes a caller, logs it, and alerts staff. Handles crisis alerts too.
async function take(req, res) {
  const b = req.body;
  const err = requireFields(b, ['message']);
  if (err) return res.status(400).json({ ok: false, error: err });

  const isCrisis = b.callerType === 'crisis' || b.priority === 'crisis';
  const subject = isCrisis
    ? `URGENT - Caller in crisis needs follow-up (${b.name || 'unknown'})`
    : `New message for ${b.routeTo || 'the team'} (${b.callerType || 'general'})`;

  await sheets.appendCallRow({
    callerType: b.callerType || 'general', fullName: b.name, phone: b.phone, email: b.email,
    flags: isCrisis ? ['crisis'] : [], summary: b.message,
  });

  const body = `From: ${b.name || 'Unknown'} (${b.phone || 'no phone'}, ${b.email || 'no email'})\nRoute to: ${b.routeTo || 'general'}\n\nMessage:\n${b.message}`;
  await gmail.sendEmail({ to: env.staff.email, subject, text: body });
  if (isCrisis && env.staff.sms) {
    await twilio.sendSMS({ to: env.staff.sms, body: `CRISIS follow-up needed: ${b.name || 'caller'} ${b.phone || ''}. Check email.` });
  }

  return res.json({ ok: true, logged: true, alertedStaff: true, priority: isCrisis ? 'crisis' : 'normal' });
}

module.exports = { take };
