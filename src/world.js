import * as THREE from 'three';

// Paleta low-poly plana
const COL = {
  ground: 0x8fb573,
  road: 0x3d4045,
  marking: 0xe8e8e8,
  stopLine: 0xf5f5f5,
  sidewalk: 0x9a9a92,
  pole: 0x707880,
  building: [0xd9a066, 0xa8c5d8, 0xc9b7a4, 0xb5d0a0, 0xd8b5c5, 0xe0d5b0],
};

const ROAD_W = 7; // calzada de dos carriles
const LANE_W = ROAD_W / 2;

export function laneCenter(side = 1) {
  // side 1 = carril derecho al conducir hacia -z
  return side * (LANE_W / 2);
}

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function box(w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// Escena base

const ENV = {
  day:   { sky: 0xbfe3f2, fog: [60, 160], hemi: 0.85, sun: 1.6, sunColor: 0xfff4e0, ground: 0x8fb573 },
  dusk:  { sky: 0xe8a97a, fog: [50, 140], hemi: 0.45, sun: 0.7, sunColor: 0xffb070, ground: 0x74915e },
  night: { sky: 0x0b1026, fog: [30, 110], hemi: 0.14, sun: 0.22, sunColor: 0x8fa8ff, ground: 0x2e3c28 },
  fog:   { sky: 0xc8cdd2, fog: [10, 48],  hemi: 0.7,  sun: 0.45, sunColor: 0xffffff, ground: 0x7d9a68 },
};

// mode: 'day' | 'dusk' | 'night' | 'fog'
export function createBaseScene({ mode = 'day' } = {}) {
  const env = ENV[mode] ?? ENV.day;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(env.sky);
  scene.fog = new THREE.Fog(env.sky, env.fog[0], env.fog[1]);

  const hemi = new THREE.HemisphereLight(0xffffff, env.ground, env.hemi);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(env.sunColor, env.sun);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.camera.far = 150;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(env.ground));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  return scene;
}

// Farola con luz puntual: usar con moderación (máx. 4-5 por escena, modo night)
export function addStreetlight(scene, { x, z } = {}) {
  const pole = box(0.12, 4.5, 0.12, COL.pole);
  pole.position.set(x, 2.25, z);
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.18, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
  );
  lamp.position.set(x, 4.55, z);
  const light = new THREE.PointLight(0xffd9a0, 30, 22, 1.8);
  light.position.set(x, 4.4, z);
  scene.add(pole, lamp, light);
}

// ---------------------------------------------------------------------------
// Carreteras y marcas viales (señalización horizontal)

export function addRoadZ(scene, { x = 0, from, to, width = ROAD_W } = {}) {
  const len = Math.abs(to - from);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(width, len), mat(COL.road));
  road.rotation.x = -Math.PI / 2;
  road.position.set(x, 0, (from + to) / 2);
  road.receiveShadow = true;
  scene.add(road);
  return road;
}

export function addRoadX(scene, { z = 0, from, to, width = ROAD_W } = {}) {
  const len = Math.abs(to - from);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(len, width), mat(COL.road));
  road.rotation.x = -Math.PI / 2;
  road.position.set((from + to) / 2, 0, z);
  road.receiveShadow = true;
  scene.add(road);
  return road;
}

// Línea discontinua central sobre una vía en eje Z
export function addDashesZ(scene, { x = 0, from, to } = {}) {
  const dashLen = 1.6, gap = 2.4;
  const dir = Math.sign(to - from);
  for (let z = from; dir > 0 ? z < to : z > to; z += dir * (dashLen + gap)) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.15, dashLen), mat(COL.marking));
    d.rotation.x = -Math.PI / 2;
    d.position.set(x, 0.01, z + (dir * dashLen) / 2);
    scene.add(d);
  }
}

export function addDashesX(scene, { z = 0, from, to } = {}) {
  const dashLen = 1.6, gap = 2.4;
  const dir = Math.sign(to - from);
  for (let x = from; dir > 0 ? x < to : x > to; x += dir * (dashLen + gap)) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, 0.15), mat(COL.marking));
    d.rotation.x = -Math.PI / 2;
    d.position.set(x + (dir * dashLen) / 2, 0.01, z);
    scene.add(d);
  }
}

// Línea continua central sobre una vía en eje Z
export function addSolidLineZ(scene, { x = 0, from, to } = {}) {
  const len = Math.abs(to - from);
  const l = new THREE.Mesh(new THREE.PlaneGeometry(0.15, len), mat(COL.marking));
  l.rotation.x = -Math.PI / 2;
  l.position.set(x, 0.01, (from + to) / 2);
  scene.add(l);
}

// Paso de peatones: bandas paralelas al sentido de la marcha
export function addCrosswalk(scene, { z, width = ROAD_W } = {}) {
  const n = Math.floor(width / 1.0);
  for (let i = 0; i < n; i++) {
    const x = -width / 2 + 0.5 + i * 1.0;
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.4), mat(COL.stopLine));
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.012, z);
    scene.add(stripe);
  }
}

// Glorieta: anillo de calzada + isleta central
export function addRoundabout(scene, { rInner = 5, rOuter = 12 } = {}) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(rInner, rOuter, 48), mat(COL.road));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.001;
  ring.receiveShadow = true;
  scene.add(ring);

  const island = new THREE.Mesh(new THREE.CircleGeometry(rInner, 32), mat(COL.sidewalk));
  island.rotation.x = -Math.PI / 2;
  island.position.y = 0.02;
  scene.add(island);

  const grass = new THREE.Mesh(new THREE.CircleGeometry(rInner - 1, 32), mat(0x6da85c));
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = 0.03;
  scene.add(grass);

  const trunk = box(0.35, 1.6, 0.35, 0x8a6642);
  trunk.position.y = 0.8;
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), mat(0x5e9e4a));
  crown.position.y = 2.6;
  crown.castShadow = true;
  scene.add(trunk, crown);
}

// Línea de detención (marca horizontal) cruzando el carril derecho, en eje Z hacia -z
export function addStopLine(scene, { x = laneCenter(1), z, width = LANE_W - 0.4 } = {}) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.45), mat(COL.stopLine));
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.012, z);
  scene.add(line);
}

// Marca de ceda el paso: triángulos pintados en el carril
export function addYieldMarks(scene, { x = laneCenter(1), z } = {}) {
  for (let i = -1; i <= 1; i++) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.35, 0);
    shape.lineTo(0.35, 0);
    shape.lineTo(0, -1.0);
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape);
    const t = new THREE.Mesh(g, mat(COL.stopLine));
    t.rotation.x = -Math.PI / 2;
    t.position.set(x + i * 1.0, 0.012, z);
    scene.add(t);
  }
}

// Tramo de vía genérico con rotación libre (rampas de incorporación, diagonales)
export function addRoadSeg(scene, { x = 0, z = 0, rotY = 0, len = 40, width = ROAD_W, color = COL.road } = {}) {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(width, len), mat(color));
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rotY; // giro en el plano del suelo
  road.position.set(x, 0, z);
  road.receiveShadow = true;
  scene.add(road);
  return road;
}

// Flecha de carril pintada en la calzada. dir: 'up' | 'left' | 'right' | 'return'
export function addLaneArrow(scene, { x = laneCenter(1), z, dir = 'up' } = {}) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.moveTo(64, 10); ctx.lineTo(100, 80); ctx.lineTo(76, 80); ctx.lineTo(76, 246);
  ctx.lineTo(52, 246); ctx.lineTo(52, 80); ctx.lineTo(28, 80); ctx.closePath();
  ctx.fill();
  if (dir === 'left' || dir === 'right') {
    const sx = dir === 'left' ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(64 + sx * 0, 90); ctx.lineTo(64 + sx * 40, 120); ctx.lineTo(64 + sx * 20, 150);
    ctx.closePath(); ctx.fill();
  }
  if (dir === 'return') {
    ctx.beginPath();
    ctx.moveTo(52, 100); ctx.lineTo(20, 140); ctx.lineTo(52, 160);
    ctx.closePath(); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 2.4),
    new THREE.MeshLambertMaterial({ map: tex, transparent: true })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.013, z);
  scene.add(m);
  return m;
}

// Túnel sencillo sobre la vía en eje Z
export function addTunnel(scene, { from, to, width = 10, height = 4.5 } = {}) {
  const len = Math.abs(to - from);
  const zc = (from + to) / 2;
  const wallL = box(0.6, height, len, 0x555a60);
  wallL.position.set(-width / 2, height / 2, zc);
  const wallR = wallL.clone();
  wallR.position.x = width / 2;
  const roof = box(width + 0.6, 0.5, len, 0x4a4e54);
  roof.position.set(0, height + 0.25, zc);
  scene.add(wallL, wallR, roof);
}

// ---------------------------------------------------------------------------
// Entorno: edificios y árboles para dar contexto urbano

export function addCityBlocks(scene, { avoid = 14 } = {}) {
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 40; i++) {
    const gx = (rand() - 0.5) * 180;
    const gz = (rand() - 0.5) * 180;
    if (Math.abs(gx) < avoid || Math.abs(gz) < avoid) continue;
    const h = 4 + rand() * 12;
    const b = box(6 + rand() * 8, h, 6 + rand() * 8, COL.building[i % COL.building.length]);
    b.position.set(gx, h / 2, gz);
    scene.add(b);
  }
  for (let i = 0; i < 25; i++) {
    const gx = (rand() - 0.5) * 160;
    const gz = (rand() - 0.5) * 160;
    if (Math.abs(gx) < 6 || Math.abs(gz) < 6) continue;
    const trunk = box(0.3, 1.2, 0.3, 0x8a6642);
    trunk.position.set(gx, 0.6, gz);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), mat(0x5e9e4a));
    crown.position.set(gx, 2.0, gz);
    crown.castShadow = true;
    scene.add(trunk, crown);
  }
}

// ---------------------------------------------------------------------------
// Vehículos

export function makeCar(color = 0xd45050) {
  const g = new THREE.Group();
  const body = box(1.7, 0.55, 3.6, color);
  body.position.y = 0.45;
  const cabin = box(1.5, 0.5, 1.8, color);
  cabin.position.set(0, 0.95, -0.1);
  const glass = box(1.52, 0.32, 1.82, 0x9fd4e8);
  glass.position.set(0, 0.98, -0.1);
  g.add(body, cabin, glass);
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12);
  const wheelMat = mat(0x222222);
  for (const [wx, wz] of [[-0.8, 1.15], [0.8, 1.15], [-0.8, -1.15], [0.8, -1.15]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.32, wz);
    w.castShadow = true;
    g.add(w);
  }
  return g;
}

// Peatón low-poly (misma constitución que el agente, ropa de calle)
export function makePeaton({ shirt = 0x4a7fd4, pants = 0x555555 } = {}) {
  const g = new THREE.Group();
  const legL = box(0.16, 0.75, 0.16, pants);
  legL.position.set(-0.12, 0.375, 0);
  const legR = legL.clone();
  legR.position.x = 0.12;
  const torso = box(0.5, 0.65, 0.28, shirt);
  torso.position.y = 1.08;
  const head = box(0.26, 0.26, 0.26, 0xe8b88a);
  head.position.y = 1.58;
  const armL = box(0.13, 0.6, 0.13, shirt);
  armL.position.set(-0.32, 1.1, 0);
  const armR = armL.clone();
  armR.position.x = 0.32;
  g.add(legL, legR, torso, head, armL, armR);
  g.scale.setScalar(1.15);
  return g;
}

// Camión / furgón
export function makeTruck(color = 0xc9762b) {
  const g = new THREE.Group();
  const cargo = box(2.1, 2.0, 4.6, color);
  cargo.position.set(0, 1.3, 0.6);
  const cab = box(2.0, 1.4, 1.6, 0x5577aa);
  cab.position.set(0, 1.0, -2.6);
  const glass = box(1.9, 0.5, 0.2, 0x9fd4e8);
  glass.position.set(0, 1.35, -3.35);
  g.add(cargo, cab, glass);
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12);
  const wheelMat = mat(0x222222);
  for (const [wx, wz] of [[-0.95, 1.6], [0.95, 1.6], [-0.95, -0.2], [0.95, -0.2], [-0.95, -2.6], [0.95, -2.6]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.42, wz);
    g.add(w);
  }
  return g;
}

// Ciclista (bici + figura)
export function makeBike({ shirt = 0xd45050 } = {}) {
  const g = new THREE.Group();
  const frame = box(0.12, 0.5, 1.4, 0x333333);
  frame.position.y = 0.65;
  const wheelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.08, 14);
  const wheelMat = mat(0x222222);
  for (const wz of [0.65, -0.65]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(0, 0.33, wz);
    g.add(w);
  }
  const torso = box(0.4, 0.55, 0.25, shirt);
  torso.position.set(0, 1.25, 0.15);
  torso.rotation.x = 0.35;
  const head = box(0.24, 0.24, 0.24, 0xe8b88a);
  head.position.set(0, 1.62, -0.05);
  const casco = box(0.28, 0.1, 0.28, 0xeeeeee);
  casco.position.set(0, 1.77, -0.05);
  g.add(frame, torso, head, casco);
  return g;
}

// Ambulancia: userData.beacon es la luz del techo — parpadear desde tick():
//   amb.userData.beacon.material.color.set(t % 0.6 < 0.3 ? 0x2a6cff : 0x9ab8ff)
export function makeAmbulance() {
  const g = makeTruck(0xf2f2f2);
  const stripe = box(2.12, 0.3, 4.62, 0xd44);
  stripe.position.set(0, 1.0, 0.6);
  const beacon = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.22, 0.4),
    new THREE.MeshBasicMaterial({ color: 0x2a6cff })
  );
  beacon.position.set(0, 2.45, 0.6);
  g.add(stripe, beacon);
  g.userData.beacon = beacon;
  return g;
}

// ---------------------------------------------------------------------------
// Señales verticales (cara dibujada en canvas → plano)

function signCanvas(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Primitivas de dibujo compartidas
function circleSign(ctx, { ring = '#c1121f', bg = '#fff' } = {}) {
  ctx.fillStyle = ring;
  ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(128, 128, 92, 0, Math.PI * 2); ctx.fill();
}
function blueSquare(ctx) {
  ctx.fillStyle = '#1c5bb8';
  ctx.fillRect(10, 10, 236, 236);
}
function warnTriangle(ctx) {
  ctx.fillStyle = '#c1121f';
  ctx.beginPath(); ctx.moveTo(128, 16); ctx.lineTo(244, 226); ctx.lineTo(12, 226); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(128, 54); ctx.lineTo(216, 208); ctx.lineTo(40, 208); ctx.closePath(); ctx.fill();
}
function slash(ctx, color = '#c1121f', w = 18) {
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(48, 208); ctx.lineTo(208, 48); ctx.stroke();
}
function arrow(ctx, rot = 0, color = '#fff') {
  ctx.save(); ctx.translate(128, 128); ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -70); ctx.lineTo(34, -22); ctx.lineTo(14, -22); ctx.lineTo(14, 66);
  ctx.lineTo(-14, 66); ctx.lineTo(-14, -22); ctx.lineTo(-34, -22); ctx.closePath();
  ctx.fill(); ctx.restore();
}
function person(ctx, x, y, s, color = '#111') {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - s * 0.85, s * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - s * 0.12, y - s * 0.65, s * 0.24, s * 0.45);
  ctx.beginPath(); ctx.moveTo(x, y - s * 0.2); ctx.lineTo(x - s * 0.28, y); ctx.lineTo(x - s * 0.14, y);
  ctx.lineTo(x, y - s * 0.05); ctx.lineTo(x + s * 0.14, y); ctx.lineTo(x + s * 0.28, y); ctx.closePath(); ctx.fill();
}
function carGlyph(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 26, y - 14, 52, 34);
  ctx.fillRect(x - 16, y - 30, 32, 18);
}

// Cada cara recibe (ctx, opts) — opts viene de addSign(type, { value, dir, ... })
const SIGN_FACES = {
  velocidad: (ctx, { value = 50 } = {}) => {
    circleSign(ctx);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 96px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(value), 128, 134);
  },
  finLimitaciones: (ctx, { value = '' } = {}) => {
    circleSign(ctx, { ring: '#fff' });
    ctx.fillStyle = '#666';
    if (value) { ctx.font = 'bold 84px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(value), 128, 134); }
    slash(ctx, '#666', 14); slash(ctx, '#666', 14);
  },
  prohibidoAdelantar: (ctx) => {
    circleSign(ctx);
    carGlyph(ctx, 88, 138, '#c1121f');
    carGlyph(ctx, 172, 138, '#111');
  },
  finProhibidoAdelantar: (ctx) => {
    circleSign(ctx, { ring: '#fff' });
    carGlyph(ctx, 88, 138, '#888');
    carGlyph(ctx, 172, 138, '#888');
    slash(ctx, '#666', 14);
  },
  prohibidoEntrada: (ctx) => {
    ctx.fillStyle = '#c1121f';
    ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(38, 108, 180, 40);
  },
  circulacionProhibida: (ctx) => { circleSign(ctx); },
  sentidoObligatorio: (ctx, { dir = 'up' } = {}) => {
    ctx.fillStyle = '#1c5bb8';
    ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();
    const rot = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[dir] ?? 0;
    arrow(ctx, rot);
  },
  pasoPeatonesAzul: (ctx) => {
    blueSquare(ctx);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(128, 40); ctx.lineTo(226, 210); ctx.lineTo(30, 210); ctx.closePath(); ctx.fill();
    person(ctx, 128, 196, 110);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(44 + i * 46, 216, 30, 14); }
  },
  peligro: (ctx, { glyph = 'interseccion' } = {}) => {
    warnTriangle(ctx);
    ctx.fillStyle = '#111';
    if (glyph === 'interseccion') {
      ctx.fillRect(118, 90, 20, 110); ctx.fillRect(83, 125, 90, 20);
    } else if (glyph === 'peatones' || glyph === 'ninos') {
      person(ctx, 118, 195, 100);
      if (glyph === 'ninos') person(ctx, 158, 195, 72);
    } else if (glyph === 'semaforo') {
      ctx.fillRect(113, 95, 30, 100);
      ['#c1121f', '#e8a000', '#2a9d3a'].forEach((c, i) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(128, 112 + i * 32, 11, 0, Math.PI * 2); ctx.fill();
      });
    } else if (glyph === 'estrechamiento') {
      ctx.beginPath(); ctx.moveTo(100, 90); ctx.lineTo(112, 90); ctx.lineTo(118, 200); ctx.lineTo(106, 200); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(156, 90); ctx.lineTo(144, 90); ctx.lineTo(138, 200); ctx.lineTo(150, 200); ctx.closePath(); ctx.fill();
    } else if (glyph === 'glorieta') {
      ctx.strokeStyle = '#111'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(128, 150, 34, 0, Math.PI * 2); ctx.stroke();
    }
  },
  estacionamientoProhibido: (ctx) => {
    ctx.fillStyle = '#c1121f'; ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c5bb8'; ctx.beginPath(); ctx.arc(128, 128, 92, 0, Math.PI * 2); ctx.fill();
    slash(ctx);
  },
  paradaProhibida: (ctx) => {
    ctx.fillStyle = '#c1121f'; ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c5bb8'; ctx.beginPath(); ctx.arc(128, 128, 92, 0, Math.PI * 2); ctx.fill();
    slash(ctx);
    ctx.save(); ctx.translate(256, 0); ctx.scale(-1, 1); slash(ctx); ctx.restore();
  },
  tunel: (ctx) => {
    blueSquare(ctx);
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(128, 150, 70, Math.PI, 0); ctx.fill();
    ctx.fillRect(58, 150, 140, 60);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(128, 155, 48, Math.PI, 0); ctx.fill();
    ctx.fillRect(80, 155, 96, 55);
  },
  estrechamientoCede: (ctx) => {
    circleSign(ctx);
    arrow(ctx, 0, '#111'); ctx.save(); ctx.translate(70, 0); arrow(ctx, Math.PI, '#c1121f'); ctx.restore();
  },
  estrechamientoPrio: (ctx) => {
    blueSquare(ctx);
    arrow(ctx, 0, '#fff'); ctx.save(); ctx.translate(70, 0); arrow(ctx, Math.PI, '#c1121f'); ctx.restore();
  },
  finPrioridad: (ctx) => {
    ctx.save();
    ctx.translate(128, 128); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#fff'; ctx.fillRect(-88, -88, 176, 176);
    ctx.fillStyle = '#f2b705'; ctx.fillRect(-62, -62, 124, 124);
    ctx.restore();
    slash(ctx, '#555', 16);
  },
  zonaResidencial: (ctx) => {
    blueSquare(ctx);
    ctx.fillStyle = '#fff'; ctx.fillRect(30, 120, 90, 70);
    ctx.beginPath(); ctx.moveTo(20, 125); ctx.lineTo(75, 80); ctx.lineTo(130, 125); ctx.closePath(); ctx.fill();
    person(ctx, 180, 200, 110, '#fff');
  },
  stop: (ctx) => {
    ctx.fillStyle = '#c1121f';
    const r = 122, cx = 128, cy = 128;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 8) + (i * Math.PI) / 4;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STOP', 128, 132);
  },
  ceda: (ctx) => {
    ctx.fillStyle = '#c1121f';
    ctx.beginPath();
    ctx.moveTo(14, 30); ctx.lineTo(242, 30); ctx.lineTo(128, 226);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(52, 52); ctx.lineTo(204, 52); ctx.lineTo(128, 182);
    ctx.closePath();
    ctx.fill();
  },
  prioridad: (ctx) => {
    ctx.save();
    ctx.translate(128, 128);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-88, -88, 176, 176);
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(-62, -62, 124, 124);
    ctx.restore();
  },
};

// addSign(scene, 'velocidad', { x, z, value: 40 }) — opts extra van a la cara
export function addSign(scene, type, { x, z, rotY = 0, height = 2.2, ...faceOpts } = {}) {
  const drawFace = SIGN_FACES[type];
  if (!drawFace) throw new Error(`Señal desconocida: ${type}`);
  const g = new THREE.Group();
  const pole = box(0.08, height, 0.08, COL.pole);
  pole.position.y = height / 2;
  g.add(pole);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.85),
    new THREE.MeshLambertMaterial({ map: signCanvas((ctx) => drawFace(ctx, faceOpts)), transparent: true, side: THREE.DoubleSide })
  );
  face.position.y = height + 0.35;
  g.add(face);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  return g;
}

// ---------------------------------------------------------------------------
// Semáforo

// Devuelve un manejador con setActive() para animar fases desde tick()
// (p. ej. ámbar intermitente: setActive(t % 1 < 0.5 ? 'amber' : 'off')).
export function addSemaphore(scene, { x, z, rotY = 0, active = 'green' } = {}) {
  const g = new THREE.Group();
  const pole = box(0.12, 3.2, 0.12, COL.pole);
  pole.position.y = 1.6;
  g.add(pole);
  const head = box(0.45, 1.15, 0.3, 0x2b2b2b);
  head.position.y = 3.35;
  g.add(head);
  const colors = { red: 0xff3b30, amber: 0xffb300, green: 0x2ecc40 };
  const lamps = {};
  ['red', 'amber', 'green'].forEach((name, i) => {
    const lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.13, 16),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    lamp.position.set(0, 3.72 - i * 0.36, 0.16);
    g.add(lamp);
    lamps[name] = lamp;
  });
  function setActive(name) {
    for (const [k, lamp] of Object.entries(lamps)) {
      lamp.material.color.set(k === name ? colors[k] : 0x333333);
    }
  }
  setActive(active);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  return { group: g, setActive };
}

// ---------------------------------------------------------------------------
// Agente de circulación (figura low-poly con poses de brazos)

export function addAgente(scene, { x, z, rotY = 0, pose = 'alto' } = {}) {
  const g = new THREE.Group();

  const legL = box(0.16, 0.75, 0.16, 0x2b3a55);
  legL.position.set(-0.12, 0.375, 0);
  const legR = legL.clone();
  legR.position.x = 0.12;

  const torso = box(0.5, 0.65, 0.28, 0xd6f21b); // chaleco alta visibilidad
  torso.position.y = 1.08;

  const head = box(0.26, 0.26, 0.26, 0xe8b88a);
  head.position.y = 1.58;
  const cap = box(0.3, 0.1, 0.3, 0x2b3a55);
  cap.position.y = 1.75;

  g.add(legL, legR, torso, head, cap);

  // Brazos con pivote en el hombro
  function arm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.32, 1.36, 0);
    const a = box(0.13, 0.6, 0.13, 0xd6f21b);
    a.position.y = -0.3;
    pivot.add(a);
    g.add(pivot);
    return pivot;
  }
  const armL = arm(-1);
  const armR = arm(1);

  // Poses reglamentarias
  if (pose === 'alto') {
    // Brazo levantado verticalmente: detención obligatoria
    armR.rotation.z = Math.PI;
    armL.rotation.z = 0.15;
  } else if (pose === 'frente') {
    // Brazo extendido horizontal (lateral, visible de frente): detiene a
    // quienes se acercan desde direcciones que corten la indicada
    armR.rotation.z = Math.PI / 2;
    armL.rotation.z = 0.15;
  } else if (pose === 'cruz') {
    // Brazos en cruz
    armL.rotation.z = -Math.PI / 2;
    armR.rotation.z = Math.PI / 2;
  } else if (pose === 'luz') {
    // Brazo extendido con luz roja (regulación nocturna)
    armR.rotation.z = Math.PI / 2;
    armL.rotation.z = 0.15;
    const luz = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.14),
      new THREE.MeshBasicMaterial({ color: 0xff2222 })
    );
    luz.position.set(0, -0.62, 0);
    armR.add(luz);
  } else if (pose === 'lento') {
    // Brazo a media altura (balanceo arriba-abajo: reducir velocidad)
    armR.rotation.z = Math.PI / 4;
    armL.rotation.z = 0.15;
  }

  g.scale.setScalar(1.2);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  return g;
}
