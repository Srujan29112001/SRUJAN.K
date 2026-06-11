/**
 * =============================================================================
 * RESUME HTML TEMPLATE
 * =============================================================================
 * Print-ready A4 single page. Ported 1:1 from the approved master design
 * (Space Grotesk + Inter + JetBrains Mono, cyan-teal accent, bordered link
 * buttons) — the same layout used for real applications.
 *
 * The tailored sections (role line, summary, skills, key projects) come from
 * the pipeline; Experience and Education are the owner's staples and render
 * verbatim from preferences.
 *
 * PDF strategy (Vercel-safe, no server-side browser): the page sets
 * document.title to the target filename and auto-opens the print dialog —
 * "Save as PDF" produces a crisp, text-based (ATS-parseable) PDF named
 * correctly by default. A no-print toolbar explains this to the visitor.
 * =============================================================================
 */

import type { ResumePreferences, TailoredResume } from './resume-agents/types';

/** Escape every interpolated string — JD-derived text must never inject HTML. */
function esc(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Allow only http(s) URLs through to href attributes. */
function safeUrl(url: string): string {
    return /^https?:\/\//i.test(url) ? esc(url) : '#';
}

export interface RenderOptions {
    fileName: string;
    autoPrint?: boolean;
}

export function renderResumeHTML(
    prefs: ResumePreferences,
    tailored: TailoredResume,
    opts: RenderOptions,
): string {
    const { header, experience, education } = prefs;

    const contactLinks = header.links
        .map(l => `<a class="lnk" href="${safeUrl(l.url)}">${esc(l.label)} <span class="arw">↗</span></a>`)
        .join('\n        ');

    const skillRows = tailored.skills
        .map(row => `
      <div class="skill-row">
        <div class="skill-cat">${esc(row.category)}</div>
        <div class="skill-tags">
          ${row.items.map(i => `<span class="tag${i.key ? ' key' : ''}">${esc(i.name)}</span>`).join('')}
        </div>
      </div>`)
        .join('');

    const experienceEntries = experience
        .map(e => `
    <div class="entry">
      <div class="entry-top">
        <div>
          <div class="entry-title">${esc(e.title)}</div>
          <div class="entry-meta"><span class="org">${esc(e.org)}</span>${e.location ? ` · ${esc(e.location)}` : ''}</div>
        </div>
        <div class="entry-date">${esc(e.dates)}</div>
      </div>
      <ul class="bullets">
        ${e.bullets.map(b => `<li>${esc(b)}</li>`).join('\n        ')}
      </ul>
    </div>`)
        .join('');

    const projectEntries = tailored.projects
        .map(p => `
    <div class="entry">
      <div class="proj-head">
        <span class="entry-title">${esc(p.title)}</span>
        <span class="proj-links">
          ${p.links.map(l => `<a class="plnk" href="${safeUrl(l.url)}">${esc(l.label)} <span class="arw">↗</span></a>`).join('')}
        </span>
      </div>
      <ul class="bullets">
        ${p.bullets.map(b => `<li>${esc(b)}</li>`).join('\n        ')}
      </ul>
    </div>`)
        .join('');

    const educationEntries = education
        .map(e => `
      <div class="entry">
        <div class="entry-top">
          <div>
            <div class="entry-title">${esc(e.title)}</div>
            <div class="entry-meta"><span class="org">${esc(e.org)}</span>${e.location ? ` · ${esc(e.location)}` : ''}</div>
            ${e.note ? `<div class="course">${esc(e.note)}</div>` : ''}
          </div>
          <div class="entry-date">${esc(e.dates)}</div>
        </div>
      </div>`)
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(opts.fileName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#15212E;
    --body:#323D4A;
    --muted:#6B7888;
    --accent:#0E7490;
    --accent-ink:#0A5364;
    --accent-soft:#ECF6F8;
    --line:#E4E9EF;
    --page:#FFFFFF;
  }
  *{ box-sizing:border-box; margin:0; padding:0; }
  @page{ size:A4; margin:0; }
  html,body{ background:#f3f4f6; }
  @media print{ html,body{ background:#fff; } .toolbar{ display:none !important; } }
  body{
    font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    color:var(--body);
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
  }
  .toolbar{
    position:sticky; top:0; z-index:50;
    background:#0B1220; color:#E2E8F0;
    padding:10px 16px;
    display:flex; align-items:center; justify-content:center; gap:14px;
    font-size:13px;
  }
  .toolbar button{
    background:#0E7490; color:#fff; border:none; border-radius:6px;
    padding:7px 16px; font-size:13px; font-weight:600; cursor:pointer;
  }
  .toolbar button:hover{ background:#0A5364; }
  .page{
    width:210mm;
    min-height:290mm;
    background:var(--page);
    margin:0 auto;
    padding:9mm 12.5mm 6.5mm;
    position:relative;
  }

  /* ===== MASTHEAD ===== */
  .masthead{ display:flex; justify-content:space-between; align-items:flex-end; gap:8mm; }
  .name{
    font-family:"Space Grotesk",sans-serif; font-weight:700; font-size:24pt;
    letter-spacing:.14em; color:var(--ink); line-height:1;
  }
  .role{
    font-family:"Space Grotesk",sans-serif; font-weight:500; font-size:10.3pt;
    color:var(--accent-ink); letter-spacing:.01em; margin-top:2mm;
  }
  .role .dot{ color:var(--muted); margin:0 5px; font-weight:400; }
  .utility{ text-align:right; flex-shrink:0; }
  .contact{
    display:flex; flex-direction:column; gap:1.2mm; align-items:flex-end;
    font-size:8.6pt; color:var(--body);
  }
  .contact span{ display:inline-flex; align-items:center; gap:5px; }
  .contact svg{ width:11px; height:11px; flex-shrink:0; color:var(--muted); }
  .contact a{ color:var(--body); text-decoration:none; }
  .links{ display:flex; gap:5px; justify-content:flex-end; margin-top:2.6mm; }
  .lnk{
    display:inline-flex; align-items:center; gap:3px;
    border:0.8pt solid var(--accent); color:var(--accent-ink);
    border-radius:4pt; padding:1.6pt 6.5pt;
    font-size:8.2pt; font-weight:600; text-decoration:none; letter-spacing:.01em;
    background:#fff;
  }
  .lnk .arw{ font-size:7.4pt; opacity:.8; }
  .rule-accent{
    height:2.2pt;
    background:linear-gradient(90deg,var(--accent) 0%,var(--accent) 22%,var(--line) 22%,var(--line) 100%);
    border:none; border-radius:2pt;
    margin:2.2mm 0 0.6mm;
  }

  /* ===== SECTIONS ===== */
  section{ margin-top:1.8mm; }
  .sec-head{ display:flex; align-items:center; gap:2.5mm; margin-bottom:0.9mm; }
  .tick{ width:5pt; height:5pt; background:var(--accent); border-radius:1pt; flex-shrink:0; }
  .sec-head h2{
    font-family:"Space Grotesk",sans-serif; font-weight:600; font-size:10pt;
    text-transform:uppercase; letter-spacing:.16em; color:var(--ink); white-space:nowrap;
  }
  .sec-rule{ flex:1; height:0.7pt; background:var(--line); }

  /* ===== SUMMARY ===== */
  .summary{ font-size:9.2pt; line-height:1.33; color:var(--body); }
  .summary strong{ color:var(--ink); font-weight:600; }

  /* ===== SKILLS ===== */
  .skill-row{ display:flex; align-items:baseline; gap:4mm; padding:0.45mm 0; }
  .skill-row + .skill-row{ border-top:0.6pt solid var(--line); }
  .skill-cat{
    width:36mm; flex-shrink:0;
    font-family:"Space Grotesk",sans-serif; font-weight:600; font-size:8.5pt;
    color:var(--ink); letter-spacing:.005em; line-height:1.3;
  }
  .skill-tags{ display:flex; flex-wrap:wrap; gap:4px; }
  .tag{
    border:0.6pt solid var(--line); border-radius:3pt; padding:1pt 5pt;
    font-size:8pt; color:var(--body); background:#fff; white-space:nowrap;
  }
  .tag.key{ border-color:var(--accent); color:var(--accent-ink); background:var(--accent-soft); font-weight:600; }

  /* ===== ENTRIES ===== */
  .entry{ margin-bottom:1.1mm; }
  .entry:last-child{ margin-bottom:0; }
  .entry-top{ display:flex; justify-content:space-between; align-items:baseline; gap:4mm; }
  .entry-title{ font-size:9.6pt; font-weight:700; color:var(--ink); }
  .entry-meta{ font-size:8.7pt; color:var(--body); margin-top:.3mm; }
  .entry-meta .org{ font-weight:600; }
  .entry-date{
    font-family:"JetBrains Mono",monospace; font-size:8pt; font-weight:500;
    color:var(--muted); white-space:nowrap; flex-shrink:0; letter-spacing:-.01em;
  }
  ul.bullets{ list-style:none; margin:1mm 0 0; }
  ul.bullets li{
    position:relative; padding-left:4.2mm;
    font-size:8.9pt; line-height:1.27; color:var(--body); margin-bottom:.5mm;
  }
  ul.bullets li::before{
    content:""; position:absolute; left:0; top:3.1pt;
    width:4pt; height:1.4pt; background:var(--accent); border-radius:1pt;
  }
  ul.bullets li strong{ color:var(--ink); font-weight:600; }

  /* project link buttons */
  .proj-head{ display:flex; align-items:baseline; gap:3mm; flex-wrap:wrap; }
  .proj-links{ display:inline-flex; gap:4px; }
  .plnk{
    display:inline-flex; align-items:center; gap:2.5px;
    border:0.7pt solid var(--line); color:var(--accent-ink);
    border-radius:3pt; padding:.6pt 4.5pt;
    font-size:7.5pt; font-weight:600; text-decoration:none; letter-spacing:.01em;
    background:#fff;
  }
  .plnk .arw{ font-size:6.8pt; opacity:.75; }

  /* education */
  .edu-grid{ display:flex; flex-direction:column; gap:1.2mm; }
  .course{ font-size:8.3pt; color:var(--muted); margin-top:.6mm; }
  .course b{ color:var(--body); font-weight:600; }
</style>
</head>
<body>
<div class="toolbar">
  <span>Save this as a PDF: press <b>Ctrl+P</b> (or <b>⌘P</b>) and choose <b>"Save as PDF"</b> — the filename is pre-set.</span>
  <button onclick="window.print()">Save as PDF</button>
</div>
<div class="page">

  <!-- ============ MASTHEAD ============ -->
  <header class="masthead">
    <div class="id">
      <h1 class="name">${esc(header.name)}</h1>
      <p class="role">${esc(tailored.roleLine)}</p>
    </div>
    <div class="utility">
      <div class="contact">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 6 9-6"/></svg>
          <a href="mailto:${esc(header.email)}">${esc(header.email)}</a>
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5c0 8.5 6.5 15 15 15a2 2 0 0 0 2-2v-2.5a1 1 0 0 0-.8-1l-3.3-.7a1 1 0 0 0-1 .4l-.9 1.2A12 12 0 0 1 9 11l1.2-.9a1 1 0 0 0 .4-1l-.7-3.3a1 1 0 0 0-1-.8H6a2 2 0 0 0-2 2Z"/></svg>
          <a href="tel:${esc(header.phone.replace(/\s+/g, ''))}">${esc(header.phone)}</a>
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          ${esc(header.location)}
        </span>
      </div>
      <div class="links">
        ${contactLinks}
      </div>
    </div>
  </header>
  <hr class="rule-accent">

  <!-- ============ SUMMARY ============ -->
  <section>
    <div class="sec-head"><span class="tick"></span><h2>Summary</h2><span class="sec-rule"></span></div>
    <p class="summary">${esc(tailored.summary)}</p>
  </section>

  <!-- ============ TECHNICAL SKILLS ============ -->
  <section>
    <div class="sec-head"><span class="tick"></span><h2>Technical Skills</h2><span class="sec-rule"></span></div>
    <div class="skills">${skillRows}
    </div>
  </section>

  <!-- ============ EXPERIENCE (staples) ============ -->
  <section>
    <div class="sec-head"><span class="tick"></span><h2>Professional Experience</h2><span class="sec-rule"></span></div>
    ${experienceEntries}
  </section>

  <!-- ============ KEY PROJECTS (tailored) ============ -->
  <section>
    <div class="sec-head"><span class="tick"></span><h2>Key Projects</h2><span class="sec-rule"></span></div>
    ${projectEntries}
  </section>

  <!-- ============ EDUCATION (staples) ============ -->
  <section>
    <div class="sec-head"><span class="tick"></span><h2>Education</h2><span class="sec-rule"></span></div>
    <div class="edu-grid">${educationEntries}
    </div>
  </section>

</div>
${opts.autoPrint ? `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},500);});</script>` : ''}
</body>
</html>`;
}
