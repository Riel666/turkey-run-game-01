// farmer.js — the chaser: Farmer Bram, drawn in canvas code.
// He starts a gap behind the turkey and gains ground whenever the turkey
// stumbles; corn and hiding push him back. Gap 0 means caught.
import { GROUND_Y, FARMER_GAP_START, PALETTE } from './config.js';

export function createFarmer() {
  return {
    gap: FARMER_GAP_START,
    runPhase: 0,
    state: 'chasing', // chasing | searching | grabbing | celebrating
    shoutTimer: 0,
  };
}

// The farmer's screen x follows the gap: the smaller the gap, the closer he is.
export function farmerX(farmer, turkeyX) {
  return turkeyX - 70 - farmer.gap * 0.55;
}

export function updateFarmer(farmer, dt, creepPerS) {
  farmer.runPhase += dt * 13;
  farmer.gap = Math.max(0, farmer.gap - creepPerS * dt);
  if (farmer.shoutTimer > 0) farmer.shoutTimer -= dt;
}

export function farmerShout(farmer) {
  farmer.shoutTimer = 0.9;
}

// Draw Farmer Bram: straw hat, red-checked shirt under overalls, long arms
// reaching for the turkey, boots pounding the dirt.
export function drawFarmer(ctx, farmer, turkeyX, time) {
  const x = farmerX(farmer, turkeyX);
  if (x < -90) return; // off-screen left, still a threat on the meter
  const feetY = GROUND_Y;
  const step = Math.sin(farmer.runPhase) * 10;
  const bob = Math.abs(Math.sin(farmer.runPhase)) * 3;
  const bodyY = feetY - 52 - bob;
  ctx.save();

  // Legs.
  ctx.strokeStyle = PALETTE.farmerOveralls;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 6, bodyY + 22);
  ctx.lineTo(x - 10 + step, feetY);
  ctx.moveTo(x + 6, bodyY + 22);
  ctx.lineTo(x + 10 - step, feetY);
  ctx.stroke();
  // Boots.
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(x - 16 + step, feetY - 6, 14, 6);
  ctx.fillRect(x + 4 - step, feetY - 6, 14, 6);

  // Overalls body.
  ctx.fillStyle = PALETTE.farmerOveralls;
  ctx.fillRect(x - 16, bodyY - 6, 32, 34);
  // Shirt sleeves and reaching arms.
  const reach = farmer.state === 'grabbing' ? 26 : 14 + Math.sin(farmer.runPhase) * 4;
  ctx.strokeStyle = PALETTE.farmerShirt;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + 12, bodyY + 2);
  ctx.lineTo(x + 24 + reach, bodyY + 8 - Math.sin(farmer.runPhase) * 4);
  ctx.moveTo(x + 10, bodyY + 12);
  ctx.lineTo(x + 22 + reach * 0.8, bodyY + 22);
  ctx.stroke();
  // Shirt chest.
  ctx.fillStyle = '#b8452a';
  ctx.fillRect(x - 16, bodyY - 6, 32, 12);

  // Head.
  ctx.fillStyle = PALETTE.farmerSkin;
  ctx.beginPath();
  ctx.arc(x + 2, bodyY - 18, 13, 0, Math.PI * 2);
  ctx.fill();
  // Moustache.
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(x - 6, bodyY - 14, 16, 4);
  // Straw hat.
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath();
  ctx.ellipse(x + 2, bodyY - 28, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 10, bodyY - 40, 24, 13);
  // Shout burst.
  if (farmer.shoutTimer > 0) {
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('COME BACK HERE!', x + 26, bodyY - 46);
  }
  ctx.restore();
}
