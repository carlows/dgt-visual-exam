import { TEMA as prioridad } from './tema01-prioridad.js';
import { TEMA as glorietas } from './tema02-glorietas.js';
import { TEMA as agente } from './tema03-agente.js';
import { TEMA as semaforos } from './tema04-semaforos.js';
import { TEMA as verticales } from './tema05-verticales.js';
import { TEMA as marcas } from './tema06-marcas.js';
import { TEMA as adelantamiento } from './tema07-adelantamiento.js';
import { TEMA as maniobras } from './tema08-maniobras.js';
import { TEMA as vulnerables } from './tema09-vulnerables.js';
import { TEMA as alumbrado } from './tema10-alumbrado.js';

export const TEMAS = [
  prioridad, glorietas, agente, semaforos, verticales,
  marcas, adelantamiento, maniobras, vulnerables, alumbrado,
];

export const SCENARIOS = TEMAS.flatMap((t) => t.scenarios);
