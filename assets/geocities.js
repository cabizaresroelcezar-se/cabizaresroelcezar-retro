/* Bring back GeoCities: GIFs scattered in the side gutters + a soundtrack. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scatter each zone's GIF row into the left/right gutters ---------- */
  var MIN_GUTTER = 84;
  var zones = [];
  document.querySelectorAll(".gif-row").forEach(function (row) {
    var zone = row.closest(".zone");
    var inner = zone && zone.querySelector(".zone-inner");
    if (!zone || !inner) return;
    var left = document.createElement("div");
    var right = document.createElement("div");
    left.className = "scatter l";
    right.className = "scatter r";
    left.setAttribute("aria-hidden", "true");
    right.setAttribute("aria-hidden", "true");
    zone.appendChild(left);
    zone.appendChild(right);
    var imgs = Array.prototype.slice.call(row.querySelectorAll("img"));
    imgs.forEach(function (img) {
      img.dataset.rot = (Math.random() * 20 - 10).toFixed(1);
      img.dataset.jx = Math.random().toFixed(3);
      img.dataset.jy = (Math.random() - 0.5).toFixed(3);
      img.style.animationDelay = (-Math.random() * 3).toFixed(2) + "s";
    });
    zones.push({ zone: zone, inner: inner, row: row, left: left, right: right, imgs: imgs });
  });

  function place(col, list, gutter, height) {
    var slot = height / list.length;
    list.forEach(function (img, i) {
      var w = Number(img.getAttribute("width")) || 80;
      var h = Number(img.getAttribute("height")) || 80;
      var s = Math.min(1, (gutter - 16) / w, Math.min(130, slot - 12) / h);
      var dw = Math.max(24, w * s), dh = h * (dw / w);
      var x = 8 + Number(img.dataset.jx) * Math.max(0, gutter - dw - 16);
      var y = (i + 0.5) * slot - dh / 2 + Number(img.dataset.jy) * slot * 0.4;
      y = Math.max(8, Math.min(height - dh - 8, y));
      img.style.width = dw + "px";
      img.style.height = "auto";
      img.style.left = x + "px";
      img.style.top = y + "px";
      img.style.setProperty("--rot", img.dataset.rot + "deg");
      col.appendChild(img);
    });
  }

  function layout() {
    zones.forEach(function (z) {
      var gutter = (z.zone.clientWidth - z.inner.getBoundingClientRect().width) / 2;
      if (gutter >= MIN_GUTTER) {
        var height = z.zone.clientHeight;
        z.left.style.width = z.right.style.width = gutter + "px";
        place(z.left, z.imgs.filter(function (_, i) { return i % 2 === 0; }), gutter, height);
        place(z.right, z.imgs.filter(function (_, i) { return i % 2 === 1; }), gutter, height);
        z.zone.classList.add("is-scattered");
      } else {
        z.imgs.forEach(function (img) {
          img.style.cssText = "animation-delay:" + img.style.animationDelay;
          z.row.appendChild(img);
        });
        z.zone.classList.remove("is-scattered");
      }
    });
  }

  var t = null;
  function relayout() { clearTimeout(t); t = setTimeout(layout, 120); }
  layout();
  window.addEventListener("resize", relayout);
  window.addEventListener("load", layout); // zone heights settle once images/fonts load

  /* ---------- Back to the Future: PRESENT TIME = this visitor's previous visit ----------
     The previous visit is fixed for the whole browser session, so hopping between
     pages doesn't overwrite it with "a few seconds ago". */
  var MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  function tcFormat(d) {
    var hr = d.getHours() % 12 || 12;
    return MON[d.getMonth()] + " " + String(d.getDate()).padStart(2, "0") + " " + d.getFullYear() + " " +
      String(hr).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + (d.getHours() < 12 ? " AM" : " PM");
  }
  var lastVisit = null;
  try {
    var held = sessionStorage.getItem("cabz-prev-visit");
    if (held === null) {
      held = localStorage.getItem("cabz-last-visit") || "";
      sessionStorage.setItem("cabz-prev-visit", held);
      localStorage.setItem("cabz-last-visit", String(Date.now()));
    }
    if (held) lastVisit = new Date(Number(held));
  } catch (e) { /* storage blocked: treat as a first visit */ }

  var tcNow = document.getElementById("tc-now");
  if (tcNow) {
    if (lastVisit && !isNaN(lastVisit)) {
      tcNow.textContent = tcFormat(lastVisit);
      tcNow.title = "Your last visit to Cabz's World";
    } else {
      // first trip: no previous visit yet, so show right now and keep ticking
      var tick = function () { tcNow.textContent = tcFormat(new Date()); };
      tick();
      setInterval(tick, 15000);
      tcNow.title = "First visit! Come back and this shows when you were last here";
    }
  }

  /* ---------- the soundtrack: CabzAmp jukebox ---------- */
  if (window.top !== window) return;
  var YT_ID = "bWXazVhlyxQ";
  var SPOTIFY = "https://open.spotify.com/track/59WN2psjkt1tyaxjspN8fp";
  var box = document.createElement("div");
  box.className = "jukebox paused";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Soundtrack player");
  box.innerHTML =
    '<div class="jb-title"><span>♫ CABZAMP · SOUNDTRACK</span><button type="button" class="jb-fold" aria-expanded="true" aria-label="Collapse player">_</button></div>' +
    '<div class="jb-body">' +
      '<div class="jb-lcd"><div class="jb-marquee"><span>*** 01. RAGE AGAINST THE MACHINE - KILLING IN THE NAME (1992) *** WARNING: EXPLICIT LYRICS *** TURN IT UP ***</span></div>' +
        '<div class="jb-row"><span class="amp-viz" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="jb-state">STOPPED</span></div></div>' +
      '<div class="jb-btns"><button type="button" class="jb-play">▶ Play</button><button type="button" class="jb-stop">■ Stop</button><a class="jb-spot" href="' + SPOTIFY + '" target="_blank" rel="noopener" data-nav-skip>♫ Spotify</a></div>' +
      '<div class="jb-video" hidden></div>' +
      '<p class="jb-note">⚠ Explicit lyrics · plays via the official YouTube video</p>' +
    '</div>';
  document.body.appendChild(box);

  var video = box.querySelector(".jb-video");
  var state = box.querySelector(".jb-state");
  var fold = box.querySelector(".jb-fold");

  box.querySelector(".jb-play").addEventListener("click", function () {
    if (!video.hidden) return;
    video.innerHTML = '<iframe title="Rage Against The Machine - Killing In The Name (official video)" src="https://www.youtube-nocookie.com/embed/' + YT_ID + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    video.hidden = false;
    box.classList.remove("paused", "folded");
    fold.setAttribute("aria-expanded", "true");
    state.textContent = "PLAYING";
    var amp = document.getElementById("amp-stop");
    if (amp) amp.click(); // don't mix with the chiptune
  });
  box.querySelector(".jb-stop").addEventListener("click", function () {
    video.innerHTML = "";
    video.hidden = true;
    box.classList.add("paused");
    state.textContent = "STOPPED";
  });
  fold.addEventListener("click", function () {
    var folded = box.classList.toggle("folded");
    fold.setAttribute("aria-expanded", String(!folded));
    fold.setAttribute("aria-label", folded ? "Expand player" : "Collapse player");
    fold.textContent = folded ? "□" : "_";
  });
  if (window.innerWidth < 700) { box.classList.add("folded"); fold.textContent = "□"; fold.setAttribute("aria-expanded", "false"); }
  if (reduceMotion) box.classList.add("no-motion");
})();

/* Cabz Network TV remote: flip between channels with a burst of static. */
(function () {
  "use strict";
  var tv = document.querySelector("[data-tv]");
  if (!tv) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var screens = tv.querySelectorAll(".cn-screen");
  var btns = document.querySelectorAll(".remote .rbtn");
  var remote = document.querySelector(".remote");
  var nameEl = tv.querySelector(".cn-ch-name"), dayEl = tv.querySelector(".cn-day"), noise = tv.querySelector(".cn-static");
  tv.classList.add("tuned");

  function tune(id, flash) {
    screens.forEach(function (s) { s.hidden = s.id !== id; });
    btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("aria-controls") === id ? "true" : "false"); });
    var cur = document.getElementById(id);
    nameEl.textContent = cur.getAttribute("data-name");
    dayEl.textContent = cur.getAttribute("data-day");
    if (flash) {
      remote.classList.add("blip");
      setTimeout(function () { remote.classList.remove("blip"); }, 150);
      if (!reduceMotion) { noise.classList.remove("on"); void noise.offsetWidth; noise.classList.add("on"); }
      window.dispatchEvent(new Event("resize")); // the zone changed height: re-place the gutter GIFs
    }
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function () { tune(b.getAttribute("aria-controls"), true); });
  });
  tune("ch-cn", false);
})();
