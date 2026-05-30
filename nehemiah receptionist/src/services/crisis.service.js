// Crisis detection + safe response. Default protocol: 988 + 911 + alert staff.
const HIGH = [
  'kill myself', 'suicide', 'suicidal', 'end my life', 'want to die',
  'kill me', 'hurt myself', 'self harm', 'self-harm', 'overdose',
  'no reason to live', 'better off dead', 'end it all', 'take my life'
];
const MED = [
  'hopeless', 'can\'t go on', 'cant go on', 'give up', 'breaking down',
  'falling apart', 'relapsing', 'about to relapse', 'in danger',
  'being hurt', 'abused', 'scared for my life', 'crisis', 'emergency'
];

function assess(text = '') {
  const t = String(text).toLowerCase();
  const matchedHigh = HIGH.filter((k) => t.includes(k));
  const matchedMed = MED.filter((k) => t.includes(k));
  const severity = matchedHigh.length ? 'high' : matchedMed.length ? 'medium' : 'none';
  return {
    isCrisis: severity !== 'none',
    severity,
    matched: [...matchedHigh, ...matchedMed],
  };
}

function response(severity = 'high') {
  const grounding =
    "Thank you for telling me. You matter, and you're not alone right now. " +
    "Let's take one slow breath together. I'm here with you.";
  const resources = {
    suicideAndCrisisLifeline: '988 (call or text, 24/7)',
    crisisTextLine: 'Text HOME to 741741',
    emergency: '911 if you are in immediate danger',
    veterans: '988 then press 1',
    domesticViolence: '1-800-799-7233',
  };
  const next =
    severity === 'high'
      ? "If you're thinking about harming yourself, please call or text 988 right now, or 911 if you're in immediate danger. I'm also alerting a Project Nehemiah staff member so a real person can reach out to you."
      : "It sounds like you're carrying a lot. You can reach the 988 Suicide & Crisis Lifeline any time, and I'm flagging this so a Project Nehemiah team member can follow up with you personally.";
  return { grounding, resources, next, alertStaff: true };
}

module.exports = { assess, response };
