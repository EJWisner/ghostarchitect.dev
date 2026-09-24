/* ============================================================================
   GHOST ARCHITECT™ — the codebase as a world
   ----------------------------------------------------------------------------
   One continuous WebGL scene behind the homepage. A lattice of modules (points)
   and dependencies (hairline edges). Scroll position drives a single timeline T:

     0 → 1   hero        slow dolly, the lattice at rest, breathing blue
     1 → 2   sweep       a plane of light crosses the lattice; nodes settle to
                         teal / amber / red as it passes
     2 → 3   blast       a ripple leaves one red node and runs the edges outward,
                         camera orbits the finding
     3 → 4   enclosure   a glass box closes around the whole world; nothing
                         crosses the wall
     4 → 5   report      the lattice untangles into sorted rows: red, amber, teal

   Source of truth: next/src/scene.js.  Bundle: next/scene.js  (see build.sh).
   The bundle is a plain script, not an ES module, so the page also runs when
   index.html is opened straight from the folder over file://.
   Shot script: next/SHOTLIST.md.
   ============================================================================ */

import * as THREE from 'three';

// Colours are authored as display values; no colour-space conversion anywhere.
THREE.ColorManagement.enabled = false;

const canvas = document.getElementById('lattice');
const html = document.documentElement;

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

if (!canvas || !webglOK()) {
  html.classList.add('no-webgl');
  if (canvas) canvas.remove();
} else {
  start();
}

function start() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small  = matchMedia('(max-width: 720px)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  // <canvas data-variant="local">: Local's cyan accent, and the building is there from the first frame,
  // because on the Local page the world is enclosed before anything else is said about it.
  const isLocal = canvas.dataset.variant === 'local';
  // <canvas data-ambient>: a content page. No chapters, the world at rest, further away and quieter,
  // so it reads as atmosphere under long copy rather than as the subject of the page.
  const ambient = canvas.hasAttribute('data-ambient');

  /* ---------- deterministic randomness: the same world on every visit ---------- */
  let seed = 20260924;
  const rnd = () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rnd();
    while (!v) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * v);
  };
  const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;
  const smooth  = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const lerp    = (a, b, t) => a + (b - a) * t;

  /* ---------- palette ---------- */
  const C_IDLE  = new THREE.Color(isLocal ? '#2fb4dc' : '#4a9eff');
  const C_TEAL  = new THREE.Color('#00d4aa');
  const C_AMBER = new THREE.Color('#ffaa00');
  const C_RED   = new THREE.Color('#ff4a6b');
  const OUTCOME = [C_TEAL, C_AMBER, C_RED];

  /* ---------- the lattice ---------- */
  const N  = small ? 1000 : 2600;   // modules
  const CL = small ? 18 : 36;       // clusters (packages, services, apps)

  const centers = [];
  for (let i = 0; i < CL; i++) {
    centers.push(new THREE.Vector3((rnd() - 0.5) * 32, (rnd() - 0.5) * 8, (rnd() - 0.5) * 18 - 3));
  }

  const p0      = new Float32Array(N * 3);   // resting positions
  const cluster = new Uint16Array(N);
  const weights = centers.map(() => 0.4 + rnd());
  const wsum    = weights.reduce((a, b) => a + b, 0);
  let idx = 0;
  for (let c = 0; c < CL && idx < N; c++) {
    const n  = c === CL - 1 ? N - idx : Math.round(N * weights[c] / wsum);
    const sx = 0.9 + rnd() * 1.3, sz = 0.9 + rnd() * 1.3;
    const layers = 2 + Math.floor(rnd() * 4);          // floors: the structure reads as architecture
    for (let k = 0; k < n && idx < N; k++) {
      const layer = Math.floor(rnd() * layers);
      p0[idx * 3]     = centers[c].x + gauss() * sx;
      p0[idx * 3 + 1] = centers[c].y + (layer - (layers - 1) / 2) * 0.55 + gauss() * 0.04;
      p0[idx * 3 + 2] = centers[c].z + gauss() * sz;
      cluster[idx] = c;
      idx++;
    }
  }

  // Edges: two nearest neighbours inside a cluster, a few bridges between near clusters.
  const members = Array.from({ length: CL }, () => []);
  for (let i = 0; i < N; i++) members[cluster[i]].push(i);

  const edgeKeys = new Set();
  const edges = [];
  const bridgeFlag = [];          // 1 for a cross-cluster bridge (drawn fainter)
  const addEdge = (a, b, bridge) => {
    if (a === b) return;
    const key = a < b ? a * N + b : b * N + a;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key); edges.push(a, b); bridgeFlag.push(bridge ? 1 : 0);
  };
  const d2 = (a, b) => {
    const dx = p0[a * 3] - p0[b * 3], dy = p0[a * 3 + 1] - p0[b * 3 + 1], dz = p0[a * 3 + 2] - p0[b * 3 + 2];
    return dx * dx + dy * dy + dz * dz;
  };
  for (const list of members) {
    for (const a of list) {
      let b1 = -1, b2 = -1, d1 = 1e9, d2b = 1e9;
      for (const b of list) {
        if (b === a) continue;
        const d = d2(a, b);
        if (d < d1) { d2b = d1; b2 = b1; d1 = d; b1 = b; }
        else if (d < d2b) { d2b = d; b2 = b; }
      }
      if (b1 >= 0) addEdge(a, b1);
      if (b2 >= 0 && rnd() < 0.7) addEdge(a, b2);
    }
  }
  for (let c = 0; c < CL; c++) {
    const near = centers.map((v, i) => [i, v.distanceToSquared(centers[c])])
      .filter(([i]) => i !== c).sort((a, b) => a[1] - b[1]).slice(0, 2);
    near.forEach(([o], rank) => {
      if (rank === 1 && rnd() < 0.5) return;          // the second-nearest cluster only half the time
      let best = -1, bestB = -1, bd = 1e9;
      for (let s = 0; s < 14; s++) {                   // the closest pair we can find: short bridges, not long spokes
        const a = members[c][Math.floor(rnd() * members[c].length)];
        const b = members[o][Math.floor(rnd() * members[o].length)];
        if (a === undefined || b === undefined) continue;
        const d = d2(a, b);
        if (d < bd) { bd = d; best = a; bestB = b; }
      }
      if (best >= 0) addEdge(best, bestB, true);
    });
  }
  const E = edges.length / 2;

  const degree = new Uint8Array(N);
  const adj = Array.from({ length: N }, () => []);
  for (let e = 0; e < E; e++) {
    const a = edges[e * 2], b = edges[e * 2 + 1];
    degree[a]++; degree[b]++; adj[a].push(b); adj[b].push(a);
  }

  /* ---------- outcomes: what the scan will find ---------- */
  const outcome = new Uint8Array(N);   // 0 teal, 1 amber, 2 red
  // The hub: the node near the middle of the world whose change would touch the most files
  // within a few hops. The ripple starts here.
  const RIPPLE_MAX = 10;
  const reachFrom = (s) => {
    const seen = new Int16Array(N).fill(-1); seen[s] = 0;
    const q = [s]; let n = 0;
    for (let h = 0; h < q.length; h++) {
      const a = q[h]; if (seen[a] >= RIPPLE_MAX) continue;
      for (const b of adj[a]) if (seen[b] < 0) { seen[b] = seen[a] + 1; q.push(b); n++; }
    }
    return n;
  };
  let hub = 0, hubScore = -1;
  for (let i = 0; i < N; i++) {
    const x = p0[i * 3], z = p0[i * 3 + 2];
    if (Math.abs(x) > 7 || Math.abs(z + 3) > 6 || degree[i] < 3) continue;
    const s = reachFrom(i) + rnd() * 0.5;
    if (s > hubScore) { hubScore = s; hub = i; }
  }
  outcome[hub] = 2;
  // Two more reds, far from the hub and from each other.
  const reds = [hub];
  for (let r = 0; r < 2; r++) {
    let pick = -1, ps = -1;
    for (let i = 0; i < N; i++) {
      if (outcome[i] === 2 || degree[i] < 2) continue;
      let minD = 1e9;
      for (const q of reds) minD = Math.min(minD, d2(i, q));
      const s = Math.min(minD, 140) + degree[i] * 4 + rnd();
      if (s > ps) { ps = s; pick = i; }
    }
    if (pick >= 0) { outcome[pick] = 2; reds.push(pick); }
  }
  for (let i = 0; i < N; i++) if (outcome[i] === 0 && rnd() < 0.06) outcome[i] = 1;

  // Blast Radius™: hops from the hub along the edges.
  const depth = new Int16Array(N).fill(-1);
  {
    const q = [hub]; depth[hub] = 0;
    for (let h = 0; h < q.length; h++) {
      const a = q[h];
      for (const b of adj[a]) if (depth[b] < 0) { depth[b] = depth[a] + 1; q.push(b); }
    }
  }

  /* ---------- the report: resting positions sorted into rows ---------- */
  const order = Array.from({ length: N }, (_, i) => i).sort((a, b) =>
    (outcome[b] - outcome[a]) || (cluster[a] - cluster[b]) || (p0[a * 3] - p0[b * 3]));
  const perRow = small ? 32 : 64;
  const rows   = Math.ceil(N / perRow);
  const dx = small ? 0.24 : 0.2, dy = 0.3;
  const p1 = new Float32Array(N * 3);
  order.forEach((i, k) => {
    const row = Math.floor(k / perRow), col = k % perRow;
    p1[i * 3]     = (col - (perRow - 1) / 2) * dx + (rnd() - 0.5) * 0.02;
    p1[i * 3 + 1] = ((rows - 1) / 2 - row) * dy + (rnd() - 0.5) * 0.02;
    p1[i * 3 + 2] = (rnd() - 0.5) * 0.05;
  });

  /* ---------- per-node statics ---------- */
  const size   = new Float32Array(N);
  const phase  = new Float32Array(N);
  const bright = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    phase[i]  = rnd() * 6.283;
    bright[i] = rnd() < 0.08 ? 1 : 0;
    size[i]   = (0.15 + rnd() * 0.1) * (bright[i] ? 1.8 : 1) * (outcome[i] === 2 ? 2.6 : 1);
  }

  /* ---------- bounds ---------- */
  const bmin = new THREE.Vector3(1e9, 1e9, 1e9), bmax = new THREE.Vector3(-1e9, -1e9, -1e9);
  for (let i = 0; i < N; i++) {
    bmin.x = Math.min(bmin.x, p0[i * 3]); bmax.x = Math.max(bmax.x, p0[i * 3]);
    bmin.y = Math.min(bmin.y, p0[i * 3 + 1]); bmax.y = Math.max(bmax.y, p0[i * 3 + 1]);
    bmin.z = Math.min(bmin.z, p0[i * 3 + 2]); bmax.z = Math.max(bmax.z, p0[i * 3 + 2]);
  }
  const H = new THREE.Vector3(p0[hub * 3], p0[hub * 3 + 1], p0[hub * 3 + 2]);

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x0a0a0f, 1);
  const DPR = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
  renderer.setPixelRatio(DPR);

  const scene  = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0f, 8, 50);        // dims the edges with distance; points fade in their own shader
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 220);

  /* ---------- points ---------- */
  const pos = new Float32Array(p0);
  const col = new Float32Array(N * 3);
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  pgeo.setAttribute('aColor',   new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  pgeo.setAttribute('aSize',    new THREE.BufferAttribute(size, 1));
  pgeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -3), 60);

  const pmat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 600 }, uNear: { value: 2.0 }, uFar: { value: 50 }, uGain: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float aSize; attribute vec3 aColor;
      uniform float uScale, uNear, uFar, uGain;
      varying vec3 vColor; varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float d = -mv.z;
        gl_PointSize = clamp(aSize * uGain * uScale / d, 1.5, 30.0);
        vFade = (1.0 - smoothstep(uFar * 0.35, uFar, d)) * smoothstep(0.0, uNear * 2.5, d);
        vColor = aColor;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vFade;
      void main() {
        vec2 uv = gl_PointCoord - 0.5; float r2 = dot(uv, uv);
        if (r2 > 0.25) discard;
        float a = exp(-r2 * 16.0) * (1.0 - smoothstep(0.18, 0.25, r2));
        gl_FragColor = vec4(vColor * a * vFade, a * vFade);
      }`,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Points(pgeo, pmat));

  /* ---------- edges ---------- */
  const lpos = new Float32Array(E * 6);
  const lcol = new Float32Array(E * 6);
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3).setUsage(THREE.DynamicDrawUsage));
  lgeo.setAttribute('color',    new THREE.BufferAttribute(lcol, 3).setUsage(THREE.DynamicDrawUsage));
  lgeo.boundingSphere = pgeo.boundingSphere;
  const lmat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 1, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending, fog: true,
  });
  scene.add(new THREE.LineSegments(lgeo, lmat));

  /* ---------- the scan plane ---------- */
  const sweepGeo = new THREE.PlaneGeometry(bmax.z - bmin.z + 6, bmax.y - bmin.y + 4);
  sweepGeo.rotateY(Math.PI / 2);
  const sweepMat = new THREE.MeshBasicMaterial({
    color: isLocal ? 0x00bfd8 : 0x4a9eff, transparent: true, opacity: 0, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const sweep = new THREE.Mesh(sweepGeo, sweepMat);
  sweep.position.set(0, (bmin.y + bmax.y) / 2, (bmin.z + bmax.z) / 2);
  sweep.visible = false;
  scene.add(sweep);
  const sweepEdge = new THREE.LineSegments(new THREE.EdgesGeometry(sweepGeo),
    new THREE.LineBasicMaterial({ color: isLocal ? 0x9fecf7 : 0x9ccaff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  sweep.add(sweepEdge);

  /* ---------- the building ---------- */
  const margin = 1.6;
  const boxSize = new THREE.Vector3().subVectors(bmax, bmin).addScalar(margin * 2);
  const boxCenter = new THREE.Vector3().addVectors(bmin, bmax).multiplyScalar(0.5);
  const boxGeo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
  const boxMat = new THREE.MeshBasicMaterial({
    color: 0x4a9eff, transparent: true, opacity: 0, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.copy(boxCenter);
  box.visible = false;
  scene.add(box);
  const boxEdges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo),
    new THREE.LineBasicMaterial({ color: 0x5fb3c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  box.add(boxEdges);

  /* ---------- Local: the hub and its spokes ----------
     Ghost Architect™ Local is an air-gapped estate: one hub holds the model server, the queue and
     the fleet page; spokes are the machines that run scans and report back. Everything stays
     inside the building. On Local pages the world carries that shape from the first frame. */
  let hubGeo = null, spokesMat = null;
  const HUB_C = [0.35, 0.95, 1.0];
  if (isLocal) {
    const hubPos = boxCenter.clone(); hubPos.y += 0.4;
    hubGeo = new THREE.BufferGeometry();
    hubGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([hubPos.x, hubPos.y, hubPos.z]), 3));
    hubGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(HUB_C), 3).setUsage(THREE.DynamicDrawUsage));
    hubGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([1.7]), 1));
    hubGeo.boundingSphere = pgeo.boundingSphere;
    scene.add(new THREE.Points(hubGeo, pmat));
    const near = centers.map((c, i) => [i, c.distanceToSquared(hubPos)]).sort((a, b) => a[1] - b[1]).slice(0, small ? 6 : 10);
    const sp = new Float32Array(near.length * 6);
    near.forEach(([i], k) => { const c = centers[i]; sp.set([hubPos.x, hubPos.y, hubPos.z, c.x, c.y, c.z], k * 6); });
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.boundingSphere = pgeo.boundingSphere;
    spokesMat = new THREE.LineBasicMaterial({ color: 0x00bfd8, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
    scene.add(new THREE.LineSegments(sg, spokesMat));
  }

  /* ---------- camera keyframes at integer T ---------- */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const orbitR = 9.5, a0 = -0.32, a1 = 0.32;
  const KEY = [
    ambient
      ? { p: V(6, 14, 44), l: V(0, -6, -6) }                                     // 0 content pages: wide and quiet, the world low in the frame
      : isLocal
      ? { p: V(4, 12, 40), l: V(0, -3.5, -5) }                                   // 0 hero (Local): a step further back, so the walls of the building are in frame
      : { p: V(0, 9, 26),  l: V(0, -4.4, -5) },                                  // 0 hero: at rest, seen a little from above, the world below the headline
    { p: V(-1.5, 3.4, 22), l: V(-3.4, -0.4, -2) },                               // 1 sweep begins, lattice sits right of centre
    { p: V(H.x + orbitR * Math.sin(a0), H.y + 1.6, H.z + orbitR * Math.cos(a0)), l: V(H.x + 2.6, H.y + 0.1, H.z) }, // 2 blast begins
    { p: V(H.x + orbitR * Math.sin(a1), H.y + 1.2, H.z + orbitR * Math.cos(a1)), l: V(H.x + 2.6, H.y + 0.1, H.z) }, // 3 blast ends
    { p: V(boxCenter.x + 14, boxCenter.y + 13, boxCenter.z + 74), l: V(boxCenter.x, boxCenter.y - 1, boxCenter.z) }, // 4 the building, from outside, two faces visible
    { p: V(3.5, 0.2, 27), l: V(6.2, 0, 0) },                                     // 5 the report, document left, copy right
  ];

  /* ---------- timeline from scroll ---------- */
  const phaseEls = Array.from(document.querySelectorAll('[data-phase]'))
    .sort((a, b) => +a.dataset.phase - +b.dataset.phase);
  function targetT() {
    const vh = window.innerHeight;
    let T = 0;
    for (const el of phaseEls) {
      const r = el.getBoundingClientRect();
      const k = +el.dataset.phase;
      let p;
      if (k === 0) p = clamp01(-(r.top - 60) / (r.height * 0.9));
      else p = clamp01((vh * 0.82 - r.top) / (r.height + vh * 0.42));
      T += p;
    }
    return T;
  }

  /* ---------- pointer parallax ---------- */
  let mx = 0, my = 0, smx = 0, smy = 0;
  if (!coarse && !reduce) {
    window.addEventListener('pointermove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* ---------- resize ---------- */
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    pmat.uniforms.uScale.value = h * DPR * 0.78;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ---------- frame ---------- */
  let T = 0, lastTime = 0, lastU4 = 0, frameNo = 0, lastTt = -1, idleFrames = 0;
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  const cA = new THREE.Color(), cB = new THREE.Color();
  const right = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

  function frame(time) {
    const t  = time * 0.001;
    const dt = Math.min(0.05, Math.max(0.001, t - lastTime));
    lastTime = t;
    frameNo++;

    const Tt = targetT();
    if (Math.abs(Tt - lastTt) < 1e-4 && Math.abs(Tt - T) < 1e-3) idleFrames++; else idleFrames = 0;
    lastTt = Tt;
    // When nothing is happening but the breathing, render at half rate.
    if (!reduce && idleFrames > 30 && (frameNo & 1)) return;

    if (reduce) T = Tt;
    else T += (Tt - T) * (1 - Math.exp(-dt * 2.4));

    const u1 = clamp01(T - 1), u2 = clamp01(T - 2), u3 = clamp01(T - 3), u4 = clamp01(T - 4);
    const e4 = smooth(u4);

    // sweep plane position
    const xs = lerp(bmin.x - 2.5, bmax.x + 2.5, smooth(u1));
    const sweepOn = u1 > 0 && u1 < 1;
    sweep.visible = sweepOn;
    if (sweepOn) {
      sweep.position.x = xs;
      const fade = Math.pow(Math.sin(Math.PI * u1), 0.5);
      sweepMat.opacity = 0.06 * fade;
      sweepEdge.material.opacity = 0.5 * fade;
    }

    // building (on the Local page it is there from the start, and strengthens for its own chapter)
    const far3 = smooth(u3 / 0.6);
    const bo = Math.max(far3, isLocal ? 0.55 : 0) * (1 - smooth(u4 / 0.5));
    box.visible = bo > 0.001;
    boxMat.opacity = 0.03 * bo;
    boxEdges.material.opacity = 0.7 * bo;
    // the camera is far away for the building shot: let the world stay visible out there
    const farDist = lerp(ambient ? 96 : isLocal ? 80 : 68, 130, far3);
    pmat.uniforms.uFar.value = farDist;
    scene.fog.far = farDist;
    scene.fog.near = lerp(10, 30, far3);
    pmat.uniforms.uGain.value = 1 + 1.9 * far3 * (1 - e4) + 0.35 * e4;
    const farLight = 1 + 0.9 * far3 * (1 - e4);

    // Local hub: a slow pulse, and it steps aside with the edges when the report forms
    if (hubGeo) {
      const pulse = (0.8 + 0.25 * Math.sin(t * 1.1) * (reduce ? 0 : 1)) * (1 - e4);
      const a = hubGeo.attributes.aColor.array;
      a[0] = HUB_C[0] * pulse; a[1] = HUB_C[1] * pulse; a[2] = HUB_C[2] * pulse;
      hubGeo.attributes.aColor.needsUpdate = true;
      spokesMat.opacity = 0.22 * (1 - e4) * (0.85 + 0.15 * Math.sin(t * 1.1));
    }

    // ripple radius, in hops
    const R = u2 * (RIPPLE_MAX + 3) - 1.5;
    const blastDim = smooth(u2 / 0.25) * (1 - smooth(u3 / 0.6));
    const calm = smooth(u3 / 0.7);
    const breathe = reduce ? 0 : 1;

    // morph resting → report
    const morphing = u4 > 0 || lastU4 > 0;
    if (morphing) {
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        pos[j]     = lerp(p0[j],     p1[j],     e4);
        pos[j + 1] = lerp(p0[j + 1], p1[j + 1], e4);
        pos[j + 2] = lerp(p0[j + 2], p1[j + 2], e4);
      }
      pgeo.attributes.position.needsUpdate = true;
    }
    lastU4 = u4;

    // colours
    const restGain = ambient ? 0.62 : 1;
    for (let i = 0; i < N; i++) {
      const j = i * 3;
      const x = p0[j];
      const b = (0.58 + 0.22 * Math.sin(t * 0.9 + phase[i]) * breathe + (bright[i] ? 0.5 : 0)) * restGain;
      let r = C_IDLE.r * b, g = C_IDLE.g * b, bl = C_IDLE.b * b;

      // sweep: behind the plane, nodes settle to their outcome, with a flicker as the plane passes
      const d = xs - x;
      if (u1 > 0 && d > 0) {
        const f = Math.exp(-d * 1.4);
        const oc = OUTCOME[outcome[i]];
        const k = (outcome[i] === 0 ? 0.62 : 0.95) + (bright[i] ? 0.3 : 0) + 1.1 * f;
        r = oc.r * k + f * 0.45; g = oc.g * k + f * 0.45; bl = oc.b * k + f * 0.45;
      }

      // blast: the ripple lights the connected nodes amber; everything else steps back
      if (blastDim > 0) {
        const dp = depth[i];
        let lit = 0;
        if (dp >= 0 && dp <= RIPPLE_MAX && R >= dp) {
          const ring = Math.exp(-((R - dp) * (R - dp)) / 0.7);
          lit = Math.min(1, 0.7 + ring * 0.9) * (1 - dp / (RIPPLE_MAX + 5));
        }
        const dim = 1 - 0.66 * blastDim;
        let rr = r * dim, gg = g * dim, bb = bl * dim;
        if (lit > 0) {
          const w = lit * blastDim;
          rr = lerp(rr, C_AMBER.r * 1.35, w); gg = lerp(gg, C_AMBER.g * 1.35, w); bb = lerp(bb, C_AMBER.b * 1.35, w);
        }
        if (i === hub) { rr = C_RED.r * 1.6; gg = C_RED.g * 1.6; bb = C_RED.b * 1.6; }
        r = rr; g = gg; bl = bb;
      }

      // enclosure: the world settles back to a calm, examined state
      if (calm > 0) {
        const oc = OUTCOME[outcome[i]];
        const cb = (0.42 + 0.18 * Math.sin(t * 0.6 + phase[i]) * breathe + (bright[i] ? 0.35 : 0)) * farLight;
        const tr = lerp(C_IDLE.r, oc.r, 0.55) * cb, tg = lerp(C_IDLE.g, oc.g, 0.55) * cb, tb = lerp(C_IDLE.b, oc.b, 0.55) * cb;
        r = lerp(r, outcome[i] ? oc.r * cb * 1.6 : tr, calm);
        g = lerp(g, outcome[i] ? oc.g * cb * 1.6 : tg, calm);
        bl = lerp(bl, outcome[i] ? oc.b * cb * 1.6 : tb, calm);
      }

      // report: every row in its severity colour, steady
      if (e4 > 0) {
        const oc = OUTCOME[outcome[i]];
        const k = outcome[i] === 0 ? 0.8 : 1.15;
        r = lerp(r, oc.r * k, e4); g = lerp(g, oc.g * k, e4); bl = lerp(bl, oc.b * k, e4);
      }

      col[j] = r; col[j + 1] = g; col[j + 2] = bl;
    }
    pgeo.attributes.aColor.needsUpdate = true;

    // edges follow their endpoints; they fade as the report forms
    const lmBase = 0.3 * (1 - e4) * restGain;
    for (let e = 0; e < E; e++) {
      const lm = bridgeFlag[e] ? lmBase * 0.5 : lmBase;
      const a = edges[e * 2] * 3, b = edges[e * 2 + 1] * 3, o = e * 6;
      if (morphing) {
        lpos[o] = pos[a]; lpos[o + 1] = pos[a + 1]; lpos[o + 2] = pos[a + 2];
        lpos[o + 3] = pos[b]; lpos[o + 4] = pos[b + 1]; lpos[o + 5] = pos[b + 2];
      }
      lcol[o]     = col[a] * lm;     lcol[o + 1] = col[a + 1] * lm; lcol[o + 2] = col[a + 2] * lm;
      lcol[o + 3] = col[b] * lm;     lcol[o + 4] = col[b + 1] * lm; lcol[o + 5] = col[b + 2] * lm;
    }
    if (morphing || frameNo === 1) lgeo.attributes.position.needsUpdate = true;
    lgeo.attributes.color.needsUpdate = true;

    // camera
    const k = Math.min(4, Math.floor(T)), u = smooth(T - k);
    camPos.lerpVectors(KEY[k].p, KEY[k + 1].p, u);
    camLook.lerpVectors(KEY[k].l, KEY[k + 1].l, u);
    if (!reduce) {
      const hero = 1 - clamp01(T);               // slow drift while the hero is on screen
      camPos.x += Math.sin(t * 0.05) * 0.5 * hero;
      camPos.z += Math.sin(t * 0.08) * 0.6 * hero;
      camPos.y += Math.sin(t * 0.065) * 0.2;
      smx += (mx - smx) * (1 - Math.exp(-dt * 3));
      smy += (my - smy) * (1 - Math.exp(-dt * 3));
      right.subVectors(camLook, camPos).normalize().cross(up).normalize();
      camPos.addScaledVector(right, smx * 0.45).addScaledVector(up, -smy * 0.3);
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    renderer.render(scene, camera);
  }

  // seed the line positions once
  for (let e = 0; e < E; e++) {
    const a = edges[e * 2] * 3, b = edges[e * 2 + 1] * 3, o = e * 6;
    lpos[o] = p0[a]; lpos[o + 1] = p0[a + 1]; lpos[o + 2] = p0[a + 2];
    lpos[o + 3] = p0[b]; lpos[o + 4] = p0[b + 1]; lpos[o + 5] = p0[b + 2];
  }

  renderer.setAnimationLoop(frame);
  document.addEventListener('visibilitychange', () => {
    renderer.setAnimationLoop(document.hidden ? null : frame);
  });

  html.classList.add('has-lattice');

  // A small handle for review: ghostLattice.T() reads the timeline, ghostLattice.stats() the world.
  window.ghostLattice = {
    T: () => T,
    stats: () => ({ nodes: N, edges: E, clusters: CL, hub, reds: reds.length, rippleReach: depth.filter((d) => d >= 0 && d <= RIPPLE_MAX).length }),
  };
}
