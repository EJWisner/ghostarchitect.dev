#!/usr/bin/env python3
"""
Port one or more live blog posts (blog/<name>.html) into next/blog/<name>.html.

Every post on ghostarchitect.dev shares one skeleton:
  <div class="article-wrap"> back-link, .article-meta, h1, .lede, .article-body ... </div>
This lifts that article out of its old shell (own <style>, own footer, absolute paths) and drops it into the
/next/ shell (site.css + blog.css, shared nav via ../../assets, next-nav.js, the ambient scene). Copy is not
touched: the article HTML is carried over as-is, apart from path rewrites and the removal of inline style
attributes, which blog.css replaces.

Usage:  port-post.py <live-repo-root> <next-dir> <post-name> [<post-name> ...]
        port-post.py <live-repo-root> <next-dir> --all
Prints one fidelity line per post (visible-word counts, live vs new).
"""
import html as htmlmod
import os
import re
import sys
from collections import Counter
from html.parser import HTMLParser

LIVE = sys.argv[1]
NEXT = sys.argv[2]
names = sys.argv[3:]
if names == ['--all']:
    names = sorted(f[:-5] for f in os.listdir(os.path.join(LIVE, 'blog')) if f.endswith('.html'))

# Pages that exist in /next/ (top level). Anything else under / goes to the live page two levels up.
PORTED = {f for f in os.listdir(NEXT) if f.endswith('.html') and not f.startswith('_')}
RETIRED = {'partner.html'}

SHELL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- PREVIEW BUILD: keep noindex until this replaces the live page -->
  <meta name="robots" content="noindex, nofollow" />
{head}
  <meta name="theme-color" content="#0a0a0f" />
  <!-- Paths are relative to /next/blog/ so the page also opens straight from the folder (file://).
       When this replaces the live page, ../../ becomes / and ../ becomes /next-root-relative. -->
  <link rel="icon" type="image/jpeg" href="../../GHOSTLOGO.JPG" />
  <link rel="apple-touch-icon" href="../../GHOSTLOGO.JPG" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" />
  <link rel="stylesheet" href="../../assets/ga-nav.css?v=20260920b" />
  <link rel="stylesheet" href="../site.css" />
  <link rel="stylesheet" href="../blog.css" />
</head>
<body data-product="{product}">

<canvas id="lattice" aria-hidden="true" data-ambient{variant}></canvas>

<div id="ga-nav-mount"></div>

<main class="page">
  <article class="article">
{article}
  </article>
</main>

<footer>
  <a href="../index.html" class="footer-logo"><img src="../../GHOSTLOGO.JPG" alt="" width="20" height="20" loading="lazy" /> Ghost Architect&trade;</a>
  <span>&copy; 2026 EJ Wisner &middot; Ghost Architect&trade; &middot; All rights reserved. &middot; US Copyright Reg. #1-15123488721 &middot; <a href="../blog.html">Blog</a> &middot; <a href="../support.html{support_q}">Support</a> &middot; <a href="../privacy.html">Privacy Policy</a> &middot; <a href="../msa.html">Terms of Service</a></span>
</footer>

<script src="../../assets/ga-nav.js?v=20260920b" defer></script>
<script src="../next-nav.js" defer></script>
<script src="../scene.js" defer></script>
</body>
</html>
"""

HEAD_KEEP = re.compile(
    r'<title>.*?</title>|<link rel="canonical"[^>]*>|<meta (?:name|property)="(?:description|keywords|author|og:[^"]+|twitter:[^"]+|article:[^"]+)"[^>]*>|<script type="application/ld\+json">.*?</script>',
    re.S)


def rewrite_path(url):
    """Site-root path -> path relative to next/blog/."""
    if not url.startswith('/') or url.startswith('//'):
        return url
    m = re.match(r'^/([^?#]*)(.*)$', url)
    file, rest = m.group(1), m.group(2)
    if file == '':
        return '../index.html' + rest
    if file.startswith('assets/') or file == 'GHOSTLOGO.JPG' or file.endswith(('.pdf', '.png', '.jpg', '.jpeg', '.webm', '.mp4', '.svg')):
        return '../../' + file + rest
    if file == 'blog.html':
        return '../blog.html' + rest
    if file.startswith('blog/'):
        return file[5:] + rest
    if file in PORTED:
        return '../' + file + rest
    return '../../' + file + rest


def rewrite_article(a):
    # retired page: keep the words, drop the link
    a = re.sub(r'<a\b[^>]*href="/partner\.html[^"]*"[^>]*>(.*?)</a>', r'\1', a, flags=re.S)
    # hrefs and srcs
    def sub_attr(m):
        return m.group(1) + rewrite_path(m.group(2)) + '"'
    a = re.sub(r'((?:href|src|poster)=")([^"]*)"', sub_attr, a)
    # inline styles: blog.css takes over
    a = re.sub(r'\s+style="[^"]*"', '', a)
    # the posts' own inner footers / footer-logos, if any slipped inside the wrap
    a = re.sub(r'<div class="article-footer">.*?</div>\s*</div>', '', a, flags=re.S)
    return a


class Words(HTMLParser):
    def __init__(self):
        super().__init__()
        self.t = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self.skip -= 1

    def handle_data(self, d):
        if not self.skip:
            self.t.append(d)


def words(s):
    w = Words()
    w.feed(s)
    return re.findall(r"[A-Za-z0-9$%.'&;™-]+", htmlmod.unescape(' '.join(w.t)))


def extract_article(body):
    """Return the inner HTML of <div class="article-wrap">, balanced on div nesting, footer excluded."""
    start = body.index('<div class="article-wrap">') + len('<div class="article-wrap">')
    depth, i = 1, start
    tag = re.compile(r'<(/?)div\b', re.S)
    while depth:
        m = tag.search(body, i)
        if not m:
            raise ValueError('unbalanced article-wrap')
        depth += -1 if m.group(1) else 1
        i = m.end()
    inner = body[start:m.start()]
    return inner.split('<footer')[0]


os.makedirs(os.path.join(NEXT, 'blog'), exist_ok=True)
for name in names:
    src = open(os.path.join(LIVE, 'blog', name + '.html'), encoding='utf-8').read()
    head = '\n'.join('  ' + h.strip() for h in HEAD_KEEP.findall(src))
    body = re.search(r'<body[^>]*>(.*)</body>', src, re.S).group(1)
    article = rewrite_article(extract_article(body))
    is_local = name.startswith('ghost-local-')
    out = SHELL.format(head=head, product='local' if is_local else 'cloud', variant=' data-variant="local"' if is_local else '',
                       article=article, support_q='?platform=local' if is_local else '')
    dst = os.path.join(NEXT, 'blog', name + '.html')
    open(dst, 'w', encoding='utf-8').write(out)
    lw, nw = words(src), words(out)
    miss = Counter(lw) - Counter(nw)
    print('%-46s live %5d new %5d ratio %.3f  missing: %s' % (name, len(lw), len(nw), len(nw) / max(1, len(lw)),
          ' '.join('%s×%d' % kv for kv in miss.most_common(8)) or '-'))
