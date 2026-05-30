# Project Nehemiah — AI Front Desk (Receptionist + Intake Specialist)

A standalone Node.js/Express backend that powers an AI front desk for Project Nehemiah:
it answers questions, detects who's calling, runs returning-citizen intake, builds a
personalized reentry plan, recommends resources, books appointments, sends email/SMS
confirmations, logs every call to Google Sheets, and generates a case-manager handoff packet.

**Built to be demo-ready on Monday.** It runs in **DEMO_MODE** out of the box — no Google,
Twilio, or email credentials required to test. Flip `DEMO_MODE=false` and fill in `.env`
when you're ready to go live.

It does **not** depend on Vapi (Vapi is optional). It **never** makes outbound calls.

---

## Quick start (local, 2 minutes)

```bash
npm install
cp .env.example .env      # works as-is in demo mode
npm test                  # runs smoke tests (should print "X passed, 0 failed")
npm start                 # starts on http://localhost:3000
```

Then open `tests/sample-requests.http` to fire test requests.

## Deploy to Render (free)

See **docs/DEPLOYMENT.md** — step-by-step, no coding required.

---

## What it does (the 14 capabilities)

1. **Receptionist** — hours, location, services, donor/volunteer/partner handling, English + Spanish.
2. **Caller-type detection** — returning citizen, volunteer, donor, partner, staff, crisis, wrong number, general.
3. **Volunteer flow** — sign-ups, role matching, onboarding steps, message taking.
4. **Donor & partner flow** — giving info, impact stories, meeting scheduling, message taking.
5. **Crisis detection** — switches tone, gives 988/911 + grounding, alerts staff.
6. **Intake specialist** — collects identity + assesses housing/employment/support/emotional/spiritual.
7. **Reentry plan** — readiness score, phase (Renewal/Foundation/Purpose), 7/30/90-day plan.
8. **Resource navigator** — housing, jobs, counseling, transport, documentation, mentoring, faith.
9. **Handoff packet** — full JSON for the case manager.
10. **Appointment scheduling** — Google Calendar (demo: Tre's calendar; swap later).
11. **Email + SMS confirmations** — backend-powered.
12. **Google Sheets logging** — one row per call.
13. **Website-widget compatible** — clean JSON, short responses, no whisper triggers.
14. **No outbound calls** — ever.

## Project layout

```
src/
  server.js              Express app + API-key gate + health check
  config/env.js          All environment variables
  routes/index.js        Every endpoint
  controllers/           Request handlers (one per flow)
  services/              Brain: caller-type, crisis, reentry scoring, resources, handoff
  connectors/            Google Calendar, Sheets, Gmail, Twilio, Vapi (all demo-aware)
  schemas/               13 JSON action schemas for the AI agent
  knowledge/             Knowledge base, resources, events, stories, volunteer roles
docs/                    Deployment, API, architecture, Google + Vapi setup
tests/                   Smoke tests + sample requests
```

## Endpoints (all under `/api`, protected by `x-api-key`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health check (no auth) |
| POST | `/api/handle` | Detect caller type + route |
| POST | `/api/receptionist` | Answer a general question |
| POST | `/api/intake` | Full intake → score, plan, handoff |
| POST | `/api/appointment` | Book appointment + confirmations |
| GET | `/api/appointment/availability` | Day availability |
| POST | `/api/message` | Take message / crisis alert |
| POST | `/api/volunteer` | Volunteer sign-up |
| POST | `/api/donor` | Donor / partner inquiry |
| POST | `/api/webhook/claude` | Single entry point for the AI agent |
| GET | `/api/knowledge` | Full knowledge base |
| GET | `/api/schema/:name` | A JSON action schema |
| GET | `/api/vapi/assistant` | (Optional) read existing Vapi assistant |

See **docs/API.md** for request/response examples.
