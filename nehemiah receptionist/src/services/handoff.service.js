const { randomUUID } = require('crypto');

// Assembles the Case Manager Handoff Packet (the JSON the team receives).
function buildPacket({ caller = {}, intake = {}, resources = {}, appointment = null, callerType = 'general', summary = '', flags = [] }) {
  return {
    packetId: randomUUID(),
    createdAt: new Date().toISOString(),
    callerType,
    caller: {
      fullName: caller.fullName || null,
      phone: caller.phone || null,
      email: caller.email || null,
      dob: caller.dob || null,
      docNumber: caller.docNumber || null,
      emergencyContact: caller.emergencyContact || null,
      preferredContact: caller.preferredContact || null,
      language: caller.language || 'en',
    },
    readinessScore: intake.readinessScore ?? null,
    reentryPhase: intake.reentryPhase ?? null,
    phaseFocus: intake.phaseFocus ?? null,
    domains: intake.domains ?? null,
    plan: intake.plan ?? null,
    resourceRecommendations: resources,
    flags: [...new Set([...(intake.flags || []), ...flags])],
    appointment,
    summary,
    status: 'awaiting_case_manager',
  };
}

module.exports = { buildPacket };
