const kb = require('../knowledge/knowledge-base.json');
const stories = require('../knowledge/success-stories.json');
const events = require('../knowledge/events.json');

// Answers general/receptionist questions from the knowledge base.
function answer(req, res) {
  const q = String(req.body.question || req.body.text || '').toLowerCase();
  const lang = req.body.language === 'es' ? 'es' : 'en';

  let topic = 'general';
  let response;

  if (/hour|open|close|abierto|horario/.test(q)) {
    topic = 'hours';
    response = `Our office is generally open Monday-Friday, 9 AM to 5 PM Eastern (Friday until 4 PM). We're closed weekends. ${kb.organization.officeHours.note ? '' : ''}`;
  } else if (/where|location|address|located|direccion|dónde|donde/.test(q)) {
    topic = 'location';
    response = `We're located at ${kb.organization.address}.`;
  } else if (/donat|give|gift|contribut|donar/.test(q)) {
    topic = 'donate';
    response = `You can give at ${kb.giving.donateUrl}, or I can connect you with our team about partnership and giving. Would you like that?`;
  } else if (/volunteer|help out|serve|get involved|voluntario/.test(q)) {
    topic = 'volunteer';
    response = `We'd love your help. We have roles like mentors, navigators, coaches, hospitality, admin, and media. I can sign you up right now and have our team follow up.`;
  } else if (/story|success|impact|testimon|historia/.test(q)) {
    topic = 'stories';
    response = stories.stories[0].summary;
  } else if (/event|orientation|when|schedule|evento/.test(q)) {
    topic = 'events';
    const e = events.events[0];
    response = `Our next event is ${e.title} on ${e.date} at ${e.time}, ${e.location}.`;
  } else if (/program|service|how.*work|curriculum|do you do|servicio/.test(q)) {
    topic = 'program';
    response = `${kb.organization.mission} We walk people through three phases - Renewal, Foundation, and Purpose - over a 6 to 12 month journey.`;
  } else {
    response = `${kb.organization.mission} How can I help you today - are you looking to join the program, volunteer, give, or something else?`;
  }

  return res.json({ ok: true, topic, language: lang, response, source: 'knowledge-base' });
}

module.exports = { answer };
