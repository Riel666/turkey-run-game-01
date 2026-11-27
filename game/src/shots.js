// shots.js — posed, deterministic scene states for honest screenshots.
// ?scene=title | play | caught | escaped renders one fixed frame of the game's
// own code, with a seeded world, so a screenshot can be taken reliably.
// The scenes are real game states, not composites: the same render path the
// live game uses draws them.
import { CANVAS_W, GROUND_Y } from './config.js';
import { createWorld } from './world.js';
import { createTurkey } from './turkey.js';
import { createFarmer } from './farmer.js';

function seedObstacles(world) {
  // A busy orchard stretch: a fence to jump, a swinging knife to duck, corn,
  // and a haystack to hide in — the run at its most readable.
  world.obstacles.push(
    { kind: 'fence', x: 620, w: 26, h: 74, hit: false, swing: 0 },
    { kind: 'knifeSwing', x: 760, w: 22, h: 74, hit: false, swing: 1.2 },
    { kind: 'haybale', x: 900, w: 50, h: 48, hit: false, swing: 0 },
  );
  world.corns.push(
    { x: 420, y: GROUND_Y - 66, taken: false, bob: 0 },
    { x: 466, y: GROUND_Y - 100, taken: false, bob: 1 },
    { x: 512, y: GROUND_Y - 66, taken: false, bob: 2 },
  );
  world.haystacks.push({ x: 300, w: 76, h: 84, used: false });
}

export function applyScene(scene) {
  const world = createWorld(20261127);
  const turkey = createTurkey();
  const farmer = createFarmer();
  const time = 1.25;

  if (scene === 'play') {
    world.distanceM = 640;
    world.score = 7420;
    world.cornCollected = 11;
    world.lives = 3;
    world.farmerGap = 150;
    world.stage = { name: 'The Orchard', fromM: 500, toM: 1000, sky: '#f2a65e', horizon: '#d97b3f', ground: '#96602c', grass: '#6d9c3f', accent: '#b8452a' };
    seedObstacles(world);
    turkey.y = GROUND_Y - 52;
    turkey.vy = -220;
    turkey.grounded = false;
    turkey.runPhase = 3.1;
    farmer.gap = 150;
    farmer.runPhase = 2.0;
    return { mode: 'play', world, turkey, farmer, time, paused: true };
  }

  if (scene === 'caught') {
    world.distanceM = 812;
    world.score = 9130;
    world.cornCollected = 14;
    world.lives = 0;
    world.farmerGap = 0;
    world.over = 'caught';
    world.overReason = 'Farmer Bram caught Gobbles by the tail feathers!';
    world.stage = { name: 'The Orchard', fromM: 500, toM: 1000, sky: '#f2a65e', horizon: '#d97b3f', ground: '#96602c', grass: '#6d9c3f', accent: '#b8452a' };
    seedObstacles(world);
    turkey.stumbling = 0.4;
    turkey.runPhase = 1.0;
    farmer.gap = 0;
    farmer.state = 'grabbing';
    farmer.runPhase = 2.0;
    return { mode: 'caught', world, turkey, farmer, time, paused: true };
  }

  if (scene === 'escaped') {
    world.distanceM = 1500;
    world.score = 18480;
    world.cornCollected = 26;
    world.lives = 2;
    world.farmerGap = 340;
    world.over = 'escaped';
    world.overReason = 'Gobbles reached Freedom Woods — no Thanksgiving dinner today!';
    world.stage = { name: 'The Kitchen', fromM: 1000, toM: 1500, sky: '#e88a4f', horizon: '#c25a33', ground: '#7d4a26', grass: '#5d7f33', accent: '#8f2f1d' };
    world.obstacles.push({ kind: 'oven', x: 700, w: 74, h: 112, hit: false, swing: 0 });
    world.corns.push({ x: 420, y: GROUND_Y - 66, taken: false, bob: 0 });
    turkey.runPhase = 4.2;
    farmer.gap = 340;
    farmer.state = 'searching';
    return { mode: 'escaped', world, turkey, farmer, time, paused: true };
  }

  // Default: title.
  return { mode: 'title', world, turkey, farmer, time, paused: true };
}

export function sceneFromQuery(search) {
  const params = new URLSearchParams(search);
  const scene = params.get('scene');
  return scene === 'play' || scene === 'caught' || scene === 'escaped' ? scene : 'title';
}
