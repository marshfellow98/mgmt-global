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

${footerBlock}`,
      },
      /* Prefilling the assistant turn with "# " forces the response to begin
         mid-headline. The model physically cannot open with "Here's the
         digest for..." because it's already inside an H1 — which is what
         was leaking through as a subtitle in the sent email. */
      { role: 'assistant', content: '# ' },
    ],
  });

  const raw = message.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
    .trim();

  /* The prefill means the response continues from "# ", so put it back.
     Then drop anything before the first heading as a safety net — if a
     preamble ever slips past the prefill, it should never reach a
     subscriber. */
  let text = raw.startsWith('#') ? raw : `# ${raw}`;
  const firstHeading = text.indexOf('# ');
  if (firstHeading > 0) text = text.slice(firstHeading);

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

async function main() {
  console.log(`[newsletter] drafting ${ISSUE_NAME}, covering ${MONTH_NAME}`);

  const footer = await firmFooter();
  console.log(`[newsletter] firm footer: ${footer.openRoleCount} open roles`);

  const { text, searches } = await draft(footer);
  const words = text.split(/\s+/).length;
  console.log(`[newsletter] drafted ${words} words from ${searches} searches`);

  if (words < 200) {
    throw new Error(`Draft is only ${words} words — search likely returned nothing useful`);
  }

  // The headline the model wrote becomes the subject line.
  const headline = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const subject = headline || `Insurance market digest — ${MONTH_NAME}`;

  /* The H1 moves into the masthead, so the body renderer skips it — see
     email-template.ts. */
  const html = renderEmail({
    headline: subject,
    markdown: text,
    monthCovered: MONTH_NAME,
  });

  const saved = await saveDraft(subject, html);
  const url = `https://buttondown.com/emails/${saved.id}`;
  console.log(`[newsletter] saved as draft ${saved.id}`);

  await notify(subject, url, words, searches);
  console.log('[newsletter] Shane notified. Nothing sent to subscribers.');
}

main().catch((err) => {
  console.error('[newsletter] FAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
