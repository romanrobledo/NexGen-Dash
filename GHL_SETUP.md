# GHL Integration — Setup

Wires the NexGen GHL sub-account into the Families workflow:
- Family detail → **Send SMS** header button sends via GHL to the primary guardian
- Families → **Notify** sub-page bulk-SMSes a tag (defaults to `enrolled`) or a Smart List

## 1. Create the Private Integration Token in GHL

In the NexGen GHL sub-account (not Bizsync):

1. Settings → **Private Integrations** → **Create New Integration**
2. Name it `NexGen-Dash`
3. Scopes required:
   - View / Edit **Contacts**
   - View / Edit **Conversations**
   - View / Edit **Conversation Messages**
   - View **Users**
   - View **Locations**
4. Copy the token that starts with `pit-us-...` — you only see it once.

## 2. Get the Location ID

Settings → **Business Profile** → **Location ID** (the long string after `/v2/location/` in the URL).

## 3. Add env vars in Vercel

Vercel dashboard → project → **Settings** → **Environment Variables**. Add:

| Name | Value | Environments |
|---|---|---|
| `GHL_LOCATION_ID` | the Location ID from step 2 | Production, Preview, Development |
| `GHL_PIT` | the `pit-us-...` token from step 1 | Production, Preview, Development |
| `GHL_NOTIFY_WEBHOOK_URL` | the URL from the Notify workflow (see §3b below) | Production, Preview, Development |
| `GHL_PROXY_API_KEY` | *(optional)* a random string if you want server-to-server calls to work | Production |

Then **Redeploy** the production branch for the vars to take effect (Vercel doesn't hot-reload env on running deploys).

## 3b. Build the Notify workflow in GHL (one-time)

The Notify page (`/families/notify`) fires ONE POST to a GHL inbound-webhook trigger. GHL takes over from there, loops over the tagged audience, and sends with its own `Wait` step between messages — the throttle lever against spam flags. Setup is ~10 minutes of clicking in GHL.

1. GHL → **Automation** → **Workflows** → **+ Create Workflow** → start from scratch. Name it `NexGen Notify`.
2. **Add Trigger** → **Inbound Webhook**.
   - Save the trigger. GHL generates a webhook URL that looks like `https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...`
   - Copy that URL. This is what goes into `GHL_NOTIFY_WEBHOOK_URL` in Vercel (step 3).
3. **Add Action** → **Find Contacts** (or whatever your GHL workspace calls the "fetch contacts by filter" action).
   - Filter: `Tag contains {{inboundWebhookRequest.tag}}`
   - This pulls everyone with the tag we posted.
4. **Add Action** → **For Each** (loops over the found contacts).
   - Inside the loop add:
     - **Send SMS** → message body = `{{inboundWebhookRequest.message}}`
     - **Wait** → pick your throttle. Start with **`Wait: 30 seconds`** — safe against carrier spam filters for 80–120 message sends. Dial it up or down later.
5. **Publish** the workflow (toggle at the top of the builder).

### The payload we send

```json
{
  "tag": "nexgen parent",
  "message": "Hi — quick note from NexGen…",
  "audience_label": "Enrolled Parents",
  "sender_name": "Roman Robledo",
  "fired_at": "2026-11-18T21:45:00Z"
}
```

Every field is available inside the workflow as `{{inboundWebhookRequest.FIELD_NAME}}` — use `sender_name` if you want to sign the SMS, use `audience_label` for internal logs, etc.

### Throttle guide

| `Wait` step | 120 msgs take | When to use |
|---|---|---|
| 2 seconds | ~4 min | Aggressive. Risk flags on non-verified brands. |
| **30 seconds** | ~1 hour | **Default — balances speed vs safety** |
| 2 minutes | ~4 hours | Very conservative, drip territory |

If you ever get carrier feedback that messages are being flagged, bump the Wait higher — no code change needed.

## 4. Test it

Open a preview URL (or production after redeploy):
- Go to any Family detail → mark a guardian as primary (star on Guardians tab) → click **Send SMS** → type a short message → send. Check the GHL conversation — the thread should show the outbound SMS. If the guardian's phone wasn't already in GHL, a new contact is created.
- Go to **Families → Notify** → leave tag at `enrolled` (or pick a Smart List) → the recipient list loads from GHL → compose → **Review & send**.

## Local-dev caveat

`npm run dev` runs Vite only — it doesn't execute `/api/*` serverless functions. Hitting Send SMS or the Notify page locally will fail with `Unexpected token '/'…` because Vite returns the SPA HTML for `/api/ghl`.

Two ways to test locally:
- **Preview deploys** — push a branch, open the Vercel preview URL (simplest)
- **`vercel dev`** — `npm i -g vercel && vercel dev` runs both Vite and the serverless functions on one port

## Files

- `lib/ghl.js` — REST client (server-side only)
- `api/ghl.js` — Vercel serverless dispatcher at `/api/ghl?action=…`
- `src/hooks/useGhl.js` — frontend client (`fetch('/api/ghl')`)
- `src/components/SendSmsModal.jsx` — one-off SMS composer
- `src/pages/FamilyNotifyPage.jsx` — bulk Notify page

## What's NOT wired (yet)

- **Secondary contact** — guardians table doesn't model this today. If you want "falls back to secondary if primary has no phone" semantics, we add a `priority` int column or reuse `emergency_priority`. Flag when you want this.
- **Thread view on Family detail** — the SMS modal is send-only. If you want to see the inbound/outbound history inline (like RomanOS), that's the `contact_thread` action already in the API — needs a UI panel.
- **Smart List endpoint shape** — GHL has shifted the endpoint historically; if your plan returns empty, we'll need to swap to the alternate route when testing live.
- **Per-user auth on the proxy** — `/api/ghl` is gated by same-origin + optional API key, not Supabase JWT. Fine for a childcare roster; harden if that posture changes.
- **"Staff" tag** — the Notify page's Staff preset assumes a GHL tag literally named `staff`. If your staff contacts carry a different tag (e.g. `employee`, `nexgen team`), update the PRESETS map in `src/pages/FamilyNotifyPage.jsx` or just use the Custom tag input for one-offs.
