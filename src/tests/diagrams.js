// Diagramas de estudio: velocidades por vehículo/vía y alumbrado por situación
// Fuente: Reglamento General de Circulación (art. 48 velocidades, tras
// RD 1514/2018 y RD 970/2020 para vías urbanas) y recomendaciones DGT.

const SPEED_ROWS = [
  {
    vehicle: '🚗 Turismos y motocicletas',
    note: 'También autocaravanas ≤ 3.500 kg y pick-up',
    autopista: { max: 120 },
    convencional: { max: 90 },
  },
  {
    vehicle: '🚌 Autobuses',
    note: 'También derivados de turismo y mixtos adaptables',
    autopista: { max: 100 },
    convencional: { max: 80 },
  },
  {
    vehicle: '🚚 Camiones y furgonetas',
    note: 'También articulados, con remolque y autocaravanas > 3.500 kg',
    autopista: { max: 90 },
    convencional: { max: 80 },
  },
  {
    vehicle: '🛵 Ciclomotores',
    note: 'Prohibido circular por autopista y autovía',
    autopista: { banned: true },
    convencional: { max: 45 },
  },
];

const URBAN_ROWS = [
  { max: 20, desc: 'Calles de plataforma única (calzada y acera al mismo nivel)' },
  { max: 30, desc: 'Vías de un único carril por sentido' },
  { max: 50, desc: 'Vías de dos o más carriles por sentido (todos los vehículos)' },
];

const MIN_RULES = [
  { sign: { min: 60 }, desc: 'Velocidad mínima en autopista y autovía: 60 km/h' },
  { sign: null, desc: 'Regla general: no circular por debajo de la mitad de la velocidad genérica de la vía (convencional 45 km/h, urbana 25 km/h), salvo adelantamiento o causa justificada' },
];

// luces: pos = posición, cruce, carretera (largas), antiN-del, antiN-tras
const LIGHT_SITUATIONS = [
  {
    icon: '🌃',
    title: 'Noche en vía interurbana sin iluminar',
    lights: ['carretera'],
    detail: 'Largas si no deslumbras a otros; cambia a cruce al cruzarte con alguien o al seguir de cerca a otro vehículo.',
  },
  {
    icon: '🏙️',
    title: 'Noche en poblado o vía bien iluminada',
    lights: ['cruce'],
    detail: 'Cruce siempre; las largas están prohibidas en vías urbanas suficientemente iluminadas.',
  },
  {
    icon: '🚇',
    title: 'Túneles y pasos inferiores',
    lights: ['cruce'],
    detail: 'Cruce obligatorio también de día, esté o no iluminado el túnel.',
  },
  {
    icon: '🌫️',
    title: 'Niebla, lluvia intensa o nevada',
    lights: ['cruce', 'antiniebla-del'],
    detail: 'Cruce y/o antiniebla delantera. La antiniebla trasera SOLO con niebla densa, lluvia muy intensa o nevada intensa (deslumbra si la usas sin motivo).',
  },
  {
    icon: '🌅',
    title: 'Amanecer y atardecer (crepúsculo)',
    lights: ['cruce'],
    detail: 'Enciende el cruce en cuanto baje la luz: ver y sobre todo ser visto.',
  },
  {
    icon: '↔️',
    title: 'Carril reversible, adicional o en sentido contrario',
    lights: ['cruce'],
    detail: 'Cruce encendido también de día mientras circules por ese carril.',
  },
  {
    icon: '🏍️',
    title: 'Motocicletas',
    lights: ['cruce'],
    detail: 'Cruce siempre encendido, de día y de noche.',
  },
  {
    icon: '🅿️',
    title: 'Parado o averiado en la calzada de noche',
    lights: ['posicion'],
    detail: 'Luces de posición (y emergencia si obstaculizas). Señaliza además con la luz V-16 o los triángulos.',
  },
  {
    icon: '😎',
    title: 'Si te deslumbran',
    lights: [],
    detail: 'Reduce la velocidad e incluso detente si es necesario; nunca respondas deslumbrando tú.',
  },
];

const LIGHT_LABELS = {
  posicion: { label: 'Posición', cls: 'chip-pos' },
  cruce: { label: 'Cruce (cortas)', cls: 'chip-cruce' },
  carretera: { label: 'Carretera (largas)', cls: 'chip-larga' },
  'antiniebla-del': { label: 'Antiniebla delantera', cls: 'chip-niebla' },
};

function sign(cell) {
  if (!cell) return '';
  if (cell.banned) return '<span class="sign banned" title="Prohibido">⛔</span>';
  if (cell.max != null) return `<span class="sign max">${cell.max}</span>`;
  if (cell.min != null) return `<span class="sign min">${cell.min}</span>`;
  return '';
}

export function renderDiagrams(container) {
  let html = '';

  // --- Velocidades -----------------------------------------------------------
  html += '<div class="stats-block"><h2>Velocidades máximas fuera de poblado</h2>';
  html += '<div class="speed-table"><div class="speed-head"></div><div class="speed-head">Autopista / autovía</div><div class="speed-head">Carretera convencional</div>';
  for (const r of SPEED_ROWS) {
    html += `<div class="speed-vehicle"><strong>${r.vehicle}</strong><span>${r.note}</span></div>`;
    html += `<div class="speed-cell">${sign(r.autopista)}</div>`;
    html += `<div class="speed-cell">${sign(r.convencional)}</div>`;
  }
  html += '</div></div>';

  html += '<div class="stats-block"><h2>Velocidades en vías urbanas (todos los vehículos)</h2><div class="urban-rows">';
  for (const u of URBAN_ROWS) {
    html += `<div class="urban-row">${sign(u)}<span>${u.desc}</span></div>`;
  }
  html += '</div></div>';

  html += '<div class="stats-block"><h2>Velocidades mínimas</h2><div class="urban-rows">';
  for (const m of MIN_RULES) {
    html += `<div class="urban-row">${m.sign ? sign(m.sign) : '<span class="sign spacer"></span>'}<span>${m.desc}</span></div>`;
  }
  html += '</div></div>';

  // --- Alumbrado -------------------------------------------------------------
  html += '<div class="stats-block"><h2>Qué luces usar en cada situación</h2><div class="light-grid">';
  for (const s of LIGHT_SITUATIONS) {
    const chips = s.lights.length
      ? s.lights.map((l) => `<span class="chip ${LIGHT_LABELS[l].cls}">${LIGHT_LABELS[l].label}</span>`).join('')
      : '<span class="chip chip-none">Sin cambio de luces</span>';
    html += `<div class="light-card"><div class="light-title">${s.icon} ${s.title}</div><div class="light-chips">${chips}</div><p>${s.detail}</p></div>`;
  }
  html += '</div></div>';

  html += '<p class="subtitle">Genéricas del Reglamento General de Circulación; una señal concreta siempre manda sobre estos valores.</p>';

  container.innerHTML = html;
}
