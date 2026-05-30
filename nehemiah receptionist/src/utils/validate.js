// Lightweight field validation so endpoints fail clearly instead of crashing.
function requireFields(body, fields) {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ''
  );
  return missing.length ? `Missing required field(s): ${missing.join(', ')}` : null;
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
const isPhone = (v) => /^[+]?[\d\s().-]{7,}$/.test(String(v || ''));

module.exports = { requireFields, isEmail, isPhone };
