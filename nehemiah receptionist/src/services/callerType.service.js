// Smart caller-type detection from free text + optional hints.
// Returns one of: returning_citizen, volunteer, donor, partner, staff,
// crisis, wrong_number, general.
const CRISIS = require('./crisis.service');

const RULES = [
  { type: 'crisis', weight: 100, kw: [] }, // handled separately via CRISIS
  { type: 'returning_citizen', weight: 10, kw: ['just got out', 'released', 'coming home', 'reentry', 're-entry', 'returning citizen', 'on parole', 'on probation', 'incarcerated', 'doc number', 'halfway house', 'need housing', 'need a job', 'need help getting back'] },
  { type: 'volunteer', weight: 9, kw: ['volunteer', 'mentor', 'help out', 'serve', 'give my time', 'get involved', 'sign up to help'] },
  { type: 'donor', weight: 9, kw: ['donate', 'donation', 'give money', 'contribute', 'gift', 'tithe', 'sponsor', 'support financially'] },
  { type: 'partner', weight: 9, kw: ['partner', 'partnership', 'organization', 'church', 'employer', 'hire your', 'collaborate', 'refer clients', 'grant'] },
  { type: 'staff', weight: 8, kw: ['i work here', 'staff', 'team member', 'case manager', 'this is tre', 'transfer me to'] },
  { type: 'wrong_number', weight: 12, kw: ['wrong number', 'who is this', 'didn\'t call you', 'meant to call', 'sorry wrong'] },
];

function detect(text = '', hints = {}) {
  const t = String(text).toLowerCase();

  // Crisis always wins.
  const crisis = CRISIS.assess(text);
  if (crisis.isCrisis) {
    return { type: 'crisis', confidence: 0.99, crisis, matched: crisis.matched };
  }

  if (hints.callerType) {
    return { type: hints.callerType, confidence: 0.95, matched: ['hint'] };
  }

  const scores = {};
  const matched = {};
  for (const rule of RULES) {
    for (const k of rule.kw) {
      if (t.includes(k)) {
        scores[rule.type] = (scores[rule.type] || 0) + rule.weight;
        (matched[rule.type] = matched[rule.type] || []).push(k);
      }
    }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) {
    return { type: 'general', confidence: 0.4, matched: [] };
  }
  const [type, score] = ranked[0];
  const confidence = Math.min(0.95, 0.5 + score / 20);
  return { type, confidence, matched: matched[type] };
}

module.exports = { detect };
