const reentry = require('../services/reentry.service');
const resourceSvc = require('../services/resource.service');
const handoff = require('../services/handoff.service');
const sheets = require('../connectors/googleSheets');
const gmail = require('../connectors/gmail');
const env = require('../config/env');
const { requireFields } = require('../utils/validate');

// Full intake -> readiness score, phase, plan, resources, handoff packet, logging.
async function process(req, res) {
  const caller = req.body.caller || {};
  const assessment = req.body.assessment || {};

  const err = requireFields(caller, ['fullName']);
  if (err) return res.status(400).json({ ok: false, error: err });

  const intake = reentry.fullIntake({ caller, assessment });
  const resources = resourceSvc.recommend({ categories: req.body.categories || [], flags: intake.flags });
  const summary =
    `${caller.fullName} - readiness ${intake.readinessScore}/100, phase ${intake.reentryPhase}. ` +
    `Flags: ${intake.flags.join(', ') || 'none'}.`;

  const packet = handoff.buildPacket({
    caller, intake, resources, callerType: 'returning_citizen',
    appointment: req.body.appointment || null, summary, flags: intake.flags,
  });

  // Log + notify case manager (stubbed in demo mode).
  await sheets.appendCallRow({
    callerType: 'returning_citizen', fullName: caller.fullName, phone: caller.phone,
    email: caller.email, language: caller.language, readinessScore: intake.readinessScore,
    reentryPhase: intake.reentryPhase, flags: intake.flags, summary, packetId: packet.packetId,
  });
  await gmail.sendEmail({
    to: env.staff.email,
    subject: `New intake: ${caller.fullName} (${intake.reentryPhase}, readiness ${intake.readinessScore})`,
    text: `${summary}\n\nHandoff packet:\n${JSON.stringify(packet, null, 2)}`,
  });

  return res.json({ ok: true, intake, resources, handoffPacket: packet });
}

module.exports = { process };
