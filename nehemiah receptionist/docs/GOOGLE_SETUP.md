# Google Setup (Calendar + Sheets + Gmail)

You only need this when you turn off demo mode. All three Google features share ONE OAuth app.

## 1. Create the OAuth credentials
1. Go to https://console.cloud.google.com → create a project "Nehemiah Front Desk".
2. **APIs & Services → Enable APIs** → enable: **Google Calendar API**, **Google Sheets API**, **Gmail API**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type **Web application**.
4. Add redirect URI: `https://developers.google.com/oauthplayground`.
5. Copy the **Client ID** and **Client Secret** → put in `.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## 2. Get a refresh token
1. Go to https://developers.google.com/oauthplayground.
2. Top-right gear → check **Use your own OAuth credentials** → paste Client ID + Secret.
3. In the left scope list, add:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/gmail.send`
4. **Authorize APIs** → sign in with the account that owns the calendar/sheet.
5. **Exchange authorization code for tokens** → copy the **Refresh token** → `.env` as `GOOGLE_REFRESH_TOKEN`.

## 3. Calendar + Sheet IDs
- **Calendar ID:** Google Calendar → the calendar's **Settings** → "Integrate calendar" → **Calendar ID**.
  For the demo use **Tre's** calendar ID. Swap to Nehemiah's later — just change `GOOGLE_CALENDAR_ID`.
- **Sheets ID:** create a Google Sheet, add a tab named **Calls**, paste this header row into row 1:
  `Timestamp | Caller Type | Full Name | Phone | Email | Language | Readiness | Phase | Flags | Appt | Summary | Packet ID`
  The Sheets ID is the long string in the URL between `/d/` and `/edit`. Put it in `GOOGLE_SHEETS_ID`.

That's it — set `DEMO_MODE=false` and the connectors go live.
