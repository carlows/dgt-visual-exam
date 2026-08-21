// Diagramas de estudio: velocidades por vehículo/vía y alumbrado por situación
// Fuente: Reglamento General de Circulación (art. 48 velocidades, tras
// RD 1514/2018 y RD 970/2020 para vías urbanas) y recomendaciones DGT.

// Cada fila es un grupo con el mismo límite; todos sus vehículos se muestran
// con el mismo peso visual.
const SPEED_ROWS = [
  {
    members: ['🚗 Turismos', '🏍️ Motocicletas', '🚙 Autocaravanas ≤ 3.500 kg', '🛻 Pick-up'],
    autopista: { max: 120 },
    convencional: { max: 90 },
  },
  {
    members: ['🚌 Autobuses', '🚕 Derivados de turismo', '🚑 Vehículos mixtos adaptables'],
    autopista: { max: 100 },
    convencional: { max: 80 },
  },
  {
    members: ['🚚 Camiones y tractocamiones', '🚐 Furgonetas', '🚗➕ Automóviles con remolque', '🚛 Vehículos articulados', '🚙 Autocaravanas > 3.500 kg'],
    autopista: { max: 90 },
    convencional: { max: 80 },
  },
  {
    members: ['🛵 Ciclomotores'],
    note: 'Prohibido circular por autopista y autovía',
    autopista: { banned: true },
    convencional: { max: 45 },
  },
  {
    members: ['🚲 Bicicletas'],
    note: 'Prohibida la autopista; por autovía solo el arcén (mayores de 14 años y si no está prohibido). Pueden superar los 45 km/h en descensos',
    autopista: { banned: true },
    convencional: { max: 45 },
  },
  {
    members: ['🚜 Vehículos especiales'],
    note: 'Prohibida autopista/autovía si no pueden superar los 60 km/h. Sin ciertos requisitos (frenado, alumbrado…): 25 km/h',
    autopista: { banned: true },
    convencional: { max: 40 },
  },
  {
    members: ['🛴 VMP (patinetes)'],
    note: 'Solo vías urbanas, máximo 25 km/h. Prohibidas travesías, interurbanas, autopistas y autovías',
    autopista: { banned: true },
    convencional: { banned: true },
  },
];

const URBAN_ROWS = [
  { max: 20, desc: 'Calles de plataforma única (calzada y acera al mismo nivel)' },
  { max: 30, desc: 'Vías de un único carril por sentido' },
  { max: 50, desc: 'Vías de dos o más carriles por sentido (todos los vehículos)' },
];

// Límites en situaciones especiales (obras, carriles habilitados, etc.)
const SPECIAL_ROWS = [
  { sign: { max: 80 }, icon: '🏙️', desc: 'Autopistas y autovías que pasan por dentro de poblado: 80 km/h, salvo otra señal.' },
  { sign: { max: 50 }, icon: '🛣️', desc: 'Travesías (tramo de carretera que cruza un poblado): 50 km/h genérica.' },
  { sign: { max: 80 }, icon: '↔️', desc: 'Carril habilitado en sentido contrario al habitual (por fluidez, cono/baliza): máximo 80 km/h (o el señalizado si es menor), sin bajar de 60, y con la luz de cruce encendida.' },
  { sign: null, icon: '🚧', desc: 'Obras: mandan las señales provisionales de fondo amarillo, que prevalecen sobre las señales fijas de la vía.' },
  { sign: null, icon: '🚸', desc: 'Transporte escolar y de menores, y mercancías peligrosas: fuera de poblado circulan 10 km/h por debajo de la genérica de su vehículo.' },
  { sign: null, icon: '🚫', desc: 'Adelantar NO permite superar el límite: la antigua excepción de +20 km/h en convencionales se eliminó en 2022.' },
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
    detail: 'Cruce siempre encendido, también de día. De noche, las mismas reglas que un turismo: largas en interurbana sin iluminar, cruce al cruzarte con alguien.',
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

// Retrovisores obligatorios (Reglamento General de Vehículos)
const MIRROR_ROWS = [
  {
    icon: '🚗', vehicle: 'Turismos',
    mirrors: ['Interior', 'Exterior izquierdo'],
    detail: 'El exterior derecho es obligatorio solo si el interior no permite ver bien hacia atrás (p. ej. luneta tapada o remolque).',
  },
  {
    icon: '🏍️', vehicle: 'Motocicletas',
    mirrors: ['Exterior izquierdo'],
    detail: 'Si por construcción puede superar los 100 km/h, obligatorios los DOS exteriores (izquierdo y derecho).',
  },
  {
    icon: '🛵', vehicle: 'Ciclomotores',
    mirrors: ['Exterior izquierdo'],
    detail: 'Basta con el retrovisor izquierdo.',
  },
  {
    icon: '🚚', vehicle: 'Camiones y furgonetas',
    mirrors: ['Exterior izquierdo', 'Exterior derecho'],
    detail: 'Dos exteriores siempre: la carga o la carrocería impiden usar el interior.',
  },
  {
    icon: '🚌', vehicle: 'Autobuses',
    mirrors: ['Exterior izquierdo', 'Exterior derecho'],
    detail: 'Dos exteriores siempre.',
  },
];

// Clasificación de vehículos (definiciones que caen en examen)
const VEHICLE_TYPES = [
  { icon: '🛴', title: 'VMP (patinete eléctrico)', detail: 'Una plaza, entre 6 y 25 km/h. Prohibido en travesías, interurbanas, autopistas, autovías y túneles urbanos.' },
  { icon: '🛵', title: 'Ciclomotor', detail: '2 o 3 ruedas con motor ≤ 50 cm³ y velocidad ≤ 45 km/h (también cuadriciclos ligeros). NO es una motocicleta y NO puede circular por autopista ni autovía.' },
  { icon: '🏍️', title: 'Motocicleta', detail: 'Dos ruedas (con o sin sidecar), cilindrada > 50 cm³ o velocidad > 45 km/h.' },
  { icon: '🚗', title: 'Turismo', detail: 'Automóvil destinado al transporte de personas con un máximo de 9 plazas incluida la del conductor.' },
  { icon: '🚌', title: 'Autobús', detail: 'Más de 9 plazas incluida la del conductor.' },
  { icon: '🚐', title: 'Furgoneta / camión ligero', detail: 'Transporte de mercancías con MMA ≤ 3.500 kg. Por encima de 3.500 kg es un camión.' },
  { icon: '🚛', title: 'Vehículo articulado', detail: 'Tractocamión + semirremolque. Si es un automóvil que arrastra un remolque: tren de carretera.' },
  { icon: '🚜', title: 'Vehículo especial', detail: 'Obras, servicios o agrícola (tractor). Velocidad genérica máxima: 40 km/h (25 km/h sin ciertos requisitos).' },
];

// Plazos de ITV por antigüedad del vehículo
const ITV_ROWS = [
  {
    icon: '🚗', vehicle: 'Turismos particulares',
    periods: [['0–4 años', 'exento'], ['4–10 años', 'cada 2 años'], ['+10 años', 'cada año']],
  },
  {
    icon: '🏍️', vehicle: 'Motocicletas',
    periods: [['0–4 años', 'exento'], ['+4 años', 'cada 2 años']],
  },
  {
    icon: '🛵', vehicle: 'Ciclomotores',
    periods: [['0–3 años', 'exento'], ['+3 años', 'cada 2 años']],
  },
  {
    icon: '🚐', vehicle: 'Furgonetas (mercancías ≤ 3.500 kg)',
    periods: [['0–2 años', 'exento'], ['2–6 años', 'cada 2 años'], ['6–10 años', 'cada año'], ['+10 años', 'cada 6 meses']],
  },
  {
    icon: '🚛', vehicle: 'Camiones (> 3.500 kg)',
    periods: [['0–10 años', 'cada año'], ['+10 años', 'cada 6 meses']],
  },
  {
    icon: '🚌', vehicle: 'Autobuses',
    periods: [['0–5 años', 'cada año'], ['+5 años', 'cada 6 meses']],
  },
];

// Permiso por puntos: infracciones que restan puntos (Ley 18/2021,
// en vigor desde marzo 2022), de más a menos graves.
const POINTS_GROUPS = [
  {
    points: 6, tone: 'p6', title: 'Las más graves',
    items: [
      'Alcohol: superar el doble de la tasa (más de 0,50 mg/l en aire; noveles y profesionales más de 0,30)',
      'Conducir con drogas en el organismo',
      'Negarse a las pruebas de alcohol o drogas',
      'Conducción temeraria, circular en sentido contrario o carreras ilegales',
      'Sujetar el móvil con la mano mientras conduces (antes eran 3)',
      'Llevar inhibidores de radar en el vehículo',
      'Adelantar a ciclistas sin la separación mínima obligatoria',
      'Los excesos de velocidad más altos del cuadro sancionador',
    ],
  },
  {
    points: 4, tone: 'p4', title: 'Muy graves',
    items: [
      'Alcohol entre 0,25 y 0,50 mg/l en aire (noveles y profesionales entre 0,15 y 0,30)',
      'Saltarse un semáforo en rojo, un STOP o un ceda el paso',
      'No respetar la prioridad de paso',
      'Adelantar con peligro o entorpeciendo al contrario',
      'No mantener la distancia de seguridad',
      'No usar cinturón, casco o sistema de retención infantil (antes eran 3)',
      'Arrojar a la vía objetos que puedan causar incendios o accidentes',
      'Excesos de velocidad intermedios del cuadro sancionador',
    ],
  },
  {
    points: 3, tone: 'p3', title: 'Graves',
    items: [
      'Conducir usando auriculares (cascos)',
      'Llevar detectores de radar (no confundir con inhibidores: 6)',
      'Cambio de sentido antirreglamentario',
      'Excesos de velocidad moderados del cuadro sancionador',
    ],
  },
  {
    points: 2, tone: 'p2', title: 'Las más leves con puntos',
    items: [
      'Los excesos de velocidad más bajos que ya detraen puntos (p. ej. ir a 71–80 km/h donde el límite es 50)',
      'Un exceso pequeño (los primeros ~20 km/h según el límite) solo conlleva multa de 100 €, sin puntos',
    ],
  },
];

// Distancias de seguridad (art. 54 RGC; túneles; RD 518/2026 vulnerables)
const SAFE_DISTANCES = [
  {
    icon: '📏', title: 'Regla general (todas las vías y vehículos)',
    dist: 'Poder detenerse sin colisionar',
    detail: 'Espacio libre que permita pararse ante un frenado brusco del que va delante. La DGT recomienda la regla de los 2 segundos (contar dos segundos desde que el precedente pasa un punto fijo).',
  },
  {
    icon: '🚛', title: 'Camiones > 3.500 kg y conjuntos > 10 m (fuera de poblado)',
    dist: '50 m',
    detail: 'Separación mínima para que quien adelanta pueda intercalarse. NO se exige en poblado, donde está prohibido adelantar, con varios carriles por sentido o con tráfico saturado.',
  },
  {
    icon: '🚇', title: 'Túneles y pasos inferiores (si no vas a adelantar)',
    dist: '100 m o 4 s',
    detail: 'Para vehículos de más de 3.500 kg: 150 m o 6 segundos.',
  },
  {
    icon: '🚲', title: 'Ciclistas entre sí',
    dist: 'Exentos',
    detail: 'Los ciclistas pueden circular en grupo (pelotón) sin mantener estas separaciones; el resto de conductores debe extremar la atención con ellos.',
  },
  {
    icon: '↪️', title: 'Adelantar a ciclistas, peatones o VMP (interurbana)',
    dist: '1,5 m y −20 km/h',
    detail: 'Separación lateral mínima de 1,5 m Y reducir al menos 20 km/h respecto al límite de la vía. Si hay varios carriles por sentido: cambio completo de carril obligatorio (RD 518/2026).',
  },
  {
    icon: '🏙️', title: 'Detrás de un ciclista en ciudad (mismo carril)',
    dist: '5 m',
    detail: 'Separación mínima de 5 metros con el ciclista que te precede en zonas urbanas (nuevo, RD 518/2026).',
  },
  {
    icon: '🅿️', title: 'Rebasar un vehículo inmovilizado',
    dist: '1,5 m y −20 km/h',
    detail: 'Al rebasar un vehículo detenido en la calzada: 1,5 m de separación lateral y reducir la velocidad al menos 20 km/h (RD 518/2026).',
  },
];

// Carga sobresaliente (art. 15 RGC) — solo cargas indivisibles.
// front/body/rear: proporciones para la barra visual.
const OVERHANG_ROWS = [
  {
    icon: '🚗', vehicle: 'Turismos (y demás vehículos NO de mercancías)',
    front: 0, body: 10, rear: 1.5,
    label: 'Solo por detrás: 10% de su longitud · 15% si la carga es indivisible',
    detail: 'Un turismo de 4,5 m: 45 cm, o 67 cm si es indivisible (p. ej. una escalera). Nunca por delante ni lateralmente.',
  },
  {
    icon: '🚐', vehicle: 'Vehículos de mercancías ≤ 5 m (furgonetas)',
    front: 0, body: 3, rear: 1,
    label: 'Carga indivisible: hasta 1/3 de la longitud del vehículo',
    detail: 'Lateralmente la carga no debe sobresalir.',
  },
  {
    icon: '🚛', vehicle: 'Vehículos de mercancías > 5 m (camiones)',
    front: 2, body: 10, rear: 3,
    label: 'Carga indivisible: 2 m por delante · 3 m por detrás',
    detail: 'Límites fijos en metros, independientes de la longitud del vehículo.',
  },
  {
    icon: '🏍️', vehicle: 'Motos, ciclomotores y bicis (anchura < 1 m)',
    front: 0, body: 2, rear: 0.25,
    label: 'Delante: nada · Detrás: 0,25 m · Lateral: 0,50 m por lado',
    detail: 'Por delante la carga no puede sobresalir NADA; por detrás hasta 0,25 m, y lateralmente hasta 0,50 m a cada lado del eje del vehículo.',
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
    const members = r.members.map((m) => `<span class="member">${m}</span>`).join('');
    html += `<div class="speed-vehicle"><div class="members">${members}</div>${r.note ? `<span>${r.note}</span>` : ''}</div>`;
    html += `<div class="speed-cell">${sign(r.autopista)}</div>`;
    html += `<div class="speed-cell">${sign(r.convencional)}</div>`;
  }
  html += '</div></div>';

  html += '<div class="stats-block"><h2>Velocidades en vías urbanas (todos los vehículos)</h2><div class="urban-rows">';
  for (const u of URBAN_ROWS) {
    html += `<div class="urban-row">${sign(u)}<span>${u.desc}</span></div>`;
  }
  html += '</div></div>';

  html += '<div class="stats-block"><h2>Límites en situaciones especiales</h2><div class="urban-rows">';
  for (const s of SPECIAL_ROWS) {
    html += `<div class="urban-row">${s.sign ? sign(s.sign) : `<span class="sign emoji">${s.icon}</span>`}<span>${s.desc}</span></div>`;
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

  // --- Retrovisores ----------------------------------------------------------
  html += '<div class="stats-block"><h2>Espejos retrovisores obligatorios</h2><div class="light-grid">';
  for (const m of MIRROR_ROWS) {
    const chips = m.mirrors.map((x) => `<span class="chip chip-cruce">${x}</span>`).join('');
    html += `<div class="light-card"><div class="light-title">${m.icon} ${m.vehicle}</div><div class="light-chips">${chips}</div><p>${m.detail}</p></div>`;
  }
  html += '</div></div>';

  // --- Tipos de vehículos ----------------------------------------------------
  html += '<div class="stats-block"><h2>Tipos de vehículos</h2><div class="light-grid">';
  for (const v of VEHICLE_TYPES) {
    html += `<div class="light-card"><div class="light-title">${v.icon} ${v.title}</div><p>${v.detail}</p></div>`;
  }
  html += '</div></div>';

  // --- Permiso por puntos ----------------------------------------------------
  html += '<div class="stats-block"><h2>Pérdida de puntos por infracciones</h2>';
  html += '<div class="urban-row" style="margin-bottom:12px"><span class="sign emoji">🪪</span><span>Saldo inicial: <strong>12 puntos</strong> (8 para noveles). Máximo acumulable por buen comportamiento: <strong>15</strong>. Ojo: alcohol superior a 0,60 mg/l en aire, o exceder el límite en más de 60 km/h en ciudad / 80 km/h en interurbana, ya es <strong>delito</strong> (vía penal, no puntos).</span></div>';
  for (const g of POINTS_GROUPS) {
    html += `<div class="points-group ${g.tone}"><div class="points-head"><span class="points-badge">−${g.points}</span><strong>${g.title}</strong></div><ul>`;
    for (const it of g.items) html += `<li>${it}</li>`;
    html += '</ul></div>';
  }
  html += '</div>';

  // --- Distancias de seguridad ---------------------------------------------
  html += '<div class="stats-block"><h2>Distancias de seguridad</h2><div class="light-grid">';
  for (const d of SAFE_DISTANCES) {
    html += `<div class="light-card"><div class="light-title">${d.icon} ${d.title}</div><div class="light-chips"><span class="chip chip-dist">${d.dist}</span></div><p>${d.detail}</p></div>`;
  }
  html += '</div></div>';

  // --- Carga sobresaliente -----------------------------------------------
  html += '<div class="stats-block"><h2>Cuánto puede sobresalir la carga (solo cargas indivisibles)</h2><div class="urban-rows">';
  for (const o of OVERHANG_ROWS) {
    const total = o.front + o.body + o.rear;
    const seg = (v, cls) => (v ? `<span class="load-seg ${cls}" style="flex:${v / total}"></span>` : '');
    html += `<div class="load-card">
      <div class="light-title">${o.icon} ${o.vehicle}</div>
      <div class="load-bar">${seg(o.front, 'over')}${seg(o.body, 'body')}${seg(o.rear, 'over')}</div>
      <div class="load-label">${o.label}</div>
      <p>${o.detail}</p>
    </div>`;
  }
  html += `<div class="light-card"><div class="light-title">⚠️ Señalización obligatoria</div>
    <p>Si la carga sobresale por detrás: panel <strong>V-20</strong> (franjas rojas y blancas) en el extremo. Si ocupa todo el ancho: <strong>dos paneles</strong> formando una V invertida. De noche o con poca visibilidad, además una <strong>luz roja</strong>.</p></div>`;
  html += '</div></div>';

  // --- ITV ---------------------------------------------------------------
  html += '<div class="stats-block"><h2>Plazos de la ITV (por antigüedad)</h2><div class="urban-rows">';
  for (const r of ITV_ROWS) {
    const chips = r.periods
      .map(([age, freq]) => `<span class="chip ${freq === 'exento' ? 'chip-none' : freq === 'cada 6 meses' ? 'chip-niebla' : 'chip-cruce'}">${age}: ${freq}</span>`)
      .join('');
    html += `<div class="urban-row itv-row"><span class="itv-vehicle">${r.icon} ${r.vehicle}</span><span class="light-chips">${chips}</span></div>`;
  }
  html += '</div></div>';

  html += '<p class="subtitle">Genéricas del Reglamento General de Circulación y de Vehículos; una señal concreta siempre manda sobre estos valores.</p>';

  container.innerHTML = html;
}
