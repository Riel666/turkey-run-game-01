// config.js — every tuning number and colour for Turkey Run: The Great Escape.
// One place to tune the run: speed, gravity, stages, scoring and the palette.
export const CANVAS_W = 960;
export const CANVAS_H = 540;
export const GROUND_Y = 470;

export const TURKEY_X = 180;
export const TURKEY_W = 56;
export const TURKEY_H_STAND = 64;
export const TURKEY_H_DUCK = 38;

export const GRAVITY = 2300;
export const JUMP_VELOCITY = -820;
export const BASE_SPEED = 250;
export const SPEED_PER_100M = 16;
export const MAX_SPEED = 540;
export const METERS_PER_PX = 1 / 30;

export const ESCAPE_DISTANCE_M = 1500;
export const START_LIVES = 3;
export const FARMER_GAP_START = 260;
export const FARMER_GAP_MIN = 0;
export const FARMER_GAP_MAX = 420;
export const FARMER_CREEP_PER_S = 5;
export const STUMBLE_GAP_COST = 62;
export const STUMBLE_LIVES_COST = 1;
export const CORN_GAP_BONUS = 4;
export const HIDE_GAP_BONUS = 70;
export const HIDE_SCORE_BONUS = 50;

export const SCORE_PER_METER = 10;
export const SCORE_PER_CORN = 25;

export const STAGES = [
  { name: 'The Farmyard', fromM: 0, toM: 500, sky: '#f7c873', horizon: '#e89b4d', ground: '#a9713a', grass: '#7fae4e', accent: '#c96f2e' },
  { name: 'The Orchard', fromM: 500, toM: 1000, sky: '#f2a65e', horizon: '#d97b3f', ground: '#96602c', grass: '#6d9c3f', accent: '#b8452a' },
  { name: 'The Kitchen', fromM: 1000, toM: 1500, sky: '#e88a4f', horizon: '#c25a33', ground: '#7d4a26', grass: '#5d7f33', accent: '#8f2f1d' },
];

export const PALETTE = {
  turkeyBody: '#8a5a2b',
  turkeyWing: '#6e4520',
  turkeyHead: '#a06a33',
  turkeyFeather: ['#b4552d', '#d97b2f', '#e8a83c', '#7d4a1e', '#c96f2e'],
  turkeyBeak: '#e8a83c',
  turkeyWattle: '#c0392b',
  farmerShirt: '#4a6fa5',
  farmerOveralls: '#3b5a8a',
  farmerSkin: '#e8b98a',
  farmerHat: '#8a6d3b',
  corn: '#f2c230',
  cornHusk: '#7fae4e',
  knifeBlade: '#dfe6ea',
  knifeHandle: '#5b3a1e',
  ovenBody: '#5b5b66',
  ovenGlow: '#ff7a2f',
  hudPanel: 'rgba(46, 26, 10, 0.72)',
  hudText: '#ffe9b8',
  titleText: '#fff3d6',
};

export function stageFor(distanceM) {
  for (const stage of STAGES) {
    if (distanceM < stage.toM) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function speedFor(distanceM) {
  return Math.min(MAX_SPEED, BASE_SPEED + Math.floor(distanceM / 100) * SPEED_PER_100M);
}
