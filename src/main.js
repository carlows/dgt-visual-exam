import * as THREE from 'three';
import { createBaseScene, laneCenter } from './world.js';
import { TEMAS, SCENARIOS } from './scenarios/index.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 300);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// UI

const ui = {
  menu: document.getElementById('menu'),
  menuTitle: document.getElementById('menu-title'),
  menuSubtitle: document.getElementById('menu-subtitle'),
  list: document.getElementById('scenario-list'),
  hud: document.getElementById('hud'),
  hudTitle: document.getElementById('hud-title'),
  dash: document.getElementById('dash'),
  question: document.getElementById('question'),
  questionText: document.getElementById('question-text'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  result: document.getElementById('feedback-result'),
  explanation: document.getElementById('feedback-explanation'),
  rule: document.getElementById('feedback-rule'),
  app: document.getElementById('app'),
  btnPeek: document.getElementById('btn-peek'),
  btnReplay: document.getElementById('btn-replay'),
  btnNext: document.getElementById('btn-next'),
  btnMenu: document.getElementById('btn-menu'),
};

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// ---------------------------------------------------------------------------
// Estado

let state = 'menu'; // menu | driving | question | feedback
let scene = createBaseScene();
let current = null;
let currentIndex = 0;
let npcs = [];
let elapsed = 0;
const player = new THREE.Group();
const headlight = new THREE.SpotLight(0xfff2d0, 0, 45, 0.5, 0.5, 1.2);
headlight.position.set(0, 1.1, 0);
headlight.target.position.set(0, 0, -20);
player.add(headlight, headlight.target);

function loadScenario(index) {
  currentIndex = index;
  current = SCENARIOS[index];
  scene = createBaseScene(current.env ?? {});
  npcs = current.build(scene) || [];
  elapsed = 0;
  resetView();
  setPeek(false);
  hide(ui.btnPeek);

  // Faros del vehículo propio en escenas oscuras
  const mode = current.env?.mode ?? 'day';
  headlight.intensity = (mode === 'night' || mode === 'dusk') ? 60 : (mode === 'fog' ? 25 : 0);

  player.position.set(current.playerLane !== undefined ? current.playerLane : laneCenter(1), 0, current.playerStart);
  scene.add(player);

  camera.position.set(0, 1.3, 0);
  camera.rotation.set(0, 0, 0);
  player.add(camera);

  ui.hudTitle.textContent = `${current.tag} — ${current.title}`;
  hide(ui.menu); hide(ui.question); hide(ui.feedback);
  show(ui.hud); show(ui.dash);
  state = 'driving';
}

function showQuestion() {
  state = 'question';
  hide(ui.hud);
  show(ui.btnPeek);
  setPeek(false);
  ui.question.classList.remove('side-left', 'side-right');
  if (current.panel === 'left') ui.question.classList.add('side-left');
  if (current.panel === 'right') ui.question.classList.add('side-right');
  ui.questionText.textContent = current.question;
  ui.options.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  current.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="key">${letters[i]}</span>${opt.text}`;
    btn.addEventListener('click', () => answer(opt));
    ui.options.appendChild(btn);
  });
  show(ui.question);
}

function answer(opt) {
  state = 'feedback';
  hide(ui.question);
  setPeek(false);
  if (opt.correct) {
    ui.result.textContent = '✔ Correcto';
    ui.result.className = 'ok';
    ui.explanation.textContent = current.explanation;
  } else {
    ui.result.textContent = '✘ Incorrecto';
    ui.result.className = 'ko';
    ui.explanation.textContent = `${opt.feedback ?? ''} ${current.explanation}`;
  }
  ui.rule.textContent = current.rule;
  show(ui.feedback);
}

// ---------------------------------------------------------------------------
// Menú en dos niveles: temas → escenarios

function showMenu() {
  state = 'menu';
  hide(ui.hud); hide(ui.dash); hide(ui.question); hide(ui.feedback); hide(ui.btnPeek);
  setPeek(false);
  renderTemaMenu();
  show(ui.menu);
}

// ---------------------------------------------------------------------------
// Ver escena (ocultar panel) y mirar alrededor arrastrando

let peeking = false;
function setPeek(on) {
  peeking = on;
  ui.app.classList.toggle('peeking', on);
  ui.btnPeek.textContent = on
    ? (state === 'feedback' ? '❓ Volver a la explicación' : '❓ Volver a la pregunta')
    : '👁 Ver escena';
}
ui.btnPeek.addEventListener('click', () => setPeek(!peeking));

let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0;
camera.rotation.order = 'YXZ';
function resetView() {
  yaw = 0; pitch = 0; dragging = false;
  camera.rotation.set(0, 0, 0);
}
function panActive() { return state === 'question' || state === 'feedback'; }

canvas.addEventListener('pointerdown', (e) => {
  if (!panActive()) return;
  dragging = true;
  lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging || !panActive()) return;
  yaw -= (e.clientX - lastX) * 0.005;
  pitch -= (e.clientY - lastY) * 0.005;
  pitch = Math.max(-0.7, Math.min(0.7, pitch));
  lastX = e.clientX; lastY = e.clientY;
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });

function renderTemaMenu() {
  ui.menuTitle.textContent = 'Situaciones DGT';
  ui.menuSubtitle.textContent = 'Elige un tema. Conduces en primera persona y, en el momento clave, decides qué hacer.';
  ui.list.innerHTML = '';
  TEMAS.forEach((tema) => {
    const btn = document.createElement('button');
    btn.className = 'scenario-btn';
    btn.innerHTML = `<span class="tag">${tema.scenarios.length} situaciones</span><br>${tema.title}`;
    btn.addEventListener('click', () => renderScenarioMenu(tema));
    ui.list.appendChild(btn);
  });
  const rand = document.createElement('button');
  rand.className = 'scenario-btn random';
  rand.innerHTML = `<span class="tag">Al azar</span><br>Situación aleatoria`;
  rand.addEventListener('click', () => loadScenario(Math.floor(Math.random() * SCENARIOS.length)));
  ui.list.appendChild(rand);
}

function renderScenarioMenu(tema) {
  ui.menuTitle.textContent = tema.title;
  ui.menuSubtitle.textContent = '';
  ui.list.innerHTML = '';
  const back = document.createElement('button');
  back.className = 'scenario-btn back';
  back.textContent = '← Temas';
  back.addEventListener('click', renderTemaMenu);
  ui.list.appendChild(back);
  tema.scenarios.forEach((s) => {
    const idx = SCENARIOS.indexOf(s);
    const btn = document.createElement('button');
    btn.className = 'scenario-btn';
    btn.textContent = s.title;
    btn.addEventListener('click', () => loadScenario(idx));
    ui.list.appendChild(btn);
  });
}

ui.btnReplay.addEventListener('click', () => loadScenario(currentIndex));
ui.btnNext.addEventListener('click', () => loadScenario((currentIndex + 1) % SCENARIOS.length));
ui.btnMenu.addEventListener('click', showMenu);

// Atajos de teclado A/B/C durante la pregunta
window.addEventListener('keydown', (e) => {
  if (state !== 'question') return;
  const idx = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
  if (idx >= 0 && idx < current.options.length) answer(current.options[idx]);
});

// Acceso programático (tests automatizados y depuración)
window.DGT = { load: loadScenario, SCENARIOS, TEMAS, answer: (i) => answer(current.options[i]) };

// ---------------------------------------------------------------------------
// Bucle

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state !== 'menu' && current) {
    elapsed += dt;
    current.tick?.(elapsed, dt); // luces, semáforos, balizas: sigue animando en la pregunta
  }

  if (state === 'driving') {
    player.position.z -= current.playerSpeed * dt;
    for (const npc of npcs) {
      if (npc.orbit) {
        // Trayectoria circular (glorietas). Con angSpeed negativo el vehículo
        // circula en el sentido reglamentario (isleta a su izquierda).
        npc.orbit.angle += npc.orbit.angSpeed * dt;
        const { cx, cz, r, angle } = npc.orbit;
        npc.mesh.position.set(cx + r * Math.cos(angle), 0, cz + r * Math.sin(angle));
        npc.mesh.rotation.y = -angle;
      } else if (npc.path) {
        // Polilínea de puntos [x, z] recorrida a npc.speed
        const i = npc._i ?? (npc._i = 0);
        if (i < npc.path.length) {
          const [tx, tz] = npc.path[i];
          const dx = tx - npc.mesh.position.x;
          const dz = tz - npc.mesh.position.z;
          const dist = Math.hypot(dx, dz);
          const step = (npc.speed ?? 6) * dt;
          if (dist <= step) {
            npc.mesh.position.set(tx, 0, tz);
            npc._i = i + 1;
          } else {
            npc.mesh.position.x += (dx / dist) * step;
            npc.mesh.position.z += (dz / dist) * step;
            npc.mesh.rotation.y = Math.atan2(-dx, -dz);
          }
        }
      } else if (npc.vel) {
        npc.mesh.position.x += npc.vel[0] * dt;
        npc.mesh.position.z += npc.vel[1] * dt;
      }
    }
    if (player.position.z <= current.triggerZ) showQuestion();
  }

  renderer.render(scene, camera);
}

// Escena de fondo para el menú: el primer escenario, congelado
scene = createBaseScene();
SCENARIOS[0].build(scene);
camera.position.set(10, 8, 30);
camera.lookAt(0, 0, 0);
scene.add(camera);
renderTemaMenu();

animate();
