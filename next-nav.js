/* ============================================================================
   /next/ ONLY — makes the shared nav (assets/ga-nav.js) work while the new
   pages live in this folder, without touching the shared file.

   The shared nav hard-codes site-root paths: /#hosted, /local.html,
   /pricing.html, /GHOSTLOGO.JPG and so on. Opened from the folder (file://)
   those point at the root of the hard drive; served from /next/ they point at
   the live, old-design pages. This script, after the nav has mounted:

     1. points every nav link that has a /next/ version (PAGES below) at that
        version, relative to this page, so it works from file:// and from /next/;
     2. points every other nav link at the live page one level up (../x.html),
        which is the live site when served and the repo copy when opened from
        the folder;
     3. repoints the nav logo to ../GHOSTLOGO.JPG;
     4. lights the Cloud / Local switch from <body data-product="cloud|local">.

   When /next/ becomes the site root, ../ resolves to / and PAGES resolve to
   their root paths, so nothing here has to change on cutover; it just stops
   mattering and can be removed along with the noindex metas.

   Add a page's filename to PAGES the moment its /next/ version exists.
   ============================================================================ */
(function () {
  'use strict';

  var PAGES = [
    'audit.html',
    'blog.html',
    'changelog.html',
    'contact.html',
    'download.html',
    'for-agency-owners.html',
    'ghost-brief.html',
    'ghost-watcher.html',
    'index.html',
    'inheritance-audit.html',
    'local-walkthrough.html',
    'local.html',
    'msa.html',
    'plans.html',
    'pricing.html',
    'privacy.html',
    'prompt-triage.html',
    'security.html',
    'support.html',
    'thank-you.html',
    'trial.html',
    'triple-crown-process.html',
    'blog/codebase-triage-walkthrough.html',
    'blog/cost-of-ai-codebase-analysis.html',
    'blog/executive-brief-v821.html',
    'blog/ghost-brief-launch.html',
    'blog/ghost-local-ask-the-code.html',
    'blog/ghost-local-v1-0-0.html',
    'blog/ghost-local-v7-0-0.html',
    'blog/ghost-local-v7-0-1.html',
    'blog/ghost-local-v7-0-2.html',
    'blog/ghost-local-v7-0-3.html',
    'blog/ghost-local-v7-1-0.html',
    'blog/ghost-local-v7-1-1.html',
    'blog/ghost-local-v7-1-2.html',
    'blog/ghost-local-v7-1-3.html',
    'blog/ghost-local-v7-1-4.html',
    'blog/ghost-local-v7-1-5.html',
    'blog/ghost-local-v7-1-6.html',
    'blog/ghost-local-v7-1-7.html',
    'blog/ghost-local-v7-1-8.html',
    'blog/ghost-local-v7-1-9.html',
    'blog/ghost-local-v7-2-0.html',
    'blog/ghost-local-v7-2-1.html',
    'blog/ghost-local-v7-2-2.html',
    'blog/ghost-local-v7-2-3.html',
    'blog/ghost-local-v7-2-4.html',
    'blog/ghost-local-v7-2-5.html',
    'blog/ghost-local-v7-2-6.html',
    'blog/ghost-local-v7-2-7.html',
    'blog/ghost-local-v7-2-8.html',
    'blog/ghost-local-v7-3-0.html',
    'blog/ghost-local-v7-3-1.html',
    'blog/ghost-local-v7-3-2.html',
    'blog/ghost-local-v7-3-9.html',
    'blog/ghost-local-v7-4-0.html',
    'blog/ghost-local-v7-4-1.html',
    'blog/ghost-local-v7-4-10.html',
    'blog/ghost-local-v7-4-2.html',
    'blog/ghost-local-v7-4-3.html',
    'blog/ghost-local-v7-4-4.html',
    'blog/ghost-local-v7-4-5.html',
    'blog/ghost-local-v7-4-6.html',
    'blog/ghost-local-v7-4-7.html',
    'blog/ghost-local-v7-4-8.html',
    'blog/ghost-local-v7-4-9.html',
    'blog/ghost-open-v5-launch.html',
    'blog/ghost-partner-profiles-v825.html',
    'blog/ghost-prompt-triage-launch.html',
    'blog/ghost-prompt-triage-v53-clarity.html',
    'blog/ghost-triple-crown.html',
    'blog/ghost-v7-launch.html',
    'blog/ghost-watcher-v908.html',
    'blog/ghost-watcher-v931-stream-batch.html',
    'blog/inheritance-audit-mode-launch.html',
    'blog/introducing-ghost-partner.html',
    'blog/magento-244-eol.html',
    'blog/magento-246-eol.html',
    'blog/magento-249-upgrade.html',
    'blog/meta-extension-scan.html',
    'blog/why-claude-code-is-not-your-starting-point.html'
  ];

  // Pages retired from the site. Their nav entries are removed inside /next/ (EJ, 2026-09-24: the
  // Refer & Earn programme, partner.html, is no longer offered).
  var RETIRED = ['partner.html'];

  var here = (document.body && document.body.getAttribute('data-product')) || 'cloud';
  // The /next/ root is wherever this script lives, so pages in subfolders (next/blog/...) resolve correctly too.
  var self = document.currentScript && document.currentScript.src;
  var base = self ? new URL('.', self).pathname : location.pathname.replace(/[^/]*$/, '');
  var built = {};
  PAGES.forEach(function (p) { built[p] = true; });

  function rewrite(href) {
    if (!href || href.charAt(0) !== '/' || href.charAt(1) === '/') return null;   // only site-root paths
    var m = href.match(/^\/([^?#]*)(.*)$/);
    var file = m[1], rest = m[2];
    if (file === '') file = 'index.html';
    if (built[file]) return base + file + rest;
    return base + '../' + file + rest;
  }

  var tries = 0;
  (function retarget() {
    var nav = document.querySelector('nav.ga-nav');
    if (!nav) { if (tries++ < 80) setTimeout(retarget, 25); return; }

    // The shared script renders the nav, the mobile menu and the trial bar as siblings, so rewrite
    // site-root links wherever they are. Ported pages carry only relative links of their own, so any
    // site-root link left on a page is the shared nav's, or a slip that wants the same treatment.
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var file = (href.match(/^\/([^?#]*)/) || [])[1];
      if (file && RETIRED.indexOf(file) !== -1) { a.parentNode.removeChild(a); return; }
      var to = rewrite(href);
      if (to) a.setAttribute('href', to);
    });
    document.querySelectorAll('img[src]').forEach(function (img) {
      var to = rewrite(img.getAttribute('src'));
      if (to) img.setAttribute('src', to);
    });
    document.querySelectorAll('a.ga-product.hosted').forEach(function (a) { a.classList.toggle('on', here === 'cloud'); });
    document.querySelectorAll('a.ga-product.local').forEach(function (a) { a.classList.toggle('on', here === 'local'); });
  })();
})();
