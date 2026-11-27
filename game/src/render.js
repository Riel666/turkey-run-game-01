// render.js — everything the player sees, drawn on one canvas.
// Autumn farm, orchard and kitchen backdrops, the obstacles, the HUD and the
// title / caught / escaped screens. All art is drawn in code.
import {
  CANVAS_W, CANVAS_H, GROUND_Y, ESCAPE_DISTANCE_M, PALETTE,
} from './config.js';
import { drawTurkey } from './turkey.js';
import { drawFarmer } from './farmer.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawBackground(ctx, stage, distanceM) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.sky);
  sky.addColorStop(1, stage.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);
  // Sun.
  ctx.fillStyle = '#fff0b8';
  ctx.beginPath();
  ctx.arc(820, 84, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 184, 0.35)';
  ctx.beginPath();
  ctx.arc(820, 84, 52, 0, Math.PI * 2);
  ctx.fill();
  // Distant hills, parallax by distance.
  ctx.fillStyle = stage.accent;
  ctx.globalAlpha = 0.5;
  const off = (distanceM * 8) % 480;
  for (let i = -1; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(i * 480 - off + 240, GROUND_Y + 40, 220, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Trees / barn silhouette strip.
  ctx.fillStyle = stage.ground;
  ctx.globalAlpha = 0.65;
  const off2 = (distanceM * 22) % 320;
  for (let i = -1; i < 4; i++) {
    const tx = i * 320 - off2 + 90;
    ctx.beginPath();
    ctx.arc(tx, GROUND_Y - 18, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(tx - 5, GROUND_Y - 20, 10, 22);
  }
  ctx.globalAlpha = 1;
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 10);
  // Drifting leaves.
  ctx.fillStyle = '#d97b2f';
  for (let i = 0; i < 8; i++) {
    const lx = ((i * 173 + distanceM * 30) % (CANVAS_W + 40)) - 20;
    const ly = 120 + ((i * 67) % 300) + Math.sin(distanceM * 0.05 + i) * 8;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(i * 0.7);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}

export function drawObstacle(ctx, ob, time) {
  const ground = GROUND_Y;
  if (ob.kind === 'fence') {
    ctx.fillStyle = '#7d5230';
    ctx.fillRect(ob.x, ground - ob.h, 6, ob.h);
    ctx.fillRect(ob.x + ob.w - 6, ground - ob.h, 6, ob.h);
    ctx.fillRect(ob.x - 4, ground - ob.h + 8, ob.w + 8, 7);
    ctx.fillRect(ob.x - 4, ground - ob.h + 30, ob.w + 8, 7);
    ctx.fillRect(ob.x - 4, ground - ob.h + 52, ob.w + 8, 7);
  } else if (ob.kind === 'haybale') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(ob.x + ob.w / 2, ground - ob.h / 2, ob.h / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ob.x + ob.w / 2, ground - ob.h / 2, ob.h / 2 - 6, 0, Math.PI * 2);
    ctx.stroke();
  } else if (ob.kind === 'puddle') {
    ctx.fillStyle = '#7fb3d5';
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2, ground - 4, ob.w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2 - 12, ground - 6, 18, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (ob.kind === 'oven') {
    ctx.fillStyle = PALETTE.ovenBody;
    roundRect(ctx, ob.x, ground - ob.h, ob.w, ob.h, 8);
    ctx.fill();
    ctx.fillStyle = '#2e2e36';
    roundRect(ctx, ob.x + 10, ground - ob.h + 18, ob.w - 20, 46, 6);
    ctx.fill();
    const flicker = 0.6 + Math.sin(time * 9 + ob.x) * 0.25;
    ctx.fillStyle = `rgba(255, 122, 47, ${flicker})`;
    roundRect(ctx, ob.x + 16, ground - ob.h + 24, ob.w - 32, 34, 4);
    ctx.fill();
    ctx.fillStyle = '#dfe6ea';
    ctx.fillRect(ob.x + 8, ground - 14, ob.w - 16, 5);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', ob.x + ob.w / 2, ground - ob.h - 8);
  } else if (ob.kind === 'knifeSwing') {
    // Rope from a branch above, blade swinging low across head height.
    const sway = Math.sin(time * 2.4 + ob.swing) * 5;
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ob.x + 11, GROUND_Y - 150);
    ctx.lineTo(ob.x + 11 + sway, GROUND_Y - 74);
    ctx.stroke();
    ctx.save();
    ctx.translate(ob.x + 11 + sway, GROUND_Y - 58);
    ctx.rotate(Math.sin(time * 2.4 + ob.swing) * 0.12);
    ctx.fillStyle = PALETTE.knifeBlade;
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(6, -14);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.knifeHandle;
    ctx.fillRect(-6, -22, 12, 10);
    ctx.restore();
  } else if (ob.kind === 'knifeRoll') {
    // A carving knife skidding along the ground, handle first.
    ctx.save();
    ctx.translate(ob.x + ob.w / 2, ground - 12);
    ctx.rotate(-0.12);
    ctx.fillStyle = PALETTE.knifeBlade;
    ctx.beginPath();
    ctx.moveTo(-26, -6);
    ctx.lineTo(14, -6);
    ctx.lineTo(30, 0);
    ctx.lineTo(14, 6);
    ctx.lineTo(-26, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.knifeHandle;
    ctx.fillRect(-34, -6, 10, 12);
    ctx.restore();
  }
}

export function drawCorn(ctx, corn, time) {
  const bobY = Math.sin(time * 5 + corn.bob) * 3;
  ctx.save();
  ctx.translate(corn.x, corn.y + bobY);
  ctx.fillStyle = PALETTE.cornHusk;
  ctx.beginPath();
  ctx.moveTo(-8, 12);
  ctx.lineTo(-14, -4);
  ctx.lineTo(-8, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.corn;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9a41f';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4, -10);
    ctx.lineTo(i * 4, 10);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawHaystack(ctx, hay, time) {
  const ground = GROUND_Y;
  ctx.fillStyle = '#e0aa3e';
  ctx.beginPath();
  ctx.moveTo(hay.x, ground);
  ctx.quadraticCurveTo(hay.x + hay.w / 2, ground - hay.h - 14, hay.x + hay.w, ground);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8862a';
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(hay.x + (hay.w * i) / 5, ground - 8);
    ctx.quadraticCurveTo(hay.x + (hay.w * i) / 5 + 4, ground - hay.h / 2, hay.x + (hay.w * i) / 5, ground - hay.h + 6);
    ctx.stroke();
  }
  if (!hay.used) {
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE! ↓', hay.x + hay.w / 2, ground - hay.h - 10);
  }
}

export function drawHud(ctx, world, farmer) {
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 12, 10, 300, 74, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`SCORE ${Math.floor(world.score)}`, 24, 34);
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`🌽 ${world.cornCollected}    ${Math.floor(world.distanceM)} m / ${ESCAPE_DISTANCE_M} m`, 24, 58);
  ctx.fillText(`${world.stage.name}`, 24, 76);
  // Lives as hearts.
  ctx.font = '20px Georgia, serif';
  ctx.fillText('♥'.repeat(Math.max(0, world.lives)) + '♡'.repeat(Math.max(0, 3 - world.lives)), 330, 34);
  // Farmer proximity meter.
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, CANVAS_W - 272, 10, 260, 40, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('FARMER BRAM', CANVAS_W - 260, 26);
  const frac = farmer.gap / 420;
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(CANVAS_W - 160, 16, 140, 12);
  ctx.fillStyle = frac > 0.45 ? '#7fae4e' : frac > 0.2 ? '#e8a83c' : '#c0392b';
  ctx.fillRect(CANVAS_W - 160, 16, 140 * frac, 12);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '12px Georgia, serif';
  ctx.fillText(frac > 0.45 ? 'far behind' : frac > 0.2 ? 'closing in!' : 'RIGHT BEHIND YOU!', CANVAS_W - 260, 44);
  // Distance progress bar.
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 12, CANVAS_H - 26, CANVAS_W - 24, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#7fae4e';
  const prog = Math.min(1, world.distanceM / ESCAPE_DISTANCE_M);
  roundRect(ctx, 12, CANVAS_H - 26, (CANVAS_W - 24) * prog, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM WOODS →', CANVAS_W - 70, CANVAS_H - 30);
  // Stage banner.
  if (world.bannerTimer > 0 && world.banner) {
    ctx.globalAlpha = Math.min(1, world.bannerTimer);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.banner, CANVAS_W / 2, 150);
    ctx.globalAlpha = 1;
  }
  // Hidden flash.
  if (world.hiddenFlash > 0) {
    ctx.globalAlpha = Math.min(1, world.hiddenFlash);
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN! +50', CANVAS_W / 2, 200);
    ctx.globalAlpha = 1;
  }
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(40, 20, 8, 0.62)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function panel(ctx, y, h) {
  ctx.fillStyle = 'rgba(46, 26, 10, 0.82)';
  roundRect(ctx, 130, y, CANVAS_W - 260, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#e8a83c';
  ctx.lineWidth = 2;
  roundRect(ctx, 130, y, CANVAS_W - 260, h, 16);
  ctx.stroke();
}

export function drawTitle(ctx, time) {
  const turkey = { x: CANVAS_W / 2, y: GROUND_Y - 6, vy: 0, ducking: false, stumbling: 0, runPhase: time * 8, grounded: true };
  drawTurkey(ctx, turkey, time);
  ctx.fillStyle = '#fff3d6';
  ctx.textAlign = 'center';
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText('TURKEY RUN', CANVAS_W / 2, 110);
  ctx.font = 'italic bold 30px Georgia, serif';
  ctx.fillStyle = '#ffd98a';
  ctx.fillText('— The Great Escape —', CANVAS_W / 2, 152);
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#fff3d6';
  ctx.fillText('Thanksgiving is coming. Farmer Bram wants dinner.', CANVAS_W / 2, 196);
  ctx.fillText('Run 1,500 m to Freedom Woods — dodge the oven and the carving knife!', CANVAS_W / 2, 224);
  const blink = Math.floor(time * 1.6) % 2 === 0;
  if (blink) {
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = '#ffe9b8';
    ctx.fillText('Press SPACE or CLICK to run!', CANVAS_W / 2, 300);
  }
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#e8d9b8';
  ctx.fillText('↑ / SPACE / click — jump      ↓ / S — duck & hide in haystacks', CANVAS_W / 2, 340);
  ctx.fillText('Grab corn 🌽 for points · Hide to lose the farmer · P pause · M sound', CANVAS_W / 2, 364);
  ctx.fillText('3 lives. If Bram catches you, you are dinner.', CANVAS_W / 2, 388);
}

export function drawCaught(ctx, world) {
  overlay(ctx);
  panel(ctx, 96, 300);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb08a';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.fillText('CAUGHT!', CANVAS_W / 2, 168);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(world.overReason, CANVAS_W / 2, 210);
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Score ${Math.floor(world.score)}   ·   Distance ${Math.floor(world.distanceM)} m   ·   Corn 🌽 ${world.cornCollected}`, CANVAS_W / 2, 252);
  ctx.fillText('Farmer Bram is already lighting the oven…', CANVAS_W / 2, 282);
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText('Press R or CLICK to try again', CANVAS_W / 2, 340);
}

export function drawEscaped(ctx, world) {
  overlay(ctx);
  panel(ctx, 96, 300);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a8e07a';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.fillText('ESCAPED!', CANVAS_W / 2, 168);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(world.overReason, CANVAS_W / 2, 210);
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Score ${Math.floor(world.score)}   ·   Distance ${Math.floor(world.distanceM)} m   ·   Corn 🌽 ${world.cornCollected}`, CANVAS_W / 2, 252);
  ctx.fillText('Gobbles lives to gobble another day. Happy Thanksgiving — for the turkey!', CANVAS_W / 2, 282);
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText('Press R or CLICK to run again', CANVAS_W / 2, 340);
}

export function drawPaused(ctx) {
  overlay(ctx);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2 - 10);
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Press P to keep running', CANVAS_W / 2, CANVAS_H / 2 + 26);
}
