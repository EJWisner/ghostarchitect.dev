// Ghost Architect™ LinkedIn Promo Card Generator — v7.2.2 Campaign
// June 12–25 2026 | 56 cards | 4 posts/day
// Usage: node generate-promo.mjs
// Deps:  npm install sharp (uses same sharp version as last campaign)

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const SVG_DIR = path.join(__dirname, 'svg-promo');
const OUT_DIR = path.join(__dirname, 'assets', 'promo');
fs.mkdirSync(SVG_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── CARD BUILDER ────────────────────────────────────────────────────────────
// badge: 'FREE' | 'PRO' | 'v7.2.2' | 'TEAM'
// subtitle: shown as  // subtitle  in cyan mono
// headline: array of lines (big white bold)
// body: single body copy string
function buildSVG({ badge, subtitle, headline, body }) {
  const badgeColor = badge === 'FREE' ? '#1e3a5f' : badge === 'PRO' ? '#1a3a2a' : badge === 'TEAM' ? '#3a1a3a' : '#1e2a3a';
  const dotColor   = badge === 'FREE' ? '#4fc3f7' : badge === 'PRO' ? '#4caf82' : badge === 'TEAM' ? '#b07adb' : '#4fc3f7';

  const headlineLines = headline.map((line, i) =>
    `<tspan x="90" dy="${i === 0 ? 0 : 88}">${escXML(line)}</tspan>`
  ).join('');

  // body wrapping — manual at ~42 chars
  const bodyWrapped = wrapText(body, 42);
  const bodyLines = bodyWrapped.map((line, i) =>
    `<tspan x="90" dy="${i === 0 ? 0 : 40}">${escXML(line)}</tspan>`
  ).join('');

  const headlineY = 340;
  const bodyY = headlineY + (headline.length * 88) + 50;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <radialGradient id="bg" cx="85%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#0d1f2d"/>
      <stop offset="100%" stop-color="#0a0f14"/>
    </radialGradient>
  </defs>

  <!-- background -->
  <rect width="1200" height="1200" fill="url(#bg)"/>

  <!-- card border -->
  <rect x="36" y="36" width="1128" height="1128" rx="32" ry="32"
    fill="none" stroke="#ffffff14" stroke-width="1.5"/>

  <!-- GA wordmark -->
  <text x="90" y="140" font-family="Arial Black, Arial, sans-serif"
    font-size="38" font-weight="900" fill="#ffffff" letter-spacing="1">GA</text>
  <text x="148" y="140" font-family="Arial, sans-serif"
    font-size="30" font-weight="700" fill="#ffffff">Ghost Architect</text>
  <text x="524" y="126" font-family="Arial, sans-serif"
    font-size="18" font-weight="400" fill="#ffffff">™</text>

  <!-- badge top-right -->
  <rect x="960" y="100" width="168" height="52" rx="26" ry="26" fill="${badgeColor}"/>
  <circle cx="995" cy="126" r="8" fill="${dotColor}"/>
  <text x="1012" y="132" font-family="Arial, sans-serif" font-size="22"
    font-weight="700" fill="#ffffff" letter-spacing="1">${escXML(badge)}</text>

  <!-- subtitle -->
  <text x="90" y="242" font-family="Courier New, monospace" font-size="26"
    fill="#4fc3f7" letter-spacing="1">// ${escXML(subtitle)}</text>

  <!-- headline -->
  <text x="90" y="${headlineY}" font-family="Arial Black, Arial, sans-serif"
    font-size="82" font-weight="900" fill="#ffffff" letter-spacing="-1"
    xml:space="preserve">${headlineLines}</text>

  <!-- body copy -->
  <text x="90" y="${bodyY}" font-family="Arial, sans-serif"
    font-size="34" font-weight="400" fill="#9aa5b4" line-height="1.5">${bodyLines}</text>

  <!-- terminal bar background -->
  <rect x="68" y="988" width="1064" height="140" rx="16" ry="16" fill="#0d1117"/>
  <rect x="68" y="988" width="1064" height="140" rx="16" ry="16"
    fill="none" stroke="#ffffff18" stroke-width="1"/>

  <!-- traffic lights -->
  <circle cx="116" cy="1042" r="13" fill="#ff5f57"/>
  <circle cx="158" cy="1042" r="13" fill="#febc2e"/>
  <circle cx="200" cy="1042" r="13" fill="#28c840"/>

  <!-- npm command -->
  <text x="116" y="1096" font-family="Courier New, monospace" font-size="30" fill="#4fc3f7">$</text>
  <text x="148" y="1096" font-family="Courier New, monospace" font-size="30" fill="#e2e8f0">
    npm install -g ghost-architect-open</text>

  <!-- footer -->
  <text x="90" y="1172" font-family="Courier New, monospace" font-size="22"
    fill="#4a5568">ghostarchitect.dev</text>
  <text x="670" y="1172" font-family="Arial, sans-serif" font-size="22"
    fill="#4a5568">Any codebase. Any language. Any platform.</text>
</svg>`;
}

function escXML(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function wrapText(text, maxLen) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLen) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

// ─── POST DATA — 56 cards ─────────────────────────────────────────────────────
// slots: 8am | 1130am | 2pm | 530pm
// days map to calendar dates starting Jun 12 2026

const POSTS = [
// ── DAY 1 — Thu Jun 12 ──────────────────────────────────────────────────────
{ file:'day01-8am',    badge:'FREE',   subtitle:'pre-engagement triage',
  headline:['Your Magento codebase','has a story.'],
  body:'Most teams don\'t know what it\'s saying. Ghost Architect™ reads it in minutes.' },

{ file:'day01-1130am', badge:'FREE',   subtitle:'blast radius',
  headline:['3,000 files.','147 conflict zones.','14 hotspots.'],
  body:'Ghost Architect™ found them before you touched a line of code.' },

{ file:'day01-2pm',    badge:'PRO',    subtitle:'fix-forecast',
  headline:['Fix Forecast™','says: know before','you scope.'],
  body:'H1 fix: 4 hours. H5 fix: project risk. Not after the SOW. Before.' },

{ file:'day01-530pm',  badge:'FREE',   subtitle:'try it tonight',
  headline:['The question your','client can\'t answer.'],
  body:'Ghost Architect™ can. npm install -g ghost-architect-open' },

// ── DAY 2 — Fri Jun 13 ──────────────────────────────────────────────────────
{ file:'day02-8am',    badge:'PRO',    subtitle:'fix-forecast',
  headline:['Scope creep starts','in the estimate.'],
  body:'Ghost Architect™ Fix Forecast™ ends guessing before the SOW is signed.' },

{ file:'day02-1130am', badge:'PRO',    subtitle:'risk ladder',
  headline:['H1. H2. H3.','H4. H5.'],
  body:'That\'s your risk ladder. Ghost Architect™ shows you every rung before you climb.' },

{ file:'day02-2pm',    badge:'FREE',   subtitle:'eol countdown',
  headline:['August 11, 2026.','Adobe Commerce','2.4.6 goes EOL.'],
  body:'Ghost Architect™ tells you how far your client has to go. Today.' },

{ file:'day02-530pm',  badge:'FREE',   subtitle:'free scan',
  headline:['Free scan.','Real data.','No demo call.'],
  body:'Just: npm install -g ghost-architect-open — and the truth about your codebase.' },

// ── DAY 3 — Mon Jun 16 ──────────────────────────────────────────────────────
{ file:'day03-8am',    badge:'FREE',   subtitle:'question mode',
  headline:['One question.','One answer.','Right now.'],
  body:'Ghost Architect™ Question Mode. Open tier. Free. No full scan. No wait.' },

{ file:'day03-1130am', badge:'FREE',   subtitle:'question mode',
  headline:['"Is the checkout','safe to touch?"'],
  body:'Ghost Architect™ answers that. And the three questions after it. Instantly.' },

{ file:'day03-2pm',    badge:'PRO',    subtitle:'multi-mode',
  headline:['POI. Blast.','Conflict.','One run.'],
  body:'Three scans. Zero surprises. Ghost Architect™ pre-engagement triage.' },

{ file:'day03-530pm',  badge:'FREE',   subtitle:'different category',
  headline:['Other tools','review PRs.'],
  body:'Ghost Architect™ works before you write one. Any codebase. Any language.' },

// ── DAY 4 — Tue Jun 17 ──────────────────────────────────────────────────────
{ file:'day04-8am',    badge:'FREE',   subtitle:'eol urgency',
  headline:['61 days to','Adobe Commerce','2.4.6 EOL.'],
  body:'How complex is your client\'s upgrade? Ghost Architect™ tells you this afternoon.' },

{ file:'day04-1130am', badge:'PRO',    subtitle:'commit-forecast',
  headline:['Unscoped upgrade.','Blown budget.','Fired consultant.'],
  body:'Ghost Architect™ Commit Forecast™ rewrites that story before it starts.' },

{ file:'day04-2pm',    badge:'PRO',    subtitle:'eol window closing',
  headline:['Your EOL proposal','window closes fast.'],
  body:'Show up with data, not guesses. Ghost Architect™ gives you the data.' },

{ file:'day04-530pm',  badge:'FREE',   subtitle:'free to start',
  headline:['Free to start.','No credit card.','No sales call.'],
  body:'npm install -g ghost-architect-open — your next client meeting just got sharper.' },

// ── DAY 5 — Wed Jun 18 ──────────────────────────────────────────────────────
{ file:'day05-8am',    badge:'v7.2.2', subtitle:'ghost portal',
  headline:['Ghost Portal™','is live.'],
  body:'Self-serve. Instant access. No waiting list. signup.ghostarchitect.dev' },

{ file:'day05-1130am', badge:'PRO',    subtitle:'fix-forecast',
  headline:['PDF. Markdown.','Plain text.','All three.'],
  body:'One Fix Forecast™ run. Hand the PDF to the client. Keep the Markdown for your team.' },

{ file:'day05-2pm',    badge:'v7.2.2', subtitle:'mode-2n',
  headline:['Blast cost','isn\'t theoretical.'],
  body:'Ghost Architect™ tracks it per file, per run, for real. Mode 2N. Real numbers.' },

{ file:'day05-530pm',  badge:'v7.2.2', subtitle:'v7.2.2 is live',
  headline:['Seven versions.','One unified CLI.'],
  body:'Ghost Architect™ v7.2.2 — the version that ships clean. ghost-architect-open on npm.' },

// ── DAY 6 — Thu Jun 19 ──────────────────────────────────────────────────────
{ file:'day06-8am',    badge:'PRO',    subtitle:'social proof',
  headline:['A real demo.','A real codebase.','The room got quiet.'],
  body:'Ghost Architect™ ran. That\'s triage with receipts.' },

{ file:'day06-1130am', badge:'PRO',    subtitle:'fix-forecast',
  headline:['Scan one: POI.','Scan two: Blast.','Scan three: win.'],
  body:'By scan four you own the room. Ghost Architect™ Fix Forecast™.' },

{ file:'day06-2pm',    badge:'v7.2.2', subtitle:'ghost platform',
  headline:['Two tools.','One platform.','Full coverage.'],
  body:'Ghost Listener™ watches production. Ghost Architect™ triages before you touch it.' },

{ file:'day06-530pm',  badge:'FREE',   subtitle:'the ghost way',
  headline:['Know before','you hire anyone.'],
  body:'Any codebase. Any stack. Platform-agnostic pre-engagement triage. Free to start.' },

// ── DAY 7 — Fri Jun 20 ──────────────────────────────────────────────────────
{ file:'day07-8am',    badge:'FREE',   subtitle:'eol countdown',
  headline:['52 days to','Adobe Commerce','2.4.6 EOL.'],
  body:'Your client still hasn\'t scoped the upgrade. Ghost Architect™ changes that today.' },

{ file:'day07-1130am', badge:'PRO',    subtitle:'fix-forecast results',
  headline:['23 conflict zones.','8 hotspots.','6 sprints.'],
  body:'Client signed scope same week. Ghost Architect™ Fix Forecast™.' },

{ file:'day07-2pm',    badge:'PRO',    subtitle:'roi',
  headline:['What does it cost','to NOT triage?'],
  body:'Blown timelines. Surprise re-scopes. Ghost Architect™ Pro starts at $99/mo.' },

{ file:'day07-530pm',  badge:'FREE',   subtitle:'any stack',
  headline:['Magento. Laravel.','Next.js. Whatever','you inherited.'],
  body:'Platform-agnostic pre-engagement triage. npm install -g ghost-architect-open' },

// ── DAY 8 — Mon Jun 23 ──────────────────────────────────────────────────────
{ file:'day08-8am',    badge:'FREE',   subtitle:'question mode',
  headline:['"Is the payment','module safe','to refactor?"'],
  body:'Ghost Architect™ Question Mode. Open tier. Free. One question. Real answer.' },

{ file:'day08-1130am', badge:'PRO',    subtitle:'multi-mode',
  headline:['Commit Forecast™.','Fix Forecast™.','Blast scan.'],
  body:'Three modes. One CLI. Zero surprises. Ghost Architect™ v7.2.2.' },

{ file:'day08-2pm',    badge:'v7.2.2', subtitle:'mode-2n',
  headline:['Brace-depth aware.','Real blast cost.','Not guesswork.'],
  body:'Mode 2N inserts with precision. Narrator cost labeled (est). This is Ghost Architect™.' },

{ file:'day08-530pm',  badge:'v7.2.2', subtitle:'v7.2.2 is live',
  headline:['Combined reports.','Real cost tracking.','Re-forecast protection.'],
  body:'This is what serious pre-engagement triage looks like. v7.2.2 on npm now.' },

// ── DAY 9 — Tue Jun 24 ──────────────────────────────────────────────────────
{ file:'day09-8am',    badge:'PRO',    subtitle:'for consultants',
  headline:['Walk in with','a triage report.'],
  body:'Walk out with the contract. Ghost Architect™ gives you the data behind the confidence.' },

{ file:'day09-1130am', badge:'PRO',    subtitle:'pre-call triage',
  headline:['45 minutes','before the call.'],
  body:'Ghost Architect™ scans it in 20. You walk in knowing what they don\'t.' },

{ file:'day09-2pm',    badge:'PRO',    subtitle:'ghost pro',
  headline:['Ghost Architect™ Pro.','$99/month.'],
  body:'Unlimited scans. Full Fix Forecast™. Combined reports. Ghost Portal™ access.' },

{ file:'day09-530pm',  badge:'TEAM',   subtitle:'ghost team',
  headline:['Ghost Team™.','$399/month.'],
  body:'Shared portal. Shared intel. One account. Every consultant. signup.ghostarchitect.dev' },

// ── DAY 10 — Wed Jun 25 ─────────────────────────────────────────────────────
{ file:'day10-8am',    badge:'FREE',   subtitle:'gut check with receipts',
  headline:['Stop scoping','from gut feel.'],
  body:'Ghost Architect™ is the gut check with receipts. Pre-engagement triage. Start free.' },

{ file:'day10-1130am', badge:'FREE',   subtitle:'different category',
  headline:['Kodus reviews PRs.','Ghost Architect™','works before any PR.'],
  body:'Pre-engagement. Not post-commit. Different category entirely.' },

{ file:'day10-2pm',    badge:'FREE',   subtitle:'blast radius',
  headline:['Every codebase has','a blast radius.'],
  body:'Most teams find it by accident. Ghost Architect™ finds it on purpose.' },

{ file:'day10-530pm',  badge:'FREE',   subtitle:'campaign close',
  headline:['Know your codebase','before you touch it.'],
  body:'Ghost Architect™ — pre-engagement triage. npm install -g ghost-architect-open' },

// ── DAYS 11-14 — Thu Jun 19 to Wed Jun 25 bonus slots ───────────────────────
// (campaign widget only showed 10 unique days; these fill the full 14)

{ file:'day11-8am',    badge:'PRO',    subtitle:'fix-forecast',
  headline:['The estimate','is the risk.'],
  body:'Ghost Architect™ Fix Forecast™ makes the risk visible before the SOW exists.' },

{ file:'day11-1130am', badge:'FREE',   subtitle:'question mode',
  headline:['"Where are the','payment integrations?"'],
  body:'Ghost Architect™ answers that in under a minute. Open tier. Free.' },

{ file:'day11-2pm',    badge:'v7.2.2', subtitle:'ghost portal',
  headline:['Self-serve onboarding.','GitHub OAuth.','Instant access.'],
  body:'Ghost Portal™ is live at signup.ghostarchitect.dev — no sales call needed.' },

{ file:'day11-530pm',  badge:'FREE',   subtitle:'any codebase',
  headline:['Not just Magento.','Not just PHP.','Any codebase.'],
  body:'Ghost Architect™ works on any language, any platform, any stack. Start free.' },

{ file:'day12-8am',    badge:'PRO',    subtitle:'pre-engagement',
  headline:['Pre-engagement','is the new','competitive moat.'],
  body:'The consultant who triages first wins the scope. Ghost Architect™ makes that easy.' },

{ file:'day12-1130am', badge:'PRO',    subtitle:'blast radius',
  headline:['Blast radius:','traced.','Risk: mapped.'],
  body:'Ghost Architect™ Conflict + Blast scan. Know the landmines before you step.' },

{ file:'day12-2pm',    badge:'v7.2.2', subtitle:'v7.2.2 shipped',
  headline:['Multi-select','Fix Forecast™.','H1 through H5.'],
  body:'Combined reports. JSON-refactored extraction. v7.2.2 is the version that ships.' },

{ file:'day12-530pm',  badge:'FREE',   subtitle:'free tier',
  headline:['4 scans free.','No license needed.','No gatekeeping.'],
  body:'Ghost Architect™ Open tier. Try the full triage workflow before you pay a dollar.' },

{ file:'day13-8am',    badge:'PRO',    subtitle:'for agency founders',
  headline:['Your team triages','every codebase','the same way.'],
  body:'Ghost Architect™ Team plan. One portal. Every consultant. Consistent methodology.' },

{ file:'day13-1130am', badge:'FREE',   subtitle:'eol',
  headline:['Adobe Commerce','2.4.6 EOL is','not a drill.'],
  body:'August 11 is the deadline. Ghost Architect™ tells you the scope of the upgrade. Today.' },

{ file:'day13-2pm',    badge:'PRO',    subtitle:'commit-forecast',
  headline:['Commit Forecast™','looks forward.'],
  body:'Where are you relative to a clean upgrade path? Ghost Architect™ answers that.' },

{ file:'day13-530pm',  badge:'FREE',   subtitle:'try it',
  headline:['One command.','The truth about','your codebase.'],
  body:'npm install -g ghost-architect-open — then run it on anything you\'ve inherited.' },

{ file:'day14-8am',    badge:'PRO',    subtitle:'roi',
  headline:['One bad engagement','costs more than','a year of Pro.'],
  body:'Ghost Architect™ Pro: $99/mo. One surprise re-scope pays for the whole year.' },

{ file:'day14-1130am', badge:'FREE',   subtitle:'pre-engagement triage',
  headline:['Read the repo','before you','quote it.'],
  body:'Ghost Architect™ — pre-engagement triage. The truth before the SOW.' },

{ file:'day14-2pm',    badge:'v7.2.2', subtitle:'ghost platform',
  headline:['Ghost Architect™.','Ghost Listener™.','Ghost Portal™.'],
  body:'Three tools. One platform. Pre-engagement to production. ghostarchitect.dev' },

{ file:'day14-530pm',  badge:'FREE',   subtitle:'14 days. one message.',
  headline:['Know your codebase','before you touch it.'],
  body:'Ghost Architect™ — pre-engagement triage. npm install -g ghost-architect-open' },
];

// ─── RENDER LOOP ─────────────────────────────────────────────────────────────
(async () => {
  let n = 0;
  for (const post of POSTS) {
    const svg = buildSVG(post);
    const svgPath = path.join(SVG_DIR, post.file + '.svg');
    const pngPath = path.join(OUT_DIR, post.file + '.png');
    fs.writeFileSync(svgPath, svg, 'utf8');
    await sharp(Buffer.from(svg), { density: 150 })
      .resize(1200, 1200)
      .png()
      .toFile(pngPath);
    n++;
    process.stdout.write(`\r  rendered ${n}/${POSTS.length}: ${post.file}.png`);
  }
  console.log(`\n✓ ${n} cards written to ${OUT_DIR}`);
  console.log('✓ SVG sources saved to ' + SVG_DIR);
  generateCSV();
})();

// ─── CSV GENERATOR ────────────────────────────────────────────────────────────
// Maps file names back to scheduled dates/times (Chicago CT)
// Slot times: 8am | 11:30am | 2pm | 5:30pm CT
const BASE_URL = 'https://ghostarchitect.dev/assets/promo';

// Campaign dates: 14 business days starting Jun 12 2026
// Days 1–5: Jun 12–13, 16–18 (Thu/Fri then Mon–Wed)
// Days 6–10: Jun 19–20, 23–25
// Days 11–14: Jun 26, 27, 30, Jul 1
const DAY_DATES = [
  '2026-06-12', // day01
  '2026-06-13', // day02
  '2026-06-16', // day03
  '2026-06-17', // day04
  '2026-06-18', // day05
  '2026-06-19', // day06
  '2026-06-20', // day07
  '2026-06-23', // day08
  '2026-06-24', // day09
  '2026-06-25', // day10
  '2026-06-26', // day11
  '2026-06-27', // day12
  '2026-06-30', // day13
  '2026-07-01', // day14
];

const SLOT_TIMES = {
  '8am':    '08:00',
  '1130am': '11:30',
  '2pm':    '14:00',
  '530pm':  '17:30',
};

function generateCSV() {
  // Buffer requires: text, image_url, tags, posting_time
  const rows = ['text,image_url,tags,posting_time'];
  for (const post of POSTS) {
    // parse day index and slot from filename e.g. "day03-1130am"
    const m = post.file.match(/^day(\d+)-(.+)$/);
    if (!m) continue;
    const dayIdx = parseInt(m[1], 10) - 1;
    const slot   = m[2];
    const date   = DAY_DATES[dayIdx];
    const time   = SLOT_TIMES[slot];
    const dt     = `${date} ${time}`;
    const imgUrl = `${BASE_URL}/${post.file}.png`;
    const tags   = '';

    // Build the LinkedIn post text from headline + body
    const headlineText = post.headline.join('\n');
    const fullText = `${headlineText}\n${post.body}\n\n#GhostArchitect #PreEngagement #CodeTriage`;

    // CSV-escape: wrap in quotes, double any internal quotes
    const safeText = '"' + fullText.replace(/"/g, '""') + '"';
    const safeImg  = '"' + imgUrl + '"';
    rows.push(`${safeText},${safeImg},${tags},${dt}`);
  }
  const csvPath = path.join(__dirname, 'ghost-architect-campaign-jun2026.csv');
  fs.writeFileSync(csvPath, rows.join('\n'), 'utf8');
  console.log(`✓ CSV written: ${csvPath}`);
  console.log(`  ${rows.length - 1} posts scheduled Jun 12 – Jul 1 2026`);
}
