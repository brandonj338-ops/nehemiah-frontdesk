// Self-contained smoke tests. Boots the Express app in-process (supertest-free)
// using Node's http + the exported app. Runs in DEMO_MODE so no real creds needed.
process.env.DEMO_MODE = 'true';
process.env.API_KEY = ''; // open for local tests
const http = require('http');
const app = require('../src/server');

let passed = 0, failed = 0;
const server = http.createServer(app);

function call(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const addr = server.address();
    const req = http.request(
      { host: '127.0.0.1', port: addr.port, path, method, headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : {} }));
      }
    );
    if (data) req.write(data);
    req.end();
  });
}

function assert(name, cond, detail) {
  if (cond) { passed++; console.log('  PASS  ' + name); }
  else { failed++; console.log('  FAIL  ' + name + (detail ? '  -> ' + JSON.stringify(detail) : '')); }
}

async function main() {
  await new Promise((r) => server.listen(0, r));

  let r = await call('GET', '/health');
  assert('health ok', r.status === 200 && r.body.ok === true, r.body);

  r = await call('POST', '/api/handle', { text: 'I just got out and I need housing and a job' });
  assert('detects returning_citizen', r.body.callerType === 'returning_citizen', r.body);

  r = await call('POST', '/api/handle', { text: 'I want to volunteer as a mentor' });
  assert('detects volunteer', r.body.callerType === 'volunteer', r.body);

  r = await call('POST', '/api/handle', { text: 'I would like to make a donation' });
  assert('detects donor', r.body.callerType === 'donor', r.body);

  r = await call('POST', '/api/handle', { text: 'I feel hopeless and I want to kill myself' });
  assert('detects crisis + 988', r.body.callerType === 'crisis' && /988/.test(JSON.stringify(r.body.resources)), r.body);

  r = await call('POST', '/api/receptionist', { question: 'Where are you located?' });
  assert('receptionist location', /Fort Dupont/.test(r.body.response), r.body);

  r = await call('POST', '/api/intake', {
    caller: { fullName: 'Test Caller', phone: '+12025550123', email: 't@example.com' },
    assessment: { housing: 0, employment: 1, support: 1, emotional: 1, spiritual: 2 },
  });
  assert('intake scores + phase', r.body.ok && typeof r.body.intake.readinessScore === 'number' && r.body.intake.reentryPhase === 'Renewal', r.body.intake);
  assert('intake builds 7/30/90 plan', r.body.intake.plan.sevenDay.length > 0 && r.body.intake.plan.ninetyDay.length > 0, r.body.intake.plan);
  assert('intake returns handoff packet', !!r.body.handoffPacket.packetId, r.body.handoffPacket);
  assert('intake recommends housing resource', !!r.body.resources.housing, r.body.resources);

  r = await call('POST', '/api/appointment', { name: 'Test', email: 't@example.com', phone: '+12025550123', purpose: 'Intake appointment', startISO: '2026-06-02T14:00:00-04:00', endISO: '2026-06-02T14:30:00-04:00' });
  assert('appointment books + confirms', r.body.ok && r.body.event.id && r.body.confirmations.email, r.body);

  r = await call('POST', '/api/volunteer', { name: 'Vol Test', email: 'v@example.com', roleId: 'mentor', availability: 'weekends' });
  assert('volunteer signup', r.body.ok && r.body.role.id === 'mentor', r.body);

  r = await call('POST', '/api/message', { name: 'Crisis Caller', message: 'please help', priority: 'crisis' });
  assert('message crisis alert', r.body.ok && r.body.priority === 'crisis', r.body);

  r = await call('POST', '/api/webhook/claude', { action: 'ask', payload: { question: 'What are your hours?' } });
  assert('webhook dispatch', r.body.ok && /9 AM/.test(r.body.response), r.body);

  r = await call('GET', '/api/schema/intake');
  assert('schema endpoint', r.body.title === 'intake', r.body);

  console.log(`\n${passed} passed, ${failed} failed`);
  server.close();
  process.exit(failed ? 1 : 0);
}
main();
