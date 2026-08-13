import * as THREE from 'three';
import {
  addRoadZ, addRoadX, addRoadSeg, addDashesZ, addSolidLineZ, addStopLine,
  addYieldMarks, addCrosswalk, addLaneArrow, addCityBlocks, addSemaphore,
  makeCar, makeTruck, makePeaton, laneCenter,
} from '../world.js';

const WHITE = 0xe8e8e8;
const YELLOW = 0xe8c832;

// Pinta un rectángulo plano sobre la calzada (rot = giro en el plano del suelo)
function paintMark(scene, { x, z, w, l, rot = 0, color = WHITE }) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, l),
    new THREE.MeshLambertMaterial({ color })
  );
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = rot;
  m.position.set(x, 0.012, z);
  scene.add(m);
  return m;
}

// Pinta un rótulo de texto (STOP, BUS…) sobre el carril, legible para el jugador
function paintText(scene, text, { x, z, w = 2.0, l = 3.0, color = '#e8e8e8' }) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = 'bold 150px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, l),
    new THREE.MeshLambertMaterial({ map: tex, transparent: true })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.013, z);
  scene.add(m);
  return m;
}

export const TEMA = {
  id: 'marcas',
  title: 'Marcas viales',
  scenarios: [
    // 1 ---------------------------------------------------------------------
    {
      id: 'linea-discontinua-adelantar',
      tag: 'Marcas viales',
      title: 'Línea discontinua y vehículo lento',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        const npc = makeCar(0x8a9a3d);
        npc.position.set(laneCenter(1), 0, 18.5); // z=4 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'Circulas detrás de un turismo muy lento y la marca central de la calzada es una línea discontinua. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'No: nunca se puede rebasar la marca longitudinal central.',
          feedback: 'La línea discontinua sí puede franquearse; lo que no debe atravesarse es la continua.',
        },
        {
          text: 'Sí, siempre que haya visibilidad y espacio suficiente para completar la maniobra con seguridad.',
          correct: true,
        },
        {
          text: 'Sí, sin más condiciones: la línea discontinua autoriza siempre el adelantamiento.',
          feedback: 'La marca lo permite, pero la maniobra sigue exigiendo visibilidad, espacio libre y no poner en peligro a nadie.',
        },
      ],
      explanation: 'La línea longitudinal discontinua puede franquearse para adelantar, cambiar de carril o girar. Ahora bien, la marca solo autoriza cruzarla: el adelantamiento exige además visibilidad y espacio suficientes para realizarlo sin riesgo.',
      rule: 'Arts. 84 y 168 RGCir — línea discontinua y condiciones del adelantamiento.',
    },

    // 2 ---------------------------------------------------------------------
    {
      id: 'doble-continua-discontinua',
      tag: 'Marcas viales',
      title: 'Doble línea: discontinua a tu lado',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { x: -0.15, from: -80, to: 80 }); // continua, lado contrario
        addDashesZ(scene, { x: 0.15, from: -80, to: 80 });     // discontinua, tu lado
        addCityBlocks(scene);
        const npc = makeTruck(0x4a7fd4);
        npc.position.set(laneCenter(1), 0, 18.5); // z=4 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'La marca central es doble: una línea continua y otra discontinua adosadas, con la discontinua de tu lado. ¿Puedes cruzarla para adelantar al camión?',
      options: [
        {
          text: 'Sí: solo debes atender a la línea situada de tu lado, y es discontinua.',
          correct: true,
        },
        {
          text: 'No: la presencia de una línea continua prohíbe la maniobra a ambos sentidos.',
          feedback: 'En las marcas dobles cada conductor atiende únicamente a la línea de su lado; la continua rige para el sentido contrario.',
        },
        {
          text: 'Sí, y los vehículos que circulan en sentido contrario también podrían cruzarla.',
          feedback: 'Al sentido contrario le afecta la línea continua de su lado, que le prohíbe atravesarla.',
        },
      ],
      explanation: 'Cuando una marca longitudinal doble está formada por una línea continua y otra discontinua adosadas, cada conductor debe atender solo a la línea situada de su lado. Con la discontinua a tu lado puedes cruzarla para adelantar; el sentido contrario, con la continua, no.',
      rule: 'Art. 169 RGCir — marcas viales dobles.',
    },

    // 3 ---------------------------------------------------------------------
    {
      id: 'flecha-seleccion-carril',
      tag: 'Marcas viales',
      title: 'Flecha de dirección en tu carril',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { z: -6, from: -60, to: 60 });
        addDashesZ(scene, { from: 80, to: -1 });
        addDashesZ(scene, { from: -11, to: -80 });
        addCityBlocks(scene, { avoid: 16 });
        addLaneArrow(scene, { x: laneCenter(1), z: 10, dir: 'right' });
        addLaneArrow(scene, { x: laneCenter(1), z: 3, dir: 'right' });
        return [];
      },
      question: 'En tu carril hay pintadas flechas que señalan hacia la derecha. ¿Qué te indican?',
      options: [
        {
          text: 'Recomiendan girar a la derecha, pero puedes seguir de frente si lo prefieres.',
          feedback: 'Las flechas de selección de carriles obligan: no son una simple recomendación.',
        },
        {
          text: 'Solo advierten de que existe una intersección próxima.',
          feedback: 'Además de anunciar la intersección, obligan a seguir el sentido indicado desde el carril en que están pintadas.',
        },
        {
          text: 'Que, circulando por ese carril, debes seguir obligatoriamente la dirección indicada en la próxima intersección.',
          correct: true,
        },
      ],
      explanation: 'Las flechas de selección de carriles indican que quien circula por el carril donde están pintadas debe seguir el sentido o uno de los sentidos que señalan en la próxima intersección. Si no quieres girar, debes cambiar de carril antes, donde las marcas lo permitan.',
      rule: 'Art. 172 RGCir — otras marcas e inscripciones de color blanco (flechas de dirección).',
    },

    // 4 ---------------------------------------------------------------------
    {
      id: 'cebreado-linea-continua',
      tag: 'Marcas viales',
      title: 'Zona cebreada',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'right',
      playerLane: 2.8,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80, width: 9 });
        // Zona excluida central delimitada por línea continua
        addSolidLineZ(scene, { x: 1.15, from: -20, to: 20 });
        addSolidLineZ(scene, { x: -1.15, from: -20, to: 20 });
        addDashesZ(scene, { from: 80, to: 21 });
        addDashesZ(scene, { from: -21, to: -80 });
        for (let i = 0; i < 5; i++) {
          paintMark(scene, { x: 0, z: 10 - i * 2.6, w: 2.0, l: 0.4, rot: Math.PI / 4 });
        }
        addCityBlocks(scene);
        return [];
      },
      question: 'A tu izquierda hay una zona de la calzada marcada con franjas oblicuas blancas, rodeada por una línea continua. ¿Qué debes hacer?',
      options: [
        {
          text: 'Puedes circular sobre ella si con eso acortas tu trayectoria.',
          feedback: 'Al estar delimitada por línea continua, está prohibido entrar en la zona cebreada.',
        },
        {
          text: 'No entrar en esa zona con el vehículo ni detenerte sobre ella.',
          correct: true,
        },
        {
          text: 'Puedes detenerte sobre ella unos instantes, pero no estacionar.',
          feedback: 'El cebreado excluye esa zona del tráfico: tampoco se permite la parada sobre él.',
        },
      ],
      explanation: 'El cebreado (franjas oblicuas enmarcadas por una línea continua) señala una zona excluida de la circulación: no se debe entrar en ella ni detenerse encima. Si el marco fuera de línea discontinua, solo podría pisarse en caso de necesidad manifiesta y sin riesgo.',
      rule: 'Art. 172 RGCir — cebreado (zona excluida del tráfico).',
    },

    // 5 ---------------------------------------------------------------------
    {
      id: 'zigzag-amarillo',
      tag: 'Marcas viales',
      title: 'Línea amarilla en zigzag',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        // Zigzag amarillo junto al bordillo derecho
        for (let i = 0; i < 9; i++) {
          paintMark(scene, {
            x: 3.15, z: 10 - i * 1.4, w: 0.15, l: 1.7,
            rot: (i % 2 === 0 ? 1 : -1) * 0.5, color: YELLOW,
          });
        }
        return [];
      },
      question: 'Junto al bordillo derecho hay pintada una línea amarilla en zigzag, en una zona de parada de autobús. ¿Puedes estacionar sobre ella?',
      options: [
        {
          text: 'No puedes estacionar; una parada momentánea sí estaría permitida.',
          correct: true,
        },
        {
          text: 'No puedes ni parar ni estacionar en ningún caso.',
          feedback: 'El zigzag amarillo prohíbe el estacionamiento; la prohibición de parada y estacionamiento corresponde a la línea amarilla continua.',
        },
        {
          text: 'Puedes estacionar fuera de las horas de servicio del autobús.',
          feedback: 'La marca prohíbe estacionar en toda su extensión, sin franjas horarias.',
        },
      ],
      explanation: 'La línea amarilla en zigzag indica que en esa zona está prohibido estacionar, por estar reservada generalmente a algún uso especial, como la parada de autobuses. La parada momentánea, sin abandonar el vehículo, no queda prohibida por esta marca.',
      rule: 'RGCir — marcas viales de color amarillo (zigzag: prohibición de estacionamiento).',
    },

    // 6 ---------------------------------------------------------------------
    {
      id: 'amarilla-continua-bordillo',
      tag: 'Marcas viales',
      title: 'Línea amarilla continua',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        // Línea amarilla continua junto al borde derecho de la calzada
        paintMark(scene, { x: 3.32, z: -3, w: 0.15, l: 30, color: YELLOW });
        return [];
      },
      question: 'Junto al borde derecho de la calzada hay una línea amarilla continua. ¿Puedes parar un momento para que baje un pasajero?',
      options: [
        {
          text: 'Sí, la parada de menos de dos minutos está permitida.',
          feedback: 'La línea amarilla continua prohíbe también la parada, por breve que sea.',
        },
        {
          text: 'Sí, siempre que permanezcas dentro del vehículo.',
          feedback: 'Permanecer al volante no cambia nada: la marca prohíbe parar y estacionar.',
        },
        {
          text: 'No: la línea amarilla continua prohíbe la parada y el estacionamiento en toda su longitud.',
          correct: true,
        },
      ],
      explanation: 'Una línea amarilla longitudinal continua pintada junto al borde de la calzada significa que la parada y el estacionamiento están prohibidos o sometidos a restricción en toda la longitud de la línea y en el lado en que está dispuesta.',
      rule: 'RGCir — marcas viales de color amarillo (línea continua: parada y estacionamiento prohibidos).',
    },

    // 7 ---------------------------------------------------------------------
    {
      id: 'marca-stop-carril',
      tag: 'Marcas viales',
      title: 'Inscripción STOP en la calzada',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { z: -5, from: -60, to: 60 });
        addDashesZ(scene, { from: 80, to: 0 });
        addDashesZ(scene, { from: -10, to: -80 });
        addCityBlocks(scene, { avoid: 16 });
        paintText(scene, 'STOP', { x: laneCenter(1), z: 7 });
        addStopLine(scene, { z: -0.5 });
        return [];
      },
      question: 'En tu carril está pintada la palabra STOP y más adelante hay una línea de detención. ¿Qué te indica esta marca?',
      options: [
        {
          text: 'Puedes continuar sin detenerte si no se aproximan vehículos por la transversal.',
          feedback: 'La marca de STOP obliga a detenerse siempre, haya o no tráfico a la vista.',
        },
        {
          text: 'La obligación de detener el vehículo ante la próxima línea de detención.',
          correct: true,
        },
        {
          text: 'Que debes reducir la velocidad y ceder el paso, sin necesidad de detenerte.',
          feedback: 'Eso corresponde al ceda el paso; el STOP exige la detención completa del vehículo.',
        },
      ],
      explanation: 'La inscripción STOP pintada en el carril anuncia al conductor la obligación de detener el vehículo ante la próxima línea de detención o, si no existiera, inmediatamente antes de la calzada a la que se aproxima, y ceder el paso a los vehículos que circulen por ella.',
      rule: 'Art. 171 RGCir — señales horizontales de circulación (STOP).',
    },

    // 8 ---------------------------------------------------------------------
    {
      id: 'ceda-marca-horizontal',
      tag: 'Marcas viales',
      title: 'Triángulos de ceda pintados',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { z: -2, from: -60, to: 60 });
        addDashesZ(scene, { from: 80, to: 3 });
        addDashesZ(scene, { from: -7, to: -80 });
        addCityBlocks(scene, { avoid: 16 });
        addYieldMarks(scene, { z: 4 });
        const npc = makeCar(0xd4a24a);
        npc.position.set(-30.1, 0, -0.25); // x=-12 en la congelación
        npc.rotation.y = -Math.PI / 2;     // circula hacia +x
        scene.add(npc);
        return [{ mesh: npc, vel: [5, 0] }];
      },
      question: 'En tu carril hay pintados unos triángulos blancos antes del cruce y no existe señal vertical. ¿Debes ceder el paso a quien circula por la vía transversal?',
      options: [
        {
          text: 'Sí: la marca vial tiene el mismo valor que la señal vertical de ceda el paso.',
          correct: true,
        },
        {
          text: 'No: sin señal vertical, la marca pintada es solo orientativa.',
          feedback: 'Las señales horizontales obligan por sí mismas, exista o no señal vertical que las acompañe.',
        },
        {
          text: 'Solo si el otro vehículo se aproxima por tu derecha.',
          feedback: 'La marca de ceda te obliga frente a ambos sentidos de la vía transversal, no solo frente a la derecha.',
        },
      ],
      explanation: 'Los triángulos pintados en el carril son la señal horizontal de ceda el paso: obligan igual que la señal vertical, aunque esta no exista. Debes ceder el paso a los vehículos que circulen por la vía a la que te aproximas y detenerte si es preciso.',
      rule: 'Art. 171 RGCir — señales horizontales de circulación (ceda el paso).',
    },

    // 9 ---------------------------------------------------------------------
    {
      id: 'paso-peatones-sin-semaforo',
      tag: 'Marcas viales',
      title: 'Paso de peatones sin semáforo',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 80, to: 3 });
        addDashesZ(scene, { from: -3, to: -80 });
        addCrosswalk(scene, { z: 0 });
        addCityBlocks(scene);
        const p = makePeaton({ shirt: 0xc25555 });
        p.position.set(-6.9, 0, 0); // x=-4, al borde del paso, en la congelación
        p.rotation.y = -Math.PI / 2; // camina hacia +x
        scene.add(p);
        return [{ mesh: p, vel: [0.8, 0] }];
      },
      question: 'Te aproximas a un paso de peatones no regulado por semáforo y una persona se dispone a cruzar. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Mantener la velocidad si el peatón aún no ha pisado la calzada.',
          feedback: 'Debes moderar la velocidad al acercarte a un paso y ceder también a quien va a entrar en él.',
        },
        {
          text: 'Advertir de tu presencia con el claxon y pasar primero.',
          feedback: 'En el paso la prioridad es del peatón; el claxon no te da preferencia.',
        },
        {
          text: 'Moderar la velocidad y ceder el paso, deteniéndote si es necesario.',
          correct: true,
        },
      ],
      explanation: 'La marca de paso para peatones indica una zona donde estos tienen prioridad. Al aproximarte a un paso no regulado debes moderar la velocidad y detenerte, si es preciso, para dejar cruzar a quien esté en el paso o se disponga a entrar en él.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante pasos de peatones.',
    },

    // 10 --------------------------------------------------------------------
    {
      id: 'linea-detencion-semaforo-rojo',
      tag: 'Marcas viales',
      title: 'Semáforo rojo y línea de detención',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { z: -6, from: -60, to: 60 });
        addDashesZ(scene, { from: 80, to: -1 });
        addDashesZ(scene, { from: -11, to: -80 });
        addCityBlocks(scene, { avoid: 16 });
        addStopLine(scene, { z: 2 });
        addSemaphore(scene, { x: 4.4, z: 0, active: 'red' });
        return [];
      },
      question: 'El semáforo está en rojo y en tu carril hay una línea continua de detención. ¿Dónde debes detener el vehículo?',
      options: [
        {
          text: 'Antes de la línea de detención, sin llegar a rebasarla.',
          correct: true,
        },
        {
          text: 'A la altura del semáforo, aunque rebases la línea pintada.',
          feedback: 'La detención debe producirse ante la línea de detención, no junto al poste del semáforo.',
        },
        {
          text: 'Puedes cruzar con precaución si no se aproxima ningún vehículo.',
          feedback: 'La luz roja no intermitente obliga a detenerse en todo caso.',
        },
      ],
      explanation: 'La luz roja no intermitente prohíbe el paso y obliga a detenerse antes de la línea de detención más próxima. Esa marca transversal continua señala exactamente el punto que el vehículo no debe franquear.',
      rule: 'Arts. 146 y 170 RGCir — luz roja y marca transversal de detención.',
    },

    // 11 --------------------------------------------------------------------
    {
      id: 'carril-bus-inscripcion',
      tag: 'Marcas viales',
      title: 'Carril con inscripción BUS',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      playerLane: -1.75, // vía de sentido único con dos carriles; circulas por el izquierdo
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        paintText(scene, 'BUS', { x: laneCenter(1), z: 6 });
        paintText(scene, 'BUS', { x: laneCenter(1), z: -14 });
        const bus = makeTruck(0xd4483c);
        bus.position.set(laneCenter(1), 0, 15.75); // z=-6 en la congelación
        scene.add(bus);
        return [{ mesh: bus, vel: [0, -6] }];
      },
      question: 'Circulas con tu turismo por una vía de sentido único y en el carril derecho está pintada la inscripción BUS. ¿Puedes circular por ese carril?',
      options: [
        {
          text: 'Sí, porque por él circula menos tráfico.',
          feedback: 'La inscripción reserva el carril a los vehículos indicados; la fluidez no te autoriza a usarlo.',
        },
        {
          text: 'No: está reservado a los vehículos que indica la inscripción, salvo que la señalización te permita usarlo para girar.',
          correct: true,
        },
        {
          text: 'Sí, siempre que no se aproxime ningún autobús.',
          feedback: 'Aunque el carril esté libre, sigue reservado: no basta con que no venga ningún autobús.',
        },
      ],
      explanation: 'La inscripción BUS pintada en un carril indica que está reservado a esa clase de vehículos. Los turismos no deben circular por él, salvo en los tramos en que la señalización permita utilizarlo, por ejemplo, para incorporarse o para girar próximos a una intersección.',
      rule: 'Arts. 35 y 172 RGCir — utilización del carril bus e inscripciones en la calzada.',
    },

    // 12 --------------------------------------------------------------------
    {
      id: 'flecha-retorno',
      tag: 'Marcas viales',
      title: 'Flecha de retorno',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      playerLane: -1.75, // estás adelantando por el carril izquierdo
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 80, to: -6 });
        addSolidLineZ(scene, { from: -6, to: -80 }); // la discontinua se acaba
        addCityBlocks(scene);
        addLaneArrow(scene, { x: -1.75, z: 6, dir: 'return' });
        addLaneArrow(scene, { x: -1.75, z: -2, dir: 'return' });
        const npc = makeTruck(0x6a8f5a);
        npc.position.set(laneCenter(1), 0, 34.5); // z=20, ya rebasado, en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'Estás adelantando por el carril izquierdo y en él aparece pintada una flecha de retorno. ¿Qué te indica?',
      options: [
        {
          text: 'Que el carril izquierdo pasa a ser solo para vehículos lentos.',
          feedback: 'La flecha de retorno no reserva el carril: avisa de que debes abandonarlo.',
        },
        {
          text: 'Que puedes permanecer en el carril izquierdo mientras la línea central siga siendo discontinua.',
          feedback: 'Precisamente anuncia que la discontinua está a punto de convertirse en continua: no apures hasta el final.',
        },
        {
          text: 'Que debes incorporarte lo antes posible al carril derecho.',
          correct: true,
        },
      ],
      explanation: 'La flecha de retorno, ligeramente curvada hacia el lado derecho, anuncia la proximidad de una línea continua y advierte de que debes circular cuanto antes por el carril al que apunta: termina el adelantamiento y vuelve al carril derecho.',
      rule: 'Art. 172 RGCir — otras marcas e inscripciones de color blanco (flecha de retorno).',
    },

    // 13 --------------------------------------------------------------------
    {
      id: 'linea-borde-arcen',
      tag: 'Marcas viales',
      title: 'Línea de borde y arcén',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { x: 1.5, from: -80, to: 80, width: 10 }); // calzada + arcén derecho
        addRoadSeg(scene, { x: 5, z: 0, len: 160, width: 3, color: 0x46494f }); // arcén
        addDashesZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { x: 3.5, from: -80, to: 80 }); // línea de borde
        addCityBlocks(scene);
        return [];
      },
      question: 'A la derecha de tu carril hay una línea blanca continua que lo separa del arcén. ¿Qué significa esa marca?',
      options: [
        {
          text: 'Delimita el borde de la calzada: con tu turismo no debes circular por el arcén.',
          correct: true,
        },
        {
          text: 'Que debes circular por el arcén para facilitar el adelantamiento a los más rápidos.',
          feedback: 'Solo determinados vehículos (o quien circula a velocidad anormalmente reducida por emergencia) deben usar el arcén; facilitar un adelantamiento no te obliga a invadirlo.',
        },
        {
          text: 'Que está prohibido estacionar en el arcén.',
          feedback: 'Es la línea de borde de la calzada; no regula por sí misma el estacionamiento.',
        },
      ],
      explanation: 'La línea continua de borde delimita la calzada y la separa del arcén. Los turismos deben circular por la calzada; el arcén queda para peatones y para los vehículos obligados a utilizarlo (ciclos, ciclomotores o quien circule a velocidad anormalmente reducida).',
      rule: 'Arts. 36 y 167 RGCir — utilización del arcén y línea de borde de calzada.',
    },

    // 14 --------------------------------------------------------------------
    {
      id: 'isleta-cebreada-giro',
      tag: 'Marcas viales',
      title: 'Isleta cebreada central',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'right',
      playerLane: 2.8,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80, width: 9 });
        addRoadX(scene, { z: -8, from: -60, to: 60 });
        // Isleta cebreada central antes del cruce
        addSolidLineZ(scene, { x: 1.15, from: -3, to: 13 });
        addSolidLineZ(scene, { x: -1.15, from: -3, to: 13 });
        addDashesZ(scene, { from: 80, to: 14 });
        addDashesZ(scene, { from: -13, to: -80 });
        for (let i = 0; i < 5; i++) {
          paintMark(scene, { x: 0, z: 11 - i * 2.6, w: 2.0, l: 0.4, rot: Math.PI / 4 });
        }
        addCityBlocks(scene, { avoid: 16 });
        return [];
      },
      question: 'Vas a girar a la izquierda en el próximo cruce y antes de él hay una isleta central marcada con cebreado. ¿Cómo debes rebasarla?',
      options: [
        {
          text: 'Puedes pisar el cebreado si con ello inicias antes el giro.',
          feedback: 'La isleta cebreada está excluida del tráfico: no debes circular sobre ella ni siquiera para girar.',
        },
        {
          text: 'Rodeándola por donde indican las marcas, sin circular sobre el cebreado.',
          correct: true,
        },
        {
          text: 'Deteniéndote siempre justo antes de la isleta.',
          feedback: 'La isleta no impone detención: canaliza las trayectorias; te detendrás solo si el tráfico lo exige.',
        },
      ],
      explanation: 'Las isletas cebreadas canalizan el tráfico antes de una intersección y son zonas excluidas de la circulación. Para girar a la izquierda debes bordearlas siguiendo tu carril, por el lado que marcan las líneas, sin invadir el cebreado.',
      rule: 'Art. 172 RGCir — cebreado e isletas de canalización.',
    },

    // 15 --------------------------------------------------------------------
    {
      id: 'carril-reversible',
      tag: 'Marcas viales',
      title: 'Carril reversible',
      playerStart: 45, playerSpeed: 8, triggerZ: 16,
      panel: 'right',
      playerLane: 3.5,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80, width: 10.5 });
        // Carril central delimitado por doble línea discontinua a cada lado
        addDashesZ(scene, { x: 1.6, from: -80, to: 80 });
        addDashesZ(scene, { x: 1.9, from: -80, to: 80 });
        addDashesZ(scene, { x: -1.6, from: -80, to: 80 });
        addDashesZ(scene, { x: -1.9, from: -80, to: 80 });
        addCityBlocks(scene);
        const npc = makeCar(0x5577aa);
        npc.position.set(-3.5, 0, -30.6); // z=2 en la congelación, viene de frente
        npc.rotation.y = Math.PI;
        scene.add(npc);
        return [{ mesh: npc, vel: [0, 9] }];
      },
      question: 'El carril central está delimitado a ambos lados por una doble línea discontinua. ¿Puedes utilizarlo para adelantar?',
      options: [
        {
          text: 'Sí, es un carril normal habilitado para el adelantamiento en ambos sentidos.',
          feedback: 'La doble línea discontinua delimita un carril reversible, no un carril central de adelantamiento libre.',
        },
        {
          text: 'Sí, siempre que no venga ningún vehículo de frente.',
          feedback: 'No basta con que esté libre: su sentido lo fijan los semáforos de carril, y solo con autorización puedes usarlo.',
        },
        {
          text: 'Solo cuando los semáforos de carril muestren para tu sentido que está abierto (flecha verde).',
          correct: true,
        },
      ],
      explanation: 'Las dobles líneas discontinuas a ambos lados delimitan un carril reversible, cuyo sentido de circulación puede cambiar. Solo puedes utilizarlo cuando los semáforos cuadrados de carril lo abran para tu sentido (flecha verde); con aspa roja está cerrado.',
      rule: 'Arts. 148 y 168 RGCir — carril reversible y semáforos de carril.',
    },
  ],
};
