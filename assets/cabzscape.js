/* Cabzscape Navigator 2.0: links open in a draggable Win95 browser window,
   plus random neon colors for every CRT logo. */
(function () {
  "use strict";

  /* ---------- random neon per CRT (no two neighbours alike) ---------- */
  var NEON = [
    { hue: "290deg", glow: "#ff00ff" },
    { hue: "150deg", glow: "#00ffff" },
    { hue: "60deg", glow: "#39ff14" },
    { hue: "10deg", glow: "#ffff00" },
    { hue: "230deg", glow: "#9d4dff" },
    { hue: "-20deg", glow: "#ff8800" },
    { hue: "320deg", glow: "#ff3b6b" },
    { hue: "180deg", glow: "#4dd2ff" }
  ];
  var hosts = document.querySelectorAll(".polaroid, .quest");
  var recent = [];
  hosts.forEach(function (el) {
    var pick;
    do { pick = NEON[(Math.random() * NEON.length) | 0]; } while (recent.indexOf(pick) !== -1);
    recent.push(pick);
    if (recent.length > 3) recent.shift(); // differs from the previous 3 = the whole row above in a 3-col grid
    el.style.setProperty("--hue", pick.hue);
    el.style.setProperty("--glow", pick.glow);
  });

  /* Inside the navigator's own iframe: links go to the top window, no nested navigators. */
  if (window.top !== window) {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (/^https?:/i.test(h)) { a.target = "_blank"; a.rel = "noopener"; }
      else if (/\.html$/.test(h)) a.target = "_top";
    });
    return;
  }

  /* ---------- the window ---------- */
  var FRAMEABLE = [location.host, "www.agiletechops.com", "agiletechops.com", "cabizaresroelcezar-se.github.io"];
  var modal = document.createElement("div");
  modal.className = "nav-modal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="nav-win win" role="dialog" aria-modal="true" aria-labelledby="nav-title">' +
      '<div class="win-title nav-drag"><img src="assets/gifs/globe-3.gif" alt="" width="16" height="16"><span class="t" id="nav-title">Cabzscape Navigator 2.0</span>' +
        '<span class="ctrls"><button type="button" class="nav-min" aria-label="Minimize">_</button><button type="button" class="nav-max" aria-label="Maximize">□</button><button type="button" class="nav-close" aria-label="Close">×</button></span></div>' +
      '<div class="win-menu" aria-hidden="true"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>G</u>o</span><span><u>B</u>ookmarks</span><span><u>O</u>ptions</span><span><u>D</u>irectory</span><span><u>H</u>elp</span></div>' +
      '<div class="nav-toolbar">' +
        '<button type="button" class="nav-btn" data-act="back" disabled><b>◀</b>Back</button>' +
        '<button type="button" class="nav-btn" data-act="fwd" disabled><b>▶</b>Forward</button>' +
        '<button type="button" class="nav-btn" data-act="reload"><b>↻</b>Reload</button>' +
        '<button type="button" class="nav-btn" data-act="home"><b>⌂</b>Home</button>' +
        '<button type="button" class="nav-btn" data-act="open"><b>↗</b>Open</button>' +
        '<span class="nav-throbber" aria-hidden="true"><span>C</span></span>' +
      '</div>' +
      '<label class="nav-loc"><span>Location:</span><input type="text" readonly aria-label="Location"></label>' +
      '<div class="nav-view"></div>' +
      '<div class="win-status"><span class="nav-status">Document: Done</span><span>🔓</span><span class="nav-pct">100%</span></div>' +
    '</div>';
  document.body.appendChild(modal);

  var win = modal.querySelector(".nav-win");
  var view = modal.querySelector(".nav-view");
  var loc = modal.querySelector(".nav-loc input");
  var titleEl = modal.querySelector("#nav-title");
  var statusEl = modal.querySelector(".nav-status");
  var pctEl = modal.querySelector(".nav-pct");
  var btn = function (a) { return modal.querySelector('[data-act="' + a + '"]'); };
  var history = [], pos = -1, opener = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function contextFor(a) {
    var box = a.closest(".polaroid, .quest, .friend, .win-body, .term, .panel, p") || a.parentElement;
    var h = box.querySelector("h3");
    var title = (h ? h.textContent : a.textContent).replace(/\s+/g, " ").trim();
    var img = box.querySelector(".crt img, img.badge-img");
    var texts = [];
    box.querySelectorAll("p, li").forEach(function (p) {
      var t = p.textContent.replace(/\s+/g, " ").trim();
      if (t && t !== title && texts.indexOf(t) === -1 && t.length > 25) texts.push(t);
    });
    var glow = getComputedStyle(box).getPropertyValue("--glow").trim() || "#ff00ff";
    var hue = getComputedStyle(box).getPropertyValue("--hue").trim() || "290deg";
    return { title: title || "Untitled", img: img && img.getAttribute("src"), alt: img && img.alt, texts: texts.slice(0, 4), glow: glow, hue: hue };
  }

  function preview(entry) {
    var u = new URL(entry.url);
    var c = entry.ctx;
    var site = u.hostname.replace(/^www\./, "");
    var kind = /facebook/.test(site) ? "Facebook page" : /linkedin/.test(site) ? "LinkedIn profile" : site;
    var html =
      '<div class="nav-page">' +
        '<p class="center"><img src="assets/gifs/welcome-red.gif" alt="" width="207" height="51"></p>' +
        '<h1 class="nav-page-title">' + esc(c.title) + '</h1>' +
        '<p class="center nav-kind">~*~ ' + esc(kind) + ' ~*~</p>' +
        (c.img ? '<div class="crt nav-crt" style="--hue:' + c.hue + ';--glow:' + c.glow + '"><img src="' + esc(c.img) + '" alt="' + esc(c.alt || "") + '"></div>' : '<p class="center"><img src="assets/gifs/globe-1.gif" alt="" width="96" height="96"></p>') +
        c.texts.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
        '<div class="nav-alert win" role="alert">' +
          '<div class="win-title"><span class="t">Cabzscape</span></div>' +
          '<div class="win-body"><span class="nav-alert-icon" aria-hidden="true">⚠</span><p><b>' + esc(site) + '</b> refuses to be displayed inside another window. (Very 2026 of it.)<br>Open it in a new window to keep surfing!</p>' +
          '<p class="center"><a class="btn95" href="' + esc(entry.url) + '" target="_blank" rel="noopener" data-nav-skip>Open in New Window ↗</a></p></div>' +
        '</div>' +
        '<p class="center"><img src="assets/gifs/construction-bar.gif" alt="" width="323" height="118" style="width:200px"></p>' +
      '</div>';
    view.innerHTML = html;
    done();
  }

  function frame(entry) {
    var f = document.createElement("iframe");
    f.title = entry.ctx.title;
    f.src = entry.embed || entry.url;
    f.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    f.addEventListener("load", done);
    view.innerHTML = "";
    view.appendChild(f);
    setTimeout(done, 8000);
  }

  var loadTimer = null;
  function loading() {
    win.classList.add("is-loading");
    statusEl.textContent = "Connecting to host " + new URL(history[pos].url).hostname + "...";
    var p = 0;
    clearInterval(loadTimer);
    loadTimer = setInterval(function () { p = Math.min(p + 7 + Math.random() * 15, 95); pctEl.textContent = (p | 0) + "%"; }, 120);
  }
  function done() {
    clearInterval(loadTimer);
    win.classList.remove("is-loading");
    statusEl.textContent = "Document: Done";
    pctEl.textContent = "100%";
  }

  function render() {
    var entry = history[pos];
    loc.value = entry.url;
    titleEl.textContent = "Cabzscape Navigator 2.0 - [" + entry.ctx.title + "]";
    btn("back").disabled = pos <= 0;
    btn("fwd").disabled = pos >= history.length - 1;
    loading();
    var host = new URL(entry.url).host;
    if (entry.embed || FRAMEABLE.indexOf(host) !== -1) frame(entry);
    else setTimeout(function () { preview(entry); }, 450);
  }

  function open(a) {
    var url = new URL(a.getAttribute("href"), location.href).href;
    history = history.slice(0, pos + 1);
    history.push({ url: url, embed: a.dataset.embed, ctx: contextFor(a) });
    pos = history.length - 1;
    if (modal.hidden) {
      opener = a;
      modal.hidden = false;
      document.documentElement.classList.add("nav-open");
      win.classList.remove("is-min");
      modal.querySelector(".nav-close").focus();
    }
    render();
  }

  function close() {
    clearInterval(loadTimer);
    modal.hidden = true;
    view.innerHTML = "";
    history = []; pos = -1;
    document.documentElement.classList.remove("nav-open");
    if (opener) opener.focus();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute("data-nav-skip")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return;
    var u = new URL(href, location.href);
    if (u.origin === location.origin && u.pathname === location.pathname) return; // same-page anchors
    if (u.origin === location.origin && /\/(index\.html)?$/.test(u.pathname)) return; // going home is a real navigation
    e.preventDefault();
    open(a);
  });

  modal.querySelector(".nav-close").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // keep focus inside the window
      var f = win.querySelectorAll("button:not([disabled]), a[href], input, iframe");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  btn("back").addEventListener("click", function () { if (pos > 0) { pos--; render(); } });
  btn("fwd").addEventListener("click", function () { if (pos < history.length - 1) { pos++; render(); } });
  btn("reload").addEventListener("click", render);
  btn("home").addEventListener("click", close);
  btn("open").addEventListener("click", function () { window.open(history[pos].url, "_blank", "noopener"); });
  modal.querySelector(".nav-max").addEventListener("click", function () {
    win.classList.toggle("is-max");
    win.classList.remove("is-min");
    win.style.transform = "";
  });
  modal.querySelector(".nav-min").addEventListener("click", function () { win.classList.toggle("is-min"); });

  /* drag by the title bar */
  var drag = null, dx = 0, dy = 0;
  modal.querySelector(".nav-drag").addEventListener("pointerdown", function (e) {
    if (e.target.closest("button") || win.classList.contains("is-max") || window.innerWidth < 700) return;
    drag = { x: e.clientX - dx, y: e.clientY - dy };
    e.currentTarget.setPointerCapture(e.pointerId);
    win.classList.add("is-drag");
  });
  modal.querySelector(".nav-drag").addEventListener("pointermove", function (e) {
    if (!drag) return;
    dx = e.clientX - drag.x;
    dy = e.clientY - drag.y;
    win.style.transform = "translate(" + dx + "px," + dy + "px)";
  });
  modal.querySelector(".nav-drag").addEventListener("pointerup", function () { drag = null; win.classList.remove("is-drag"); });
})();
