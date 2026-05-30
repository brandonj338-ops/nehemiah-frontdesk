// Adapter so the existing Vapi voice assistant can call this backend.
// Vapi sends:   { "message": { "toolCalls": [ { "id", "function": { "name", "arguments" } } ] } }
// Vapi expects: { "results": [ { "toolCallId", "result": "<single-line string>" } ] }
const conversation = require('./conversation.controller');
const receptionist = require('./receptionist.controller');
const intake = require('./intake.controller');
const appointment = require('./appointment.controller');
const message = require('./message.controller');
const engagement = require('./engagement.controller');

const MAP = {
  detect: conversation.handle,
  handle: conversation.handle,
  ask: receptionist.answer,
  intake: intake.process,
  schedule: appointment.schedule,
  message: message.take,
  volunteer: engagement.volunteer,
  donor: engagement.donor,
};

// Domains that belong in the intake "assessment" object.
const ASSESSMENT_KEYS = ['housing', 'employment', 'support', 'emotional', 'spiritual'];

// Lets the voice agent pass FLAT fields; we reshape into the nested body each controller wants.
function normalize(name, args) {
  if (name === 'intake' && !args.caller) {
    const caller = {}, assessment = {};
    for (const [k, v] of Object.entries(args)) {
      if (ASSESSMENT_KEYS.includes(k)) assessment[k] = v;
      else caller[k] = v;
    }
    return { caller, assessment };
  }
  if ((name === 'detect' || name === 'handle') && !args.text && args.message) {
    return { ...args, text: args.message };
  }
  if (name === 'ask' && !args.question && args.text) {
    return { ...args, question: args.text };
  }
  return args;
}

// Runs a normal Express controller and captures its JSON instead of sending it.
function runController(fn, body) {
  return new Promise((resolve) => {
    const req = { body, query: {}, header: () => undefined };
    let statusCode = 200;
    const res = {
      status(c) { statusCode = c; return this; },
      json(payload) { resolve({ statusCode, payload }); return this; },
    };
    Promise.resolve(fn(req, res)).catch((e) =>
      resolve({ statusCode: 500, payload: { ok: false, error: e.message } })
    );
  });
}

async function handle(req, res) {
  const toolCalls = req.body?.message?.toolCalls || req.body?.toolCalls || [];
  const results = [];

  for (const call of toolCalls) {
    const name = call.function?.name || call.name;
    let args = call.function?.arguments ?? call.arguments ?? {};
    if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }

    const fn = MAP[name];
    let out;
    if (!fn) {
      out = { ok: false, error: `Unknown tool '${name}'. Valid: ${Object.keys(MAP).join(', ')}` };
    } else {
      const r = await runController(fn, normalize(name, args));
      out = r.payload;
    }
    // Vapi requires result to be a single-line string.
    results.push({ toolCallId: call.id, result: JSON.stringify(out).replace(/\s*\n\s*/g, ' ') });
  }

  return res.json({ results });
}

module.exports = { handle };
