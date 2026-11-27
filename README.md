# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Riel666/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Riel666/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Turkey Run — The Great Escape: a turkey escape game. Thanksgiving is coming,
Farmer Bram wants dinner, and Gobbles the turkey has 1,500 metres of farmyard,
orchard and kitchen to cross to reach Freedom Woods.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or run the entry program, which copies `game/` and `screenshots/` and writes the dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What it is

- **Run for your life**: Gobbles runs on his own — you jump, duck and hide.
  Farmer Bram chases from behind; every stumble lets him gain ground, and if
  he catches up, you are dinner.
- **Dodge the dinner prep**: fences and hay bales to jump, puddles to clear,
  a carving knife swinging at head height (duck under it!) and one skidding
  along the ground, and in the kitchen a glowing hot oven to clear.
- **Hide**: duck inside a haystack and Bram loses your trail — he falls back
  and you score a hiding bonus. Crash into one standing up and you stumble.
- **Three stages that get harder**: the Farmyard (0–500 m), the Orchard
  (500–1,000 m) and the Kitchen (1,000–1,500 m). The run gets faster as you
  go, and the gaps between hazards shrink.
- **Corn**: grab corn for points — each cob also buys a little distance from
  Bram. Reach 1,500 m to escape; lose all 3 lives or let Bram catch you and
  the run ends.
- **HUD**: score, distance to Freedom Woods, lives, corn count, a farmer
  proximity meter and a progress bar. Title screen, caught screen and
  escaped screen, all with restart (R or click).
- **Controls**: ↑ / Space / click — jump, ↓ / S — duck & hide, R — restart,
  P — pause, M — sound.
- **Sound**: synthesized WebAudio only — gobbles, a jump whoosh, corn chimes,
  thuds, Bram's shout and short jingles for escape and capture. No audio
  files, no network.

## Files

- `main.ts` — the entrypoint; copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `game/index.html` — the page; a full-window canvas, no network requests
- `game/src/config.js` — every tuning number, stage and colour
- `game/src/world.js` — the run: spawning, collisions, scoring, stages
- `game/src/turkey.js` — Gobbles: physics and canvas-drawn turkey art
- `game/src/farmer.js` — Farmer Bram: the chase and his canvas-drawn art
- `game/src/render.js` — backdrops, obstacles, HUD and all screens
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/input.js` — keyboard + pointer input
- `game/src/shots.js` — posed scene states for honest screenshots (`?scene=title|play|caught|escaped`)
- `game/src/main.js` — boot and the game loop
- `game/src/random.js` — seeded RNG
- `serve.ts` — a tiny static server for local play
- `shots.json` — the screenshot manifest
- `LICENSE` — MIT
- `.makefun/owner.json` — payout wallet claim file

## Verification

`node main.ts` with `MAKEFUN_OUTPUT_DIR` set copies `game/` and `screenshots/` and writes `dossier.json` (429,307 bytes). Screenshots are real renders of the game in headless Chromium at 1280x800: `1-play.png` (67,767 bytes), `2-title.png` (83,861 bytes), `3-caught.png` (66,981 bytes), `4-escaped.png` (67,995 bytes) — each under the 256 KiB cap.

Headless play-test with the real rules: the game starts on Space, the turkey jumps, and 8 jumps over ~6 s run with no console errors and no network requests (only the game's own files from localhost). Node smoke tests of the pure logic (stages, speed ramp, knife ducking, fence jumping, haystack hiding, corn, escape at 1,500 m, capture at gap 0) all pass (17 checks).

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=nrw7bbqr&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
