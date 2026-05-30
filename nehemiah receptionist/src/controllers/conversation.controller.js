const callerType = require('../services/callerType.service');
const crisis = require('../services/crisis.service');
const volunteerKB = require('../knowledge/volunteer-opportunities.json');
const kb = require('../knowledge/knowledge-base.json');

// Main entry: detect caller type and return how to route + an opening response.
function handle(req, res) {
  const text = req.body.text || req.body.message || '';
  const hints = req.body.hints || {};
  const lang = req.body.language === 'es' ? 'es' : 'en';

  const det = callerType.detect(text, hints);

  // Crisis short-circuit.
  if (det.type === 'crisis') {
    const r = crisis.response(det.crisis.severity);
    return res.json({
      ok: true,
      callerType: 'crisis',
      confidence: det.confidence,
      severity: det.crisis.severity,
      action: 'crisis_protocol',
      response: `${r.grounding} ${r.next}`,
      resources: r.resources,
      alertStaff: true,
      nextEndpoint: '/api/message  (log + alert staff)',
    });
  }

  const routes = {
    returning_citizen: { action: 'start_intake', nextEndpoint: '/api/intake', response: "I'm so glad you reached out. I can help you get connected. I'll ask a few quick questions so we can match you with the right support - is that okay?" },
    volunteer: { action: 'volunteer_signup', nextEndpoint: '/api/volunteer', response: `Wonderful - thank you for wanting to serve. We have roles like ${volunteerKB.roles.slice(0,3).map(r=>r.name).join(', ')} and more. Can I grab your name and contact info to sign you up?` },
    donor: { action: 'donor_flow', nextEndpoint: '/api/donor', response: `Thank you for your generosity. You can give at ${kb.giving.donateUrl}, or I can have someone from our team reach out about partnership. Which would you prefer?` },
    partner: { action: 'partner_flow', nextEndpoint: '/api/donor', response: "We value partnerships. I can take your details and have our partnerships team schedule a conversation with you. Would that work?" },
    staff: { action: 'staff_message', nextEndpoint: '/api/message', response: "Sure - I can take a message for the team or note who you're trying to reach. Who is this for?" },
    wrong_number: { action: 'end_politely', nextEndpoint: null, response: "No problem at all - you've reached Project Nehemiah. Have a blessed day!" },
    general: { action: 'answer_question', nextEndpoint: '/api/receptionist', response: "Happy to help! Are you looking to join the program, volunteer, give, or do you have a general question?" },
  };

  const route = routes[det.type] || routes.general;
  return res.json({ ok: true, callerType: det.type, confidence: det.confidence, matched: det.matched, language: lang, ...route });
}

module.exports = { handle };
