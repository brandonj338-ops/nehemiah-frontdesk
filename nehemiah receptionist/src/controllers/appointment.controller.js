const calendar = require('../connectors/googleCalendar');
const gmail = require('../connectors/gmail');
const twilio = require('../connectors/twilio');
const { requireFields } = require('../utils/validate');

// Schedules an appointment on the (demo: Tre's) Google Calendar + sends confirmations.
async function schedule(req, res) {
  const b = req.body;
  const err = requireFields(b, ['startISO', 'endISO', 'purpose']);
  if (err) return res.status(400).json({ ok: false, error: err });

  const summary = `${b.purpose} - ${b.name || 'Caller'} (Project Nehemiah)`;
  const event = await calendar.createEvent({
    summary,
    description: b.notes || `Booked via AI front desk. Purpose: ${b.purpose}.`,
    startISO: b.startISO, endISO: b.endISO,
    attendeeEmail: b.email, attendeeName: b.name,
  });

  const when = new Date(b.startISO).toLocaleString('en-US', { timeZone: 'America/New_York' });
  const confirmText = `Project Nehemiah: your ${b.purpose} is booked for ${when} (ET). Reply or call if you need to change it. 4224 Fort Dupont St. SE, Washington, DC.`;

  const confirmations = {};
  if (b.email) confirmations.email = await gmail.sendEmail({ to: b.email, subject: 'Your Project Nehemiah appointment is confirmed', text: confirmText });
  if (b.phone) confirmations.sms = await twilio.sendSMS({ to: b.phone, body: confirmText });

  return res.json({ ok: true, event, confirmations });
}

async function availability(req, res) {
  const day = req.query.day || req.body?.day;
  if (!day) return res.status(400).json({ ok: false, error: 'Provide ?day=YYYY-MM-DD' });
  const busy = await calendar.listBusy({ dayISO: day });
  return res.json({ ok: true, ...busy });
}

module.exports = { schedule, availability };
