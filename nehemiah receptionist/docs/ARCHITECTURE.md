# Architecture

## JSON-first, modular backend

```
Caller (phone / website widget)
        │  speech or text
        ▼
   AI Agent (Claude / Vapi)  ── calls one webhook ──►  /api/webhook/claude
        │                                                    │ action + payload
        │                                                    ▼
        │                                          ┌──────────────────────┐
        │                                          │   Controllers (HTTP) │
        │                                          └──────────┬───────────┘
        │                                                     ▼
        │                                          ┌──────────────────────┐
        │                                          │   Services (logic)   │
        │                                          │  callerType, crisis, │
        │                                          │  reentry, resource,  │
        │                                          │  handoff             │
        │                                          └──────────┬───────────┘
        │                                                     ▼
        │                                          ┌──────────────────────┐
        │                                          │   Connectors (I/O)   │
        │                                          │  Calendar, Sheets,   │
        │                                          │  Gmail, Twilio, Vapi │
        │                                          └──────────────────────┘
```

## Data flow for a returning-citizen call
1. `/api/handle` classifies the caller → `returning_citizen`.
2. Agent collects identity + 5 domain scores, posts to `/api/intake`.
3. `reentry.service` computes readiness (0–100) and phase (Renewal/Foundation/Purpose).
4. It builds a 7/30/90-day plan tailored to the caller's flags.
5. `resource.service` recommends matching resources.
6. `handoff.service` assembles the case-manager packet (JSON).
7. Connectors log the row to Sheets and email the packet to staff.
8. Optional: `/api/appointment` books on the calendar + sends email/SMS confirmations.

## Demo mode
`DEMO_MODE=true` stubs every connector (Calendar/Sheets/Gmail/Twilio) so the system runs
end-to-end with zero credentials. All logic (detection, scoring, planning) is real in both modes.

## Design choices
- **Stateless** — no database; each call carries its own data. Easy to host on free tiers.
  Add a DB later only if you need history beyond the Sheets log.
- **One webhook** — the agent only needs a single URL + API key.
- **Connectors are swappable** — replace the Sheets log with a CRM, or Twilio with another SMS
  provider, without touching the logic layer.
- **Knowledge base is JSON** — edit `src/knowledge/*.json` to update hours, events, stories,
  volunteer roles, and resources. Later: auto-sync from the website + calendar.

## Reentry scoring (transparent + tunable)
Domains scored 0–4, weighted: housing 25%, employment 20%, support 20%, emotional 20%,
spiritual 15% → 0–100 readiness. Phases: <40 Renewal, 40–69 Foundation, ≥70 Purpose.
Edit weights/thresholds in `src/services/reentry.service.js`.
