/* ============================================================================
   Email template.

   Turns the digest's Markdown into a branded HTML email.

   Email HTML is not web HTML. Constraints that shaped this:

   - No web fonts. Outlook, Gmail's app and most desktop clients ignore
     @font-face entirely. So: Georgia for display (a serif on every machine
     since the nineties) and a system sans stack for body. Not Source Serif
     and Schibsted Grotesk, but the same serif/sans pairing and the same
     proportions, which is what actually reads as the brand.

   - No flexbox, no grid, no external stylesheet. Tables and inline styles,
     because Outlook renders through Word's engine.

   - Light body, dark header. A fully dark email is a deliverability risk —
     some clients invert it, others render it badly — and this gets read on
     phones in bright rooms. The dark masthead carries the brand; the body
     stays readable.

   - Max 600px. The long-standing safe width for email.

   The Markdown converter below handles only what the digest actually
   produces: headings, paragraphs, links, bold, lists, rules. A general
   Markdown library would be a dependency for no benefit.
   ============================================================================ */

const GOLD = '#E1A13F';
const INK = '#05070A';
const BODY_TEXT = '#2A3340';
const MUTED = '#6B7681';
const RULE = '#E2DED6';
const PAPER = '#FBFAF7';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Inline markdown: links, bold, italic, code. */
function inline(s: string) {
  return escapeHtml(s)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `<a href="$2" style="color:${GOLD};text-decoration:underline;">$1</a>`
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:600;">$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

/** The subset of Markdown the digest actually uses. */
function markdownToHtml(md: string): string {
  const out: string[] = [];
  let inList = false;
  let para: string[] = [];

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  /* Markdown wraps a paragraph across several source lines. Treating each
     line as its own <p> broke every wrapped sentence into fragments in the
     sent email — flush the buffer at a blank line or a block element
     instead. */
  const flushPara = () => {
    if (!para.length) return;
    out.push(
      `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;` +
      `line-height:1.62;color:${BODY_TEXT};">${inline(para.join(' '))}</p>`
    );
    para = [];
  };

  for (const rawLine of md.split('\n')) {
    const line = rawLine.trim();

    if (!line) { flushPara(); closeList(); continue; }

    if (line === '---' || line === '***') {
      flushPara();
      closeList();
      out.push(
        `<hr style="border:0;border-top:1px solid ${RULE};margin:32px 0;">`
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushPara();
      closeList();
      out.push(
        `<h2 style="margin:36px 0 14px;font-family:${SERIF};font-size:20px;` +
        `line-height:1.25;font-weight:600;color:${INK};">${inline(line.slice(3))}</h2>`
      );
      continue;
    }

    // The H1 is rendered in the masthead instead, so skip it in the body.
    if (line.startsWith('# ')) { flushPara(); closeList(); continue; }

    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!inList) {
        out.push('<ul style="margin:0 0 16px;padding-left:20px;">');
        inList = true;
      }
      out.push(
        `<li style="margin:0 0 8px;font-family:${SANS};font-size:15px;` +
        `line-height:1.62;color:${BODY_TEXT};">${inline(line.replace(/^[-*]\s+/, ''))}</li>`
      );
      continue;
    }

    closeList();
    para.push(line);
  }

  flushPara();
  closeList();
  return out.join('\n');
}

export function renderEmail(opts: {
  headline: string;
  markdown: string;
  monthCovered: string;
  siteUrl?: string;
}): string {
  const site = opts.siteUrl ?? 'https://mgmtglobal.com';
  const body = markdownToHtml(opts.markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.headline)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
  <!-- Preview text: what shows beside the subject in an inbox list. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    The insurance market in ${escapeHtml(opts.monthCovered)} — deals, moves, and what it means for hiring.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

          <!-- Masthead -->
          <tr>
            <td style="background:${INK};padding:34px 36px 30px;">
              <div style="font-family:${SERIF};font-size:21px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">
                MGMT
              </div>
              <div style="font-family:${SANS};font-size:8px;letter-spacing:3.2px;text-transform:uppercase;color:#9AA4AF;margin-top:3px;">
                Global Consulting
              </div>

              <div style="height:28px;"></div>

              <div style="font-family:${SANS};font-size:9px;letter-spacing:2.4px;text-transform:uppercase;color:${GOLD};font-weight:600;">
                ${escapeHtml(opts.monthCovered)} &middot; Market digest
              </div>
              <h1 style="margin:12px 0 0;font-family:${SERIF};font-size:27px;line-height:1.2;font-weight:600;color:#ffffff;">
                ${escapeHtml(opts.headline)}
              </h1>
            </td>
          </tr>

          <!-- Gold rule under the masthead -->
          <tr><td style="background:${GOLD};height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${PAPER};padding:28px 36px 36px;border-top:1px solid ${RULE};">
              <p style="margin:0 0 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">
                <a href="${site}" style="color:${MUTED};text-decoration:none;">mgmtglobal.com</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:info@mgmtglobal.com" style="color:${MUTED};text-decoration:none;">info@mgmtglobal.com</a>
                &nbsp;&middot;&nbsp; 469-458-6469
              </p>
              <p style="margin:0 0 14px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">
                Boutique retained executive search for the insurance industry. Carrollton, Texas.
              </p>
              <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.6;color:#9AA4AF;">
                You're receiving this because you subscribed at mgmtglobal.com.
                <a href="{{ unsubscribe_url }}" style="color:#9AA4AF;text-decoration:underline;">Unsubscribe</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
