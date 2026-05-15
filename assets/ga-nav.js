/* ========================================================================
   GHOST ARCHITECT — SHARED NAVIGATION
   ========================================================================
   Single source of truth for the site-wide dropdown nav.
   Include this script on any page:
     <link rel="stylesheet" href="/assets/ga-nav.css">
     <script src="/assets/ga-nav.js" defer></script>
     <div id="ga-nav-mount"></div>   <!-- nav renders here -->
   ======================================================================== */

(function(){
  'use strict';

  // Detect current page to mark the right item as active
  var path = window.location.pathname.replace(/\/$/, '') || '/';

  function isActive(href){
    // Normalize: strip trailing slash, strip .html, compare
    var normHref = href.replace(/\.html$/, '').replace(/\/$/, '');
    var normPath = path.replace(/\.html$/, '').replace(/\/$/, '');
    return normHref === normPath;
  }

  // Which dropdown group is currently active?
  var activeGroup = null;
  if (path.indexOf('for-agency-owners') !== -1 || path.indexOf('for-agency-teams') !== -1) activeGroup = 'solutions';
  else if (path.indexOf('inheritance-audit') !== -1 || path.indexOf('prompt-triage') !== -1 || path.indexOf('audit') !== -1 || path.indexOf('ghost-partner') !== -1) activeGroup = 'modes';
  else if (path.indexOf('blog') !== -1 || path.indexOf('faq') !== -1 || path.indexOf('support') !== -1 || path.indexOf('security') !== -1) activeGroup = 'resources';

  var navHtml = ''
    + '<nav class="ga-nav">'
    + '  <a href="/" class="ga-nav-logo">'
    + '    <img src="/GHOSTLOGO.JPG" alt="Ghost Architect" />'
    + '    Ghost Architect&trade;'
    + '  </a>'
    + '  <ul class="ga-nav-links">'

    // ── MODES dropdown ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'modes' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">'
    + '        Modes'
    + '        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    + '      </button>'
    + '      <div class="ga-dropdown">'
    + '        <div class="ga-dropdown-section-label">Scan Modes</div>'
    + '        <a href="/inheritance-audit.html" class="ga-dropdown-item' + (isActive('/inheritance-audit.html') ? ' active' : '') + '">'
    + '          <div class="title">Inheritance Audit <span class="pill">FLAGSHIP</span></div>'
    + '          <div class="desc">Done-for-you report for buyers. Stack reality, EOL deps, modernization roadmap.</div>'
    + '        </a>'
    + '        <a href="/prompt-triage.html" class="ga-dropdown-item' + (isActive('/prompt-triage.html') ? ' active' : '') + '">'
    + '          <div class="title">Prompt Triage</div>'
    + '          <div class="desc">Audit AI prompts as production code. 15 detectors, academic taxonomy.</div>'
    + '        </a>'
    + '        <a href="/#what-it-does" class="ga-dropdown-item">'
    + '          <div class="title">All 8 Scan Modes</div>'
    + '          <div class="desc">POI, Blast Radius, Conflict, Recon, Chat, Compare, Dashboard, Audit.</div>'
    + '        </a>'
    + '        <div class="ga-dropdown-divider"></div>'
    + '        <a href="/audit.html" class="ga-dropdown-item' + (isActive('/audit.html') ? ' active' : '') + '">'
    + '          <div class="title">Done-For-You Audit</div>'
    + '          <div class="desc">Have EJ run the audit for you. Deal-grade PDF in 48 hours.</div>'
    + '        </a>'
    + '        <a href="/#ghost-partner" class="ga-dropdown-item">'
    + '          <div class="title">Ghost Partner&trade;</div>'
    + '          <div class="desc">Your methodology, your branding, your rates. White-label profiles.</div>'
    + '        </a>'
    + '      </div>'
    + '    </li>'

    // ── SOLUTIONS dropdown ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'solutions' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">'
    + '        Solutions'
    + '        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    + '      </button>'
    + '      <div class="ga-dropdown">'
    + '        <div class="ga-dropdown-section-label">For Your Role</div>'
    + '        <a href="/for-agency-owners.html" class="ga-dropdown-item' + (isActive('/for-agency-owners.html') ? ' active' : '') + '">'
    + '          <div class="title">For Agency Owners <span class="pill new">NEW</span></div>'
    + '          <div class="desc">Bid with confidence. Protect margin. Ship without surprises.</div>'
    + '        </a>'
    + '        <a href="/#for-agency-teams" class="ga-dropdown-item">'
    + '          <div class="title">For Agency Teams</div>'
    + '          <div class="desc">Workflow integration for the engineers running engagements.</div>'
    + '        </a>'
    + '        <div class="ga-dropdown-divider"></div>'
    + '        <a href="/inheritance-audit.html" class="ga-dropdown-item">'
    + '          <div class="title">For Buyers &amp; PE Diligence</div>'
    + '          <div class="desc">Acquisition-grade codebase reports in under sixty seconds.</div>'
    + '        </a>'
    + '        <a href="/security.html" class="ga-dropdown-item' + (isActive('/security.html') || isActive('/security') ? ' active' : '') + '">'
    + '          <div class="title">For CTOs &amp; Security</div>'
    + '          <div class="desc">Runs locally. Your code never leaves your machine. BYOK.</div>'
    + '        </a>'
    + '      </div>'
    + '    </li>'

    // ── PRICING (flat) ──
    + '    <li class="ga-nav-item">'
    + '      <a href="/pricing" class="ga-nav-link' + (isActive('/pricing') || isActive('/pricing.html') || isActive('/plans.html') ? ' active' : '') + '">Pricing</a>'
    + '    </li>'

    // ── RESOURCES dropdown ──
    + '    <li class="ga-nav-item" data-dropdown>'
    + '      <button class="ga-nav-link' + (activeGroup === 'resources' ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">'
    + '        Resources'
    + '        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    + '      </button>'
    + '      <div class="ga-dropdown align-right" style="min-width: 240px;">'
    + '        <a href="/security.html" class="ga-dropdown-item' + (isActive('/security.html') || isActive('/security') ? ' active' : '') + '">'
    + '          <div class="title">Security &amp; Trust</div>'
    + '          <div class="desc">How we handle your code, keys, and data.</div>'
    + '        </a>'
    + '        <a href="/blog.html" class="ga-dropdown-item' + (isActive('/blog.html') ? ' active' : '') + '">'
    + '          <div class="title">Blog</div>'
    + '          <div class="desc">Releases, deep-dives, agency war stories.</div>'
    + '        </a>'
    + '        <a href="/#faq" class="ga-dropdown-item">'
    + '          <div class="title">FAQ</div>'
    + '          <div class="desc">Common questions answered.</div>'
    + '        </a>'
    + '        <a href="/support" class="ga-dropdown-item' + (isActive('/support') || isActive('/support.html') ? ' active' : '') + '">'
    + '          <div class="title">Support</div>'
    + '          <div class="desc">Contact, docs, status.</div>'
    + '        </a>'
    + '        <div class="ga-dropdown-divider"></div>'
    + '        <a href="https://github.com/EJWisner/ghost-architect-open" target="_blank" rel="noopener" class="ga-dropdown-item">'
    + '          <div class="title">GitHub</div>'
    + '          <div class="desc">Ghost Open source &amp; releases.</div>'
    + '        </a>'
    + '      </div>'
    + '    </li>'

    // ── CTA button ──
    + '    <li class="ga-nav-item">'
    + '      <a href="/pricing" class="ga-nav-cta">'
    + '        \uD83D\uDC7B See Plans'
    + '      </a>'
    + '    </li>'
    + '  </ul>'

    + '  <button class="ga-hamburger" id="ga-hamburger" aria-label="Menu" aria-expanded="false">'
    + '    <span></span><span></span><span></span>'
    + '  </button>'
    + '</nav>'

    // ── MOBILE MENU ──
    + '<div class="ga-mobile-menu" id="ga-mobile-menu">'
    + '  <div class="ga-mobile-group' + (activeGroup === 'modes' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">'
    + '      Modes'
    + '      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    + '    </button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="/inheritance-audit.html"' + (isActive('/inheritance-audit.html') ? ' class="active"' : '') + '>Inheritance Audit <span class="pill">FLAGSHIP</span></a>'
    + '      <a href="/prompt-triage.html"' + (isActive('/prompt-triage.html') ? ' class="active"' : '') + '>Prompt Triage</a>'
    + '      <a href="/#what-it-does">All 8 Scan Modes</a>'
    + '      <a href="/audit.html"' + (isActive('/audit.html') ? ' class="active"' : '') + '>Done-For-You Audit</a>'
    + '      <a href="/#ghost-partner">Ghost Partner&trade;</a>'
    + '    </div>'
    + '  </div>'
    + '  <div class="ga-mobile-group' + (activeGroup === 'solutions' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">'
    + '      Solutions'
    + '      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    + '    </button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="/for-agency-owners.html"' + (isActive('/for-agency-owners.html') ? ' class="active"' : '') + '>For Agency Owners <span class="pill new">NEW</span></a>'
    + '      <a href="/#for-agency-teams">For Agency Teams</a>'
    + '      <a href="/inheritance-audit.html">For Buyers &amp; PE Diligence</a>'
    + '      <a href="/security.html"' + (isActive('/security.html') || isActive('/security') ? ' class="active"' : '') + '>For CTOs &amp; Security</a>'
    + '    </div>'
    + '  </div>'
    + '  <a href="/pricing" class="ga-mobile-flat-link' + (isActive('/pricing') || isActive('/pricing.html') ? ' active' : '') + '">Pricing</a>'
    + '  <div class="ga-mobile-group' + (activeGroup === 'resources' ? ' open' : '') + '" data-mobile-group>'
    + '    <button class="ga-mobile-group-header">'
    + '      Resources'
    + '      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>'
    + '    </button>'
    + '    <div class="ga-mobile-group-items">'
    + '      <a href="/security.html"' + (isActive('/security.html') || isActive('/security') ? ' class="active"' : '') + '>Security &amp; Trust</a>'
    + '      <a href="/blog.html"' + (isActive('/blog.html') ? ' class="active"' : '') + '>Blog</a>'
    + '      <a href="/#faq">FAQ</a>'
    + '      <a href="/support"' + (isActive('/support') || isActive('/support.html') ? ' class="active"' : '') + '>Support</a>'
    + '      <a href="https://github.com/EJWisner/ghost-architect-open" target="_blank" rel="noopener">GitHub</a>'
    + '    </div>'
    + '  </div>'
    + '  <a href="/pricing" class="ga-mobile-cta">\uD83D\uDC7B See Plans</a>'
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

    // Click toggle
    dropdowns.forEach(function(item){
      var trigger = item.querySelector('.ga-nav-link');
      trigger.addEventListener('click', function(e){
        e.stopPropagation();
        dropdowns.forEach(function(other){
          if (other !== item) other.classList.remove('open');
        });
        item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', item.classList.contains('open'));
      });
    });

    // Hover
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
      // preventDefault here stops the synthesized click 300ms later that would re-toggle.
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
