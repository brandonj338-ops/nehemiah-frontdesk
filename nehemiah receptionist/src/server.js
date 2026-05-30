const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const log = require('./utils/logger');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request log
app.use((req, _res, next) => {
  log.info('request', { method: req.method, path: req.path });
  next();
});

// Health check (used by Render) - no auth.
app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'nehemiah-frontdesk', demoMode: env.DEMO_MODE, time: new Date().toISOString() })
);

// API-key gate for everything under /api.
app.use('/api', (req, res, next) => {
  if (!env.API_KEY) return next(); // no key configured -> open (demo convenience)
  const key = req.header('x-api-key') || req.query.api_key;
  if (key === env.API_KEY) return next();
  return res.status(401).json({ ok: false, error: 'Invalid or missing API key' });
});

app.use('/api', routes);

// 404 + error handlers
app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));
app.use((err, _req, res, _next) => {
  log.error('unhandled', { error: err.message });
  res.status(500).json({ ok: false, error: 'Internal error', detail: err.message });
});

const PORT = env.PORT;
if (require.main === module) {
  app.listen(PORT, () => log.info('server.started', { port: PORT, demoMode: env.DEMO_MODE }));
}

module.exports = app;
