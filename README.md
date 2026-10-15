# ~\*~ Cabz's World ~\*~

**Live site:** https://cabizaresroelcezar-se.github.io/cabizaresroelcezar-retro/
**Branding page:** https://cabizaresroelcezar-se.github.io/cabizaresroelcezar-retro/branding.html
**Modern portfolio (the original):** https://cabizaresroelcezar-se.github.io/cabizaresroelcezar/ ([source](https://github.com/cabizaresroelcezar-se/cabizaresroelcezar))

A GeoCities-era remake of the personal portfolio of **Roel Cezar Cabizares**, a software engineer and
front-end developer from the Philippines. It's a love letter to the internet I started exploring on:
tiled backgrounds, animated GIFs everywhere, MIDI music, guestbooks, hit counters, and the
"under construction" sign that never came down. Est. 1998 (give or take a couple decades).

Inspired by [Cameron's World](https://www.cameronsworld.net/), a collage of the old web built from archived GeoCities pages.

---

## The tour

The homepage is a stack of full-width "neighborhoods," each with its own theme and its own pile of GIFs:

| # | Zone | Theme | What's there |
|---|------|-------|--------------|
| 1 | Entrance | Space | Glowing CABZ logo, the big wavy **Cabz's World** title, "under construction" sign, IE 4 / Netscape 4 entrances |
| 2 | Navigator | Cyber | Win95 "Cabzscape Navigator" window used as the site menu |
| 3 | About | Sky | About me, résumé download |
| 4 | My Interests | Vaporwave | Striped sunset, scrolling neon grid, palm trees and dolphins |
| 5 | Services | Ocean | Services as Win95 dialogs; click a service to pre-fill the guestbook |
| 6 | Toolbox | Under construction | Tech stack table, bulldozers and dinosaurs |
| 7 | Currently At | Win95 desktop | Job info in a Notepad window, desktop icons |
| 8 | Fave Gallery | Arcade | Projects and ventures as arcade cabinets with neon CRT screens (random colors per visit) |
| 9 | Side Quests | Fire | thy keycabz, Cryptobuds, Yo-Bi, and the CabzAmp chiptune player |
| 10 | Movie Night | Star Wars + Back to the Future | Opening crawl ("Episode IV: A New Homepage"), time circuits (destination MAR 20 2012, PRESENT TIME shows your last visit), 88 MPH |
| 11 | The Dark Side | Spooky | Statement and a link to the branding study |
| 12 | My Heroes | Comic book | POW! BAM! ZAP! and a wall of superheroes |
| 13 | Kudos | Love | Mentors and friends |
| 14 | Guestbook | Kawaii rainbow | Contact form |
| 15 | Footer | Hacker matrix | Visitor counter, 88×31 badges, and Calvin |

`branding.html` covers the personal branding and logo study with its own themed sections (space, Notepad,
blueprint, hacker terminal, WordArt typography, MS Paint palette, fire).

## Features

- **Old-school scrollbar:** Win95 style with a dithered track, ridged silver thumb and pixel arrow buttons (Chromium/Safari; Firefox gets the colors).
- **Cabzscape Navigator 2.0:** links open in a draggable Win95 browser window with Back/Forward/Reload, a location bar and a status bar. Sites that refuse to be framed (Facebook, LinkedIn and others) get a retro preview page built from the card's content, with an "Open in New Window" button.
- **GIFs everywhere:** 300+ archived GeoCities GIFs. On wide screens they spill into the left and right margins at random positions and tilts, re-shuffled every visit.
- **Neon CRT logos:** gray project logos are recolored into a random neon per card, with scanlines, flicker and a glitch on hover.
- **Soundtrack:** the CabzAmp jukebox plays "Killing in the Name" by Rage Against the Machine through the official YouTube video. Click-to-play only (explicit lyrics); there's also a Spotify link.
- **Chiptune:** a little Web Audio "MIDI" theme in the Side Quests zone.
- **Magic-wand cursor** with a fairy-dust star trail, plus a pixel pointing-hand cursor.
- **Dial-up modem entrance:** the IE 4 / Netscape 4 entrance buttons "dial in" with a synthesized modem handshake (dial tone, DTMF, the screech) and a Win95 connection dialog. Skippable.
- **Screensaver:** after a minute without input, a starfield warp with a bouncing, color-shifting CABZ logo takes over (mouse/desktop only).
- **Konami code:** type ↑ ↑ ↓ ↓ ← → ← → B A for a cheat banner and a GIF storm.
- **GeoCities 404 page:** "This page has moved to a new neighborhood!" with a blue-screen error message.
- **Link previews:** Open Graph / Twitter card image (`assets/og.png`) for nice previews when the link is shared.
- **Guestbook:** a working contact form (via [FormSubmit](https://formsubmit.co/)).
- **Visitor counter** (decorative, it just ticks up), marquees, blinking text, WordArt and 88×31 badges.
- **Accessibility:** respects `prefers-reduced-motion` (animations and the crawl stop, the trail turns off), keyboard focus stays inside the Navigator window, Esc closes it, and the layout holds down to phone width.

## How it's built

No framework, no build step: hand-written HTML, CSS and JavaScript, like it's 1999.

```
index.html            the homepage (all zones)
branding.html         branding & logo study
assets/retro.css      everything visual: zones, Win95 chrome, scrollbar, CRTs, jukebox, comic, movies
assets/cabzscape.js   Cabzscape Navigator window + random neon CRT colors
assets/geocities.js   GIF gutter scatter, time circuits clock, CabzAmp soundtrack jukebox
assets/retro.js       counter, guestbook form, fairy-dust cursor trail, chiptune player
assets/extras.js      dial-up modem entrance, screensaver, Konami code
assets/og.png         1200×630 social share preview image
404.html              GeoCities-style "page not found"
assets/gifs/          archived GeoCities GIFs (see CREDITS.md)
assets/cursors/       wand + hand SVG cursors
assets/img/           logos and project images from the original portfolio
CREDITS.md            source of every GIF
```

All GIFs are optimized with [gifsicle](https://www.lcdf.org/gifsicle/) (`-O3 --lossy=35`, kept only when smaller), which cut the GIF folder by about 22% with no visible change.

Fonts come from Google Fonts (Comic Neue, VT323, Bangers, Manrope). Tech icons in the toolbox come from
[Devicon](https://devicon.dev/) via jsDelivr.

### Run locally

Open `index.html` in a browser, or serve the folder (for example `npx serve .`). The YouTube soundtrack only
plays when the page is served over http(s), not from a `file://` path.

### Deploy

GitHub Pages serves the `main` branch from the repository root. Every push to `main` goes live in about a minute.

## Sources

- **Content:** text, project images, logos and the résumé come from my original portfolio
  ([site](https://cabizaresroelcezar-se.github.io/cabizaresroelcezar/), [repo](https://github.com/cabizaresroelcezar-se/cabizaresroelcezar)).
- **GIFs:** found through the Internet Archive's [GifCities](https://gifcities.org) search and downloaded from the
  Wayback Machine. [CREDITS.md](CREDITS.md) lists every file with its archived URL and the GeoCities page it was found on.
- **Inspiration:** [Cameron's World](https://www.cameronsworld.net/). No files were copied from it; the look is recreated
  with the same kind of archived GIFs plus original CSS.
- **Soundtrack:** Rage Against the Machine, "Killing in the Name" (1992), embedded from the
  [official RATMVEVO video](https://www.youtube.com/watch?v=bWXazVhlyxQ). The audio is not hosted here.

### A note on the GIFs

They're anonymous fan graphics rescued from GeoCities. Some show characters owned by others (superheroes,
Star Wars, Back to the Future, Calvin and Hobbes), the same way they did on fan homepages in the 90s. They're
here as a tribute to the old web. If one is yours, or you'd like it credited or removed, open an issue.

---

© Roel Cezar Cabizares. Best viewed at 800×600 in 256 colors.
