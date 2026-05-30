const express = require('express');
const router = express.Router();

const conversation = require('../controllers/conversation.controller');
const receptionist = require('../controllers/receptionist.controller');
const intake = require('../controllers/intake.controller');
const appointment = require('../controllers/appointment.controller');
const message = require('../controllers/message.controller');
const engagement = require('../controllers/engagement.controller');
const webhook = require('../controllers/webhook.controller');
const vapi = require('../connectors/vapi');

const kb = require('../knowledge/knowledge-base.json');
const fs = require('fs');
const path = require('path');

// --- Core conversation + receptionist ---
router.post('/handle', conversation.handle);          // detect caller type + route
router.post('/receptionist', receptionist.answer);    // general Q&A from KB

// --- Returning citizen intake ---
router.post('/intake', intake.process);               // score + phase + plan + handoff

// --- Appointments ---
router.post('/appointment', appointment.schedule);    // book on Tre's calendar (demo)
router.get('/appointment/availability', appointment.availability);

// --- Messages / routing / crisis alerts ---
router.post('/message', message.take);

// --- Volunteer / donor / partner ---
router.post('/volunteer', engagement.volunteer);
router.post('/donor', engagement.donor);

// --- Single webhook for the AI agent ---
router.post('/webhook/claude', webhook.dispatch);

// --- Knowledge + schemas (read-only helpers) ---
router.get('/knowledge', (_req, res) => res.json({ ok: true, knowledge: kb }));
router.get('/schema/:name', (req, res) => {
  const file = path.join(__dirname, '..', 'schemas', `${req.params.name}.schema.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ ok: false, error: 'Schema not found' });
  res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
});

// --- Optional Vapi ---
router.get('/vapi/assistant', async (_req, res) => res.json(await vapi.getAssistant()));

module.exports = router;
