/* Cabz's World — a sprinkle of DHTML */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer dates ---------- */
  var now = new Date();
  document.getElementById("year").textContent = now.getFullYear();
  document.getElementById("updated").textContent = document.lastModified
    ? new Date(document.lastModified).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : now.toDateString();

  /* ---------- hit counter (decorative: it just ticks up over time) ---------- */
  var launch = Date.UTC(2026, 9, 15);
  var hits = 1337 + Math.max(0, Math.floor((Date.now() - launch) / 36e5)) * 3;
  try {
    var mine = Number(localStorage.getItem("cabz-visits") || 0) + 1;
    localStorage.setItem("cabz-visits", String(mine));
    hits += mine;
  } catch (e) { /* storage blocked — counter still works */ }
  var counter = document.getElementById("counter");
  String(hits).padStart(7, "0").split("").forEach(function (d) {
    var s = document.createElement("span");
    s.textContent = d;
    counter.appendChild(s);
  });
  counter.setAttribute("aria-label", "Visitor counter: " + hits);

  /* ---------- service chips -> guestbook ---------- */
  var select = document.getElementById("gb-service");
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

  /* ---------- webring random ---------- */
  document.getElementById("ring-random").addEventListener("click", function (e) {
    e.preventDefault();
    var sites = [
      "https://cabizaresroelcezar-se.github.io/cabizaresroelcezar/",
      "https://github.com/cabizaresroelcezar-se",
      "https://www.linkedin.com/in/cabizaresroelcezar/",
      "https://www.cameronsworld.net/"
    ];
    window.open(sites[Math.floor(Math.random() * sites.length)], "_blank", "noopener");
  });

  /* ---------- cursor sparkle trail ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var glyphs = ["✦", "✧", "★", "·", "✶"];
    var colors = ["#ff0", "#0ff", "#f0f", "#fff", "#0f0"];
    var last = 0;
    document.addEventListener("mousemove", function (e) {
      var t = performance.now();
      if (t - last < 40) return;
      last = t;
      var s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      s.style.color = colors[(Math.random() * colors.length) | 0];
      s.style.left = e.clientX + 6 + "px";
      s.style.top = e.clientY + 6 + "px";
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    });
  }

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
