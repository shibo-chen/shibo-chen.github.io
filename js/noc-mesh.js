// Home-page hero background: a 2D-mesh NoC with XY-routed packets.
// Colors come from CSS variables (--mesh-node, --mesh-link, --accent), so the
// mesh follows the light and dark themes. With prefers-reduced-motion it draws
// one static frame. It pauses when the hero is off screen or the tab is hidden.
(function () {
  "use strict";
  var canvas = document.querySelector(".noc-mesh");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PITCH = 56, SPEED = 0.06, MAX_PACKETS = 14, TRAIL = 6;
  var cols = 0, rows = 0, ox = 0, oy = 0, w = 0, h = 0, colors = {};
  var packets = [], visible = true, last = 0, raf = 0;

  function readColors() {
    var s = getComputedStyle(document.documentElement);
    colors.node = s.getPropertyValue("--mesh-node").trim() || "rgba(0,0,0,.15)";
    colors.link = s.getPropertyValue("--mesh-link").trim() || "rgba(0,0,0,.06)";
    colors.pkt = s.getPropertyValue("--accent").trim() || "#b5532a";
  }

  function resize() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(2, Math.floor(w / PITCH) + 1); rows = Math.max(2, Math.floor(h / PITCH) + 1);
    ox = (w - (cols - 1) * PITCH) / 2; oy = (h - (rows - 1) * PITCH) / 2;
    packets = [];
  }

  function pos(x, y) { return [ox + x * PITCH, oy + y * PITCH]; }

  // XY routing: move along X to the destination column, then along Y.
  function route(sx, sy, dx, dy) {
    var hops = [[sx, sy]], x = sx, y = sy;
    while (x !== dx) { x += x < dx ? 1 : -1; hops.push([x, y]); }
    while (y !== dy) { y += y < dy ? 1 : -1; hops.push([x, y]); }
    return hops;
  }

  function spawn() {
    var sx = Math.floor(Math.random() * cols), sy = Math.floor(Math.random() * rows);
    var dx = Math.floor(Math.random() * cols), dy = Math.floor(Math.random() * rows);
    if (sx === dx && sy === dy) return;
    packets.push({ hops: route(sx, sy, dx, dy), t: 0, trail: [] });
  }

  function drawMesh() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = colors.link; ctx.lineWidth = 1; ctx.beginPath();
    for (var y = 0; y < rows; y++) { var a = pos(0, y), b = pos(cols - 1, y); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (var x = 0; x < cols; x++) { var c = pos(x, 0), d = pos(x, rows - 1); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); }
    ctx.stroke();
    ctx.fillStyle = colors.node;
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) { var p = pos(i, j); ctx.fillRect(p[0] - 3, p[1] - 3, 6, 6); }
  }

  function drawPackets() {
    ctx.fillStyle = colors.pkt;
    for (var k = 0; k < packets.length; k++) {
      var tr = packets[k].trail;
      for (var m = 0; m < tr.length; m++) {
        ctx.globalAlpha = (m + 1) / tr.length * 0.9;
        var r = 1.2 + 1.8 * (m + 1) / tr.length;
        ctx.beginPath(); ctx.arc(tr[m][0], tr[m][1], r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function step(dt) {
    if (packets.length < MAX_PACKETS && Math.random() < 0.05) spawn();
    for (var k = packets.length - 1; k >= 0; k--) {
      var p = packets[k];
      p.t += SPEED * dt / 16;
      var i = Math.floor(p.t);
      if (i >= p.hops.length - 1) { packets.splice(k, 1); continue; }
      var a = pos(p.hops[i][0], p.hops[i][1]), b = pos(p.hops[i + 1][0], p.hops[i + 1][1]), f = p.t - i;
      p.trail.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      if (p.trail.length > TRAIL) p.trail.shift();
    }
  }

  function frame(ts) {
    var dt = last ? Math.min(ts - last, 50) : 16; last = ts;
    step(dt); drawMesh(); drawPackets();
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }

  function start() { if (!raf && !reduce && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

  readColors(); resize();
  if (reduce) { drawMesh(); } else { for (var n = 0; n < 6; n++) spawn(); start(); }

  window.addEventListener("resize", function () { resize(); if (reduce) drawMesh(); });
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(canvas);
  }
  // Re-read colors when the theme toggle changes data-theme.
  new MutationObserver(function () { readColors(); if (reduce) drawMesh(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
