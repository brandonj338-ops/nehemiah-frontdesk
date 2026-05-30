// Single webhook entry point for the AI agent (Claude / Vapi tool calls).
// Dispatches { action, ... } to the right controller so the agent only needs one URL.
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

function dispatch(req, res) {
  const action = req.body.action;
  const fn = MAP[action];
  if (!fn) return res.status(400).json({ ok: false, error: `Unknown action '${action}'. Valid: ${Object.keys(MAP).join(', ')}` });
  // Controllers read from req.body; pass the payload through as-is.
  req.body = { ...req.body, ...(req.body.payload || {}) };
  return fn(req, res);
}

module.exports = { dispatch };
