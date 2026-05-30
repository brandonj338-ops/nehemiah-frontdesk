# API Reference

Base URL: `https://YOUR-URL` (or `http://localhost:3000` locally).
All `/api/*` calls require header `x-api-key: YOUR_KEY` (unless `API_KEY` is blank).
All responses are JSON and include `"ok": true|false`.

---

## POST /api/handle — detect caller type + route
Request:
```json
{ "text": "I just got out and need housing", "language": "en" }
```
Response:
```json
{ "ok": true, "callerType": "returning_citizen", "confidence": 0.9,
  "action": "start_intake", "nextEndpoint": "/api/intake", "response": "..." }
```
Caller types: `returning_citizen, volunteer, donor, partner, staff, crisis, wrong_number, general`.
On crisis, response includes `resources` (988, 911, text line) and `alertStaff: true`.

## POST /api/receptionist — general question
```json
{ "question": "What are your hours?", "language": "en" }
```
→ `{ "ok": true, "topic": "hours", "response": "..." }`

## POST /api/intake — full intake
```json
{
  "caller": { "fullName": "Marcus Lee", "phone": "+12025550123", "email": "m@x.com",
              "dob": "1990-01-01", "docNumber": "DC123456",
              "emergencyContact": "Mom 202-555-0000", "preferredContact": "phone", "language": "en" },
  "assessment": { "housing": 0, "employment": 1, "support": 1, "emotional": 2, "spiritual": 2 }
}
```
Assessment scale: 0 = acute need … 4 = stable.
Response contains `intake` (readinessScore 0–100, reentryPhase, domains, flags, 7/30/90 plan),
`resources`, and a full `handoffPacket`. Also logs to Sheets and emails the case manager.

## POST /api/appointment — book + confirm
```json
{ "name": "Marcus", "email": "m@x.com", "phone": "+12025550123",
  "purpose": "Intake appointment",
  "startISO": "2026-06-02T14:00:00-04:00", "endISO": "2026-06-02T14:30:00-04:00" }
```
→ books on the configured calendar (demo: Tre's) and sends email + SMS confirmations.

## GET /api/appointment/availability?day=2026-06-02
→ busy blocks for that day.

## POST /api/message — take message / crisis alert
```json
{ "name": "Caller", "phone": "+12025550123", "routeTo": "case manager",
  "message": "Needs a callback", "priority": "normal" }
```
Set `"priority": "crisis"` to trigger an urgent staff SMS + email.

## POST /api/volunteer — sign up
```json
{ "name": "Jane", "email": "j@x.com", "roleId": "mentor", "availability": "weekends" }
```
Role IDs: `mentor, navigator, coach, hospitality, admin, media`.

## POST /api/donor — donor / partner
```json
{ "name": "Acme Church", "email": "give@acme.org", "partner": true, "requestMeeting": true }
```

## POST /api/webhook/claude — single entry point for the AI agent
```json
{ "action": "intake", "payload": { "caller": { "fullName": "Test" }, "assessment": { "housing": 1 } } }
```
Actions: `detect, handle, ask, intake, schedule, message, volunteer, donor`.
`payload` matches the matching endpoint's body.

## GET /api/knowledge — full knowledge base
## GET /api/schema/:name — a JSON action schema
e.g. `/api/schema/intake`, `/api/schema/schedule_appointment`.
