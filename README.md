# Drop database

Hold the button and a fictional production database terminal melts: the phosphor text drips, glows and falls as embers until the screen is gone. Let go early and it cools and heals back.

Reference: [@kshvbgde's "Hold to delete"](https://x.com/kshvbgde/status/2117502283894362219), a burning-paper screen. This is a different effect and subject, with no code from it.

How it works: WebGL2, no libraries. Every glyph is mass in a small GPU fluid sim (liquid, heat, solid, afterglow) on a fixed 60 Hz step, so any moment replays the same. Mothwick, its customers and Dennis are made up, and nothing real is deleted.

Open: `python3 -m http.server` in this folder, then `/`. Hold with mouse, touch, or Space/Enter.

- `?play` runs the demo: hold, let go, heal, then a full hold to the end (about 20 s). It draws its own pointer.
- `?t=<seconds>` freezes that moment of the `?play` timeline.
- `?clean` hides the hint and the restore button. The hold button stays, because it is the subject.

Re-record: `node ../../../x-trend-ideas/_tools/record.mjs "http://127.0.0.1:<port>/<path>/?clean&play" video/drop-database.mp4 --seconds 20 --fps 30 --w 1080 --h 1350`

Check input: `node check.mjs http://127.0.0.1:<port>/<path>/` tests mouse, touch and keyboard holds, cooling, a full hold and restore.
