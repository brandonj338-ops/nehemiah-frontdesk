// Intake scoring -> readiness score, reentry phase, and a 7/30/90-day plan.

// Each domain scored 0-4 (0 = acute need, 4 = stable). Weighted into 0-100.
const DOMAIN_WEIGHTS = { housing: 0.25, employment: 0.2, support: 0.2, emotional: 0.2, spiritual: 0.15 };

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function scoreAssessment(assessment = {}) {
  const d = {
    housing: clamp(Number(assessment.housing ?? 2), 0, 4),
    employment: clamp(Number(assessment.employment ?? 2), 0, 4),
    support: clamp(Number(assessment.support ?? 2), 0, 4),
    emotional: clamp(Number(assessment.emotional ?? 2), 0, 4),
    spiritual: clamp(Number(assessment.spiritual ?? 2), 0, 4),
  };
  let weighted = 0;
  for (const [k, w] of Object.entries(DOMAIN_WEIGHTS)) weighted += (d[k] / 4) * w;
  const readinessScore = Math.round(weighted * 100);

  const flags = [];
  if (d.housing <= 1) flags.push('housing_instability');
  if (d.employment <= 1) flags.push('unemployed');
  if (d.support <= 1) flags.push('low_support_network');
  if (d.emotional <= 1) flags.push('emotional_distress');

  return { domains: d, readinessScore, flags };
}

function determinePhase(readinessScore) {
  // Maps directly to Nehemiah's pathway.
  if (readinessScore < 40) return { phase: 'Renewal', focus: 'Stabilize basics, build first mentoring relationship, address urgent needs.' };
  if (readinessScore < 70) return { phase: 'Foundation', focus: 'Spiritual readiness, emotional stability, and planning next steps.' };
  return { phase: 'Purpose', focus: 'Long-term growth, community integration, and sustained direction.' };
}

function buildPlan(score, phase) {
  const { domains, flags } = score;
  const plan = { sevenDay: [], thirtyDay: [], ninetyDay: [] };

  // 7-day: stabilize the most acute needs first.
  plan.sevenDay.push('Meet 1:1 with an assigned Project Nehemiah mentor.');
  if (flags.includes('housing_instability')) plan.sevenDay.push('Connect with housing navigator; confirm a safe place to sleep this week.');
  if (flags.includes('emotional_distress')) plan.sevenDay.push('Schedule a check-in with a biblical counselor; share the 988 line for off-hours.');
  if (flags.includes('unemployed')) plan.sevenDay.push('Gather/replace ID and key documents needed for employment.');
  plan.sevenDay.push('Attend one program gathering or service to begin community connection.');

  // 30-day: build momentum.
  plan.thirtyDay.push('Begin a curriculum cohort (How People Change or Crossroads).');
  if (domains.employment <= 2) plan.thirtyDay.push('Work with a Marketplace Coach on resume + 3 job applications.');
  if (domains.support <= 2) plan.thirtyDay.push('Get matched with a weekly mentor rhythm and a small accountability group.');
  plan.thirtyDay.push('Set 3 personal goals across spiritual, emotional, and practical domains.');

  // 90-day: sustain + grow.
  plan.ninetyDay.push('Advance toward the next program phase with mentor review.');
  if (domains.employment <= 2) plan.ninetyDay.push('Secure stable employment or enroll in job training.');
  if (domains.housing <= 2) plan.ninetyDay.push('Transition toward stable, sustainable housing.');
  plan.ninetyDay.push('Begin giving back (serve at an event or encourage a newer participant).');

  return plan;
}

function fullIntake({ caller = {}, assessment = {} }) {
  const score = scoreAssessment(assessment);
  const phaseInfo = determinePhase(score.readinessScore);
  const plan = buildPlan(score, phaseInfo);
  return {
    caller,
    readinessScore: score.readinessScore,
    domains: score.domains,
    flags: score.flags,
    reentryPhase: phaseInfo.phase,
    phaseFocus: phaseInfo.focus,
    plan,
  };
}

module.exports = { scoreAssessment, determinePhase, buildPlan, fullIntake };
