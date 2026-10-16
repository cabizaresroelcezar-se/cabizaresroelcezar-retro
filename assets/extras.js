/* Extras: dial-up modem entrance, idle screensaver, Konami code, tab title, 56K lite mode, secret word, blinking favicon. */
(function () {
  "use strict";

  if (window.top !== window) return; // not inside the Cabzscape Navigator iframe
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var AC = window.AudioContext || window.webkitAudioContext;

  /* ==========================================================
     1. DIAL-UP MODEM on the IE 4 / Netscape 4 entrance buttons
     Every sound is synthesized with Web Audio: dial tone, DTMF,
     answer tone, then the handshake screech. No audio files.
     ========================================================== */
  function modemSound(ctx) {
    var t0 = ctx.currentTime + 0.05;
    var out = ctx.createGain();
    out.gain.value = 0.18;
    out.connect(ctx.destination);

    function tone(freq, start, dur, vol, type) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t0 + start);
      g.gain.setValueAtTime(vol, t0 + start + dur - 0.01);
      g.gain.linearRampToValueAtTime(0, t0 + start + dur);
      o.connect(g).connect(out);
      o.start(t0 + start);
      o.stop(t0 + start + dur + 0.02);
      return o;
    }
    function noise(start, dur, vol, lo, hi) {
      var len = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = buf;
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(lo, t0 + start);
      bp.frequency.linearRampToValueAtTime(hi, t0 + start + dur);
      bp.Q.value = 1.2;
      g.gain.setValueAtTime(vol, t0 + start);
      g.gain.linearRampToValueAtTime(0.0001, t0 + start + dur);
      src.connect(bp).connect(g).connect(out);
      src.start(t0 + start);
    }

    // dial tone
    tone(350, 0, 0.9, 0.5); tone(440, 0, 0.9, 0.5);
    // DTMF: 1-998-CABZ (1 9 9 8 2 2 2 9)
    var DTMF = { "1": [697, 1209], "9": [852, 1477], "8": [852, 1336], "2": [697, 1336] };
    "19982229".split("").forEach(function (k, i) {
      var s = 1.05 + i * 0.13;
      tone(DTMF[k][0], s, 0.08, 0.45); tone(DTMF[k][1], s, 0.08, 0.45);
    });
    // ringback
    tone(440, 2.25, 0.5, 0.25); tone(480, 2.25, 0.5, 0.25);
    // answer tone (2100 Hz with phase-reversal clicks)
    tone(2100, 2.95, 0.9, 0.3);
    // V.8 / V.22 style call-and-response
    for (var j = 0; j < 6; j++) {
      tone(j % 2 ? 1200 : 2400, 3.9 + j * 0.09, 0.08, 0.25, "square");
      tone(j % 2 ? 980 : 1650, 3.9 + j * 0.09 + 0.045, 0.04, 0.2, "square");
    }
    // the famous screech: FSK warble + swept noise
    var warble = tone(1800, 4.5, 1.7, 0.18, "sawtooth");
    for (var k = 0; k < 40; k++) warble.frequency.setValueAtTime(900 + Math.random() * 1700, t0 + 4.5 + k * 0.042);
    noise(4.5, 1.8, 0.5, 600, 3200);
    noise(6.25, 0.9, 0.35, 2500, 900);
    tone(1650, 6.25, 0.9, 0.08, "square");
    return 7.2; // seconds
  }

  var modemOverlay = null;
  function connect(target) {
    if (modemOverlay) return;
    modemOverlay = document.createElement("div");
    modemOverlay.className = "modem-overlay";
    modemOverlay.innerHTML =
      '<div class="win modem-win" role="dialog" aria-modal="true" aria-labelledby="modem-title">' +
        '<div class="win-title"><span class="t" id="modem-title">Connecting to Cabz\'s World</span><span class="ctrls"><button type="button" class="modem-x" aria-label="Skip">×</button></span></div>' +
        '<div class="win-body modem-body">' +
          '<div class="modem-pics" aria-hidden="true"><span>🖥️</span><span class="modem-dots"><i></i><i></i><i></i><i></i><i></i></span><span>🌐</span></div>' +
          '<dl><dt>Connect to:</dt><dd>GEOCITIES.COM/CABZ</dd><dt>Phone number:</dt><dd>1-998-2229</dd></dl>' +
          '<p class="modem-status" role="status" aria-live="polite">Dialing...</p>' +
          '<p class="modem-actions"><button type="button" class="btn95 modem-skip">Skip ▶</button></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modemOverlay);
    var status = modemOverlay.querySelector(".modem-status");
    var ctx = null, timers = [];

    function finish() {
      timers.forEach(clearTimeout);
      if (ctx) { ctx.close(); ctx = null; }
      if (modemOverlay) { modemOverlay.remove(); modemOverlay = null; }
      document.removeEventListener("keydown", onKey);
      var el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
    function onKey(e) { if (e.key === "Escape") finish(); }
    document.addEventListener("keydown", onKey);
    modemOverlay.querySelector(".modem-skip").addEventListener("click", finish);
    modemOverlay.querySelector(".modem-x").addEventListener("click", finish);
    modemOverlay.querySelector(".modem-skip").focus();

    var total = 7.2;
    if (AC) { try { ctx = new AC(); total = modemSound(ctx); } catch (e) { ctx = null; } }
    [
      [0, "Dialing..."],
      [2.2, "Waiting for answer..."],
      [3.0, "Verifying username and password..."],
      [4.5, "Negotiating protocols... (EEEEEEKKKKRRRR)"],
      [6.2, "Logging on to network..."],
      [total, "Connected at 56,000 bps! ✔"]
    ].forEach(function (s) { timers.push(setTimeout(function () { status.textContent = s[1]; }, s[0] * 1000)); });
    timers.push(setTimeout(finish, (total + 0.9) * 1000));
  }

  document.querySelectorAll(".entrances a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      connect(a.getAttribute("href"));
    });
  });

  /* ==========================================================
     2. SCREENSAVER: starfield warp + bouncing logo after idle
     ========================================================== */
  var IDLE_MS = 60000;
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var saver = null, raf = 0, idleTimer = 0;

    function startSaver() {
      if (saver || document.hidden || document.documentElement.classList.contains("nav-open") || modemOverlay) return armIdle();
      saver = document.createElement("div");
      saver.className = "saver";
      saver.setAttribute("aria-hidden", "true");
      saver.innerHTML = '<canvas></canvas><img class="saver-logo" src="assets/img/logo.png" alt=""><p class="saver-hint">move the mouse to return to Cabz\'s World</p>';
      document.body.appendChild(saver);
      var cv = saver.querySelector("canvas"), c2 = cv.getContext("2d"), logo = saver.querySelector(".saver-logo");
      var W, H, stars = [];
      function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
      size();
      for (var i = 0; i < 260; i++) stars.push({ x: (Math.random() - 0.5) * W, y: (Math.random() - 0.5) * H, z: Math.random() * W });
      var LW = Math.min(420, Math.max(240, W * 0.26)); // matches the CSS clamp
      var lx = Math.random() * Math.max(0, W - LW), ly = Math.random() * Math.max(0, H - LW), vx = 2.6, vy = 2.1, hue = 0;
      function frame() {
        c2.fillStyle = "rgba(0,0,0,.35)";
        c2.fillRect(0, 0, W, H);
        for (var s = 0; s < stars.length; s++) {
          var st = stars[s];
          st.z -= 9;
          if (st.z <= 1) { st.x = (Math.random() - 0.5) * W; st.y = (Math.random() - 0.5) * H; st.z = W; }
          var k = 256 / st.z, px = st.x * k + W / 2, py = st.y * k + H / 2;
          var r = Math.max(0.4, (1 - st.z / W) * 3);
          c2.fillStyle = "#fff";
          c2.fillRect(px, py, r, r);
        }
        lx += vx; ly += vy;
        var lw = logo.offsetWidth || LW, lh = logo.offsetHeight || LW;
        if (lx <= 0 || lx + lw >= W) { vx = -vx; hue = (hue + 67) % 360; }
        if (ly <= 0 || ly + lh >= H) { vy = -vy; hue = (hue + 67) % 360; }
        logo.style.transform = "translate(" + lx + "px," + ly + "px)";
        logo.style.filter = "drop-shadow(0 0 14px hsl(" + hue + ",100%,60%)) hue-rotate(" + hue + "deg)";
        raf = requestAnimationFrame(frame);
      }
      frame();
      window.addEventListener("resize", size);
      saver._size = size;
    }
    function stopSaver() {
      if (!saver) return;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", saver._size);
      saver.remove();
      saver = null;
    }
    function armIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(startSaver, IDLE_MS); }
    ["mousemove", "mousedown", "keydown", "wheel", "touchstart", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, function () { stopSaver(); armIdle(); }, { passive: true });
    });
    armIdle();
  }

  /* ==========================================================
     3. KONAMI CODE: ↑ ↑ ↓ ↓ ← → ← → B A  →  GIF rain
     ========================================================== */
  var CODE = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  var pos = 0;
  var seq = document.querySelectorAll(".kc-seq > span");
  var kcStatus = document.querySelector(".kc-status");
  var STATUS_IDLE = kcStatus ? kcStatus.textContent : "";

  function showProgress() {
    seq.forEach(function (s, i) { s.classList.toggle("hit", i < pos); });
    if (kcStatus && pos > 0 && pos < CODE.length) kcStatus.textContent = "COMBO " + pos + " / " + CODE.length + "...";
    else if (kcStatus && pos === 0) kcStatus.textContent = STATUS_IDLE;
  }
  function press(k) {
    if (k === CODE[pos]) pos++;
    else if (k === "arrowup") pos = pos === 2 ? 2 : 1; // extra ↑ at the start doesn't break the combo
    else pos = 0;
    if (pos === CODE.length) {
      pos = CODE.length;
      showProgress();
      if (kcStatus) kcStatus.textContent = "★ CODE ACCEPTED ★";
      cheat();
      setTimeout(function () { pos = 0; showProgress(); }, 2500);
      return;
    }
    showProgress();
  }
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea, select")) return; // typing in the guestbook
    press((e.key || "").toLowerCase());
  });
  /* on-screen controller (works on phones too) */
  document.querySelectorAll(".pad [data-key]").forEach(function (b) {
    b.addEventListener("click", function () {
      press(b.getAttribute("data-key"));
      b.classList.add("pressed");
      setTimeout(function () { b.classList.remove("pressed"); }, 120);
    });
  });

  function cheat() {
    var banner = document.createElement("div");
    banner.className = "cheat-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = "★ CHEAT CODE ACTIVATED ★<br><small>+30 LIVES · GIF STORM UNLOCKED</small>";
    document.body.appendChild(banner);
    setTimeout(function () { banner.remove(); }, 4200);
    if (reduceMotion) return;

    var srcs = Array.prototype.map.call(document.querySelectorAll("img.gif"), function (i) { return i.getAttribute("src"); })
      .filter(function (s, i, arr) { return s && arr.indexOf(s) === i; });
    var layer = document.createElement("div");
    layer.className = "gif-rain";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    var n = 0;
    var drop = setInterval(function () {
      var img = document.createElement("img");
      img.src = srcs[(Math.random() * srcs.length) | 0];
      img.alt = "";
      img.style.left = Math.random() * 92 + "vw";
      img.style.width = 40 + Math.random() * 70 + "px";
      img.style.animationDuration = 2.2 + Math.random() * 2.5 + "s";
      img.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
      layer.appendChild(img);
      if (++n >= 90) clearInterval(drop);
    }, 70);
    setTimeout(function () { layer.remove(); }, 12000);
  }

  /* ==========================================================
     4. "COME BACK!" TAB TITLE while the visitor is in another tab
     ========================================================== */
  var realTitle = document.title;
  document.addEventListener("visibilitychange", function () {
    document.title = document.hidden ? "★ Come back to Cabz's World! ★" : realTitle;
  });

  /* ==========================================================
     5. 56K LITE MODE: hide the decorative GIFs (remembered per browser)
     The <head> applies the saved choice before the page paints.
     ========================================================== */
  var root = document.documentElement;
  var liteBtns = document.querySelectorAll("[data-lite]");
  function syncLite() {
    var on = root.classList.contains("lite");
    liteBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "📞 56K mode: ON (show GIFs)" : "📞 56K mode: OFF";
      b.title = on ? "Bring all the GIFs back" : "Slow connection? Hide most of the GIFs";
    });
  }
  liteBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var on = root.classList.toggle("lite");
      try { localStorage.setItem("cabz-lite", on ? "1" : "0"); } catch (e) {}
      syncLite();
      window.dispatchEvent(new Event("resize")); // let the GIF gutters re-measure
    });
  });
  syncLite();

  /* ==========================================================
     6. SECRET WORD: type "cabz" anywhere
     ========================================================== */
  var typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea, select")) return;
    if (!e.key || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "cabz") { typed = ""; cabzMode(); }
  });
  function cabzMode() {
    if (document.querySelector(".cabz-fly")) return;
    var banner = document.createElement("div");
    banner.className = "cheat-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = "★ CABZ WAS HERE ★<br><small>YOU FOUND THE SECRET WORD</small>";
    document.body.appendChild(banner);
    setTimeout(function () { banner.remove(); }, 3600);
    if (reduceMotion) return;
    var logo = document.createElement("img");
    logo.className = "cabz-fly";
    logo.src = "assets/img/logo.png";
    logo.alt = "";
    document.body.appendChild(logo);
    root.classList.add("cabz-party");
    setTimeout(function () { logo.remove(); root.classList.remove("cabz-party"); }, 3300);
  }

  /* ==========================================================
     7. BLINKING FAVICON: the </> mark cycles through neon colors
     ========================================================== */
  var icon = document.querySelector('link[rel="icon"]');
  if (icon && !reduceMotion) {
    var base = new Image();
    base.onload = function () {
      var NEON = ["#ffffff", "#39ff14", "#00ffff", "#ff00ff", "#ffff00", "#ff6a00"];
      var frames = NEON.map(function (c) {
        var cv = document.createElement("canvas");
        cv.width = cv.height = 64;
        var g = cv.getContext("2d");
        g.drawImage(base, 0, 0, 64, 64);
        g.globalCompositeOperation = "multiply"; // white mark takes the color, black stays black
        g.fillStyle = c;
        g.fillRect(0, 0, 64, 64);
        g.globalCompositeOperation = "destination-in"; // restore the round shape
        g.drawImage(base, 0, 0, 64, 64);
        try { return cv.toDataURL("image/png"); } catch (e) { return null; }
      });
      if (frames.some(function (f) { return !f; })) return;
      var n = 0;
      setInterval(function () { icon.href = frames[n = (n + 1) % frames.length]; }, 600);
    };
    base.src = icon.getAttribute("href");
  }
})();
