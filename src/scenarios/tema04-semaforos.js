import {
  addRoadZ, addRoadX, addDashesZ, addDashesX, addStopLine, addYieldMarks,
  addCrosswalk, addCityBlocks, addStreetlight, addSemaphore, addSign,
  addRoadSeg, addTunnel, makeCar, makePeaton,
} from '../world.js';

// Semáforos animados desde tick() — asignados en build() de cada escenario.
let semTarde;        // ámbar que salta cuando ya estás encima
let semParpadeo;     // ámbar intermitente en cruce con ceda
let semNivelA;       // paso a nivel: rojas alternas
let semNivelB;
let semNoche;        // ámbar intermitente nocturno sobre paso de peatones
let semTunel;        // rojo intermitente a la entrada del túnel

function cruceBase(scene) {
  addRoadZ(scene, { from: -80, to: 80 });
  addRoadX(scene, { from: -80, to: 80 });
  addDashesZ(scene, { from: 5, to: 80 });
  addDashesZ(scene, { from: -80, to: -5 });
  addDashesX(scene, { from: 5, to: 80 });
  addDashesX(scene, { from: -80, to: -5 });
  addCityBlocks(scene);
}

export const TEMA = {
  id: 'semaforos',
  title: 'Semáforos',
  scenarios: [
    {
      id: 'verde-paso-libre',
      tag: 'Semáforos',
      title: 'Semáforo en verde y cruce despejado',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });
        return [];
      },
      question: 'Te acercas a la intersección, el semáforo está en verde y el cruce está despejado. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Detenerte brevemente antes de la línea para comprobar que no viene nadie.',
          feedback: 'Con el semáforo en verde no debes detenerte si el cruce está despejado: entorpecerías la circulación sin motivo.',
        },
        {
          text: 'Pasar sin detenerte, prestando atención al cruce.',
          correct: true,
        },
        {
          text: 'Pasar acelerando para despejar el cruce cuanto antes.',
          feedback: 'El verde permite el paso, pero no autoriza a acelerar: debes atravesar el cruce a velocidad adecuada y con atención.',
        },
      ],
      explanation: 'La luz verde no intermitente significa que está permitido el paso. Debes atravesar la intersección con la precaución normal, sin detenerte, ya que hacerlo sin motivo entorpecería la circulación.',
      rule: 'Art. 146 RGCir — luz verde no intermitente: paso permitido.',
    },

    {
      id: 'ambar-fijo-detenerse',
      tag: 'Semáforos',
      title: 'Ámbar fijo visto con distancia suficiente',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'amber' });
        return [];
      },
      question: 'El semáforo se pone en ámbar fijo cuando aún dispones de distancia suficiente para parar con seguridad. ¿Qué debes hacer?',
      options: [
        {
          text: 'Detenerte antes de la línea de detención, igual que ante la luz roja.',
          correct: true,
        },
        {
          text: 'Continuar, porque el ámbar fijo solo advierte de que el semáforo va a cambiar.',
          feedback: 'El ámbar fijo obliga a detenerse como si fuera rojo. Solo se puede pasar si, al encenderse, no es posible detenerse en condiciones de seguridad.',
        },
        {
          text: 'Acelerar para cruzar antes de que se ponga en rojo.',
          feedback: 'Acelerar ante el ámbar es justo lo contrario de lo que exige la norma: si puedes detenerte con seguridad, debes hacerlo.',
        },
      ],
      explanation: 'La luz amarilla no intermitente significa que los vehículos deben detenerse como si fuera una luz roja, salvo que, cuando se encienda, el vehículo se encuentre tan cerca que no pueda detenerse en condiciones de seguridad. Aquí la distancia es suficiente, así que debes parar.',
      rule: 'Art. 146 RGCir — luz amarilla no intermitente.',
    },

    {
      id: 'ambar-fijo-encima',
      tag: 'Semáforos',
      title: 'Ámbar fijo cuando ya estás en la línea',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 8,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        semTarde = addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });
        return [];
      },
      tick(t) {
        semTarde.setActive(t < 4.2 ? 'green' : 'amber');
      },
      question: 'El semáforo pasa de verde a ámbar fijo cuando estás prácticamente sobre la línea de detención. ¿Qué debes hacer?',
      options: [
        {
          text: 'Frenar a fondo para detenerte, aunque sea pasada la línea.',
          feedback: 'Una frenada brusca a esa distancia sería peligrosa (riesgo de alcance y de quedar detenido dentro del cruce). La norma exceptúa precisamente este caso.',
        },
        {
          text: 'Dar marcha atrás hasta quedar antes de la línea de detención.',
          feedback: 'Nunca debes retroceder en una intersección: crearías un peligro mayor. La norma te permite continuar cuando no puedes detenerte con seguridad.',
        },
        {
          text: 'Continuar y despejar la intersección, porque ya no puedes detenerte con seguridad.',
          correct: true,
        },
      ],
      explanation: 'La obligación de detenerse ante el ámbar fijo tiene una excepción: cuando, al encenderse, el vehículo está tan cerca del lugar de detención que no puede pararse en condiciones de seguridad. En ese caso lo correcto es continuar y despejar el cruce.',
      rule: 'Art. 146 RGCir — luz amarilla no intermitente: excepción por imposibilidad de detenerse con seguridad.',
    },

    {
      id: 'ambar-intermitente-ceda',
      tag: 'Semáforos',
      title: 'Ámbar intermitente en cruce con ceda el paso',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        cruceBase(scene);
        addYieldMarks(scene, { z: 6 });
        addSign(scene, 'ceda', { x: 4.4, z: 8.5 });
        semParpadeo = addSemaphore(scene, { x: 4.4, z: 6, active: 'amber' });

        const cruzado = makeCar(0x3a6ea5);
        cruzado.rotation.y = -Math.PI / 2; // circula hacia +x
        cruzado.position.set(-32.6, 0, -1.75);
        return [{ mesh: cruzado, vel: [5, 0] }];
      },
      tick(t) {
        semParpadeo.setActive(t % 1 < 0.5 ? 'amber' : 'off');
      },
      question: 'El semáforo del cruce está en ámbar intermitente y bajo él hay una señal de ceda el paso. Un turismo se aproxima por la vía transversal. ¿Qué debes hacer?',
      options: [
        {
          text: 'Pasar con preferencia, porque el ámbar intermitente equivale a tener el semáforo a tu favor.',
          feedback: 'El ámbar intermitente no otorga prioridad: solo obliga a extremar la precaución y deja en vigor las normas y señales de prioridad del cruce.',
        },
        {
          text: 'Extremar la precaución y ceder el paso al turismo, porque rige la señal de ceda el paso.',
          correct: true,
        },
        {
          text: 'Detenerte obligatoriamente, como si el semáforo estuviera en rojo.',
          feedback: 'El ámbar intermitente no obliga a detenerse como el rojo; obliga a extremar la precaución y a respetar las normas de prioridad, que aquí te exigen ceder, no necesariamente parar.',
        },
      ],
      explanation: 'La luz amarilla intermitente obliga a los conductores a extremar la precaución y, en su caso, ceder el paso, pero no modifica el régimen de prioridad: siguen rigiendo las señales del cruce. Con la señal de ceda el paso, debes ceder al vehículo de la vía transversal.',
      rule: 'Art. 146 RGCir — luz amarilla intermitente: no exime del cumplimiento de las normas de prioridad.',
    },

    {
      id: 'rojo-giro-derecha',
      tag: 'Semáforos',
      title: 'Rojo y quieres girar a la derecha',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'red' });
        return [];
      },
      question: 'El semáforo está en rojo. Quieres girar a la derecha y no se aproxima ningún vehículo ni peatón. ¿Puedes girar?',
      options: [
        {
          text: 'No: la luz roja prohíbe el paso también para girar, aunque no haya tráfico.',
          correct: true,
        },
        {
          text: 'Sí, porque girar a la derecha sin tráfico no interfiere con nadie.',
          feedback: 'En España la luz roja prohíbe rebasar la línea de detención en cualquier dirección; no existe el giro a la derecha libre con rojo como en otros países.',
        },
        {
          text: 'Sí, pero solo después de detenerte por completo ante la línea.',
          feedback: 'Detenerse primero no lo autoriza: con luz roja no puedes rebasar la línea de detención ni siquiera para girar, salvo que exista una flecha verde que lo permita.',
        },
      ],
      explanation: 'La luz roja no intermitente prohíbe el paso: ningún vehículo debe rebasar la línea de detención, tampoco para girar a la derecha, aunque el cruce esté despejado. Solo una flecha verde iluminada junto al semáforo permitiría avanzar en esa dirección.',
      rule: 'Art. 146 RGCir — luz roja no intermitente: prohibición de paso.',
    },

    {
      id: 'flecha-verde-junto-rojo',
      tag: 'Semáforos',
      title: 'Rojo con flecha verde de giro',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'red' });
        // Módulo adicional con la flecha verde de giro, junto al semáforo principal.
        addSemaphore(scene, { x: 5.2, z: 6, active: 'green' });
        return [];
      },
      question: 'El semáforo principal está en rojo, pero junto a él hay iluminada una flecha verde que señala la dirección en la que quieres girar. ¿Qué significa?',
      options: [
        {
          text: 'Nada distinto: mientras el semáforo principal esté en rojo, no puedes moverte.',
          feedback: 'La flecha verde iluminada permite avanzar en su dirección cualquiera que sea la luz encendida al mismo tiempo en el semáforo principal.',
        },
        {
          text: 'Que tienes prioridad absoluta para girar en esa dirección.',
          feedback: 'La flecha verde permite avanzar, pero sin prioridad: debes hacerlo con precaución, cediendo el paso a los peatones y a los vehículos del carril al que te incorporas.',
        },
        {
          text: 'Que puedes avanzar en la dirección de la flecha, con precaución y cediendo el paso a peatones y vehículos.',
          correct: true,
        },
      ],
      explanation: 'La flecha verde iluminada junto a un semáforo en rojo permite a los vehículos tomar la dirección y sentido indicados por la flecha, cualquiera que sea la luz encendida en el semáforo principal, pero sin detenerse en el paso para peatones y cediendo el paso a los peatones que lo crucen y a los vehículos del carril al que se incorporan.',
      rule: 'Art. 146 RGCir — flecha verde sobre fondo circular negro junto a semáforo.',
    },

    {
      id: 'carriles-aspa-flecha',
      tag: 'Semáforos',
      title: 'Semáforos de carril: aspa roja sobre el tuyo',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        // Pórtico de semáforos de carril (aproximado con dos cabezas elevadas).
        const aspa = addSemaphore(scene, { x: 1.75, z: 2, active: 'red' });
        aspa.group.position.y = 2.2;
        const flecha = addSemaphore(scene, { x: -1.75, z: 2, active: 'green' });
        flecha.group.position.y = 2.2;
        return [];
      },
      question: 'Circulas por una calzada con semáforos de carril en un pórtico: sobre tu carril luce un aspa roja y sobre el carril contiguo, una flecha verde hacia abajo. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar por tu carril, porque el aspa roja solo prohíbe adelantar.',
          feedback: 'El aspa roja de un semáforo de carril prohíbe ocupar ese carril, no solo adelantar: no debes seguir circulando por él.',
        },
        {
          text: 'Abandonar tu carril en cuanto puedas hacerlo con seguridad y pasar al de la flecha verde.',
          correct: true,
        },
        {
          text: 'Detenerte en tu carril hasta que el aspa cambie a flecha verde.',
          feedback: 'Detenerte en medio de la calzada sería peligroso e innecesario: la flecha verde del carril contiguo te indica el carril por el que sí puedes circular.',
        },
      ],
      explanation: 'Los semáforos cuadrados de carril rigen exclusivamente para el carril sobre el que están situados. El aspa roja prohíbe ocupar ese carril, y la flecha verde hacia abajo permite circular por el carril que señala. Debes cambiarte con seguridad al carril autorizado.',
      rule: 'Art. 148 RGCir — semáforos cuadrados para vehículos o de carril.',
    },

    {
      id: 'verde-giro-peatones',
      tag: 'Semáforos',
      title: 'Giras en verde y hay peatones cruzando',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });

        const p1 = makePeaton({ shirt: 0xd45050 });
        p1.position.set(-6, 0, 5.6);
        const p2 = makePeaton({ shirt: 0x4a7fd4 });
        p2.position.set(-8, 0, -5.1);
        return [
          { mesh: p1, vel: [0, -1] },
          { mesh: p2, vel: [0, 1] },
        ];
      },
      question: 'Tu semáforo está en verde y vas a girar para entrar en la calle transversal, pero unos peatones la están cruzando con su semáforo también en verde. ¿Qué debes hacer?',
      options: [
        {
          text: 'Ceder el paso a los peatones y completar el giro solo cuando hayan cruzado.',
          correct: true,
        },
        {
          text: 'Pasar tú primero, porque tu semáforo está en verde.',
          feedback: 'Tu verde te permite entrar en el cruce, pero al girar debes ceder el paso a los peatones que cruzan la calle en la que vas a entrar con su semáforo en verde.',
        },
        {
          text: 'Hacer sonar el claxon para que los peatones te dejen pasar.',
          feedback: 'Los peatones cruzan con preferencia; avisarles con el claxon para que se aparten es incorrecto y además una conducta sancionable.',
        },
      ],
      explanation: 'Aunque tu semáforo esté en verde, el conductor que gira para entrar en otra vía debe ceder el paso a los peatones que la cruzan reglamentariamente, con su semáforo en verde. Solo se completa el giro cuando el paso está libre.',
      rule: 'RGCir — prioridad de paso de los peatones respecto de los vehículos que giran para entrar en otra vía.',
    },

    {
      id: 'paso-nivel-rojas-alternas',
      tag: 'Semáforos',
      title: 'Paso a nivel con luces rojas alternas',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 8, to: 80 });
        addDashesZ(scene, { from: -80, to: -8 });
        addStopLine(scene, { z: 5.5 });
        // Banda de la vía férrea cruzando la calzada.
        addRoadSeg(scene, { x: 0, z: 0, rotY: Math.PI / 2, len: 40, width: 3, color: 0x3a3a3a });
        semNivelA = addSemaphore(scene, { x: 4.4, z: 6, active: 'red' });
        semNivelB = addSemaphore(scene, { x: -4.4, z: 6, active: 'off' });
        return [];
      },
      tick(t) {
        const fase = t % 1 < 0.5;
        semNivelA.setActive(fase ? 'red' : 'off');
        semNivelB.setActive(fase ? 'off' : 'red');
      },
      question: 'Llegas a un paso a nivel cuyas dos luces rojas parpadean alternativamente. ¿Qué debes hacer?',
      options: [
        {
          text: 'Cruzar la vía con precaución si no ves venir ningún tren.',
          feedback: 'Las luces rojas alternas prohíben el paso de forma absoluta mientras están encendidas; no puedes cruzar aunque no veas el tren.',
        },
        {
          text: 'Reducir la velocidad y cruzar sin detenerte para no quedarte sobre la vía.',
          feedback: 'No se trata de cruzar deprisa: mientras las luces rojas parpadeen está prohibido pasar y debes quedarte detenido antes del paso.',
        },
        {
          text: 'Detenerte antes del paso y no cruzar mientras las luces sigan encendidas.',
          correct: true,
        },
      ],
      explanation: 'Dos luces rojas alternativamente intermitentes prohíben temporalmente el paso mientras están encendidas. Se emplean en pasos a nivel, puentes móviles y accesos similares: debes detenerte y esperar a que se apaguen.',
      rule: 'Art. 146 RGCir — luces rojas alternativamente intermitentes: prohibición temporal de paso.',
    },

    {
      id: 'semaforo-apagado-ceda',
      tag: 'Semáforos',
      title: 'Semáforo apagado en cruce con ceda el paso',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        cruceBase(scene);
        addYieldMarks(scene, { z: 6 });
        addSign(scene, 'ceda', { x: 4.4, z: 8.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'off' });

        const cruzado = makeCar(0xc9762b);
        cruzado.rotation.y = Math.PI / 2; // circula hacia -x
        cruzado.position.set(34.6, 0, 1.75);
        return [{ mesh: cruzado, vel: [-5, 0] }];
      },
      question: 'El semáforo del cruce está apagado y junto a él hay una señal de ceda el paso. Un vehículo se aproxima por la vía transversal. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Aplicar la prioridad al vehículo que viene por la derecha, porque sin semáforo el cruce queda sin señalizar.',
          feedback: 'El cruce no queda sin señalizar: al estar apagado el semáforo, rige la señal vertical de ceda el paso, que te obliga a ceder a todos los vehículos de la vía transversal.',
        },
        {
          text: 'Ceder el paso al vehículo de la vía transversal, porque rige la señal de ceda el paso.',
          correct: true,
        },
        {
          text: 'Pasar con preferencia, porque un semáforo apagado equivale a verde.',
          feedback: 'Un semáforo apagado no da paso libre: simplemente deja de regular, y pasan a regir las señales verticales del cruce, aquí el ceda el paso.',
        },
      ],
      explanation: 'En el orden de prioridad entre señales, los semáforos prevalecen sobre las señales verticales solo mientras funcionan. Si el semáforo está apagado, rigen las señales verticales de prioridad: la señal de ceda el paso te obliga a ceder a los vehículos de la vía transversal.',
      rule: 'Art. 133 RGCir — orden de preeminencia entre las señales.',
    },

    {
      id: 'rojo-linea-detencion',
      tag: 'Semáforos',
      title: 'Rojo: dónde detenerte',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 4, to: 80 });
        addDashesZ(scene, { from: -80, to: -3 });
        addCityBlocks(scene);
        addCrosswalk(scene, { z: 0 });
        addStopLine(scene, { z: 2.4 });
        addSemaphore(scene, { x: 4.4, z: 3.4, active: 'red' });
        return [];
      },
      question: 'El semáforo del paso de peatones está en rojo. ¿Dónde debes detener tu vehículo?',
      options: [
        {
          text: 'Antes de la línea de detención, sin invadir el paso para peatones.',
          correct: true,
        },
        {
          text: 'Sobre el paso de peatones, para ver mejor y salir antes cuando cambie a verde.',
          feedback: 'Detenerse sobre el paso de peatones está prohibido: obligarías a los peatones a rodear tu vehículo. La detención debe hacerse antes de la línea.',
        },
        {
          text: 'A la altura del semáforo, aunque quede pasada la línea de detención.',
          feedback: 'La referencia para detenerse es la línea de detención marcada en la calzada, no el poste del semáforo: no debes rebasarla.',
        },
      ],
      explanation: 'Ante la luz roja debes detenerte antes de la línea de detención más próxima o, si no existiera, antes del propio semáforo o del paso de peatones, sin invadirlo nunca. La línea transversal continua marca exactamente el punto que no debes rebasar.',
      rule: 'Arts. 146 y 168 RGCir — luz roja y marca de línea de detención.',
    },

    {
      id: 'verde-cruce-bloqueado',
      tag: 'Semáforos',
      title: 'Verde pero el cruce está bloqueado',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });

        // Cola detenida al otro lado de la intersección, en tu carril.
        const colores = [0xd45050, 0x4a7fd4, 0x888888];
        const npcs = [];
        [-6, -10.5, -15].forEach((z, i) => {
          const c = makeCar(colores[i]);
          c.position.set(1.75, 0, z);
          npcs.push({ mesh: c, vel: [0, 0] });
        });
        return npcs;
      },
      question: 'Tu semáforo está en verde, pero al otro lado de la intersección hay una cola de vehículos detenidos que no te permitiría salir de ella. ¿Qué debes hacer?',
      options: [
        {
          text: 'Entrar en el cruce y avanzar todo lo posible, para no perder el verde.',
          feedback: 'Si entras sin poder salir quedarás detenido dentro del cruce, bloqueándolo cuando cambie la fase. La norma lo prohíbe expresamente aunque tu semáforo esté en verde.',
        },
        {
          text: 'Entrar solo hasta la mitad del cruce y esperar allí el hueco.',
          feedback: 'Quedarte a mitad del cruce es precisamente lo que la norma quiere evitar: obstaculizarías la circulación transversal. No debes entrar hasta poder atravesarlo por completo.',
        },
        {
          text: 'No entrar en la intersección, aunque el semáforo esté en verde, hasta que puedas atravesarla sin quedar detenido.',
          correct: true,
        },
      ],
      explanation: 'Aun teniendo prioridad por el semáforo en verde, el conductor no debe penetrar en una intersección si la situación de la circulación es tal que, previsiblemente, quedaría detenido dentro de ella obstaculizando la circulación transversal.',
      rule: 'Art. 59 RGCir — obstrucción de intersecciones.',
    },

    {
      id: 'verde-envejecido',
      tag: 'Semáforos',
      title: 'Verde que llevas viendo desde lejos',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      build(scene) {
        cruceBase(scene);
        addStopLine(scene, { z: 5.5 });
        addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });
        return [];
      },
      question: 'Llevas viendo el semáforo en verde desde bastante lejos mientras te aproximas al cruce. ¿Cuál es la actuación más adecuada?',
      options: [
        {
          text: 'Acelerar para aprovechar el verde antes de que cambie.',
          feedback: 'Acelerar hacia un verde "envejecido" es lo contrario de la conducción preventiva: si cambia a ámbar te obligará a una frenada brusca o a pasar indebidamente.',
        },
        {
          text: 'Levantar el pie del acelerador y estar preparado para frenar, previendo que puede cambiar.',
          correct: true,
        },
        {
          text: 'Mantener la velocidad sin más, porque el verde te garantiza el paso.',
          feedback: 'Un verde que lleva mucho tiempo encendido puede cambiar en cualquier momento; la conducción preventiva exige anticiparlo, no confiarse.',
        },
      ],
      explanation: 'Un semáforo que lleva mucho tiempo en verde ("verde envejecido") puede cambiar a ámbar en cualquier momento. Lo prudente es levantar el pie del acelerador y cubrir el freno al aproximarte, de modo que puedas detenerte con suavidad si cambia.',
      rule: 'Art. 46 RGCir — moderación de la velocidad al aproximarse a intersecciones; conducción preventiva.',
    },

    {
      id: 'noche-ambar-paso-peatones',
      tag: 'Semáforos',
      title: 'Noche: ámbar intermitente en paso de peatones',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 4, to: 80 });
        addDashesZ(scene, { from: -80, to: -3 });
        addCityBlocks(scene);
        addCrosswalk(scene, { z: 0 });
        addStreetlight(scene, { x: 4.5, z: 10 });
        addStreetlight(scene, { x: -4.5, z: -8 });
        semNoche = addSemaphore(scene, { x: 4.4, z: 3.4, active: 'amber' });

        const peaton = makePeaton({ shirt: 0xcccccc });
        peaton.rotation.y = Math.PI / 2; // camina hacia -x, hacia el paso
        peaton.position.set(7.2, 0, 0);
        return [{ mesh: peaton, vel: [-0.7, 0] }];
      },
      tick(t) {
        semNoche.setActive(t % 1 < 0.5 ? 'amber' : 'off');
      },
      question: 'De noche, el semáforo de un paso de peatones parpadea en ámbar y un peatón se acerca al paso dispuesto a cruzar. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Continuar a tu velocidad: el ámbar intermitente indica que el semáforo está fuera de servicio.',
          feedback: 'El ámbar intermitente no significa "fuera de servicio sin más": obliga a extremar la precaución y a respetar la prioridad del peatón en el paso.',
        },
        {
          text: 'Hacer una ráfaga de luces para avisar al peatón y pasar antes de que baje a la calzada.',
          feedback: 'El peatón tiene preferencia en el paso; avisarle para pasar tú primero invierte indebidamente la prioridad.',
        },
        {
          text: 'Reducir la velocidad, extremar la precaución y ceder el paso al peatón si va a cruzar.',
          correct: true,
        },
      ],
      explanation: 'La luz amarilla intermitente obliga a extremar la precaución y no exime de las normas de prioridad: en un paso de peatones, el peatón tiene preferencia. De noche, además, debes moderar la velocidad al acercarte al paso y estar preparado para detenerte.',
      rule: 'Arts. 46 y 146 RGCir — moderación de velocidad ante pasos de peatones y luz amarilla intermitente.',
    },

    {
      id: 'rojo-intermitente-tunel',
      tag: 'Semáforos',
      title: 'Rojo intermitente a la entrada del túnel',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 8, to: 80 });
        addStopLine(scene, { z: 5.5 });
        addTunnel(scene, { from: -50, to: -4 });
        addSign(scene, 'tunel', { x: 4.4, z: 14 });
        semTunel = addSemaphore(scene, { x: 4.4, z: 6, active: 'red' });
        return [];
      },
      tick(t) {
        semTunel.setActive(t % 1 < 0.5 ? 'red' : 'off');
      },
      question: 'A la entrada de un túnel, el semáforo emite una luz roja intermitente. ¿Qué debes hacer?',
      options: [
        {
          text: 'Detenerte antes del semáforo y no entrar en el túnel mientras la luz siga parpadeando.',
          correct: true,
        },
        {
          text: 'Entrar con precaución y las luces de cruce encendidas, porque el rojo intermitente solo advierte de peligro.',
          feedback: 'La luz roja intermitente no es una simple advertencia: prohíbe temporalmente el paso igual que el rojo fijo, mientras permanece encendida.',
        },
        {
          text: 'Entrar únicamente si no ves vehículos detenidos dentro del túnel.',
          feedback: 'No te corresponde valorar si el interior parece libre: mientras la luz roja intermitente esté encendida, el paso está prohibido.',
        },
      ],
      explanation: 'Una luz roja intermitente prohíbe temporalmente el paso mientras está encendida, con el mismo efecto que la roja fija. Se utiliza en accesos a túneles, puentes móviles y pasos a nivel: debes detenerte y esperar a que se apague.',
      rule: 'Art. 146 RGCir — luz roja intermitente: prohibición temporal de paso.',
    },
  ],
};
