// Home-page hero background: "silicon to triathlon".
//   Top:    a faint 2D-mesh NoC with XY-routed packets. Beside the hero text,
//           some routers carry compute tiles: CPU cores on the left (a pipeline
//           that steps when a packet arrives) and AI accelerators on the right
//           (a MAC array that fires a wave). The mesh fades toward the course.
//   Bottom: a triathlon course. Swim in the waves, T1 at the shore, bike on a
//           rolling road, T2, then run on a trail. Three athletes are spread
//           over the course; each loops swim -> bike -> run. Some packets drop
//           off the mesh into the water as ripples.
// Colors come from CSS variables (--mesh-node, --mesh-link, --accent,
// --primary). With prefers-reduced-motion the scene is one static frame.
// The animation pauses when the hero is off screen or the tab is hidden.
(function () {
  "use strict";
  var canvas = document.querySelector(".noc-mesh");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PITCH = 56, TILE = 30, SPEED = 0.055, MAX_PACKETS = 12, TRAIL = 6, COURSE = 96, FLASH_MS = 900;
  var w = 0, h = 0, cols = 0, rows = 0, ox = 0, oy = 0, sea = 0, t1 = 0, t2 = 0;
  var textLeft = 0, textRight = 0, colors = {};
  var nodes = [], packets = [], drops = [], ripples = [], athletes = [];
  var now = 0, last = 0, raf = 0, visible = true;

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
    sea = h - COURSE;
    t1 = w * 0.42; t2 = w * 0.76;                       // transition points
    cols = Math.max(3, Math.floor(w / PITCH) + 1);
    rows = Math.max(2, Math.floor((sea - 24) / PITCH) + 1);
    ox = (w - (cols - 1) * PITCH) / 2; oy = 24;
    var text = document.querySelector(".hero-text");
    if (text) { var tr = text.getBoundingClientRect(); textLeft = tr.left - r.left - 24; textRight = tr.right - r.left + 24; }
    var photo = document.querySelector(".hero-photo");
    if (photo) { var pr = photo.getBoundingClientRect(); textRight = Math.max(textRight, pr.right - r.left + 24); }
    // Compute tiles beside the text: CPUs to the left, AI accelerators to the right.
    nodes = [];
    var narrow = w < 900;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var px = ox + x * PITCH, type = "router";
      var left = narrow ? px < w * 0.3 : px < textLeft - 20;
      var right = narrow ? px > w * 0.7 : px > textRight + 20;
      if (y < rows - 1 && (x + 2 * y) % 3 === 0) type = left ? "cpu" : right ? "ai" : "router";
      nodes.push({ x: x, y: y, type: type, hit: -1e9 });
    }
    // Three athletes spread over the course.
    athletes = [{ s: w * 0.12 }, { s: w * 0.56 }, { s: w * 0.88 }];
    packets = []; drops = []; ripples = [];
  }

  function node(x, y) { return nodes[y * cols + x]; }
  function pos(x, y) { return [ox + x * PITCH, oy + y * PITCH]; }

  // Lower alpha behind the hero text, and fade the mesh toward the course.
  function fadeX(px) {
    if (w < 900) return 0.45;
    if (px > textLeft && px < textRight) return 0.3;
    var d = px < textLeft ? textLeft - px : px - textRight;
    return Math.min(1, 0.3 + d / 140);
  }
  function fadeY(py) { return Math.max(0, Math.min(1, (sea - 8 - py) / (sea * 0.55))); }

  function route(sx, sy, dx, dy) {
    var hops = [[sx, sy]], x = sx, y = sy;
    while (x !== dx) { x += x < dx ? 1 : -1; hops.push([x, y]); }
    while (y !== dy) { y += y < dy ? 1 : -1; hops.push([x, y]); }
    return hops;
  }

  function anyOf(type) {
    var c = nodes.filter(function (n) { return n.type === type; });
    return c.length ? c[Math.floor(Math.random() * c.length)] : null;
  }

  // Traffic: CPU -> AI offload, AI -> AI exchange, AI -> CPU results, some to
  // the sea (bottom row above the swim leg), and some random.
  function spawn() {
    var r = Math.random(), a = null, b = null, toSea = false;
    if (r < 0.3) { a = anyOf("cpu"); b = anyOf("ai"); }
    else if (r < 0.5) { a = anyOf("ai"); b = anyOf("ai"); }
    else if (r < 0.65) { a = anyOf("ai"); b = anyOf("cpu"); }
    else if (r < 0.85) {
      a = node(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows));
      var maxCol = Math.max(0, Math.floor((t1 - 30 - ox) / PITCH));
      b = node(Math.floor(Math.random() * (maxCol + 1)), rows - 1); toSea = true;
    }
    if (!a || !b) { a = node(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)); b = node(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)); }
    if (a === b) return;
    packets.push({ hops: route(a.x, a.y, b.x, b.y), t: 0, trail: [], dst: b, toSea: toSea });
  }

  // ---- Course geometry ----
  function waveY(x, k) {
    var t = now / 1000, base = sea + 18 + k * 20, a = 5 + k * 2.5, l = 210 - k * 35, s = 0.5 + k * 0.25;
    return base + Math.sin(x / l * 2 * Math.PI + t * s + k) * a + Math.sin(x / (l * 0.47) + t * s * 1.7) * a * 0.35;
  }
  function landY(x, k) {
    var base = sea + 22 + k * 20;
    return base - Math.sin((x - t1) / 260 * Math.PI) * (6 + k * 2) - Math.sin(x / 97) * 2;
  }
  // Blend water into land over 50px at T1.
  function surface(x, k) {
    var m = Math.max(0, Math.min(1, (x - t1 + 25) / 50));
    return waveY(x, k) * (1 - m) + landY(x, k) * m;
  }

  function roundRect(x, y, s, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + s, y, x + s, y + s, r); ctx.arcTo(x + s, y + s, x, y + s, r);
    ctx.arcTo(x, y + s, x, y, r); ctx.arcTo(x, y, x + s, y, r); ctx.closePath();
  }

  function drawMesh() {
    ctx.lineWidth = 1;
    var k, n, p, a;
    for (k = 0; k < nodes.length; k++) {
      n = nodes[k]; p = pos(n.x, n.y); a = fadeX(p[0]) * fadeY(p[1]);
      if (a <= 0.01) continue;
      var half = n.type === "router" ? 3 : TILE / 2;
      ctx.globalAlpha = a; ctx.strokeStyle = colors.link; ctx.beginPath();
      if (n.x + 1 < cols) { var nh = node(n.x + 1, n.y).type === "router" ? 3 : TILE / 2; ctx.moveTo(p[0] + half, p[1]); ctx.lineTo(p[0] + PITCH - nh, p[1]); }
      if (n.y + 1 < rows) { var nv = node(n.x, n.y + 1).type === "router" ? 3 : TILE / 2; ctx.moveTo(p[0], p[1] + half); ctx.lineTo(p[0], p[1] + PITCH - nv); }
      ctx.stroke();
      if (n.type === "router") { ctx.fillStyle = colors.node; ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6); continue; }
      var age = now - n.hit, hot = age < FLASH_MS ? 1 - age / FLASH_MS : 0, i, j;
      ctx.strokeStyle = hot > 0 ? colors.accent : colors.node; ctx.lineWidth = hot > 0 ? 1.4 : 1;
      roundRect(p[0] - TILE / 2, p[1] - TILE / 2, TILE, 5); ctx.stroke(); ctx.lineWidth = 1;
      if (n.type === "cpu") {
        var stage = hot > 0 ? Math.floor((1 - hot) * 5) : -1;          // 5-stage pipeline
        for (i = 0; i < 5; i++) { ctx.fillStyle = i === stage ? colors.accent : colors.node; ctx.fillRect(p[0] - 10.5 + i * 4.6, p[1] - 5, 2.8, 10); }
      } else {
        var wave = hot > 0 ? (1 - hot) * 7 : -9;                       // 4x4 MAC array
        for (j = 0; j < 4; j++) for (i = 0; i < 4; i++) {
          ctx.fillStyle = Math.abs(i + j - wave) < 1 ? colors.accent : colors.node;
          ctx.fillRect(p[0] - 8.5 + i * 5, p[1] - 8.5 + j * 5, 2.8, 2.8);
        }
      }
    }
    ctx.globalAlpha = 1;
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

  function drawCourse() {
    var x, k;
    for (k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(0, h);
      for (x = 0; x <= w + 8; x += 8) ctx.lineTo(x, surface(x, k));
      ctx.lineTo(w, h); ctx.closePath();
      var g = ctx.createLinearGradient(0, sea, 0, h);
      g.addColorStop(0, colors.ink); g.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.035 + k * 0.02; ctx.fillStyle = g; ctx.fill();
      if (k < 2) {
        ctx.globalAlpha = 0.14; ctx.strokeStyle = colors.ink; ctx.lineWidth = 1; ctx.beginPath();
        for (x = 0; x <= w + 8; x += 8) { if (x === 0) ctx.moveTo(x, surface(x, k)); else ctx.lineTo(x, surface(x, k)); }
        ctx.stroke();
      }
    }
    // Front line: water (accent) on the swim leg, road on the bike leg, trail on the run leg.
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.6; ctx.strokeStyle = colors.accent; ctx.beginPath();
    for (x = 0; x <= t1; x += 6) { if (x === 0) ctx.moveTo(x, surface(x, 2)); else ctx.lineTo(x, surface(x, 2)); }
    ctx.stroke();
    ctx.globalAlpha = 0.45; ctx.strokeStyle = colors.ink; ctx.beginPath();
    for (x = t1; x <= t2; x += 6) { if (x === t1) ctx.moveTo(x, surface(x, 2)); else ctx.lineTo(x, surface(x, 2)); }
    ctx.stroke();
    ctx.setLineDash([2, 5]); ctx.beginPath();
    for (x = t2; x <= w + 6; x += 6) { if (x === t2) ctx.moveTo(x, surface(x, 2)); else ctx.lineTo(x, surface(x, 2)); }
    ctx.stroke(); ctx.setLineDash([]);
    // T1 and T2 flags.
    [[t1, "T1"], [t2, "T2"]].forEach(function (f) {
      var fx = f[0], fy = surface(fx, 2);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = colors.ink; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 26); ctx.stroke();
      ctx.fillStyle = colors.accent; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.moveTo(fx, fy - 26); ctx.lineTo(fx + 11, fy - 22); ctx.lineTo(fx, fy - 18); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.55; ctx.fillStyle = colors.ink; ctx.font = "500 10px 'IBM Plex Mono', monospace";
      ctx.fillText(f[1], fx + 4, fy - 30);
    });
    for (var r = 0; r < ripples.length; r++) {
      var rp = ripples[r], age = (now - rp.t) / 1200;
      ctx.globalAlpha = (1 - age) * 0.6; ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(rp.x, waveY(rp.x, 0), 4 + age * 26, 1.5 + age * 5, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---- Athletes ----
  function pen(alpha, width) {
    ctx.globalAlpha = alpha; ctx.strokeStyle = colors.ink; ctx.fillStyle = colors.ink;
    ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round";
  }
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

  function drawSwimmer(x) {
    var y = surface(x, 2) - 1, t = now / 1000, slope = (surface(x + 6, 2) - surface(x - 6, 2)) / 12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan(slope)); ctx.scale(1.7, 1.7);
    pen(0.35, 1.6); line(-14, 2, 0, 1);                                     // body, under water
    pen(0.9, 1.6); ctx.beginPath(); ctx.arc(4, -2, 3.6, 0, Math.PI * 2); ctx.fill();
    var arm = t * 5.5;
    line(-1, 0, -1 + Math.cos(arm) * 11, -Math.abs(Math.sin(arm)) * 9);
    pen(0.4, 1.6); line(-1, 1, -1 + Math.cos(arm + Math.PI) * 9, 3);
    ctx.globalAlpha = 0.5; ctx.fillStyle = colors.accent;
    for (var i = 0; i < 3; i++) { var s = (t * 3 + i * 0.33) % 1; ctx.beginPath(); ctx.arc(-16 - s * 8, -s * 4 + i, 1.1 * (1 - s), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function drawCyclist(x) {
    var y = surface(x, 2), t = now / 1000, slope = (surface(x + 8, 2) - surface(x - 8, 2)) / 16;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan(slope)); ctx.scale(1.25, 1.25);
    var R = 6.5, crank = t * 9;
    pen(0.85, 1.5);
    [[-10, -R], [10, -R]].forEach(function (c) {                            // wheels with a turning spoke
      ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, Math.PI * 2); ctx.stroke();
      line(c[0], c[1], c[0] + Math.cos(crank) * R, c[1] + Math.sin(crank) * R);
    });
    line(-10, -R, -1, -R); line(-1, -R, 5, -15); line(-4, -15, 7, -15); line(7, -15, 10, -R); line(-1, -R, -4, -15);  // frame
    line(7, -15, 9, -18);                                                    // bars
    var hip = [-3, -17], sh = [5, -24];
    line(hip[0], hip[1], sh[0], sh[1]); line(sh[0], sh[1], 9, -18);          // torso, arms
    ctx.beginPath(); ctx.arc(8, -27, 3.2, 0, Math.PI * 2); ctx.fill();        // head
    var pa = [-1 + Math.cos(crank) * 4, -R + Math.sin(crank) * 4], pb = [-1 - Math.cos(crank) * 4, -R - Math.sin(crank) * 4];
    line(hip[0], hip[1], (hip[0] + pa[0]) / 2 + 3, (hip[1] + pa[1]) / 2); line((hip[0] + pa[0]) / 2 + 3, (hip[1] + pa[1]) / 2, pa[0], pa[1]);
    pen(0.4, 1.5);
    line(hip[0], hip[1], (hip[0] + pb[0]) / 2 + 3, (hip[1] + pb[1]) / 2); line((hip[0] + pb[0]) / 2 + 3, (hip[1] + pb[1]) / 2, pb[0], pb[1]);
    ctx.restore();
  }

  function drawRunner(x) {
    var y = surface(x, 2), t = now / 1000, ph = t * 8;
    ctx.save(); ctx.translate(x, y); ctx.scale(1.25, 1.25);
    var bob = Math.abs(Math.sin(ph)) * 1.5, hip = [0, -13 - bob], sh = [2, -23 - bob];
    function limb(ax, ay, ang, l1, l2, bend) {
      var kx = ax + Math.sin(ang) * l1, ky = ay + Math.cos(ang) * l1;
      line(ax, ay, kx, ky); line(kx, ky, kx + Math.sin(ang + bend) * l2, ky + Math.cos(ang + bend) * l2);
    }
    pen(0.4, 1.6);
    limb(hip[0], hip[1], -Math.sin(ph) * 0.7, 7, 7, -0.6);                   // far leg
    limb(sh[0], sh[1], Math.sin(ph) * 0.8, 5, 5, 1.2);                       // far arm
    pen(0.85, 1.6);
    limb(hip[0], hip[1], Math.sin(ph) * 0.7, 7, 7, -0.6);                    // near leg
    line(hip[0], hip[1], sh[0], sh[1]);                                      // torso
    limb(sh[0], sh[1], -Math.sin(ph) * 0.8, 5, 5, 1.2);                      // near arm
    ctx.beginPath(); ctx.arc(3.5, -27.5 - bob, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawAthletes() {
    for (var i = 0; i < athletes.length; i++) {
      var s = athletes[i].s;
      if (s < t1 - 8) drawSwimmer(s); else if (s < t2) drawCyclist(s); else drawRunner(s);
    }
    ctx.globalAlpha = 1;
  }

  function step(dt) {
    if (packets.length < MAX_PACKETS && Math.random() < 0.06) spawn();
    var k, p, i, a, b, f;
    for (k = packets.length - 1; k >= 0; k--) {
      p = packets[k]; p.t += SPEED * dt / 16; i = Math.floor(p.t);
      if (i >= p.hops.length - 1) {
        packets.splice(k, 1); p.dst.hit = now;
        if (p.toSea) { var e = pos(p.dst.x, rows - 1); drops.push({ x: e[0], y: e[1], v: 0.05, trail: [] }); }
        continue;
      }
      a = pos(p.hops[i][0], p.hops[i][1]); b = pos(p.hops[i + 1][0], p.hops[i + 1][1]); f = p.t - i;
      p.trail.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      if (p.trail.length > TRAIL) p.trail.shift();
    }
    for (k = drops.length - 1; k >= 0; k--) {
      p = drops[k]; p.v += 0.0009 * dt; p.y += p.v * dt;
      p.trail.push([p.x, p.y]); if (p.trail.length > TRAIL) p.trail.shift();
      if (p.y >= surface(p.x, 0)) { if (p.x < t1) ripples.push({ x: p.x, t: now }); drops.splice(k, 1); }
    }
    for (k = ripples.length - 1; k >= 0; k--) if (now - ripples[k].t > 1200) ripples.splice(k, 1);
    for (k = 0; k < athletes.length; k++) {                  // swim slow, bike fast, run between
      var s = athletes[k].s, v = s < t1 ? 0.02 : s < t2 ? 0.055 : 0.032;
      athletes[k].s = s + v * dt;
      if (athletes[k].s > w + 30) athletes[k].s = -20;
    }
  }

  function draw() { ctx.clearRect(0, 0, w, h); drawMesh(); drawPackets(); drawCourse(); drawAthletes(); }

  function frame(ts) {
    var dt = last ? Math.min(ts - last, 50) : 16; last = ts; now = ts;
    step(dt); draw();
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  function start() { if (!raf && !reduce && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

  readColors(); layout();
  if (reduce) { now = 0; draw(); } else { for (var n = 0; n < 6; n++) spawn(); start(); }
  window.addEventListener("resize", function () { layout(); if (reduce) draw(); });
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(canvas);
  new MutationObserver(function () { readColors(); if (reduce) draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
