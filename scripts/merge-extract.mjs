// Une los batches extraídos por los agentes en src/data/tests.json
// Uso: node scripts/merge-extract.mjs <dir-con-batch_*.json>
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('falta dir'); process.exit(1); }

const rows = [];
for (const f of readdirSync(dir).filter((f) => f.startsWith('batch_') && f.endsWith('.json')).sort()) {
  const arr = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  rows.push(...arr);
}
console.log(`filas totales: ${rows.length}`);

// Filtra pantallas no válidas y deduplica por (test, q_num) — se queda la última
// aparición (foto repetida = la segunda suele ser la buena, con la imagen cargada)
const valid = rows.filter((r) => r.test != null && r.q_num != null && r.question && r.correct);
const skipped = rows.filter((r) => !valid.includes(r));
for (const s of skipped) console.log(`  descartada: ${s.file} — ${s.issues}`);

// Preferencia al deduplicar: entradas sin "issues" ganan a las marcadas
// (fotos de transición); entre limpias gana la última por nombre de archivo.
const byKey = new Map();
const dupes = [];
for (const r of valid.sort((a, b) => a.file.localeCompare(b.file))) {
  const k = `${r.test}:${r.q_num}`;
  const prev = byKey.get(k);
  if (prev) {
    dupes.push(`${prev.file} vs ${r.file} (${k})`);
    if (!prev.issues && r.issues) continue; // la nueva es peor, conserva la previa
  }
  byKey.set(k, r);
}
for (const d of dupes) console.log(`  duplicada: ${d}`);

// Agrupa por test
const tests = new Map();
for (const r of byKey.values()) {
  if (!tests.has(r.test)) tests.set(r.test, []);
  tests.get(r.test).push(r);
}

const out = [];
for (const [num, qs] of [...tests.entries()].sort((a, b) => a[0] - b[0])) {
  if (qs.length < 10) { console.log(`Test ${num}: descartado (solo ${qs.length} preguntas — foto suelta)`); continue; }
  qs.sort((a, b) => a.q_num - b.q_num);
  const missing = [];
  for (let i = 1; i <= 30; i++) if (!qs.find((q) => q.q_num === i)) missing.push(i);
  console.log(`Test ${num}: ${qs.length} preguntas${missing.length ? ` — FALTAN: ${missing.join(', ')}` : ''}`);
  out.push({
    test: num,
    questions: qs.map((q) => ({
      qNum: q.q_num,
      preguntaId: q.pregunta_id,
      question: q.question,
      options: q.options,
      correct: q.correct,
      image: q.file,
      imageDesc: q.image_desc ?? null,
      examWrongPick: q.student_wrong_pick ?? null,
    })),
  });
}

writeFileSync(new URL('../src/data/tests.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`escrito src/data/tests.json con ${out.length} tests`);
