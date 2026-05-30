// Tiny structured logger - no dependencies.
const ts = () => new Date().toISOString();
const log = (level, msg, meta) =>
  console.log(JSON.stringify({ t: ts(), level, msg, ...(meta || {}) }));

module.exports = {
  info: (m, meta) => log('info', m, meta),
  warn: (m, meta) => log('warn', m, meta),
  error: (m, meta) => log('error', m, meta),
};
