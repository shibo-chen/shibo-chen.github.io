// Home-page hero background: "silicon to open water".
//   Top:    a faint 2D-mesh NoC with XY-routed packets. The mesh fades out
//           toward the water. Now and then a packet runs off the bottom row
//           and drops into the water as a ripple.
//   Bottom: layered waves and a small swimmer doing freestyle.
// Colors come from CSS variables (--mesh-node, --mesh-link, --accent,
// --primary). With prefers-reduced-motion the scene is one static frame.
// The animation pauses when the hero is off screen or the tab is hidden.
(function () {
  "use strict";
  var canvas = document.querySelector(".noc-mesh");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PITCH = 56, SPEED = 0.055, MAX_PACKETS = 10, TRAIL = 6, WATER = 92;
  var w = 0, h = 0, cols = 0, rows = 0, ox = 0, oy = 0, sea = 0;
  var textLeft = 0, textRight = 0, colors = {};
  var packets = [], drops = [], ripples = [], now = 0, last = 0, raf = 0, visible = true;
  var swimmer = { x: 0, dir: 1 };

  function readColors() {
    var s = getComputedStyle(document.documentElement);
    colors.node = s.getPropertyValue("--mesh-node").trim() || "rgba(0,0,0,.16)";
    colors.link = s.getPropertyValue("--mesh-link").trim() || "rgba(0,0,0,.07)";
    colors.accent = s.getPropertyValue("--accent").trim() || "#b5532a";
    colors.ink = s.getPropertyValue("--primary").trim() || "#1e1e1e";
  }

  function layout() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sea = h - WATER;
    cols = Math.max(3, Math.floor(w / PITCH) + 1);
    rows = Math.max(2, Math.floor((sea - 24) / PITCH) + 1);
    ox = (w - (cols - 1) * PITCH) / 2; oy = 24;
    var text = document.querySelector(".hero-text");
    if (text) { var tr = text.getBoundingClientRect(); textLeft = tr.left - r.left - 24; textRight = tr.right - r.left + 24; }
    swimmer.x = w * 0.72;
    packets = []; drops = []; ripples = [];
  }

  // Lower alpha behind the hero text, and fade the mesh toward the water.
  function fadeX(px) {
    if (w < 900) return 0.45;
    if (px > textLeft && px < textRight) return 0.3;
    var d = px < textLeft ? textLeft - px : px - textRight;
    return Math.min(1, 0.3 + d / 140);
  }
  function fadeY(py) { return Math.max(0, Math.min(1, (sea - 8 - py) / (sea * 0.55))); }
  function pos(x, y) { return [ox + x * PITCH, oy + y * PITCH]; }

  function route(sx, sy, dx, dy) {
    var hops = [[sx, sy]], x = sx, y = sy;
    while (x !== dx) { x += x < dx ? 1 : -1; hops.push([x, y]); }
    while (y !== dy) { y += y < dy ? 1 : -1; hops.push([x, y]); }
    return hops;
  }

  function spawn() {
    var sx = Math.floor(Math.random() * cols), sy = Math.floor(Math.random() * rows);
    var toSea = Math.random() < 0.25;
    var dx = Math.floor(Math.random() * cols), dy = toSea ? rows - 1 : Math.floor(Math.random() * rows);
    if (sx === dx && sy === dy) return;
    packets.push({ hops: route(sx, sy, dx, dy), t: 0, trail: [], toSea: toSea });
  }

  // Wave height at x for layer k (0 = back, 2 = front).
  function wave(x, k) {
    var t = now / 1000, base = sea + 18 + k * 20;
    var a = 5 + k * 2.5, l = 210 - k * 35, s = 0.5 + k * 0.25;
    return base + Math.sin(x / l * 2 * Math.PI + t * s + k) * a + Math.sin(x / (l * 0.47) + t * s * 1.7) * a * 0.35;
  }

  function drawMesh() {
    ctx.lineWidth = 1;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var p = pos(x, y), a = fadeX(p[0]) * fadeY(p[1]);
      if (a <= 0.01) continue;
      ctx.globalAlpha = a; ctx.strokeStyle = colors.link; ctx.beginPath();
      if (x + 1 < cols) { ctx.moveTo(p[0] + 3, p[1]); ctx.lineTo(p[0] + PITCH - 3, p[1]); }
      if (y + 1 < rows) { ctx.moveTo(p[0], p[1] + 3); ctx.lineTo(p[0], p[1] + PITCH - 3); }
      ctx.stroke();
      ctx.fillStyle = colors.node; ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6);
    }
  }

  function drawPackets() {
    ctx.fillStyle = colors.accent;
    var all = packets.concat(drops);
    for (var k = 0; k < all.length; k++) {
      var tr = all[k].trail;
      for (var m = 0; m < tr.length; m++) {
        ctx.globalAlpha = (m + 1) / tr.length * 0.9 * fadeX(tr[m][0]) * Math.max(0.35, fadeY(tr[m][1]));
        ctx.beginPath(); ctx.arc(tr[m][0], tr[m][1], 1.3 + 1.7 * (m + 1) / tr.length, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawWater() {
    for (var k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(0, h);
      for (var x = 0; x <= w + 8; x += 8) ctx.lineTo(x, wave(x, k));
      ctx.lineTo(w, h); ctx.closePath();
      var g = ctx.createLinearGradient(0, sea, 0, h);
      g.addColorStop(0, colors.ink); g.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.035 + k * 0.02; ctx.fillStyle = g; ctx.fill();
      ctx.globalAlpha = k === 2 ? 0.6 : 0.14; ctx.strokeStyle = k === 2 ? colors.accent : colors.ink; ctx.lineWidth = k === 2 ? 1.6 : 1;
      ctx.beginPath();
      for (x = 0; x <= w + 8; x += 8) { var y = wave(x, k); if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    }
    for (var r = 0; r < ripples.length; r++) {
      var rp = ripples[r], age = (now - rp.t) / 1200;
      ctx.globalAlpha = (1 - age) * 0.6; ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(rp.x, wave(rp.x, 0), 4 + age * 26, 1.5 + age * 5, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // A small freestyle swimmer on the front wave.
  function drawSwimmer() {
    var x = swimmer.x, y = wave(x, 2) - 1, d = swimmer.dir, t = now / 1000;
    var slope = (wave(x + 6, 2) - wave(x - 6, 2)) / 12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan(slope)); ctx.scale(1.7 * d, 1.7);
    ctx.globalAlpha = 0.85; ctx.strokeStyle = colors.ink; ctx.fillStyle = colors.ink; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(0, 1); ctx.stroke();      // body, under water
    ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(4, -2, 3.6, 0, Math.PI * 2); ctx.fill();           // head
    var arm = t * 5.5;                                                                                  // stroke cycle
    ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(-1 + Math.cos(arm) * 11, -Math.abs(Math.sin(arm)) * 9); ctx.stroke();
    ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(-1 + Math.cos(arm + Math.PI) * 9, 3); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.fillStyle = colors.accent;                                               // kick splash
    for (var i = 0; i < 3; i++) { var s = (t * 3 + i * 0.33) % 1; ctx.beginPath(); ctx.arc(-16 - s * 8, -s * 4 + i, 1.1 * (1 - s), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function step(dt) {
    if (packets.length < MAX_PACKETS && Math.random() < 0.05) spawn();
    var k, p, i, a, b, f;
    for (k = packets.length - 1; k >= 0; k--) {
      p = packets[k]; p.t += SPEED * dt / 16; i = Math.floor(p.t);
      if (i >= p.hops.length - 1) {
        packets.splice(k, 1);
        if (p.toSea) { var e = pos(p.hops[p.hops.length - 1][0], rows - 1); drops.push({ x: e[0], y: e[1], v: 0.05, trail: [] }); }
        continue;
      }
      a = pos(p.hops[i][0], p.hops[i][1]); b = pos(p.hops[i + 1][0], p.hops[i + 1][1]); f = p.t - i;
      p.trail.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      if (p.trail.length > TRAIL) p.trail.shift();
    }
    for (k = drops.length - 1; k >= 0; k--) {               // fall into the sea
      p = drops[k]; p.v += 0.0009 * dt; p.y += p.v * dt;
      p.trail.push([p.x, p.y]); if (p.trail.length > TRAIL) p.trail.shift();
      if (p.y >= wave(p.x, 0)) { ripples.push({ x: p.x, t: now }); drops.splice(k, 1); }
    }
    for (k = ripples.length - 1; k >= 0; k--) if (now - ripples[k].t > 1200) ripples.splice(k, 1);
    swimmer.x += swimmer.dir * 0.022 * dt;
    if (swimmer.x > w + 30) swimmer.x = -30;
  }

  function draw() { ctx.clearRect(0, 0, w, h); drawMesh(); drawPackets(); drawWater(); drawSwimmer(); }

  function frame(ts) {
    var dt = last ? Math.min(ts - last, 50) : 16; last = ts; now = ts;
    step(dt); draw();
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  function start() { if (!raf && !reduce && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

  readColors(); layout();
  if (reduce) { now = 0; draw(); } else { for (var n = 0; n < 5; n++) spawn(); start(); }
  window.addEventListener("resize", function () { layout(); if (reduce) draw(); });
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(canvas);
  new MutationObserver(function () { readColors(); if (reduce) draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
