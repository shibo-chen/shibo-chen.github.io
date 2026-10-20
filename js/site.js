// Site-wide behavior. The theme caches the footer per layout and kind, so
// page-specific decisions happen here, in the browser.
(function () {
  "use strict";

  // Reading progress on blog posts (/blog/<slug>/ and /zh/blog/<slug>/).
  var post = document.querySelector(".post-single .post-content");
  if (post && /^\/(zh\/)?blog\/[^/]+\/?$/.test(location.pathname)) {
    var bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var ticking = false;
    var update = function () {
      var r = post.getBoundingClientRect(), total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 1;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // Copy BibTeX: a link with data-bib copies the file instead of opening it.
  var copied = (document.documentElement.lang || "").indexOf("zh") === 0 ? "已复制" : "Copied";
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-bib]");
    if (!b || !navigator.clipboard) return;
    e.preventDefault();
    var label = b.textContent, url = b.getAttribute("data-bib");
    fetch(url).then(function (r) { return r.text(); })
      .then(function (t) { return navigator.clipboard.writeText(t.trim() + "\n"); })
      .then(function () { b.textContent = copied + " ✓"; b.classList.add("copied"); },
            function () { window.location = url; })
      .then(function () { setTimeout(function () { b.textContent = label; b.classList.remove("copied"); }, 1600); });
  });
})();
