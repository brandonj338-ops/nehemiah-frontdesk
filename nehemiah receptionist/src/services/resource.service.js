const resources = require('../knowledge/resources.json');

// Recommend resources by explicit categories and/or intake flags.
function recommend({ categories = [], flags = [] } = {}) {
  const wanted = new Set(categories);
  const flagMap = {
    housing_instability: 'housing',
    unemployed: 'employment',
    emotional_distress: 'counseling',
    low_support_network: 'mentoring',
  };
  for (const f of flags) if (flagMap[f]) wanted.add(flagMap[f]);
  if (wanted.size === 0) ['housing', 'employment', 'counseling'].forEach((c) => wanted.add(c));

  const out = {};
  for (const cat of wanted) {
    if (resources.categories[cat]) out[cat] = resources.categories[cat];
  }
  return out;
}

module.exports = { recommend, all: resources.categories };
