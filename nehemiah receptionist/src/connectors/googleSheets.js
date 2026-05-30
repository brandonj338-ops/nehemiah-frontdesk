const env = require('../config/env');
const log = require('../utils/logger');

// Appends one row per call to the call log sheet.
async function appendCallRow(row) {
  const values = [[
    new Date().toISOString(),
    row.callerType || '',
    row.fullName || '',
    row.phone || '',
    row.email || '',
    row.language || 'en',
    row.readinessScore ?? '',
    row.reentryPhase || '',
    (row.flags || []).join('|'),
    row.appointment ? 'yes' : 'no',
    row.summary || '',
    row.packetId || '',
  ]];
  if (env.DEMO_MODE) {
    log.info('sheets.demo.appendCallRow', { row: values[0] });
    return { demo: true, appended: values[0] };
  }
  const { googleapis, oauth } = require('./googleClient');
  const sheets = googleapis().sheets({ version: 'v4', auth: oauth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: env.google.sheetsId,
    range: 'Calls!A:L',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  return { demo: false, appended: values[0] };
}

const HEADER = ['Timestamp','Caller Type','Full Name','Phone','Email','Language','Readiness','Phase','Flags','Appt','Summary','Packet ID'];
module.exports = { appendCallRow, HEADER };
