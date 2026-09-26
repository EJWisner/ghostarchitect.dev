#!/usr/bin/env python3
"""
Port the live changelog.html into next/changelog.html.

The live page's content (hero, manifesto, the two logs with their install cards and release cards) is carried
over as-is. Only paths are rewritten, inline styles are dropped in favour of changelog.css (badge colours become
classes), and the old shell (own <style>, footer) is replaced by the /next/ shell. Re-run after every release:
the release script edits the live page, this regenerates the /next/ copy from it.

Usage: port-changelog.py <live-repo-root> <next-dir>
"""
import html as htmlmod
import os
import re
import sys
from collections import Counter
from html.parser import HTMLParser

LIVE, NEXT = sys.argv[1], sys.argv[2]
PORTED = {f for f in os.listdir(NEXT) if f.endswith('.html') and not f.startswith('_')}
RETIRED = {'partner.html'}

src = open(os.path.join(LIVE, 'changelog.html'), encoding='utf-8').read()
HEAD_KEEP = re.compile(
    r'<title>.*?</title>|<link rel="canonical"[^>]*>|<meta (?:name|property)="(?:description|keywords|author|og:[^"]+|twitter:[^"]+)"[^>]*>|<script type="application/ld\+json">.*?</script>',
    re.S)
head = '\n'.join('  ' + h.strip() for h in HEAD_KEEP.findall(src))
body = re.search(r'<body[^>]*>(.*)</body>', src, re.S).group(1)

# content = everything after the nav mount, before the footer and the shared-nav script
content = body.split('<div id="ga-nav-mount"></div>', 1)[1]
content = content.split('<footer', 1)[0]


def rewrite_path(url):
    if not url.startswith('/') or url.startswith('//'):
        return url
    m = re.match(r'^/([^?#]*)(.*)$', url)
    file, rest = m.group(1), m.group(2)
    if file == '':
        return 'index.html' + rest
    if file.startswith('assets/') or file == 'GHOSTLOGO.JPG' or file.endswith(('.pdf', '.png', '.jpg', '.jpeg', '.webm', '.mp4', '.svg')):
        return '../' + file + rest
    if file.startswith('blog/') or file in PORTED:
        return file + rest
    return '../' + file + rest


content = re.sub(r'<a\b[^>]*href="/partner\.html[^"]*"[^>]*>(.*?)</a>', r'\1', content, flags=re.S)
content = re.sub(r'((?:href|src)=")([^"]*)"', lambda m: m.group(1) + rewrite_path(m.group(2)) + '"', content)

# badge colours: inline style -> class
KIND = {'#4a9eff': 'kind-blue', '#4ade80': 'kind-green', '#22c55e': 'kind-green', '#a78bfa': 'kind-purple', '#e07340': 'kind-orange'}


def badge(m):
    classes, style = m.group(1), m.group(2)
    col = re.search(r'color:\s*(#[0-9a-fA-F]{6})', style)
    kind = KIND.get(col.group(1).lower() if col else '', '')
    return '<span class="%s">' % (classes + (' ' + kind if kind else ''))


content = re.sub(r'<span class="(release-badge[^"]*)" style="([^"]*)">', badge, content)
content = re.sub(r'\s+style="[^"]*"', '', content)

shell = open(os.path.join(NEXT, '_template.html'), encoding='utf-8').read()
page = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- PREVIEW BUILD: keep noindex until this replaces /changelog.html. Regenerate with tools/port-changelog.py after each release. -->
  <meta name="robots" content="noindex, nofollow" />
%s
  <meta name="theme-color" content="#0a0a0f" />
  <link rel="icon" type="image/jpeg" href="../GHOSTLOGO.JPG" />
  <link rel="apple-touch-icon" href="../GHOSTLOGO.JPG" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" />
  <link rel="stylesheet" href="../assets/ga-nav.css?v=20260920b" />
  <link rel="stylesheet" href="site.css" />
  <link rel="stylesheet" href="changelog.css" />
</head>
<body data-product="cloud">

<canvas id="lattice" aria-hidden="true" data-ambient></canvas>

<div id="ga-nav-mount"></div>

<main class="page changelog">
%s
</main>

<footer>
  <a href="index.html" class="footer-logo"><img src="../GHOSTLOGO.JPG" alt="" width="20" height="20" loading="lazy" /> Ghost Architect&trade;</a>
  <span>&copy; 2026 EJ Wisner &middot; Ghost Architect&trade; &middot; All rights reserved. &middot; US Copyright Reg. #1-15123488721 &middot; <a href="support.html">Support</a> &middot; <a href="privacy.html">Privacy Policy</a> &middot; <a href="msa.html">Terms of Service</a></span>
</footer>

<script src="../assets/ga-nav.js?v=20260920b" defer></script>
<script src="next-nav.js" defer></script>
<script src="scene.js" defer></script>
</body>
</html>
""" % (head, content.strip('\n'))
open(os.path.join(NEXT, 'changelog.html'), 'w', encoding='utf-8').write(page)


class Words(HTMLParser):
    def __init__(self):
        super().__init__(); self.t = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'): self.skip -= 1
    def handle_data(self, d):
        if not self.skip: self.t.append(d)


def words(s):
    w = Words(); w.feed(s)
    return re.findall(r"[A-Za-z0-9$%.'&;™-]+", htmlmod.unescape(' '.join(w.t)))


lw, nw = words(src), words(page)
miss = Counter(lw) - Counter(nw)
print('changelog  live %d new %d ratio %.3f  missing: %s' % (len(lw), len(nw), len(nw) / max(1, len(lw)), ' '.join('%s×%d' % kv for kv in miss.most_common(10)) or '-'))
print('release cards:', page.count('class="release-card'), '| badges by kind:', Counter(re.findall(r'release-badge[^"]*"', page)).most_common(8))
