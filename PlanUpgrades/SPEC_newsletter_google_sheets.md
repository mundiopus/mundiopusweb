# SPEC: Replace Formspree with Google Sheets via Apps Script

## Problem
Formspree free tier deletes submissions after 30 days and does not allow export.
The newsletter signup form currently uses Formspree endpoint `https://formspree.io/f/xykqylgg`.

## Goal
Store newsletter email signups permanently and for free, with full export capability at any time.

## Chosen solution
Google Sheets + Google Apps Script acting as a POST endpoint.
- Free, unlimited, permanent
- Emails land directly in a Google Sheet owned by Diego
- Exportable as CSV or Excel at any time from Google Drive
- No third-party dependency or account limits

---

## Current state (index.html)

The form is at line 538:
```html
<form class="newsletter-form" id="newsletterForm">
  <input type="email" name="email" id="newsletterEmail" placeholder="your@email.com" required />
</form>
```

The submission logic is at line 704:
```js
const APPS_SCRIPT_URL = 'https://formspree.io/f/xykqylgg';  // <-- replace this
```

Two fields are sent via FormData:
- `email` (the email address)
- `consent` (hardcoded `'yes'`)

---

## Implementation steps

### Step 1 — Create the Google Sheet
1. Go to Google Drive, create a new Google Sheet named `MundiOpus Newsletter`
2. In row 1, add headers: `Timestamp` | `Email` | `Consent`

### Step 2 — Create the Apps Script
1. Inside the Sheet: Extensions > Apps Script
2. Paste this script:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const email   = e.parameter.email   || '';
  const consent = e.parameter.consent || '';
  sheet.appendRow([new Date(), email, consent]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Save the script (Ctrl+S)

### Step 3 — Deploy as Web App
1. Click Deploy > New deployment
2. Type: Web App
3. Execute as: **Me** (Diego's Google account)
4. Who has access: **Anyone**
5. Click Deploy, copy the Web App URL (looks like `https://script.google.com/macros/s/.../exec`)

### Step 4 — Update index.html
In `index.html` at line 704, replace:
```js
const APPS_SCRIPT_URL = 'https://formspree.io/f/xykqylgg';
```
with:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

No other changes needed. The fetch call, FormData, and success/error handling stay exactly the same.

### Step 5 — Test
Submit a test email via the form on the live site and verify it appears as a new row in the Google Sheet.

---

## Notes
- Every time the Apps Script code is changed, a new deployment must be created (redeploy does not overwrite the old URL).
- CORS: Apps Script handles cross-origin POST requests natively — no extra headers needed.
- The `fetch` call already uses `no-cors` mode implicitly via FormData, so responses are opaque. The current success handler fires regardless of response body, which is fine.
