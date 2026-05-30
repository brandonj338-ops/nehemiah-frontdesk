# Vapi Integration (Optional)

The system is **standalone** and does not need Vapi. If you want your existing voice agent
(assistant `dc702423-c998-4a01-9290-8e8a05313df6`) to use this backend:

## Option A — keep Vapi for voice, use this backend for the brain
1. In the Vapi dashboard, open your assistant.
2. Add a **Tool / Function** (Custom / Webhook) pointing to:
   `https://YOUR-URL/api/webhook/claude`
3. Add header `x-api-key: YOUR_KEY`.
4. Give the tool this body template:
   `{ "action": "<one of: detect, ask, intake, schedule, message, volunteer, donor>", "payload": { ... } }`
5. Paste the matching JSON schemas from `src/schemas/` as the tool's parameter definitions.

The voice agent handles speech; this backend handles logic, scheduling, logging, and handoff.

## Option B — read the existing assistant config
Set `VAPI_API_KEY` in `.env`, then `GET /api/vapi/assistant` returns the assistant's config so
you can mirror its prompt/voice. Purely optional.

## Website widget
For the chat widget, call the same endpoints directly from your site. Responses are already
short and clean (no whisper/voice-only artifacts), so they render well in chat bubbles.
