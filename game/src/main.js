// main.js — boot and the game loop for Turkey Run: The Great Escape.
// States: title → play → caught | escaped, with restart. A ?scene= query
// poses one fixed frame for screenshots; otherwise the game runs live.
import { CANVAS_W, CANVAS_H } from './config.js';
import { createInput } from './input.js';
import { SoundEngine } from './audio.js';
import { createTurkey, updateTurkey, drawTurkey } from './turkey.js';
import { createFarmer, updateFarmer, drawFarmer } from './farmer.js';
import { createWorld, updateWorld } from './world.js';
import {
  drawBackground, drawObstacle, drawCorn, drawHaystack, drawHud,
  drawTitle, drawCaught, drawEscaped, drawPaused,
} from './render.js';
import { applyScene, sceneFromQuery } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const sound = new SoundEngine();

let mode = 'title';
let world = createWorld();
let turkey = createTurkey();
let farmer = createFarmer();
let paused = false;
let time = 0;
let last = performance.now();

function startRun() {
  world = createWorld((Math.random() * 0xffffffff) >>> 0);
  turkey = createTurkey();
  farmer = createFarmer();
  mode = 'play';
  paused = false;
  sound.ensure();
  sound.gobble();
}

function backToTitle() {
  world = createWorld();
  turkey = createTurkey();
  farmer = createFarmer();
  mode = 'title';
  paused = false;
}

function playEventSounds(events) {
  for (const event of events) {
    if (event === 'corn') sound.corn();
    else if (event === 'stumble') { sound.thud(); sound.farmerShout(); farmerShout(); }
    else if (event === 'hide') sound.hide();
    else if (event === 'stage') sound.spotted();
    else if (event === 'escaped') sound.escapeFanfare();
    else if (event === 'caught') sound.caughtLament();
  }
}

function farmerShout() {
  farmer.shoutTimer = 0.9;
}

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, world.stage, world.distanceM);
  for (const hay of world.haystacks) drawHaystack(ctx, hay, time);
  for (const ob of world.obstacles) drawObstacle(ctx, ob, time);
  for (const corn of world.corns) drawCorn(ctx, corn, time);
  // The title screen draws its own turkey; the live run draws the world pair.
  if (mode !== 'title') {
    drawFarmer(ctx, farmer, turkey.x, time);
    drawTurkey(ctx, turkey, time);
  }
  if (mode === 'play') drawHud(ctx, world, farmer);
  if (mode === 'title') drawTitle(ctx, time);
  else if (mode === 'caught') drawCaught(ctx, world);
  else if (mode === 'escaped') drawEscaped(ctx, world);
  if (paused && mode === 'play') drawPaused(ctx);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;
  const pressed = input.consume();

  if (pressed.mute) sound.setMuted(!sound.muted);
  if (pressed.pause && mode === 'play') {
    paused = !paused;
    sound.click();
  }

  if (mode === 'title') {
    if (pressed.any) startRun();
  } else if (mode === 'play') {
    if (pressed.restart) {
      startRun();
    } else if (!paused) {
      updateTurkey(turkey, { jump: pressed.jump, duckHeld: input.duckHeld }, dt);
      const events = updateWorld(world, turkey, farmer, dt);
      // The world owns the farmer gap; the farmer mirrors it.
      farmer.gap = world.farmerGap;
      updateFarmer(farmer, dt, 0);
      playEventSounds(events);
      if (world.over === 'caught') {
        mode = 'caught';
        farmer.state = 'grabbing';
      } else if (world.over === 'escaped') {
        mode = 'escaped';
        farmer.state = 'searching';
      }
    }
  } else if (mode === 'caught' || mode === 'escaped') {
    if (pressed.restart || pressed.any) startRun();
  }

  render();
  requestAnimationFrame(frame);
}

// A ?scene= query poses one fixed frame instead of starting the loop.
const scene = sceneFromQuery(window.location.search);
if (scene !== 'title' || new URLSearchParams(window.location.search).has('scene')) {
  const posed = applyScene(scene);
  mode = posed.mode;
  world = posed.world;
  turkey = posed.turkey;
  farmer = posed.farmer;
  time = posed.time;
  render();
} else {
  requestAnimationFrame(frame);
}
