# Monthly Newsletter — Setup

About twenty minutes, once. After that it runs itself every month.

**What it does:** on the 1st of each month it searches the insurance trade
press for what happened last month, writes a digest with real source links,
saves it to Buttondown as a **draft**, and emails Shane a link. He skims it
and presses send.

**What it covers:** brokerage and carrier M&A, senior leadership moves,
market conditions, talent and compensation. Tailored to the segments the firm
works in.

**What it is not:** a firm update. A boutique doesn't place enough people in
thirty days to fill a newsletter, and nobody subscribes to hear about someone
else's quarter. The firm's own news is a two-line footer — open searches and
regions — not the substance.

---

## Before you start

The signup form in the site footer posts to `/api/subscribe`, which adds
people to Buttondown. It needs `BUTTONDOWN_API_KEY` set on the **web
service** — separately from the cron job, which is its own service.

So the Buttondown key goes in two places. Step 4 covers the cron job; add it
to the web service too.

---

## Step 1 — Buttondown account

1. Go to **buttondown.com** and sign up. Free up to a few hundred
   subscribers, then about $9/month.
2. Once in, go to **Settings → API**.
3. Copy the API key. Keep the tab open, you'll need it in step 4.

---

## Step 2 — Anthropic API key

This is what writes the draft. Separate from any Claude subscription.

1. Go to **console.anthropic.com** and sign up.
2. **Settings → API Keys → Create Key.**
3. Copy it — it starts with `sk-ant-`. It's shown once.
4. Add a small amount of credit under **Billing**. Twelve issues a year costs
   a couple of dollars; $5 will last well over a year.

---

## Step 3 — Upload the code

Same as always: unzip, select everything inside, drag into the repo root,
commit. This adds `jobs/newsletter.ts` and the cron job definition.

Wait for Render to finish deploying before the next step.

---

## Step 4 — Create the cron job in Render

In Render, click **New → Cron Job**.

| Field | Value |
|---|---|
| Repository | `mgmt-global` |
| Name | `mgmtglobal-newsletter` |
| Runtime | Node |
| Build Command | `npm install` |
| Command | `npm run newsletter` |
| Schedule | `0 8 1 * *` |
| Instance Type | Starter |

That schedule reads: minute 0, hour 8, day 1, every month, any weekday — so
08:00 UTC on the 1st. That's 2am or 3am Texas time depending on daylight
saving, which is fine; the draft just needs to exist before he looks.

**Cost:** you're billed per second of runtime. This runs about twenty seconds
a month.

---

## Step 5 — Environment variables

In the cron job's **Environment** tab, add all six. Yes, some duplicate the
web service — a cron job is a separate service and doesn't inherit them.

```
ANTHROPIC_API_KEY       from step 2, starts with sk-ant-
BUTTONDOWN_API_KEY      from step 1
RECRUITERFLOW_API_KEY   same value as the web service
RESEND_API_KEY          same value as the web service
MAIL_FROM               MGMTGlobal Site <noreply@mgmtglobal.com>
NEWSLETTER_EDITOR       Shane's email — where the "draft ready" note goes
```

**Then add one to the web service as well.** Go to your `mgmt-global` web
service → Environment → add:

```
BUTTONDOWN_API_KEY      same value
```

That's what makes the footer signup form work. Without it the form returns an
error. Check `/api/health` afterwards — `BUTTONDOWN_API_KEY` should show
`present: true`.

---

## Step 6 — Test it now

Don't wait a month to find out it's broken.

In the cron job, click **Trigger Run**. Then watch the **Logs** tab. A good
run looks like:

```
[newsletter] drafting October 2026
[newsletter] 3 open roles gathered
[newsletter] drafted, 380 words
[newsletter] saved as draft abc123
[newsletter] Shane notified. Nothing sent to subscribers.
```

Then check two things: Shane got the email, and the draft is sitting in
Buttondown.

### Test the signup form too

Go to any page on the site, scroll to the footer, enter your own email and
press Join. You should see "Thanks — you're on the list." Then check
Buttondown — you should be there, tagged `website`.

Submit again and it should say "You're already on the list." rather than
erroring.

### If it fails

The log names the problem directly.

| Log says | Means |
|---|---|
| `ANTHROPIC_API_KEY is not set` | Variable missing or misnamed in the cron job |
| `Buttondown 401` | Wrong Buttondown key |
| `Buttondown 403` | Free plan may not allow API access — check their billing page |
| `0 open roles gathered` | Not an error. Only affects the footer line |
| `Draft is only N words` | Search returned too little — check the Anthropic account has credit |

---

## What Shane does each month

He gets an email saying the draft is ready, with a link. It'll say how many
searches went into it.

Worth thirty seconds on two things: do the source links go where they claim,
and is anything in there so obvious his subscribers will roll their eyes? Cut
that, send the rest.

Five minutes instead of two hours.

---

## Why it searches instead of guessing

The job uses live web search on every run. Without it, the model would be
writing from training data that's months out of date and inventing specifics
to fill the gaps — exactly the sort of thing an insurance executive spots in
one line.

With it, every claim traces to something published in the window, and the
digest carries source links. Shane can verify anything in a click, and so can
a reader.

This is why the digest format works where a firm update wouldn't. External
news is factual and checkable. Commentary about the firm's own month would
have to be manufactured.

## Why it still drafts instead of sending

Not because the content can't be trusted — it's sourced. Because Shane's read
on *what matters* is what makes it his newsletter rather than a feed. Cutting
the two items his subscribers already know about, and keeping the one they
don't, is thirty seconds of work that changes how the whole thing lands.

It also means a bad search result can't reach several hundred industry
inboxes unreviewed.

---

## Changing what it writes

The instructions live in `jobs/newsletter.ts`, in the `SYSTEM` constant. It's
plain English — edit it like a brief.

Current rules: 450–650 words, every claim cited with a link, omit any section
where the search found nothing rather than padding it, no marketing register,
and don't sell MGMTGlobal's services — the credibility comes from having
curated the information well.

The sections it searches for are listed there too. If Shane wants more on
captives, or less on reinsurance, that's the list to change.

To change the schedule, edit it in Render or in `render.yaml`.
