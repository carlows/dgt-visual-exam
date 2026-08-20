import TESTS from '../data/tests.json';

const IMG_BASE = `${import.meta.env.BASE_URL}exam-images/`;
const STORAGE_KEY = 'dgt-test-attempts';

const $ = (id) => document.getElementById(id);
const views = {
  list: $('test-list-view'),
  quiz: $('quiz-view'),
  result: $('result-view'),
  stats: $('stats-view'),
};

function showView(name) {
  for (const [k, el] of Object.entries(views)) el.classList.toggle('hidden', k !== name);
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------------------------
// Registro de intentos: localStorage siempre; en dev, además attempts.json
// del repo vía middleware de Vite (ver vite.config.js)

function loadAttempts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; } catch { return []; }
}

function saveAttempt(attempt) {
  const all = loadAttempts();
  all.push(attempt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  // En el servidor de desarrollo esto persiste en attempts.json; en producción
  // (GitHub Pages) falla en silencio y queda solo localStorage.
  fetch('/__log-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt),
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Lista de tests

function bestAttempt(testNum) {
  const attempts = loadAttempts().filter((a) => a.test === testNum);
  if (!attempts.length) return null;
  return attempts.reduce((best, a) => (a.fails < best.fails ? a : best));
}

function renderList() {
  const cards = $('test-cards');
  cards.innerHTML = '';
  TESTS.forEach((t) => {
    const btn = document.createElement('button');
    btn.className = 'test-card';
    const best = bestAttempt(t.test);
    const bestLine = best
      ? `<div class="best">Mejor: <span class="${best.fails <= 3 ? 'pass' : 'fail'}">${best.fails} fallos</span> · ${loadAttempts().filter((a) => a.test === t.test).length} intentos</div>`
      : '<div class="best">Sin intentos</div>';
    btn.innerHTML = `<strong>Test ${t.test}</strong> · ${t.questions.length} preguntas${bestLine}`;
    btn.addEventListener('click', () => startTest(t));
    cards.appendChild(btn);
  });
  showView('list');
}

// ---------------------------------------------------------------------------
// Test en curso

let current = null;   // test en curso
let answers = [];     // letra elegida por pregunta (o null)
let qIndex = 0;
let startedAt = null;

function startTest(t) {
  current = t;
  answers = new Array(t.questions.length).fill(null);
  qIndex = 0;
  startedAt = new Date();
  renderQuestion();
  showView('quiz');
}

function renderQuestion() {
  const q = current.questions[qIndex];
  $('quiz-progress').textContent = `Test ${current.test} — pregunta ${qIndex + 1} de ${current.questions.length}`;

  const dots = $('quiz-dots');
  dots.innerHTML = '';
  current.questions.forEach((_, i) => {
    const d = document.createElement('span');
    if (answers[i]) d.classList.add('answered');
    if (i === qIndex) d.classList.add('current');
    d.addEventListener('click', () => { qIndex = i; renderQuestion(); });
    dots.appendChild(d);
  });

  const fig = $('q-figure');
  if (q.image) {
    $('q-image').src = IMG_BASE + q.image;
    fig.classList.remove('hidden');
  } else {
    fig.classList.add('hidden');
  }

  $('q-text').textContent = `${q.qNum}. ${q.question}`;
  const opts = $('q-options');
  opts.innerHTML = '';
  for (const [letter, text] of Object.entries(q.options)) {
    if (!text) continue;
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="key">${letter}</span>${text}`;
    if (answers[qIndex] === letter) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      answers[qIndex] = letter;
      if (qIndex < current.questions.length - 1) { qIndex++; }
      renderQuestion();
    });
    opts.appendChild(btn);
  }

  $('btn-prev').disabled = qIndex === 0;
  const answeredAll = answers.every(Boolean);
  $('btn-finish').classList.toggle('hidden', !answeredAll && qIndex < current.questions.length - 1);
  $('btn-next-q').classList.toggle('hidden', qIndex === current.questions.length - 1);
}

$('btn-prev').addEventListener('click', () => { if (qIndex > 0) { qIndex--; renderQuestion(); } });
$('btn-next-q').addEventListener('click', () => { if (qIndex < current.questions.length - 1) { qIndex++; renderQuestion(); } });
$('btn-quit').addEventListener('click', () => { if (confirm('¿Abandonar el test? Se perderán las respuestas.')) renderList(); });

window.addEventListener('keydown', (e) => {
  if (views.quiz.classList.contains('hidden')) return;
  const k = e.key.toLowerCase();
  const letters = Object.keys(current.questions[qIndex].options);
  if (letters.map((l) => l.toLowerCase()).includes(k)) {
    answers[qIndex] = k.toUpperCase();
    if (qIndex < current.questions.length - 1) qIndex++;
    renderQuestion();
  }
  if (e.key === 'ArrowRight' && qIndex < current.questions.length - 1) { qIndex++; renderQuestion(); }
  if (e.key === 'ArrowLeft' && qIndex > 0) { qIndex--; renderQuestion(); }
});

// ---------------------------------------------------------------------------
// Corrección y repaso

$('btn-finish').addEventListener('click', finishTest);

function finishTest() {
  const unanswered = answers.filter((a) => !a).length;
  if (unanswered && !confirm(`Quedan ${unanswered} preguntas sin responder. ¿Corregir igualmente?`)) return;

  const detail = current.questions.map((q, i) => ({
    qNum: q.qNum,
    preguntaId: q.preguntaId,
    question: q.question,
    picked: answers[i],
    correct: q.correct,
    ok: answers[i] === q.correct,
  }));
  const fails = detail.filter((d) => !d.ok);

  const attempt = {
    timestamp: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    test: current.test,
    total: current.questions.length,
    fails: fails.length,
    passed: fails.length <= 3,
    failedQuestions: fails.map((f) => ({
      qNum: f.qNum,
      preguntaId: f.preguntaId,
      question: f.question,
      picked: f.picked,
      correct: f.correct,
    })),
  };
  saveAttempt(attempt);
  renderResult(detail, attempt);
}

function renderResult(detail, attempt, showAll = false) {
  const passed = attempt.passed;
  const title = $('result-title');
  title.textContent = passed ? '✔ APTO' : '✘ NO APTO';
  title.className = passed ? 'pass' : 'fail';
  $('result-summary').textContent =
    `Test ${attempt.test}: ${attempt.total - attempt.fails} de ${attempt.total} correctas, ${attempt.fails} fallos. ` +
    `(El examen real permite hasta 3 fallos.)`;

  const list = $('review-list');
  list.innerHTML = '';
  const items = showAll ? detail : detail.filter((d) => !d.ok);
  if (!items.length) {
    list.innerHTML = '<p class="subtitle">Sin fallos. 🎉</p>';
  }
  for (const d of items) {
    const q = current.questions.find((x) => x.qNum === d.qNum);
    const div = document.createElement('div');
    div.className = 'review-item';
    let html = '';
    if (q.image) html += `<img src="${IMG_BASE}${q.image}" alt="" loading="lazy" />`;
    html += `<h3>${d.qNum}. ${escapeHtml(d.question)}</h3>`;
    for (const [letter, text] of Object.entries(q.options)) {
      if (!text) continue;
      const cls = letter === d.correct ? 'opt correct' : (letter === d.picked && !d.ok ? 'opt picked-wrong' : 'opt');
      const mark = letter === d.correct ? ' ✔' : (letter === d.picked && !d.ok ? ' ✘ (tu respuesta)' : '');
      html += `<div class="${cls}"><strong>${letter}</strong> ${escapeHtml(text)}${mark}</div>`;
    }
    if (!d.picked) html += `<div class="meta">Sin responder</div>`;
    div.innerHTML = html;
    list.appendChild(div);
  }

  $('btn-review-all').textContent = showAll ? 'Ver solo falladas' : 'Ver todas';
  $('btn-review-all').onclick = () => renderResult(detail, attempt, !showAll);
  showView('result');
}

$('btn-back-list').addEventListener('click', renderList);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------------------------------------------------------------------------
// Estadísticas de todos los intentos

$('btn-stats').addEventListener('click', renderStats);
$('btn-stats-back').addEventListener('click', renderList);
$('btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(loadAttempts(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'attempts.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

function renderStats() {
  const attempts = loadAttempts();
  $('stats-summary').textContent = attempts.length
    ? `${attempts.length} intentos · ${attempts.filter((a) => a.passed).length} aptos`
    : 'Todavía no hay intentos registrados.';

  const body = $('stats-body');
  body.innerHTML = '';

  if (attempts.length) {
    // Preguntas más falladas en todos los intentos
    const failCount = new Map();
    for (const a of attempts) {
      for (const f of a.failedQuestions) {
        const k = `${a.test}:${f.qNum}`;
        const e = failCount.get(k) ?? { ...f, test: a.test, n: 0 };
        e.n++;
        failCount.set(k, e);
      }
    }
    const top = [...failCount.values()].sort((a, b) => b.n - a.n).slice(0, 20);
    if (top.length) {
      const block = document.createElement('div');
      block.className = 'stats-block';
      block.innerHTML = '<h2>Preguntas más falladas</h2>';
      for (const f of top) {
        const row = document.createElement('div');
        row.className = 'stats-row';
        row.innerHTML = `<span>Test ${f.test} · P${f.qNum} — ${escapeHtml(f.question)}</span><span class="bar">${f.n}×</span>`;
        block.appendChild(row);
      }
      body.appendChild(block);
    }

    // Historial
    const hist = document.createElement('div');
    hist.className = 'stats-block';
    hist.innerHTML = '<h2>Historial</h2>';
    for (const a of [...attempts].reverse()) {
      const row = document.createElement('div');
      row.className = 'stats-row';
      const date = new Date(a.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
      row.innerHTML = `<span>${date} — Test ${a.test}</span><span class="${a.passed ? 'pass' : 'fail'}">${a.fails} fallos ${a.passed ? '✔' : '✘'}</span>`;
      hist.appendChild(row);
    }
    body.appendChild(hist);
  }

  showView('stats');
}

// ---------------------------------------------------------------------------

renderList();
