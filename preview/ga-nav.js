/* ========================================================================
   GHOST ARCHITECT(TM) SHARED NAVIGATION: PREVIEW COPY (2026-10-29)
   ========================================================================
   The benefit-first menu for the rebuilt site. It replaces /assets/ga-nav.js
   at go-live (see CHANGES.md, "Go-live steps").

   What differs from the live /assets/ga-nav.js:
     1. Benefit-first labels and descriptions; Solutions first; no beta entry;
        "license" spelling; a trademark sign on every product name.
     2. The CTA is "Start the trial" (download page) on every page, and the
        trial band puts the Ghost Architect(TM) Local trial first.
     3. PREVIEW AWARENESS. When the page is served from a folder named
        /preview/, every menu link to a page that has a preview version stays
        inside /preview/; links to pages that are records (blog, changelog,
        walkthrough, terms) go to the live root on purpose. At the site root
        PREVIEW is empty and every link is the plain root path, so this file
        can be copied over /assets/ga-nav.js unchanged.
     4. It lights the Open / Local switch from <body data-product="open|local">
        itself, so the preview pages do not need next-nav.js.
   Include:
     <link rel="stylesheet" href="/assets/ga-nav.css">
     <script src="ga-nav.js" defer></script>     (preview)
     <div id="ga-nav-mount"></div>
   ======================================================================== */

(function(){
  'use strict';

  // ── Preview awareness ──
  var PREVIEW = (function(){ var m = window.location.pathname.match(/^(.*?\/preview)(?:\/|$)/); return m ? m[1] : ''; })();
  var IN_PREVIEW = {
    'index.html': 1, 'local.html': 1, 'pricing.html': 1, 'download.html': 1, 'beta.html': 1,
    'for-agency-owners.html': 1, 'for-ip-attorneys.html': 1, 'inheritance-audit.html': 1, 'audit.html': 1,
    'ghost-brief.html': 1, 'ghost-watcher.html': 1, 'prompt-triage.html': 1, 'triple-crown-process.html': 1,
    'security.html': 1, 'support.html': 1, 'contact.html': 1, 'on-demand.html': 1, 'snapshot.html': 1
  };
  function u(href){
    if (!PREVIEW) return href;
    var m = href.match(/^\/([^?#]*)(.*)$/);
    if (!m) return href;
    var file = m[1] || 'index.html';
    return IN_PREVIEW[file] ? PREVIEW + '/' + file + m[2] : href;
  }

  // Detect current page to mark the right item as active (the /preview prefix is ignored).
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  if (PREVIEW && path.indexOf(PREVIEW) === 0) path = path.slice(PREVIEW.length) || '/';

  function isActive(href){
    var normHref = href.replace(/\.html$/, '').replace(/\/$/, '');
    var normPath = path.replace(/\.html$/, '').replace(/\/$/, '');
    return normHref === normPath;
  }
  function act(href){ return isActive(href) ? ' active' : ''; }
  function actAttr(href){ return isActive(href) ? ' class="active"' : ''; }

  // Which dropdown group is currently active?
  var activeGroup = null;
  if (path.indexOf('/local') === 0 || path.indexOf('/download') === 0 || path.indexOf('/beta') === 0) activeGroup = 'local';
  else if (path.indexOf('for-agency-owners') !== -1 || path.indexOf('for-ip-attorneys') !== -1 || path.indexOf('inheritance-audit') !== -1 || path.indexOf('/audit') === 0 || path.indexOf('on-demand') !== -1 || path.indexOf('snapshot') !== -1) activeGroup = 'solutions';
  else if (path.indexOf('prompt-triage') !== -1 || path.indexOf('ghost-brief') !== -1 || path.indexOf('ghost-watcher') !== -1 || path.indexOf('ghost-triple-crown') !== -1 || path.indexOf('triple-crown-process') !== -1) activeGroup = 'modes';
  else if (path.indexOf('blog') !== -1 || path.indexOf('support') !== -1 || path.indexOf('security') !== -1 || path.indexOf('changelog') !== -1) activeGroup = 'resources';

  // THE PRODUCT SWITCH. Lit from the page: <body data-product="local">, the Local
  // pages, a ?platform=local query or a #local anchor light Local; everything else
  // lights Ghost Open(TM).
  var bodyProduct = (document.body && document.body.getAttribute('data-product')) || '';
  var isLocalPage = bodyProduct === 'local'
    || activeGroup === 'local'
    || /[?&]platform=local\b/.test(window.location.search)
    || window.location.hash === '#local'
    || path.indexOf('/blog/ghost-local-') === 0;

  var supportHref = u('/support.html') + (isLocalPage ? '?platform=local' : '');
  var contactHref = u('/contact.html') + (isLocalPage ? '?platform=local' : '');
  var changelogHref = '/changelog.html' + (isLocalPage ? '#local' : '#open');

  var switchHtml = ''
    + '<div class="ga-product-switch" role="navigation" aria-label="Choose a product">'
    + '  <a href="' + u('/pricing.html#open') + '" class="ga-product hosted' + (isLocalPage ? '' : ' on') + '" title="Ghost Open&trade;: one person, your own Anthropic key"><span class="dot"></span>Open</a>'
    + '  <a href="' + u('/local.html') + '" class="ga-product local' + (isLocalPage ? ' on' : '') + '" title="Ghost Architect&trade; Local: your hardware, your model, a fixed price"><span class="dot"></span>Local</a>'
    + '</div>';

  var chevron = '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  var pillLocal = '<span class="pill local">LOCAL</span>';

  function item(href, title, desc, activeKey){
    return '        <a href="' + u(href) + '" class="ga-dropdown-item' + (activeKey ? act(activeKey) : '') + '">'
      + '<div class="title">' + title + '</div>'
      + '<div class="desc">' + desc + '</div>'
      + '</a>';
  }

  var navHtml = ''
    + '<nav class="ga-nav">'
    + '  <a href="' + u('/index.html') + '" class="ga-nav-logo">'
    + '    <img src="/GHOSTLOGO.JPG" alt="Ghost Architect&trade;" />'
    + '    Ghost Architect&trade;'
    + '  </a>'
    + switchHtml
    + '  <ul class="ga-nav-links">'

    // ── SOLUTIONS dropdown: who it pays for ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'solutions' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">Solutions' + chevron + '</button>'
    + '      <div class="ga-dropdown">'
    + '        <div class="ga-dropdown-section-label">Who it pays for</div>'
    + item('/for-agency-owners.html', 'For agency owners', 'Bid on what is in the code, not on a guess. Protect the margin on every fixed bid.', '/for-agency-owners.html')
    + item('/inheritance-audit.html', 'For deal advisors &amp; PE diligence', 'Know what you are buying before the LOI, even when the code cannot leave the target.', '/inheritance-audit.html')
    + item('/for-ip-attorneys.html', 'For IP attorneys &amp; experts <span class="pill new">NEW</span>', 'Turn every software client into a monthly IP watch, under your firm&rsquo;s name.', '/for-ip-attorneys.html')
    + item('/security.html', 'For CTOs &amp; security', 'Prove the code never left the building, with a printout instead of a promise.', '/security.html')
    + '        <div class="ga-dropdown-divider"></div>'
    + '        <div class="ga-dropdown-section-label">Done for you</div>'
    + item('/audit.html', 'Ghost Inheritance Audit&trade;', 'We run the audit for you. Report in 48 hours, $497 flat.', '/audit.html')
    + item('/#ghost-partner', 'Ghost Partner&trade; ' + pillLocal, 'Sell the audit under your own brand, at your own rates.', null)
    + '      </div>'
    + '    </li>'

    // ── LOCAL dropdown ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'local' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">Local' + chevron + '</button>'
    + '      <div class="ga-dropdown">'
    + '        <div class="ga-dropdown-section-label">Ghost Architect&trade; Local</div>'
    + item('/local.html', 'Overview', 'Win the work that bans AI. Your hardware, your model, the same bill every month.', '/local.html')
    + '        <a href="/local-walkthrough.html" class="ga-dropdown-item' + act('/local-walkthrough.html') + '"><div class="title">See it running</div><div class="desc">The Fleet page, the queue, LLM Status and the reports. Real screens.</div></a>'
    + item('/pricing.html#local', 'Local pricing', 'From $80 a month. No per-token bill. Half price for the first month when you convert from the trial.', null)
    + item('/download.html', 'Download &amp; install', 'Your own codebase&rsquo;s report, on your own hardware. No card, no account.', '/download.html')
    + item('/support.html?platform=local', 'Local support', 'Install, hub and spokes, zero egress, licenses.', null)
    + item('/security.html#local', 'Zero egress, proven', 'Every place data could go, listed and switched off. Hand it to your security team.', null)
    + '        <div class="ga-dropdown-divider"></div>'
    + '        <a href="/blog.html?platform=local" class="ga-dropdown-item"><div class="title">Local blog</div><div class="desc">Field reports and release notes.</div></a>'
    + '      </div>'
    + '    </li>'

    // ── MODES dropdown: what it finds ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'modes' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">Modes' + chevron + '</button>'
    + '      <div class="ga-dropdown">'
    + '        <div class="ga-dropdown-section-label">What it finds</div>'
    + item('/ghost-watcher.html', 'Ghost Watcher&trade; ' + pillLocal, 'Catch the risky change before it merges. Every commit checked, no per-commit bill.', '/ghost-watcher.html')
    + '        <a href="/blog/ghost-triple-crown.html" class="ga-dropdown-item' + act('/blog/ghost-triple-crown.html') + '"><div class="title">Ghost Triple Crown&trade;</div><div class="desc">What a change reaches, what it contradicts, and what to do about it.</div></a>'
    + item('/inheritance-audit.html', 'Inheritance Audit', 'The stack, the people and the licenses you are about to inherit.', null)
    + item('/ghost-brief.html', 'Ghost Brief&trade;', 'Hand your coding assistant the fix plan, safest fixes first.', '/ghost-brief.html')
    + item('/prompt-triage.html', 'Prompt Triage&trade;', 'Find the prompt defects that inflate your AI bill.', '/prompt-triage.html')
    + item('/#what-it-does', 'Every scan mode', 'Recon, Points of Interest, Blast Radius&trade;, Conflict Detection&trade; and more.', null)
    + item('/triple-crown-process.html', 'How we ship', 'Three votes before any change goes out. A case study.', '/triple-crown-process.html')
    + '      </div>'
    + '    </li>'

    // ── PRICING (flat) ──
    + '    <li class="ga-nav-item">'
    + '      <a href="' + u('/pricing.html') + '" class="ga-nav-link' + (isActive('/pricing') ? ' active' : '') + '">Pricing</a>'
    + '    </li>'

    // ── CONTACT (flat) ──
    + '    <li class="ga-nav-item">'
    + '      <a href="' + contactHref + '" class="ga-nav-link' + (isActive('/contact') ? ' active' : '') + '">Contact &amp; Support</a>'
    + '    </li>'

    // ── RESOURCES dropdown ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'resources' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">Resources' + chevron + '</button>'
    + '      <div class="ga-dropdown align-right" style="min-width: 240px;">'
    + item('/security.html', 'Security &amp; Trust', 'What leaves your network, and the proof.', null)
    + '        <a href="/blog.html" class="ga-dropdown-item' + act('/blog.html') + '"><div class="title">Blog</div><div class="desc">Field reports, releases, deep dives.</div></a>'
    + '        <a href="' + changelogHref + '" class="ga-dropdown-item' + act('/changelog.html') + '"><div class="title">Changelog</div><div class="desc">What shipped, and when.</div></a>'
    + item('/#faq', 'FAQ', 'Straight answers to the first questions.', null)
    + '        <a href="' + supportHref + '" class="ga-dropdown-item' + act('/support.html') + '"><div class="title">Support</div><div class="desc">Contact, docs, live chat.</div></a>'
    + '      </div>'
    + '    </li>'

    // ── CTA button ──
    + '    <li class="ga-nav-item">'
    + '      <a href="' + u('/download.html') + '" class="ga-nav-cta">👻 Start the trial</a>'
    + '    </li>'
    + '  </ul>'

    + '  <button class="ga-hamburger" id="ga-hamburger" aria-label="Menu" aria-expanded="false">'
    + '    <span></span><span></span><span></span>'
    + '  </button>'
    + '</nav>'

    // ── THE TRIAL BAND: the Local trial first, Ghost Open(TM) second ──
    + '<div class="ga-trial-band">'
    + '  <a href="' + u('/download.html') + '" class="ga-trial local">Ghost Architect&trade; Local trial &middot; no card</a>'
    + '  <a href="' + u('/pricing.html#open') + '" class="ga-trial hosted">Ghost Open&trade; &middot; one person &middot; npm install</a>'
    + '</div>'

    // ── MOBILE MENU ──
    + '<div class="ga-mobile-menu" id="ga-mobile-menu">'
    + switchHtml.replace('ga-product-switch', 'ga-product-switch mobile')
    + '  <div class="ga-mobile-group' + (activeGroup === 'solutions' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">Solutions' + chevron + '</button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="' + u('/for-agency-owners.html') + '"' + actAttr('/for-agency-owners.html') + '>For agency owners</a>'
    + '      <a href="' + u('/inheritance-audit.html') + '"' + actAttr('/inheritance-audit.html') + '>For deal advisors &amp; PE diligence</a>'
    + '      <a href="' + u('/for-ip-attorneys.html') + '"' + actAttr('/for-ip-attorneys.html') + '>For IP attorneys &amp; experts <span class="pill new">NEW</span></a>'
    + '      <a href="' + u('/security.html') + '"' + actAttr('/security.html') + '>For CTOs &amp; security</a>'
    + '      <a href="' + u('/audit.html') + '"' + actAttr('/audit.html') + '>Ghost Inheritance Audit&trade; (done for you)</a>'
    + '      <a href="' + u('/#ghost-partner') + '">Ghost Partner&trade; ' + pillLocal + '</a>'
    + '    </div>'
    + '  </div>'
    + '  <div class="ga-mobile-group' + (activeGroup === 'local' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">Local' + chevron + '</button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="' + u('/local.html') + '"' + actAttr('/local.html') + '>Ghost Architect&trade; Local</a>'
    + '      <a href="/local-walkthrough.html"' + actAttr('/local-walkthrough.html') + '>See it running</a>'
    + '      <a href="' + u('/pricing.html#local') + '">Local pricing</a>'
    + '      <a href="' + u('/download.html') + '"' + actAttr('/download.html') + '>Download &amp; install</a>'
    + '      <a href="' + u('/security.html#local') + '">Zero egress, proven</a>'
    + '      <a href="/blog.html?platform=local">Local blog</a>'
    + '    </div>'
    + '  </div>'
    + '  <div class="ga-mobile-group' + (activeGroup === 'modes' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">Modes' + chevron + '</button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="' + u('/ghost-watcher.html') + '"' + actAttr('/ghost-watcher.html') + '>Ghost Watcher&trade; ' + pillLocal + '</a>'
    + '      <a href="/blog/ghost-triple-crown.html"' + actAttr('/blog/ghost-triple-crown.html') + '>Ghost Triple Crown&trade;</a>'
    + '      <a href="' + u('/inheritance-audit.html') + '">Inheritance Audit</a>'
    + '      <a href="' + u('/ghost-brief.html') + '"' + actAttr('/ghost-brief.html') + '>Ghost Brief&trade;</a>'
    + '      <a href="' + u('/prompt-triage.html') + '"' + actAttr('/prompt-triage.html') + '>Prompt Triage&trade;</a>'
    + '      <a href="' + u('/#what-it-does') + '">Every scan mode</a>'
    + '      <a href="' + u('/triple-crown-process.html') + '"' + actAttr('/triple-crown-process.html') + '>How we ship</a>'
    + '    </div>'
    + '  </div>'
    + '  <a href="' + u('/pricing.html') + '" class="ga-mobile-flat-link' + (isActive('/pricing') ? ' active' : '') + '">Pricing</a>'
    + '  <a href="' + contactHref + '" class="ga-mobile-flat-link' + (isActive('/contact') ? ' active' : '') + '">Contact &amp; Support</a>'
    + '  <div class="ga-mobile-group' + (activeGroup === 'resources' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">Resources' + chevron + '</button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="' + u('/security.html') + '">Security &amp; Trust</a>'
    + '      <a href="/blog.html"' + actAttr('/blog.html') + '>Blog</a>'
    + '      <a href="' + changelogHref + '"' + actAttr('/changelog.html') + '>Changelog</a>'
    + '      <a href="' + u('/#faq') + '">FAQ</a>'
    + '      <a href="' + supportHref + '"' + actAttr('/support.html') + '>Support</a>'
    + '    </div>'
    + '  </div>'
    + '  <a href="' + u('/download.html') + '" class="ga-mobile-cta">👻 Start the Ghost Architect&trade; Local trial</a>'
    + '</div>';

  // Mount: prefer #ga-nav-mount, else insert at top of <body>
  function mount(){
    var target = document.getElementById('ga-nav-mount');
    if (target) {
      target.outerHTML = navHtml;
    } else if (document.body) {
      document.body.insertAdjacentHTML('afterbegin', navHtml);
    }
    wireUp();
  }

  function wireUp(){
    var dropdowns = document.querySelectorAll('.ga-nav-item[data-dropdown]');

    dropdowns.forEach(function(item){
      var trigger = item.querySelector('.ga-nav-link');
      trigger.addEventListener('click', function(e){
        e.stopPropagation();
        dropdowns.forEach(function(other){ if (other !== item) other.classList.remove('open'); });
        item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', item.classList.contains('open'));
      });
    });

    dropdowns.forEach(function(item){
      var leaveTimer;
      item.addEventListener('mouseenter', function(){
        clearTimeout(leaveTimer);
        dropdowns.forEach(function(other){ if (other !== item) other.classList.remove('open'); });
        item.classList.add('open');
      });
      item.addEventListener('mouseleave', function(){
        leaveTimer = setTimeout(function(){ item.classList.remove('open'); }, 200);
      });
    });

    document.addEventListener('click', function(){
      dropdowns.forEach(function(item){ item.classList.remove('open'); });
    });

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        dropdowns.forEach(function(item){ item.classList.remove('open'); });
        var mm = document.getElementById('ga-mobile-menu');
        var hb = document.getElementById('ga-hamburger');
        if (mm) mm.classList.remove('open');
        if (hb) hb.classList.remove('open');
      }
    });

    var hamburger = document.getElementById('ga-hamburger');
    var mobileMenu = document.getElementById('ga-mobile-menu');
    if (hamburger && mobileMenu) {
      var toggleMenu = function(e){
        if (e) { e.stopPropagation(); }
        var isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
      };
      hamburger.addEventListener('click', toggleMenu);
      // iOS Safari: touchend fires reliably when click sometimes doesn't.
      hamburger.addEventListener('touchend', function(e){
        e.preventDefault();
        toggleMenu(e);
      });
    }

    document.querySelectorAll('.ga-mobile-group[data-mobile-group]').forEach(function(group){
      var header = group.querySelector('.ga-mobile-group-header');
      if (!header) return;
      header.addEventListener('click', function(){ group.classList.toggle('open'); });
    });

    document.querySelectorAll('.ga-mobile-menu a').forEach(function(a){
      a.addEventListener('click', function(){
        if (mobileMenu) mobileMenu.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
