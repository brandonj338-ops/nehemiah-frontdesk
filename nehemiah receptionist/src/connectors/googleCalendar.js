const env = require('../config/env');
const log = require('../utils/logger');

// Creates a calendar event (appointment). Demo mode returns a fake event.
async function createEvent({ summary, description, startISO, endISO, attendeeEmail, attendeeName }) {
  if (env.DEMO_MODE) {
    const id = 'demo-evt-' + Date.now();
    log.info('calendar.demo.createEvent', { id, summary, startISO });
    return {
      demo: true,
      id,
      htmlLink: `https://calendar.google.com/calendar/r/eventedit/${id}`,
      summary, startISO, endISO, attendee: attendeeEmail || attendeeName || null,
    };
  }
  const { googleapis, oauth } = require('./googleClient');
  const cal = googleapis().calendar({ version: 'v3', auth: oauth() });
  const res = await cal.events.insert({
    calendarId: env.google.calendarId,
    sendUpdates: 'all',
    requestBody: {
      summary,
      description,
      start: { dateTime: startISO, timeZone: 'America/New_York' },
      end: { dateTime: endISO, timeZone: 'America/New_York' },
      attendees: attendeeEmail ? [{ email: attendeeEmail, displayName: attendeeName }] : [],
    },
  });
  return { demo: false, id: res.data.id, htmlLink: res.data.htmlLink, summary, startISO, endISO };
}

// Returns free/busy-style availability for a day (simplified demo).
async function listBusy({ dayISO }) {
  if (env.DEMO_MODE) {
    return { demo: true, day: dayISO, busy: [{ start: '12:00', end: '13:00' }] };
  }
  const { googleapis, oauth } = require('./googleClient');
  const cal = googleapis().calendar({ version: 'v3', auth: oauth() });
  const start = new Date(dayISO + 'T00:00:00-04:00').toISOString();
  const end = new Date(dayISO + 'T23:59:59-04:00').toISOString();
  const res = await cal.freebusy.query({
    requestBody: { timeMin: start, timeMax: end, items: [{ id: env.google.calendarId }] },
  });
  return { demo: false, day: dayISO, busy: res.data.calendars[env.google.calendarId].busy };
}

module.exports = { createEvent, listBusy };
