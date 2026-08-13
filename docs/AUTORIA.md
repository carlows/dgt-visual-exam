# Guía de autoría de escenarios

Cada tema vive en `src/scenarios/temaXX-*.js` y exporta `TEMA = { id, title, scenarios: [...] }`.
Los escenarios existentes en el archivo deben conservarse tal cual.

## Convención de escena

- El jugador circula por el **carril derecho** (`x = laneCenter(1) = 1.75`) hacia **−z**.
- El punto clave (intersección, paso, señal…) se sitúa en **z = 0**.
- `playerStart`: z inicial (típico 45). `playerSpeed`: m/s (típico 8). `triggerZ`: z donde se
  congela la escena y sale la pregunta.
- Tiempo transcurrido hasta la congelación: `t = (playerStart − triggerZ) / playerSpeed`.
  Usa esto para colocar NPCs: posición inicial = posición deseada en la congelación − velocidad × t.

## Encuadre (¡importante!)

- FOV vertical 68°, cámara a 1.3 m. Medio FOV horizontal ≈ 47°.
- El elemento clave debe quedar, en la congelación, a **8–25 m** del jugador y dentro de
  **±35°** respecto al frente. Ángulo horizontal ≈ `atan(|dx| / dz_relativo)`.
- El panel de pregunta tapa el centro-inferior. Si el elemento clave queda centrado y cerca
  (p. ej. un vehículo delante en tu carril), añade `panel: 'left'` o `panel: 'right'`.
- Señales al lado derecho de la vía: `x ≈ 4.4`, un par de metros antes del punto que regulan.

## Campos del escenario

```js
{
  id: 'kebab-unico',
  tag: 'Etiqueta corta',           // categoría visible en HUD
  title: 'Título del menú',
  playerStart: 45, playerSpeed: 8, triggerZ: 12,
  panel: 'left',                    // opcional
  playerLane: 1.75,                 // opcional, x del jugador (por defecto laneCenter(1))
  env: { mode: 'night' },           // opcional: 'day' (defecto) | 'dusk' | 'night' | 'fog'
  build(scene) { ...; return npcs; },
  tick(t, dt) { ... },              // opcional: animar luces/semáforos (sigue corriendo tras congelar)
  question: '…', options: [ { text, correct: true }, { text, feedback: '…' }, … ],
  explanation: '…',
  rule: 'Art. … RGCir — …',
}
```

- `options`: 3 opciones, exactamente una con `correct: true`. Las incorrectas llevan `feedback`
  explicando el error. Orden aleatorio de la correcta (no siempre la A).
- NPCs devueltos por `build`: `{ mesh, vel: [vx, vz] }` (recta), `{ mesh, path: [[x,z],…], speed }`
  (polilínea con giros) o `{ mesh, orbit: { cx, cz, r, angle, angSpeed } }` (glorieta,
  `angSpeed` negativo = sentido reglamentario, `rotY` se ajusta solo).
- Orientación de meshes: mirando a −z por defecto; hacia +x → `rotY = -Math.PI/2`;
  hacia −x → `rotY = Math.PI/2`.

## API de `../world.js`

Vías y marcas: `addRoadZ/addRoadX({from,to,width})`, `addRoadSeg({x,z,rotY,len,width,color})`
(color 0x7a5c3a = camino de tierra), `addDashesZ/X({from,to,x|z})`, `addSolidLineZ({x,from,to})`,
`addStopLine({x,z})`, `addYieldMarks({x,z})`, `addCrosswalk({z})`, `addLaneArrow({x,z,dir})`
(dir: up|left|right|return), `addRoundabout({rInner,rOuter})` (anillo en 0,0; carril del anillo
r≈8.5), `addTunnel({from,to})`.

Entorno: `addCityBlocks({avoid})`, `addStreetlight({x,z})` (máx 4-5, para modo night).

Señales: `addSign(scene, tipo, {x, z, rotY, ...opts})`. Tipos: `stop`, `ceda`, `prioridad`,
`velocidad` (`{value: 40}`), `finLimitaciones`, `prohibidoAdelantar`, `finProhibidoAdelantar`,
`prohibidoEntrada`, `circulacionProhibida`, `sentidoObligatorio` (`{dir}`), `pasoPeatonesAzul`,
`peligro` (`{glyph: interseccion|peatones|ninos|semaforo|estrechamiento|glorieta}`),
`estacionamientoProhibido`, `paradaProhibida`, `tunel`, `estrechamientoCede`,
`estrechamientoPrio`, `zonaResidencial`, `finPrioridad`.

Semáforo: `const s = addSemaphore(scene, {x, z, active: 'red'|'amber'|'green'|'off'})` →
`s.setActive(...)` desde `tick` (ámbar intermitente: `s.setActive(t % 1 < 0.5 ? 'amber' : 'off')`).

Figuras y vehículos: `makeCar(color)`, `makeTruck(color)`, `makeBike()`, `makeAmbulance()`
(baliza en `g.userData.beacon` — parpadear en `tick`), `makePeaton({shirt})`,
`addAgente(scene, {x, z, rotY, pose})` con poses `alto`, `frente`, `cruz`, `luz`, `lento`.

## Contenido

- Redacción en castellano, estilo examen DGT: pregunta corta y concreta sobre LA situación visible.
- `rule`: cita artículo solo si estás seguro; si no, «RGCir — normas de prioridad» genérico.
- No inventes doctrina: si una especificación te parece dudosa jurídicamente, sustitúyela por
  otra situación del mismo tema que domines, manteniendo el total pedido.
- Validación sintáctica: `npx esbuild src/scenarios/temaXX-*.js --outfile=/dev/null`.
  No arranques servidores ni instales nada.
