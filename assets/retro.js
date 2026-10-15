/* Cabz's World — a sprinkle of DHTML */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- hit counter (decorative: it just ticks up over time) ---------- */
  var counter = document.getElementById("counter");
  if (counter) {
    var launch = Date.UTC(2026, 9, 15);
    var hits = 1337 + Math.max(0, Math.floor((Date.now() - launch) / 36e5)) * 3;
    try {
      var mine = Number(localStorage.getItem("cabz-visits") || 0) + 1;
      localStorage.setItem("cabz-visits", String(mine));
      hits += mine;
    } catch (e) { /* storage blocked — counter still works */ }
    String(hits).padStart(7, "0").split("").forEach(function (d) {
      var s = document.createElement("span");
      s.textContent = d;
      counter.appendChild(s);
    });
    counter.setAttribute("aria-label", "Visitor counter: " + hits);
  }

  /* ---------- fairy dust cursor trail ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var dustColors = ["#ff0", "#0ff", "#f0f", "#fff", "#0f0", "#f80"];
    var dustGlyphs = ["✦", "✧", "★", "✶", "·"];
    var dust = [];
    var lastDust = 0;
    var running = false;
    var layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
    document.body.appendChild(layer);

    document.addEventListener("mousemove", function (e) {
      var t = performance.now();
      if (t - lastDust < 22 || dust.length > 70) return;
      lastDust = t;
      var el = document.createElement("span");
      el.className = "dust";
      el.textContent = dustGlyphs[(Math.random() * dustGlyphs.length) | 0];
      el.style.color = dustColors[(Math.random() * dustColors.length) | 0];
      el.style.fontSize = 9 + Math.random() * 12 + "px";
      layer.appendChild(el);
      dust.push({ el: el, x: e.clientX + 4, y: e.clientY + 4, vx: (Math.random() - 0.5) * 1.6, vy: -Math.random() * 1.2, life: 1, spin: (Math.random() - 0.5) * 20, r: 0 });
      if (!running) { running = true; requestAnimationFrame(tick); }
    });

    function tick() {
      for (var i = dust.length - 1; i >= 0; i--) {
        var p = dust[i];
        p.vy += 0.09;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.spin;
        p.life -= 0.018;
        if (p.life <= 0) { p.el.remove(); dust.splice(i, 1); continue; }
        var twinkle = 0.55 + 0.45 * Math.sin(p.life * 30);
        p.el.style.transform = "translate(" + p.x + "px," + p.y + "px) rotate(" + p.r + "deg) scale(" + p.life + ")";
        p.el.style.opacity = (p.life * twinkle).toFixed(2);
      }
      if (dust.length) requestAnimationFrame(tick); else running = false;
    }
  }

  /* ---------- service chips -> guestbook ---------- */
  var select = document.getElementById("gb-service");
  if (!select) return;
  var chips = document.querySelectorAll("#service-chips button");
  chips.forEach(function (chip) {
    var opt = document.createElement("option");
    opt.value = opt.textContent = chip.textContent;
    select.appendChild(opt);
    chip.addEventListener("click", function () {
      select.value = chip.textContent;
      document.getElementById("guestbook").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(function () { document.getElementById("gb-name").focus({ preventScroll: true }); }, 500);
    });
  });

  /* ---------- guestbook (FormSubmit, same inbox as the modern site) ---------- */
  var form = document.getElementById("guestbook-form");
  var status = document.getElementById("gb-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    if (data.get("_honey")) return;
    if (!data.get("name") || !data.get("email") || !data.get("message") || !form.querySelector("#gb-email").checkValidity()) {
      status.textContent = "⚠️ Please fill in your name, a valid e-mail, and a message!";
      return;
    }
    status.textContent = "⏳ Connecting to server... please wait...";
    fetch("https://formsubmit.co/ajax/cabizaresroelcezar@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        service: data.get("service") || "General inquiry",
        message: data.get("message"),
        _subject: "New guestbook entry from Cabz's World (retro site)",
        _template: "table"
      })
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () { status.textContent = "✅ Thanks for signing my guestbook! I'll write back soon."; form.reset(); })
      .catch(function () { status.textContent = "❌ Uh oh, the modem hung up. Please try again later!"; });
  });

  /* ---------- CabzAmp: a tiny chiptune "MIDI" via Web Audio ---------- */
  var amp = document.getElementById("amp");
  var timeEl = document.getElementById("amp-time");
  var ctx = null, loopTimer = null, clockTimer = null, startedAt = 0;
  // note, beats (C major-ish happy loop)
  var melody = [
    ["E5", 1], ["G5", 1], ["C6", 2], ["B5", 1], ["G5", 1], ["E5", 2],
    ["F5", 1], ["A5", 1], ["D6", 2], ["C6", 1], ["A5", 1], ["F5", 2],
    ["E5", 1], ["G5", 1], ["C6", 1], ["E6", 1], ["D6", 1], ["B5", 1], ["G5", 2],
    ["A5", 1], ["F5", 1], ["D5", 1], ["B4", 1], ["C5", 4]
  ];
  var bass = ["C3", "C3", "F3", "F3", "C3", "G3", "F3", "C3"];
  var BEAT = 0.16;

  function freq(n) {
    var map = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
    var semis = map[n[0]] + (Number(n.slice(-1)) - 4) * 12;
    return 440 * Math.pow(2, semis / 12);
  }
  function blip(type, f, t, dur, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  }
  function scheduleLoop() {
    var t = ctx.currentTime + 0.05, beats = 0;
    melody.forEach(function (m) {
      blip("square", freq(m[0]), t + beats * BEAT, m[1] * BEAT, 0.05);
      beats += m[1];
    });
    var barLen = beats / bass.length;
    bass.forEach(function (n, i) { blip("triangle", freq(n), t + i * barLen * BEAT, barLen * BEAT, 0.12); });
    loopTimer = setTimeout(scheduleLoop, beats * BEAT * 1000);
  }
  function stop() {
    clearTimeout(loopTimer); clearInterval(clockTimer);
    if (ctx) { ctx.close(); ctx = null; }
    amp.classList.add("paused");
    timeEl.textContent = "00:00";
  }
  document.getElementById("amp-play").addEventListener("click", function () {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { timeEl.textContent = "N/A"; return; }
    ctx = new AC();
    startedAt = Date.now();
    amp.classList.remove("paused");
    scheduleLoop();
    clockTimer = setInterval(function () {
      var s = Math.floor((Date.now() - startedAt) / 1000);
      timeEl.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }, 500);
  });
  document.getElementById("amp-stop").addEventListener("click", stop);
})();
