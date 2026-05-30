// OPTIONAL Vapi integration. The system is standalone and does NOT require Vapi.
// Use this only to read/sync the existing voice assistant config if desired.
const env = require('../config/env');

async function getAssistant() {
  if (!env.vapi.apiKey) return { enabled: false, reason: 'No VAPI_API_KEY set' };
  const res = await fetch(`https://api.vapi.ai/assistant/${env.vapi.assistantId}`, {
    headers: { Authorization: `Bearer ${env.vapi.apiKey}` },
  });
  if (!res.ok) return { enabled: true, ok: false, status: res.status };
  return { enabled: true, ok: true, assistant: await res.json() };
}

module.exports = { getAssistant, assistantId: env.vapi.assistantId };
