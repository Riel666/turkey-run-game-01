// turkey.js — the player: a turkey called Gobbles, drawn in canvas code.
// Physics (jump, duck, stumble, run cycle) and the turkey's own drawing live here.
import {
  GROUND_Y, GRAVITY, JUMP_VELOCITY, TURKEY_H_STAND, TURKEY_H_DUCK, TURKEY_W, PALETTE,
} from './config.js';

export function createTurkey() {
  return {
    x: 180,
    y: GROUND_Y,
    vy: 0,
    ducking: false,
    stumbling: 0,
    runPhase: 0,
    grounded: true,
  };
}

export function turkeyHeight(turkey) {
  return turkey.ducking ? TURKEY_H_DUCK : TURKEY_H_STAND;
}

export function turkeyHitbox(turkey) {
  const h = turkeyHeight(turkey);
  return { x: turkey.x - TURKEY_W / 2 + 6, y: turkey.y - h, w: TURKEY_W - 12, h };
}

export function updateTurkey(turkey, input, dt) {
  turkey.ducking = input.duckHeld && turkey.grounded;
  if (input.jump && turkey.grounded && turkey.stumbling <= 0) {
    turkey.vy = JUMP_VELOCITY;
    turkey.grounded = false;
    turkey.ducking = false;
  }
  if (turkey.stumbling > 0) turkey.stumbling -= dt;
  turkey.vy += GRAVITY * dt;
  turkey.y += turkey.vy * dt;
  if (turkey.y >= GROUND_Y) {
    turkey.y = GROUND_Y;
    turkey.vy = 0;
    turkey.grounded = true;
  }
  turkey.runPhase += dt * (turkey.grounded ? 14 : 4);
}

export function stumbleTurkey(turkey) {
  turkey.stumbling = 0.55;
  turkey.vy = Math.min(turkey.vy, -260);
  turkey.grounded = false;
}

// Draw the turkey facing right, mid-run. All art is code: a fan tail, a round
// body, a head with beak and wattle, and legs that cycle with runPhase.
export function drawTurkey(ctx, turkey, time) {
  const h = turkeyHeight(turkey);
  const cx = turkey.x;
  const feetY = turkey.y;
  const bodyY = feetY - h * 0.55;
  const flash = turkey.stumbling > 0 && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  if (flash) ctx.globalAlpha = 0.45;

  // Tail fan: five feathers fanning out behind the body.
  const fan = turkey.ducking ? 0.55 : 1;
  for (let i = -2; i <= 2; i++) {
    const angle = -Math.PI / 2 + (i * 0.42 * fan);
    const len = 34 * fan;
    const fx = cx - 14 + Math.cos(angle) * len;
    const fy = bodyY - 6 + Math.sin(angle) * len;
    ctx.strokeStyle = PALETTE.turkeyFeather[i + 2];
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 12, bodyY - 4);
    ctx.lineTo(fx, fy);
    ctx.stroke();
  }

  // Legs, cycling while running.
  const step = Math.sin(turkey.runPhase) * (turkey.grounded ? 9 : 3);
  ctx.strokeStyle = '#e8a83c';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 6, feetY - 14);
  ctx.lineTo(cx - 6 + step, feetY);
  ctx.moveTo(cx + 6, feetY - 14);
  ctx.lineTo(cx + 6 - step, feetY);
  ctx.stroke();

  // Body.
  ctx.fillStyle = PALETTE.turkeyBody;
  ctx.beginPath();
  ctx.ellipse(cx, bodyY, 26, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = PALETTE.turkeyWing;
  ctx.beginPath();
  ctx.ellipse(cx - 2, bodyY + 2, 15, 10, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head, lowered when ducking.
  const headY = turkey.ducking ? bodyY - 8 : bodyY - h * 0.42 - 12;
  const headX = cx + 16;
  ctx.strokeStyle = PALETTE.turkeyHead;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx + 12, bodyY - 8);
  ctx.lineTo(headX, headY + 4);
  ctx.stroke();
  ctx.fillStyle = PALETTE.turkeyHead;
  ctx.beginPath();
  ctx.arc(headX, headY, 11, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.fillStyle = PALETTE.turkeyBeak;
  ctx.beginPath();
  ctx.moveTo(headX + 8, headY - 2);
  ctx.lineTo(headX + 22, headY + 3);
  ctx.lineTo(headX + 8, headY + 7);
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = PALETTE.turkeyWattle;
  ctx.beginPath();
  ctx.ellipse(headX + 12, headY + 9, 4, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eye.
  ctx.fillStyle = '#1c1410';
  ctx.beginPath();
  ctx.arc(headX + 3, headY - 3, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
