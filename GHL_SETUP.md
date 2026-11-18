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

**Architecture note:** GHL's workflow "Find Contact" action can't filter by Tag (we verified this live). So the fan-out happens on OUR side: our serverless pulls every contact with the chosen tag, then fires the webhook once per contact. Each call opens a workflow instance that waits its own per-contact delay (0s, 30s, 60s, …) before sending. All 120 POSTs happen from our side in a few seconds; GHL queues 120 instances; SMS fan out one every 30s.

The workflow itself is only **three steps**:

1. GHL → **Automation** → **Workflows** → **+ Create Workflow** → start from scratch. Name it `NexGen Notify`.
2. **Add Trigger** → **Inbound Webhook**.
   - After saving, in the trigger's settings find **"Identify Contact by"** (or "Contact Lookup Field") and set it to the payload field **`contact_id`**. This tells the workflow which contact each webhook relates to — we send the GHL contact id in that field.
   - Copy the generated webhook URL. Goes into `GHL_NOTIFY_WEBHOOK_URL` in Vercel (step 3).
3. **Add Action** → **Wait**.
   - Duration: `{{inboundWebhookRequest.delay_seconds}}` with unit **seconds**.
   - This is what staggers each contact. Our app computes it: contact #1 gets 0, #2 gets 30, #3 gets 60, etc.
4. **Add Action** → **Send SMS**.
   - Message body = `{{inboundWebhookRequest.message}}`.
   - No recipient to configure — the workflow already identified the contact via the trigger, so it sends to that contact.
5. **Publish** the workflow.

### The payload we send (one per contact)

```json
{
  "contact_id":     "nmL2k9ab...",
  "message":        "Hi — quick note from NexGen…",
  "delay_seconds":  60,
  "audience_label": "Enrolled Parents",
  "sender_name":    "Roman Robledo",
  "fired_at":       "2026-11-18T21:45:00Z"
}
```

- `contact_id` — GHL identifies the contact via this (set in the trigger's "Identify Contact by")
- `delay_seconds` — used by the Wait action
- `message` — used by the Send SMS action
- `audience_label` / `sender_name` — optional, bind inside the workflow if you want to sign messages or log by audience

### Throttle (set from the Notify page, not inside the workflow)

The Notify page has a `Wait between sends` picker: 5s · 15s · 30s · 60s · 2m · custom. 30s is the default. The workflow's Wait action reads whatever you pick — change it per-send without touching the workflow.

| Throttle | 120 msgs last send | When to use |
|---|---|---|
| 5s | ~10 min | Aggressive. Risk flags on non-verified brands. |
| **30s** | ~1 hour | **Default — balances speed vs safety** |
| 2 min | ~4 hours | Very conservative, drip territory |

If carriers flag messages, bump the picker higher — no code or workflow change needed.

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
