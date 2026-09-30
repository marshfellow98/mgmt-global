# Launch — Step by Step

Everything is built and working on `mgmt-global.onrender.com`. This moves it
to `mgmtglobal.com`.

Budget about an hour, though most of that is waiting.

**The one rule:** in Wix you are only ever *changing A records* and *adding a
TXT record*. **Never touch the MX record.** That routes Shane's Microsoft 365
email, and changing it stops his mail arriving.

---

## Step 1 — Tell Render about the domain (5 min)

Do this first. Render needs to know about the domain before it can issue an
SSL certificate.

1. Render → your `mgmt-global` web service → **Settings**
2. Scroll to **Custom Domains** → **Add Custom Domain**
3. Enter `mgmtglobal.com` → Save
4. **Add Custom Domain** again → enter `www.mgmtglobal.com` → Save

Render now shows you the DNS records it wants. It'll be something like:

| Type | Name | Value |
|---|---|---|
| A | @ | `216.24.57.1` |
| CNAME | www | `mgmt-global.onrender.com` |

**Leave this page open.** You need those exact values — don't use the ones
above, they're illustrative.

Both domains will show "Verification pending" or similar. That's expected
until step 3.

---

## Step 2 — Set up Google Search Console (10 min)

Do this now, while you're about to be in the DNS settings anyway.

1. Go to **search.google.com/search-console**
2. Sign in as Shane, or whoever should own it long-term
3. Click **Add Property** → choose **Domain** (the left option, not URL prefix)
4. Enter `mgmtglobal.com`
5. Google gives you a **TXT record** to add. It looks like
   `google-site-verification=abc123...`
6. Copy it. You'll add it in step 3 alongside the other records.

**Why the Domain option:** it covers `www` and non-`www`, `http` and `https`,
all in one property. The URL-prefix option would need four separate
properties.

---

## Step 3 — Change DNS in Wix (10 min)

This is the step that actually switches the site over.

1. Wix → **Settings → Domains**
2. Find `mgmtglobal.com` → the three-dot menu → **Manage DNS Records**
   (may be labelled "Advanced")

Now, carefully:

**Change the A record.** There'll be existing A records pointing at Wix
(`185.230.63.x`). Replace them with the single A record Render gave you.

**Add or change the CNAME for `www`.** Point it at your
`mgmt-global.onrender.com` address.

**Add the TXT record** from Search Console. Name is `@` or blank; value is
the `google-site-verification=...` string.

**Do not touch:**
- The MX record (`mgmtglobal-com.mail.protection.outlook.com`) — Shane's email
- The Resend records you added earlier — the forms depend on them
- Any other TXT records already present

Save.

---

## Step 4 — Wait (30 min to a few hours)

DNS changes spread gradually. Some people will see the new site within
minutes; others keep getting Wix for a while as their ISP's cache expires.

**This is normal.** Nothing is broken.

What happens automatically during the wait:

- Render notices the domain pointing at it and issues an SSL certificate
- Until that finishes, `https://mgmtglobal.com` may show a security warning
- That also resolves itself, usually within minutes of the DNS resolving

Check progress at **dnschecker.org** — enter `mgmtglobal.com`, look at the A
record. When most locations show Render's IP rather than `185.230.63.x`,
you're through.

---

## Step 5 — Verify (10 min)

Once `mgmtglobal.com` loads the new site:

**The basics**
- [ ] Homepage loads with the hero video
- [ ] `https://` works with no security warning
- [ ] `www.mgmtglobal.com` redirects to the bare domain
- [ ] The gold icon appears in the browser tab

**The things that could silently break**
- [ ] Send yourself a message through `/contact` — does it arrive?
- [ ] Send one through `/confidential` — check the subject says only
      "Confidential enquiry"
- [ ] Subscribe through the footer — does it land in Buttondown?
- [ ] `/careers` shows the open roles
- [ ] Click an Apply button — does it reach Recruiterflow?
- [ ] **Send Shane an email from an outside address** — this confirms the MX
      record survived

That last one matters most. Everything else you'd notice; broken email you
might not for days.

---

## Step 6 — Search Console (5 min)

Back in Search Console:

1. Click **Verify**. It should pass now the TXT record has propagated. If
   not, wait a bit longer and retry.
2. Once verified, go to **Sitemaps** in the left menu
3. Enter `sitemap.xml` and submit

That tells Google about all nine pages at once rather than waiting for it to
find them. Indexing still takes days to weeks — Search Console will show
progress under **Pages**.

---

## Step 7 — Tidy up (5 min)

**Delete `/api/health`.** It did its job and there's no reason to leave a
public endpoint reporting which environment variables are set.

Delete `src/app/api/health/route.ts` from the repo and push.

---

## After launch

**Watch for a week.** Render → Logs. You're looking for anything starting
`[RF]` or `Recruiterflow` failing, which would mean the job board stopped.

**The newsletter runs on the 1st.** Shane gets a draft by email. First one is
worth reading closely before sending.

**Tell Shane what he now controls without you:**
- Post a role in Recruiterflow → appears on the site within 15 minutes
- Newsletter draft arrives on the 1st → he edits and sends
- Everything else needs a code change

---

## If something goes wrong

**Site doesn't load after several hours** — check the A record in Wix
actually saved. Wix sometimes silently reverts DNS edits.

**Security warning persists** — Render → Settings → Custom Domains. If it
still says pending, the DNS isn't resolving yet.

**Email stops arriving** — the MX record was changed. Put it back to
`mgmtglobal-com.mail.protection.outlook.com`, priority 10. Fix this first,
before anything else.

**Forms stop working** — check `/api/health` before you delete it. Most
likely an environment variable didn't carry over.
