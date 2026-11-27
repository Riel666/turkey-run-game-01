// world.js — the run itself: spawning, collisions, scoring and stages.
// Pure logic over a plain state object, so the rules can be tested without a canvas.
import {
  CANVAS_W, GROUND_Y, ESCAPE_DISTANCE_M, START_LIVES, FARMER_GAP_START,
  FARMER_GAP_MAX, FARMER_CREEP_PER_S, STUMBLE_GAP_COST, CORN_GAP_BONUS,
  HIDE_GAP_BONUS, HIDE_SCORE_BONUS, SCORE_PER_METER, SCORE_PER_CORN, METERS_PER_PX,
  stageFor, speedFor,
} from './config.js';
import { mulberry32, range } from './random.js';
import { turkeyHitbox, stumbleTurkey } from './turkey.js';

export function createWorld(seed = 20261127) {
  return {
    seed,
    rng: mulberry32(seed),
    distanceM: 0,
    score: 0,
    cornCollected: 0,
    lives: START_LIVES,
    farmerGap: FARMER_GAP_START,
    obstacles: [],
    corns: [],
    haystacks: [],
    spawnIn: 420,
    hiddenFlash: 0,
    banner: null,
    bannerTimer: 0,
    stage: stageFor(0),
    over: null, // null | 'caught' | 'escaped'
    overReason: '',
    elapsed: 0,
  };
}

function spawnPattern(world) {
  const d = world.distanceM;
  const stageIndex = d < 500 ? 0 : d < 1000 ? 1 : 2;
  const r = world.rng;
  const x = CANVAS_W + 60;
  const roll = r();
  if (stageIndex === 0) {
    if (roll < 0.34) addObstacle(world, 'fence', x);
    else if (roll < 0.58) addObstacle(world, 'haybale', x);
    else if (roll < 0.74) addObstacle(world, 'puddle', x);
    else if (roll < 0.9) addHaystack(world, x);
    else addCornRow(world, x, 3);
  } else if (stageIndex === 1) {
    if (roll < 0.28) addObstacle(world, 'fence', x);
    else if (roll < 0.42) addObstacle(world, 'haybale', x);
    else if (roll < 0.58) addObstacle(world, 'puddle', x);
    else if (roll < 0.72) addObstacle(world, 'knifeSwing', x);
    else if (roll < 0.86) addHaystack(world, x);
    else addCornRow(world, x, 4);
  } else {
    if (roll < 0.26) addObstacle(world, 'oven', x);
    else if (roll < 0.5) addObstacle(world, 'knifeSwing', x);
    else if (roll < 0.64) addObstacle(world, 'knifeRoll', x);
    else if (roll < 0.78) addObstacle(world, 'fence', x);
    else if (roll < 0.9) addHaystack(world, x);
    else addCornRow(world, x, 4);
  }
  // Next gap shrinks as the run gets faster.
  const base = 430 - Math.min(170, d * 0.14);
  world.spawnIn = base + range(r, 0, 190);
}

function addObstacle(world, kind, x) {
  const dims = {
    fence: { w: 26, h: 74 },
    haybale: { w: 50, h: 48 },
    puddle: { w: 96, h: 16 },
    oven: { w: 74, h: 112 },
    knifeSwing: { w: 22, h: 74 },
    knifeRoll: { w: 64, h: 26 },
  }[kind];
  world.obstacles.push({ kind, x, w: dims.w, h: dims.h, hit: false, swing: world.rng() * Math.PI * 2 });
}

function addHaystack(world, x) {
  world.haystacks.push({ x, w: 76, h: 84, used: false });
}

function addCornRow(world, x, count) {
  for (let i = 0; i < count; i++) {
    world.corns.push({
      x: x + i * 46,
      y: GROUND_Y - 66 - (i % 2) * 34,
      taken: false,
      bob: world.rng() * Math.PI * 2,
    });
  }
}

function obstacleRect(ob) {
  if (ob.kind === 'knifeSwing') {
    // The blade hangs low across the turkey's head height: a standing turkey
    // runs into it, a ducking turkey (38 px tall) slips underneath.
    return { x: ob.x, y: GROUND_Y - 72, w: ob.w, h: 30 };
  }
  return { x: ob.x, y: GROUND_Y - ob.h, w: ob.w, h: ob.h };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// One fixed step of the run. Returns events for sound/feedback.
export function updateWorld(world, turkey, farmer, dt) {
  const events = [];
  if (world.over) return events;
  world.elapsed += dt;
  const speed = speedFor(world.distanceM);
  world.distanceM += speed * dt * METERS_PER_PX;
  world.score += speed * dt * METERS_PER_PX * SCORE_PER_METER;
  world.farmerGap = Math.max(0, world.farmerGap - FARMER_CREEP_PER_S * dt);

  const stage = stageFor(world.distanceM);
  if (stage !== world.stage) {
    world.stage = stage;
    world.banner = stage.name;
    world.bannerTimer = 2.2;
    events.push('stage');
  }
  if (world.bannerTimer > 0) world.bannerTimer -= dt;
  if (world.hiddenFlash > 0) world.hiddenFlash -= dt;

  world.spawnIn -= speed * dt;
  if (world.spawnIn <= 0) spawnPattern(world);

  const move = speed * dt;
  for (const ob of world.obstacles) ob.x -= move;
  for (const corn of world.corns) corn.x -= move;
  for (const hay of world.haystacks) hay.x -= move;
  world.obstacles = world.obstacles.filter((ob) => ob.x + ob.w > -80);
  world.corns = world.corns.filter((c) => c.x > -40);
  world.haystacks = world.haystacks.filter((h) => h.x + h.w > -80);

  const box = turkeyHitbox(turkey);
  for (const ob of world.obstacles) {
    if (ob.hit) continue;
    if (rectsOverlap(box, obstacleRect(ob))) {
      ob.hit = true;
      world.lives -= 1;
      world.farmerGap = Math.max(0, world.farmerGap - STUMBLE_GAP_COST);
      stumbleTurkey(turkey);
      events.push('stumble');
      if (world.lives <= 0) {
        world.over = 'caught';
        world.overReason = 'Gobbles tripped one too many times — Farmer Bram caught up.';
      }
      break;
    }
  }

  for (const corn of world.corns) {
    if (!corn.taken && rectsOverlap(box, { x: corn.x - 14, y: corn.y - 14, w: 28, h: 28 })) {
      corn.taken = true;
      world.cornCollected += 1;
      world.score += SCORE_PER_CORN;
      world.farmerGap = Math.min(FARMER_GAP_MAX, world.farmerGap + CORN_GAP_BONUS);
      events.push('corn');
    }
  }
  world.corns = world.corns.filter((c) => !c.taken);

  for (const hay of world.haystacks) {
    if (hay.used) continue;
    const hayRect = { x: hay.x, y: GROUND_Y - hay.h, w: hay.w, h: hay.h };
    if (rectsOverlap(box, hayRect)) {
      hay.used = true;
      if (turkey.ducking) {
        world.farmerGap = Math.min(FARMER_GAP_MAX, world.farmerGap + HIDE_GAP_BONUS);
        world.score += HIDE_SCORE_BONUS;
        world.hiddenFlash = 1.4;
        events.push('hide');
      } else {
        world.lives -= 1;
        world.farmerGap = Math.max(0, world.farmerGap - STUMBLE_GAP_COST);
        stumbleTurkey(turkey);
        events.push('stumble');
        if (world.lives <= 0) {
          world.over = 'caught';
          world.overReason = 'Gobbles crashed into a haystack — Farmer Bram caught up.';
        }
      }
    }
  }

  if (!world.over && world.farmerGap <= 0) {
    world.over = 'caught';
    world.overReason = 'Farmer Bram caught Gobbles by the tail feathers!';
    events.push('caught');
  }
  if (!world.over && world.distanceM >= ESCAPE_DISTANCE_M) {
    world.over = 'escaped';
    world.overReason = 'Gobbles reached Freedom Woods — no Thanksgiving dinner today!';
    events.push('escaped');
  }
  return events;
}

export function finalScore(world) {
  return Math.floor(world.score);
}
