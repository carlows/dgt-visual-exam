# Situaciones DGT

Simulador 3D de situaciones de tráfico para preparar el examen teórico (permiso B).
Conduces en primera persona; en el momento clave la escena se congela y eliges A/B/C.
Cada respuesta se corrige con explicación y referencia al artículo del reglamento.

**150 situaciones en 10 temas**: prioridad en intersecciones, glorietas, señales de
agente, semáforos, señales verticales, marcas viales, adelantamiento, carriles y
maniobras, usuarios vulnerables, y alumbrado/condiciones adversas (escenas de noche,
niebla y túnel).

> ⚠️ Contenido autogenerado a partir del RGCir/LSV y revisado automáticamente, pero
> sin validación jurídica humana completa: contrasta cualquier duda con el manual
> oficial de la DGT.

## Ejecutar

```bash
npm install
npx vite
# abre http://localhost:5173
```

## Estructura

- `src/main.js` — motor: bucle de render, estados (menú → conducción → pregunta → explicación), UI.
- `src/world.js` — piezas del mundo: carreteras, marcas viales, señales verticales (canvas → textura),
  semáforos con fases, agente de circulación con poses, vehículos low-poly (turismo, camión,
  bici, ambulancia), peatones, glorietas, túneles, entornos día/atardecer/noche/niebla.
- `src/scenarios/temaXX-*.js` — **los escenarios son datos**, un archivo por tema;
  `src/scenarios/index.js` los agrega. Ver `docs/AUTORIA.md` para añadir más.
- `src/style.css` — UI (paneles, salpicadero, HUD).

## Despliegue

GitHub Pages vía Actions (`.github/workflows/deploy.yml`): cada push a `main`
construye con Vite y publica en https://carlows.github.io/dgt-visual-exam/

## Convención de escena

El jugador circula por el carril derecho (`x = laneCenter(1)`) hacia **−z**.
La intersección está en `z = 0`. `playerStart` es la z inicial, `triggerZ` la z donde
se congela la escena y aparece la pregunta.

## Añadir un escenario

```js
{
  id: 'mi-escenario',
  tag: 'Prioridad de paso',        // categoría mostrada en el menú
  title: 'Título en el menú',
  playerStart: 45, playerSpeed: 8, triggerZ: 12,
  panel: 'left',                   // opcional: 'left' | 'right' si el elemento clave queda en el centro
  build(scene) {
    // carreteras, señales, semáforos, agente, NPCs…
    // devuelve los NPCs móviles: [{ mesh, vel: [vx, vz] }]
    return [];
  },
  question: '…',
  options: [
    { text: '…', correct: true },
    { text: '…', feedback: 'por qué está mal' },
  ],
  explanation: '…',
  rule: 'Art. … RGCir',
}
```

Poses del agente: `alto` (brazo levantado: detención para todos), `frente` (brazo
extendido: detiene a quien se acerca de frente), `cruz` (brazos en cruz).

## Ideas / pendiente

- Escenarios: cambio de carril, incorporación, semáforo ámbar intermitente,
  vehículos prioritarios, estrechamiento, alumbrado (noche/túnel/niebla).
- Modo interactivo: en vez de A/B/C, controlar el coche (frenar / seguir, elegir carril)
  con el coche sobre raíles y ramas predefinidas.
- Reproducir la consecuencia tras responder (la escena continúa mostrando el desenlace).
- Fases de semáforo animadas y NPCs con trayectorias con giro.
- Sonido y modo examen (racha de escenarios aleatorios, puntuación).

## Nota sobre contenido

El banco oficial de preguntas de la DGT no es público. Referencias legales usadas al
redactar escenarios: Ley de Seguridad Vial (LSV) y Reglamento General de Circulación
(RGCir), ambos en el BOE. Para calibrar estilo: tests de la revista de la DGT
(https://revista.dgt.es/es/test/).
