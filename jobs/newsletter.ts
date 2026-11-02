/* ============================================================================
   Monthly newsletter — an insurance industry digest.

   Runs on the 1st of each month as a Render cron job.

   WHAT IT IS: a summary of what happened in the insurance industry last
   month, tailored to the segments MGMTGlobal works in. Carrier and brokerage
   M&A, senior leadership moves, market conditions, talent and compensation
   trends.

   WHAT IT IS NOT: a firm update. A boutique doesn't place enough people in
   thirty days to fill a newsletter, and nobody subscribes to hear about
   someone else's quarter. The firm's own news appears as a short footer —
   open searches, regions active — not as the substance.

   That framing is why this can be genuinely automated. The content is
   external, factual, and checkable. The model searches the real web, cites
   real sources, and every claim carries a link Shane can verify in a click.
   Contrast with firm commentary, which would have to be invented.

   It still saves as a DRAFT. Not because the content can't be trusted — it's
   sourced — but because Shane's read on what matters is the thing that makes
   it his newsletter rather than a feed.
   ============================================================================ */

import Anthropic from '@anthropic-ai/sdk';
import { getOpenJobs } from '../src/lib/recruiterflow';
import { renderEmail } from './email-template';

const now = new Date();
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const MONTH_NAME = lastMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
const ISSUE_NAME = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

/* ---------------------------------------------------------------------------
   The firm's own footer data. Deliberately small — a mention, not the story.
   --------------------------------------------------------------------------- */

async function firmFooter() {
  try {
    const jobs = await getOpenJobs();
    const regions = [...new Set(jobs.map((j) => j.location).filter(Boolean))];
    return {
      openRoleCount: jobs.length,
      regions,
      titles: jobs.slice(0, 6).map((j) => j.title),
    };
  } catch {
    return { openRoleCount: 0, regions: [], titles: [] };
  }
}

/* ---------------------------------------------------------------------------
   Drafting, with live web search.

   The search tool is what makes this work. Without it the model would be
   writing from training data that's months stale and inventing specifics.
   With it, every claim traces to a source published in the window.
   --------------------------------------------------------------------------- */

const SYSTEM = `You write a monthly insurance industry digest for MGMTGlobal Consulting,
a boutique retained executive search firm working exclusively in insurance since 2000.

READERS: insurance executives, producers, agency principals and hiring leaders across
carriers, wholesale and retail brokerage, captives and programs. They work in this
industry every day. They will notice anything vague, wrong, or obviously padded.

YOUR JOB: tell them what actually happened in their market last month, and what it means
for talent. You are their filter, not their feed.

WHAT TO COVER — search for each, and only include what you actually find:
- M&A among brokerages, agencies and carriers. Who bought whom, roughly what size.
- Senior leadership moves at carriers and major brokerages.
- Market conditions: rate movement, capacity, notable losses, reinsurance.
- Talent and compensation: producer pay, hiring patterns, notable team moves.
- Regulatory or legislative changes with real operational impact.

HARD RULES:
- Every factual claim must come from a source you actually found in search. Cite it
  with a markdown link on the relevant phrase.
- If you cannot find enough for a section, omit the section. A short digest that is
  entirely true beats a long one padded with generalities.
- Never invent a company name, a number, a date, or a quote.
- No "the landscape continues to evolve" filler. Every sentence carries information.
- Do not editorialise about MGMTGlobal or sell its services. The value here is the
  information; the firm's credibility comes from having curated it well.

VOICE: direct and unshowy. Short sentences. Shane has nothing to prove. Write the way a
well-informed colleague would email you something useful — no throat-clearing, no
marketing register.

LENGTH: 450–650 words. These are busy people.

STRUCTURE:
# [A specific headline about the month's biggest story — not "Market Update"]

One or two sentences framing the month.

## Deals
## Moves
## Market
## What it means for hiring
   — two or three sentences. This is the one place your own read is welcome,
   and it should connect the news above to talent implications.

End with the firm footer exactly as supplied in the user message.

Output clean Markdown. No preamble, no sign-off from you, just the digest.`;

async function draft(footer: Awaited<ReturnType<typeof firmFooter>>) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');

  const anthropic = new Anthropic({ apiKey: key });

  const footerBlock = footer.openRoleCount
    ? `---\n\n**MGMTGlobal is currently retained on ${footer.openRoleCount} ${
        footer.openRoleCount === 1 ? 'search' : 'searches'
      }${footer.regions.length ? ` across ${footer.regions.join(', ')}` : ''}.** ` +
      `[See open roles](https://mgmtglobal.com/careers) or ` +
      `[start a confidential conversation](https://mgmtglobal.com/confidential).`
    : `---\n\n[See our open searches](https://mgmtglobal.com/careers) or ` +
      `[start a confidential conversation](https://mgmtglobal.com/confidential).`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 12,
      } as never,
    ],
    messages: [
      {
        role: 'user',
        content: `Write the ${ISSUE_NAME} issue, covering what happened in ${MONTH_NAME}.

Search thoroughly before writing. Use multiple searches — insurance brokerage M&A,
carrier executive appointments, P&C market conditions, producer compensation, and
anything major that broke in ${MONTH_NAME}. Prefer trade press: Insurance Business,
Business Insurance, Insurance Journal, Reinsurance News, Carrier Management, AM Best.

Only write about what you find. If a section is thin, cut it.

End the digest with exactly this footer:

${footerBlock}

Begin your reply with the issue's H1 headline and nothing before it — the
first line must start with "# ". Any sentence before that heading ends up
rendered as a subtitle in the email that goes out.`,
      },
      /* NO ASSISTANT PREFILL.

         This used to end with { role: 'assistant', content: '# ' }, to force
         the reply to begin mid-headline so it could not open with "Here's
         the digest for...". That cost two months of issues:

           - '# ' was rejected outright: 400 "final assistant content cannot
             end with trailing whitespace".
           - with the space removed, the model rejected the technique
             itself: 400 "This model does not support assistant message
             prefill. The conversation must end with a user message."

         So the preamble is stripped after the fact instead (see below),
         which is where the guard belonged anyway: post-processing works on
         any model, and a prefill is a per-model capability that can be
         withdrawn without warning. Do not reintroduce one. */
    ],
  });

  const raw = message.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
    .trim();

  /* Strip any preamble.

     The first line of the digest becomes the email's subject AND its
     masthead, so a stray "Here's the October digest:" would be read as the
     headline — which is exactly what subscribers saw once before. Slice to
     the first real H1 and drop everything above it.

     If the model produced no H1 at all, do NOT let the opening line of prose
     become the subject: give it the fallback title and keep the body whole. */
  const lines = raw.split('\n');
  const h1 = lines.findIndex((l) => /^#\s+\S/.test(l));
  const text =
    h1 >= 0
      ? lines.slice(h1).join('\n').trim()
      : `# The Market Brief — ${MONTH_NAME}\n\n${raw}`;

  const searches = message.content.filter(
    (b) => (b as { type: string }).type === 'server_tool_use'
  ).length;

  return { text, searches };
}

/* ---------------------------------------------------------------------------
   Save as a draft in Buttondown
   --------------------------------------------------------------------------- */

async function saveDraft(subject: string, html: string) {
  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) throw new Error('BUTTONDOWN_API_KEY is not set');

  const res = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject,
      body: html,
      // status: draft — the line that stops it sending itself.
      status: 'draft',
      /* Tells Buttondown the body is finished HTML rather than Markdown to
         be styled with their default template. Without this it wraps the
         markup in its own styling and the branding is lost. */
      email_type: 'premium',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Buttondown ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<{ id: string }>;
}

/* ---------------------------------------------------------------------------
   Notify
   --------------------------------------------------------------------------- */

async function notify(subject: string, url: string, words: number, searches: number) {
  const { sendMail } = await import('../src/lib/mail');
  const to = process.env.NEWSLETTER_EDITOR || process.env.CONFIDENTIAL_TO || '';

  await sendMail({
    to,
    subject: `Newsletter draft ready — ${ISSUE_NAME}`,
    body: [
      `The ${ISSUE_NAME} digest is ready for review. It covers ${MONTH_NAME}.`,
      '',
      `Subject: ${subject}`,
      `Length: about ${words} words`,
      `Built from ${searches} web searches — every claim should carry a source link.`,
      '',
      'Read and send it here:',
      url,
      '',
      'Worth a skim before sending: check the links go where they say, and cut',
      'anything that reads as obvious to your subscribers. Nothing sends until',
      'you press send.',
    ].join('\n'),
  });
}

/* ---------------------------------------------------------------------------
   Run
   --------------------------------------------------------------------------- */

/** Run one step, tagging any error with the step's name. */
async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err && typeof err === 'object') (err as { step?: string }).step = name;
    throw err;
  }
}

async function main() {
  console.log(`[newsletter] drafting ${ISSUE_NAME}, covering ${MONTH_NAME}`);

  await step('preflight (credentials)', async () => preflight());

  const footer = await firmFooter();
  console.log(`[newsletter] firm footer: ${footer.openRoleCount} open roles`);

  const { text, searches } = await step('drafting with the Anthropic API', () => draft(footer));
  const words = text.split(/\s+/).length;
  console.log(`[newsletter] drafted ${words} words from ${searches} searches`);

  if (words < 200) {
    throw new Error(`Draft is only ${words} words — search likely returned nothing useful`);
  }

  // The headline the model wrote becomes the subject line.
  const headline = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const subject = headline || `The Market Brief — ${MONTH_NAME}`;

  /* The H1 moves into the masthead, so the body renderer skips it — see
     email-template.ts. */
  const html = renderEmail({
    headline: subject,
    markdown: text,
    monthCovered: MONTH_NAME,
  });

  const saved = await step('saving the draft to Buttondown', () => saveDraft(subject, html));
  const url = `https://buttondown.com/emails/${saved.id}`;
  console.log(`[newsletter] saved as draft ${saved.id}`);

  await step('emailing the review link', () => notify(subject, url, words, searches));
  console.log('[newsletter] Shane notified. Nothing sent to subscribers.');
}

/* ---------------------------------------------------------------------------
   Failure reporting

   This job went two months without producing a draft and nobody found out.
   It did not fail silently in the sense of swallowing an error — it logged
   one and exited 1 — but nothing TOLD anyone, so the only evidence was an
   absence, which is the hardest thing to notice. A monthly job that reports
   only to a log nobody opens is a job that can stop working indefinitely.

   So: every failure now sends an email. Resend is a separate dependency from
   Anthropic and Buttondown, so the two likeliest failures (model call,
   Buttondown save) can still be reported. If Resend itself is the problem the
   email cannot go out either — hence the loud log as a last resort.
   --------------------------------------------------------------------------- */
async function reportFailure(step: string, err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  console.error(`[newsletter] FAILED at ${step}: ${detail}`);

  try {
    const { sendMail } = await import('../src/lib/mail');
    const to = process.env.NEWSLETTER_EDITOR || process.env.CONFIDENTIAL_TO || '';
    if (!to) {
      console.error('[newsletter] no NEWSLETTER_EDITOR set — cannot report the failure by email');
      return;
    }
    await sendMail({
      to,
      subject: `Newsletter draft FAILED — ${ISSUE_NAME}`,
      body: [
        `The ${ISSUE_NAME} digest did not get built, so there is nothing to review.`,
        '',
        `Failed at: ${step}`,
        `Error:     ${detail}`,
        '',
        'Nothing was sent to subscribers, and no partial draft was saved.',
        '',
        'The full log is in Render -> mgmtglobal-newsletter -> Logs. Most likely:',
        '  - "credit balance is too low" -> top up at console.anthropic.com',
        '  - "invalid x-api-key" -> the Anthropic key was rotated or revoked',
        '  - a Buttondown 401 -> that key was rotated',
        '  - "model not found" -> the model id needs updating in jobs/newsletter.ts',
      ].join('\n'),
    });
    console.error('[newsletter] failure reported by email');
  } catch (mailErr) {
    console.error(
      '[newsletter] COULD NOT REPORT THE FAILURE BY EMAIL:',
      mailErr instanceof Error ? mailErr.message : mailErr,
    );
  }
}

/* Check every credential up front and name ALL the missing ones at once.

   Each step used to throw on its own missing key, so a run with two unset
   variables reported one, got fixed, then failed again on the next. */
function preflight() {
  const required = ['ANTHROPIC_API_KEY', 'BUTTONDOWN_API_KEY', 'RESEND_API_KEY'];
  const missing = required.filter((k) => !(process.env[k] || '').trim());
  if (!(process.env.NEWSLETTER_EDITOR || process.env.CONFIDENTIAL_TO || '').trim()) {
    missing.push('NEWSLETTER_EDITOR (or CONFIDENTIAL_TO)');
  }
  if (missing.length) {
    throw new Error(`not set in the Render environment: ${missing.join(', ')}`);
  }
  console.log('[newsletter] preflight ok — all credentials present');
}

main()
  .catch(async (err) => {
    /* `step` is attached by main() so the email can say where it broke
       rather than just that it broke. */
    const step = (err as { step?: string })?.step ?? 'an unknown step';
    await reportFailure(step, err);
    process.exit(1);
  });
