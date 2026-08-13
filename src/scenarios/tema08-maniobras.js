// Tema 08 — Carriles, incorporaciones y maniobras (arts. 72-81 RGCir aprox.)
// Autoría según docs/AUTORIA.md
import {
  addRoadZ, addRoadX, addRoadSeg, addDashesZ, addDashesX, addSolidLineZ,
  addLaneArrow, addTunnel, addCityBlocks, addSign,
  makeCar, makeTruck, makePeaton, laneCenter,
} from '../world.js';

export const TEMA = {
  id: 'maniobras',
  title: 'Carriles, incorporaciones y maniobras',
  scenarios: [

    // 1 ────────────────────────────────────────────────────────────────────
    {
      id: 'incorporacion-carril-aceleracion',
      tag: 'Incorporación',
      title: 'Carril de aceleración con tráfico',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      playerLane: 5.25, // el jugador circula por el carril de aceleración
      panel: 'right',
      build(scene) {
        // Calzada principal de la autovía: dos carriles hacia -z
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: -120, to: 120 });
        // Carril de aceleración a la derecha
        addRoadSeg(scene, { x: 5.25, z: 15, len: 64, width: 3.5 });
        addDashesZ(scene, { x: 3.5, from: -15, to: 45 });
        // Ramal diagonal de entrada
        addRoadSeg(scene, { x: 8.5, z: 55, rotY: 0.32, len: 26, width: 4 });

        const c1 = makeCar(0x4a7fd4);
        c1.position.set(laneCenter(1), 0, 84.5); // congelado en z=2, 10 m por delante-izquierda
        scene.add(c1);
        const c2 = makeCar(0x3f9e6b);
        c2.position.set(laneCenter(1), 0, 62.5); // congelado en z=-20
        scene.add(c2);
        return [
          { mesh: c1, vel: [0, -20] },
          { mesh: c2, vel: [0, -20] },
        ];
      },
      question: 'Te incorporas a una autovía por el carril de aceleración y por la calzada circulan varios turismos. ¿Cómo debes realizar la incorporación?',
      options: [
        {
          text: 'Detenerte al final del carril de aceleración y esperar a que la calzada quede libre.',
          feedback: 'El carril de aceleración sirve precisamente para ganar velocidad; detenerse en él solo procede si es imprescindible y dificulta mucho la incorporación.',
        },
        {
          text: 'Usar el carril para alcanzar una velocidad adecuada, ceder el paso a quienes circulan por la autovía e incorporarte sin obligarles a modificar su marcha.',
          correct: true,
        },
        {
          text: 'Incorporarte directamente: los que circulan por la autovía están obligados a apartarse al carril izquierdo para dejarte entrar.',
          feedback: 'Facilitar la incorporación desplazándose de carril es una colaboración recomendable, pero no una obligación: quien debe ceder el paso es el que se incorpora.',
        },
      ],
      explanation: 'Quien se incorpora a la circulación debe ceder el paso a los vehículos que circulan por la vía. El carril de aceleración permite adaptar la velocidad a la del tráfico de la autovía para incorporarse sin crear peligro ni obligar a otros a frenar.',
      rule: 'Art. 72 RGCir — incorporación a la circulación.',
    },

    // 2 ────────────────────────────────────────────────────────────────────
    {
      id: 'salida-carril-deceleracion',
      tag: 'Carriles',
      title: 'Salida con carril de deceleración',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        // Autovía: dos carriles hacia -z
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: -120, to: 120 });
        // Carril de deceleración a la derecha
        addRoadSeg(scene, { x: 5.25, z: -5, len: 60, width: 3.5 });
        addDashesZ(scene, { x: 3.5, from: -35, to: 25 });
        addLaneArrow(scene, { x: 5.25, z: 8, dir: 'up' });
        // Ramal diagonal de salida
        addRoadSeg(scene, { x: 8.5, z: -45, rotY: -0.32, len: 26, width: 4 });
        return [];
      },
      question: 'Vas a abandonar la autovía por esta salida, que dispone de carril de deceleración. ¿Dónde debes reducir la velocidad?',
      options: [
        {
          text: 'Dentro del carril de deceleración, entrando en él lo antes posible y frenando ya fuera de la calzada principal.',
          correct: true,
        },
        {
          text: 'En la calzada principal, frenando con antelación antes de entrar en el carril de salida.',
          feedback: 'Frenar en la calzada principal entorpece y sorprende a los que circulan detrás. El carril de deceleración existe para reducir la velocidad fuera de los carriles de paso.',
        },
        {
          text: 'Es indiferente: puedes reducir donde te resulte más cómodo si señalizas la maniobra.',
          feedback: 'No es indiferente: señalizar no basta. La reducción debe hacerse dentro del carril de deceleración para no entorpecer al resto del tráfico.',
        },
      ],
      explanation: 'Para salir de una autovía debes señalizar con antelación, pasar cuanto antes al carril de deceleración y reducir la velocidad dentro de él, no en los carriles de la calzada principal, donde frenarías al tráfico que te sigue.',
      rule: 'Art. 74 RGCir — cambios de carril; utilización del carril de deceleración.',
    },

    // 3 ────────────────────────────────────────────────────────────────────
    {
      id: 'cambio-carril-trafico',
      tag: 'Cambio de carril',
      title: 'Cambiar de carril con tráfico',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        // Dos carriles en el mismo sentido (hacia -z)
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: -120, to: 120 });

        const camion = makeTruck(0xc9762b);
        camion.position.set(laneCenter(1), 0, 20.6); // congelado en z=0, delante de ti
        scene.add(camion);
        const rapido = makeCar(0x777f8a);
        rapido.position.set(laneCenter(-1), 0, 92); // por el carril izquierdo, detrás
        scene.add(rapido);
        return [
          { mesh: camion, vel: [0, -5] },
          { mesh: rapido, vel: [0, -16] },
        ];
      },
      question: 'Circulas detrás de un camión lento y quieres pasar al carril izquierdo. ¿Cómo debes hacer el cambio de carril?',
      options: [
        {
          text: 'Señalizar con el intermitente: una vez señalizada la maniobra, los demás deben dejarte hueco.',
          feedback: 'El intermitente advierte, pero no otorga preferencia: no puedes iniciar el cambio si obligas a frenar o a desviarse a quien circula por el carril izquierdo.',
        },
        {
          text: 'Cambiar de carril con decisión: la marca discontinua permite la maniobra en cualquier momento.',
          feedback: 'La discontinua permite el cambio, pero solo cuando puedas hacerlo con seguridad, tras observar espejos y ángulo muerto y sin entorpecer a nadie.',
        },
        {
          text: 'Comprobar espejos y ángulo muerto, señalizar con antelación y cambiar solo si no obligas a frenar ni a desviarse a quien circula por ese carril.',
          correct: true,
        },
      ],
      explanation: 'Antes de cambiar de carril debes advertirlo con suficiente antelación y cerciorarte, mirando espejos y ángulo muerto, de que la maniobra no obliga a los vehículos que circulan por el otro carril a modificar bruscamente su velocidad o trayectoria.',
      rule: 'Art. 74 RGCir — cambios de carril.',
    },

    // 4 ────────────────────────────────────────────────────────────────────
    {
      id: 'salida-garaje-peaton',
      tag: 'Incorporación',
      title: 'Salida de un garaje cruzando la acera',
      playerStart: 25,
      playerSpeed: 3,
      triggerZ: 11,
      playerLane: 0,
      panel: 'left',
      build(scene) {
        // Salida del vado: camino hacia -z que cruza la acera y llega a la calle
        addRoadSeg(scene, { x: 0, z: 17.5, len: 35, width: 4, color: 0x50545a });
        // Acera transversal
        addRoadSeg(scene, { x: 0, z: 6, rotY: Math.PI / 2, len: 60, width: 3, color: 0x9a9a92 });
        // Calle transversal (doble sentido, eje X)
        addRoadX(scene, { z: 0, from: -70, to: 70 });
        addDashesX(scene, { z: 0, from: -70, to: -6 });
        addDashesX(scene, { z: 0, from: 6, to: 70 });

        // Peatón caminando por la acera hacia la salida del garaje
        const p = makePeaton({ shirt: 0xd45050 });
        p.position.set(8.4, 0, 6);
        p.rotation.y = Math.PI / 2; // camina hacia -x
        scene.add(p);
        // Turismo por la calle, se aproxima por la izquierda
        const c = makeCar(0x4a7fd4);
        c.position.set(-43.3, 0, laneCenter(1));
        c.rotation.y = -Math.PI / 2; // circula hacia +x
        scene.add(c);
        return [
          { mesh: p, vel: [-1.2, 0] },
          { mesh: c, vel: [8, 0] },
        ];
      },
      question: 'Sales de un garaje y para incorporarte a la calle debes cruzar la acera, por la que camina un peatón. ¿Qué debes hacer?',
      options: [
        {
          text: 'Avanzar con decisión sobre la acera: el peatón te ve y debe detenerse para dejarte salir.',
          feedback: 'En la acera la prioridad es siempre del peatón. Quien sale de un inmueble debe ceder el paso a peatones y vehículos.',
        },
        {
          text: 'Ceder el paso al peatón que cruza tu trayectoria y, después, a todos los vehículos de la calle antes de incorporarte.',
          correct: true,
        },
        {
          text: 'Ceder el paso solo a los vehículos que se aproximen por tu derecha.',
          feedback: 'La norma de la derecha no se aplica aquí: al incorporarte desde un inmueble debes ceder el paso a todos los vehículos, vengan por donde vengan, y antes a los peatones de la acera.',
        },
      ],
      explanation: 'El conductor que se incorpora a la circulación desde un garaje o vado debe cerciorarse de que puede hacerlo sin peligro y ceder el paso: primero a los peatones que transitan por la acera que cruza y después a todos los vehículos que circulan por la vía.',
      rule: 'Art. 72 RGCir — incorporación a la circulación desde un inmueble o vado.',
    },

    // 5 ────────────────────────────────────────────────────────────────────
    {
      id: 'carril-bus-atasco',
      tag: 'Carriles reservados',
      title: 'Atasco junto a un carril bus',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      playerLane: -1.75, // carril general; el de la derecha es el carril bus
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -120, to: 120 });
        // Línea continua que separa el carril general del carril reservado
        addSolidLineZ(scene, { x: 0, from: -120, to: 60 });
        addCityBlocks(scene, { avoid: 8 });

        // Retención en tu carril
        const colores = [0x4a7fd4, 0x3f9e6b, 0xc9b13a];
        const npcs = [];
        [0, -7, -14].forEach((z, i) => {
          const c = makeCar(colores[i]);
          c.position.set(laneCenter(-1), 0, z);
          scene.add(c);
          npcs.push({ mesh: c, vel: [0, 0] });
        });
        // Autobús circulando por su carril reservado
        const bus = makeTruck(0xcf4444);
        bus.position.set(laneCenter(1), 0, 13); // congelado en z=-20
        scene.add(bus);
        npcs.push({ mesh: bus, vel: [0, -8] });
        return npcs;
      },
      question: 'Tu carril está retenido y el carril reservado para autobuses, a tu derecha, está libre. ¿Puedes utilizarlo para evitar el atasco?',
      options: [
        {
          text: 'No: es un carril reservado y debes permanecer en el tuyo aunque haya retención.',
          correct: true,
        },
        {
          text: 'Sí, siempre que circules despacio y vuelvas a tu carril en cuanto pase la retención.',
          feedback: 'La velocidad no cambia nada: el carril bus está reservado a determinados vehículos y los demás no pueden circular por él, haya o no atasco.',
        },
        {
          text: 'Sí, porque los carriles reservados solo obligan en horario laboral.',
          feedback: 'La reserva del carril rige según su señalización, no según un supuesto horario general. Salvo indicación expresa, no puedes invadirlo.',
        },
      ],
      explanation: 'Los carriles reservados (bus, bus-taxi, VAO…) solo pueden ser utilizados por los vehículos a los que se destinan. La retención del carril general no autoriza a invadirlos, y la línea continua que los delimita tampoco puede atravesarse.',
      rule: 'RGCir — utilización de carriles reservados para determinados vehículos.',
    },

    // 6 ────────────────────────────────────────────────────────────────────
    {
      id: 'giro-izquierda-doble-sentido',
      tag: 'Cambios de dirección',
      title: 'Giro a la izquierda en calzada de doble sentido',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // Vehículo que viene de frente por el otro sentido
        const c = makeCar(0x3f9e6b);
        c.position.set(laneCenter(-1), 0, -51); // congelado en z=-20
        c.rotation.y = Math.PI; // circula hacia +z
        scene.add(c);
        return [{ mesh: c, vel: [0, 8] }];
      },
      question: 'Circulas por una calzada de doble sentido y vas a girar a la izquierda en la próxima intersección. ¿Cómo debes colocarte para el giro?',
      options: [
        {
          text: 'Ceñirte al borde derecho de la calzada para trazar el giro más abierto.',
          feedback: 'Esa es la colocación del giro a la derecha. Para girar a la izquierda debes aproximarte al eje de la calzada, no al borde derecho.',
        },
        {
          text: 'Invadir con antelación el carril del sentido contrario para prepararte y girar más rápido.',
          feedback: 'Nunca puedes prepararte invadiendo el sentido contrario: te colocarás junto al eje pero sin rebasarlo, dentro de tu mitad de la calzada.',
        },
        {
          text: 'Señalizar con antelación y situarte junto al eje central de la calzada, sin invadir el sentido contrario, cediendo el paso a los que vienen de frente.',
          correct: true,
        },
      ],
      explanation: 'Para girar a la izquierda en una calzada de doble sentido debes advertir la maniobra con antelación y ceñirte al eje de la calzada (la marca que separa los sentidos) sin invadirlo, cediendo el paso a los vehículos que circulan en sentido contrario.',
      rule: 'Arts. 75 y 76 RGCir — cambios de dirección: colocación y ejecución.',
    },

    // 7 ────────────────────────────────────────────────────────────────────
    {
      id: 'giro-derecha-borde',
      tag: 'Cambios de dirección',
      title: 'Colocación para girar a la derecha',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);
        return [];
      },
      question: 'Vas a girar a la derecha en la próxima intersección. ¿Cuál es la colocación correcta para realizar la maniobra?',
      options: [
        {
          text: 'Aproximarte al centro de la calzada para tomar la curva con más espacio.',
          feedback: 'Abrirte hacia el centro antes de girar a la derecha confunde a los demás y deja hueco por tu derecha a otros vehículos. Debes ceñirte al borde derecho.',
        },
        {
          text: 'Señalizar con antelación y ceñirte lo más posible al borde derecho de la calzada antes de girar.',
          correct: true,
        },
        {
          text: 'Basta con señalizar; la posición en el carril es indiferente si giras despacio.',
          feedback: 'La señalización es necesaria pero no suficiente: el reglamento exige además colocarse con antelación pegado al borde derecho.',
        },
      ],
      explanation: 'El giro a la derecha se prepara señalizando con suficiente antelación y ciñéndose al borde derecho de la calzada, de modo que la trayectoria sea previsible y nadie pueda colarse entre tu vehículo y el borde.',
      rule: 'Art. 75 RGCir — cambios de dirección: colocación previa.',
    },

    // 8 ────────────────────────────────────────────────────────────────────
    {
      id: 'cambio-sentido-linea-continua',
      tag: 'Cambio de sentido',
      title: 'Cambio de sentido con línea continua',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -120, to: 120 });
        addSolidLineZ(scene, { x: 0, from: -120, to: 120 });
        addCityBlocks(scene, { avoid: 8 });

        const c = makeCar(0x4a7fd4);
        c.position.set(laneCenter(-1), 0, -48); // congelado en z=-15, viene de frente
        c.rotation.y = Math.PI;
        scene.add(c);
        return [{ mesh: c, vel: [0, 8] }];
      },
      question: 'Te has equivocado de dirección y quieres cambiar de sentido, pero en este tramo la calzada está dividida por una línea continua. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar la marcha hasta un lugar adecuado donde la maniobra esté permitida, como una intersección o un tramo con línea discontinua.',
          correct: true,
        },
        {
          text: 'Hacer el cambio de sentido rápidamente, aprovechando que no se acerca ningún vehículo.',
          feedback: 'Que no venga nadie no legaliza la maniobra: la línea continua no puede atravesarse y el cambio de sentido está prohibido en ese tramo.',
        },
        {
          text: 'Hacerlo en varias maniobras con marcha atrás para no pisar la línea continua.',
          feedback: 'Trocear la maniobra no la hace legal: seguirías cruzando la línea continua y además obstaculizarías la circulación en plena calzada.',
        },
      ],
      explanation: 'El cambio de sentido está prohibido donde una línea continua divide la calzada, entre otros lugares sin visibilidad o donde se obstaculice la circulación. Lo correcto es continuar hasta un punto donde la maniobra pueda hacerse con seguridad y esté permitida.',
      rule: 'Art. 78 RGCir — cambio de sentido de la marcha.',
    },

    // 9 ────────────────────────────────────────────────────────────────────
    {
      id: 'marcha-atras-calle-pasada',
      tag: 'Marcha atrás',
      title: 'Te has pasado tu calle',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: -10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);
        return [];
      },
      question: 'Acabas de rebasar la intersección donde querías girar. ¿Puedes retroceder marcha atrás hasta ella?',
      options: [
        {
          text: 'Sí, despacio y con las luces de emergencia encendidas.',
          feedback: 'Las luces de emergencia no autorizan la maniobra: la marcha atrás está prohibida como maniobra normal y nunca puede invadir una intersección.',
        },
        {
          text: 'Sí, si compruebas que no se acerca ningún vehículo por detrás.',
          feedback: 'Aunque no venga nadie, retroceder hasta un cruce no es una maniobra complementaria permitida: es circular marcha atrás, y está prohibido.',
        },
        {
          text: 'No: la marcha atrás solo se permite como complemento de otra maniobra, con un recorrido máximo de 15 metros y sin invadir un cruce.',
          correct: true,
        },
      ],
      explanation: 'Está prohibido circular hacia atrás salvo como maniobra complementaria de otra (parar, estacionar, incorporarse…), recorriendo como máximo 15 metros y sin invadir un cruce de vías. Pasarse una calle obliga a continuar y volver por un itinerario permitido.',
      rule: 'Art. 80 RGCir — marcha atrás.',
    },

    // 10 ───────────────────────────────────────────────────────────────────
    {
      id: 'cambio-carril-abstenerse',
      tag: 'Cambio de carril',
      title: 'Carril libre… pero llega un coche rápido',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: -120, to: 120 });

        const lento = makeCar(0xc9b13a);
        lento.position.set(laneCenter(1), 0, 16.5); // congelado en z=0, delante de ti
        scene.add(lento);
        const rapido = makeCar(0x2f2f38);
        rapido.position.set(laneCenter(-1), 0, 112.8); // congelado en z=22, detrás-izquierda
        scene.add(rapido);
        return [
          { mesh: lento, vel: [0, -4] },
          { mesh: rapido, vel: [0, -22] },
        ];
      },
      question: 'El turismo que te precede circula muy despacio, la línea es discontinua y el carril izquierdo está libre delante, pero por el retrovisor ves un coche que se acerca rápido por ese carril. ¿Qué debes hacer?',
      options: [
        {
          text: 'Señalizar y cambiar de carril de inmediato: quien viene por detrás debe adaptarse a tu maniobra.',
          feedback: 'No puedes iniciar el cambio si obligas a frenar bruscamente a quien ya circula por ese carril: la preferencia es suya.',
        },
        {
          text: 'Abstenerte de cambiar de carril hasta que ese vehículo haya pasado y, entonces, señalizar y hacer la maniobra con seguridad.',
          correct: true,
        },
        {
          text: 'Acelerar y cambiarte al carril izquierdo antes de que llegue, para no perder tiempo.',
          feedback: 'Convertir el cambio de carril en una carrera con el vehículo que se aproxima es peligroso: si su velocidad no te deja hueco seguro, debes abstenerte.',
        },
      ],
      explanation: 'La línea discontinua permite el cambio de carril, pero solo cuando no suponga peligro ni entorpecimiento. Si un vehículo se aproxima rápido por el carril al que quieres pasar, debes abstenerte y esperar a que la maniobra sea segura.',
      rule: 'Art. 74 RGCir — cambios de carril.',
    },

    // 11 ───────────────────────────────────────────────────────────────────
    {
      id: 'tunel-linea-continua',
      tag: 'Cambio de carril',
      title: 'Dentro de un túnel con línea continua',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        // Dos carriles en el mismo sentido, túnel sobre la vía
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: 20, to: 120 });
        addSolidLineZ(scene, { x: 0, from: -80, to: 20 });
        addTunnel(scene, { from: 20, to: -80 });
        addSign(scene, 'tunel', { x: 4.4, z: 26 });

        const camion = makeTruck(0x5a7d9a);
        camion.position.set(laneCenter(1), 0, 18.6); // congelado en z=-2, dentro del túnel
        scene.add(camion);
        return [{ mesh: camion, vel: [0, -5] }];
      },
      question: 'Circulas por el interior de un túnel detrás de un camión lento. Entre los dos carriles del mismo sentido hay una línea continua. ¿Puedes pasar al carril izquierdo?',
      options: [
        {
          text: 'No: la línea continua prohíbe cambiar de carril; debes mantener la distancia de seguridad detrás del camión hasta que la marca lo permita.',
          correct: true,
        },
        {
          text: 'Sí, si señalizas la maniobra y no viene nadie por el carril izquierdo.',
          feedback: 'La señalización no autoriza a atravesar una línea continua: mientras exista, el cambio de carril está prohibido.',
        },
        {
          text: 'Sí, porque al ser dos carriles del mismo sentido la línea continua solo afecta al sentido contrario.',
          feedback: 'La línea continua entre carriles del mismo sentido también prohíbe atravesarla: es frecuente precisamente en túneles para impedir cambios de carril.',
        },
      ],
      explanation: 'La marca longitudinal continua no puede ser atravesada ni pisada. En los túneles suele separar los carriles para prohibir los cambios de carril y adelantamientos en un entorno de escasa visibilidad y sin escapatoria.',
      rule: 'Art. 167 RGCir — marca longitudinal continua.',
    },

    // 12 ───────────────────────────────────────────────────────────────────
    {
      id: 'averia-autovia-v16',
      tag: 'Avería',
      title: 'Avería en autovía: señalizar el vehículo',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        // Autovía con arcén a la derecha
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: -120, to: 120 });
        addRoadSeg(scene, { x: 5.0, z: 0, len: 240, width: 2.8, color: 0x46494e });
        addSolidLineZ(scene, { x: 3.5, from: -120, to: 120 });

        const c = makeCar(0x4a7fd4);
        c.position.set(laneCenter(-1), 0, 85.8); // te adelanta por la izquierda
        scene.add(c);
        return [{ mesh: c, vel: [0, -22] }];
      },
      question: 'Circulas por autovía y una avería te obliga a detener tu turismo en el arcén. ¿Cómo debes señalizar el vehículo inmovilizado?',
      options: [
        {
          text: 'Colocar dos triángulos de preseñalización a 50 metros por delante y por detrás del vehículo.',
          feedback: 'Desde el 1 de enero de 2026 los triángulos ya no son válidos en España; además, caminar por la calzada o el arcén de una autovía para colocarlos es extremadamente peligroso.',
        },
        {
          text: 'Salir del vehículo y hacer señales con los brazos desde la calzada para advertir a los demás conductores.',
          feedback: 'Nunca debes permanecer en la calzada: te expondrías a un atropello. La señalización se hace con las luces de emergencia y la baliza, y tú debes ponerte a salvo detrás de la barrera.',
        },
        {
          text: 'Encender las luces de emergencia y colocar en el techo la baliza luminosa V-16 conectada, sin necesidad de caminar por la calzada, poniéndote a salvo fuera de ella.',
          correct: true,
        },
      ],
      explanation: 'Desde el 1 de enero de 2026 la baliza V-16 conectada (con geolocalización DGT 3.0) sustituye a los triángulos en España: se coloca en el punto más alto del vehículo sin bajar a la calzada, se activan las luces de emergencia y los ocupantes deben ponerse a salvo fuera de la calzada, tras la barrera si existe.',
      rule: 'RD 1030/2022 — señal V-16 conectada, obligatoria desde el 1 de enero de 2026.',
    },

    // 13 ───────────────────────────────────────────────────────────────────
    {
      id: 'reanudar-marcha-arcen',
      tag: 'Incorporación',
      title: 'Reanudar la marcha desde el arcén',
      playerStart: 20,
      playerSpeed: 3,
      triggerZ: 12,
      playerLane: 5.1, // circulas aún por el arcén
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -120, to: 120 });
        addDashesZ(scene, { x: 0, from: -120, to: 120 });
        addRoadSeg(scene, { x: 5.1, z: 0, len: 240, width: 2.8, color: 0x46494e });
        addSolidLineZ(scene, { x: 3.5, from: -120, to: 120 });

        const c1 = makeCar(0x3f9e6b);
        c1.position.set(laneCenter(1), 0, 55.3); // congelado en z=2, carril derecho
        scene.add(c1);
        const c2 = makeCar(0x777f8a);
        c2.position.set(laneCenter(-1), 0, 44.7); // congelado en z=-14, carril izquierdo
        scene.add(c2);
        return [
          { mesh: c1, vel: [0, -20] },
          { mesh: c2, vel: [0, -22] },
        ];
      },
      question: 'Tras una detención en el arcén, vas a reanudar la marcha e incorporarte a la calzada, por la que circulan varios vehículos. ¿Cómo debes hacerlo?',
      options: [
        {
          text: 'Incorporarte enseguida: quien reanuda la marcha tiene preferencia sobre los que ya circulan.',
          feedback: 'Es justo al revés: la preferencia es de quienes circulan por la calzada; quien se incorpora desde el arcén debe cederles el paso.',
        },
        {
          text: 'Señalizar con el intermitente tu propósito con antelación y ceder el paso a los vehículos que circulan, incorporándote solo cuando puedas hacerlo sin obligarles a frenar.',
          correct: true,
        },
        {
          text: 'Basta con encender las luces de emergencia mientras entras en la calzada.',
          feedback: 'Las luces de emergencia indican peligro o inmovilización, no una incorporación. Debes usar el intermitente izquierdo y ceder el paso al tráfico de la calzada.',
        },
      ],
      explanation: 'Quien se incorpora a la circulación desde el arcén o desde una zona de detención debe advertirlo con el intermitente con suficiente antelación y ceder el paso a los vehículos que circulan por la calzada, sin obligarles a modificar su velocidad o trayectoria.',
      rule: 'Art. 72 RGCir — incorporación a la circulación.',
    },

    // 14 ───────────────────────────────────────────────────────────────────
    {
      id: 'parada-recoger-pasajero',
      tag: 'Parada',
      title: 'Recoger a un pasajero',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { x: 0, from: -80, to: 80 });
        addCityBlocks(scene, { avoid: 8 });

        // La persona que espera, en la acera derecha
        const p = makePeaton({ shirt: 0x3f9e6b });
        p.position.set(5, 0, 0);
        p.rotation.y = Math.PI; // mirando hacia ti
        scene.add(p);
        // Turismo que te sigue
        const c = makeCar(0x4a7fd4);
        c.position.set(laneCenter(1), 0, 24); // congelado detrás de ti
        scene.add(c);
        return [
          { mesh: p, vel: [0, 0] },
          { mesh: c, vel: [0, -8] },
        ];
      },
      question: 'La persona a la que vas a recoger te espera en la acera, pero no hay sitio libre junto al bordillo y un turismo te sigue. ¿Puedes detenerte un momento en tu carril con las luces de emergencia?',
      options: [
        {
          text: 'Sí: una detención de menos de dos minutos es una parada y las luces de emergencia la hacen reglamentaria.',
          feedback: 'Ser «parada» no la legaliza: la parada debe efectuarse sin obstaculizar la circulación, y las luces de emergencia no convierten en permitida una detención en pleno carril.',
        },
        {
          text: 'Sí, si el pasajero sube con rapidez y no haces esperar más de un minuto al vehículo de detrás.',
          feedback: 'La rapidez no es el criterio: detenerte en el carril bloquea a quien te sigue. Debes buscar un lugar donde la parada esté permitida y no entorpezca.',
        },
        {
          text: 'No: debes continuar hasta un lugar donde puedas parar sin obstaculizar la circulación, fuera del carril de paso.',
          correct: true,
        },
      ],
      explanation: 'La parada debe realizarse de forma que no obstaculice la circulación, situando el vehículo junto al borde derecho de la calzada o fuera de ella donde esté permitido. Detenerse en el carril de circulación bloqueando al tráfico que te sigue no está permitido, aunque sea breve y con las luces de emergencia.',
      rule: 'Arts. 90 y 91 RGCir — normas sobre la parada.',
    },

    // 15 ───────────────────────────────────────────────────────────────────
    {
      id: 'sentido-unico-giro-izquierda',
      tag: 'Cambios de dirección',
      title: 'Girar a la izquierda en sentido único',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        // Calle de sentido único con dos carriles hacia -z
        addRoadZ(scene, { from: -5, to: 80 });
        addDashesZ(scene, { x: 0, from: 5, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // Flechas de selección de carril antes de la intersección
        addLaneArrow(scene, { x: laneCenter(-1), z: 6, dir: 'left' });
        addLaneArrow(scene, { x: laneCenter(-1), z: 14, dir: 'left' });
        addLaneArrow(scene, { x: laneCenter(1), z: 6, dir: 'up' });
        addLaneArrow(scene, { x: laneCenter(1), z: 14, dir: 'up' });
        return [];
      },
      question: 'Circulas por el carril derecho de una calle de sentido único con dos carriles y al final vas a girar a la izquierda. ¿Qué debes hacer?',
      options: [
        {
          text: 'Situarte con suficiente antelación en el carril izquierdo, previa señalización y comprobación de los espejos, y girar desde él.',
          correct: true,
        },
        {
          text: 'Permanecer en el carril derecho y cruzar la calzada en el momento del giro.',
          feedback: 'Girar a la izquierda desde el carril derecho cruza la trayectoria de quien circula por el carril izquierdo: la colocación debe hacerse antes, no durante el giro.',
        },
        {
          text: 'Colocarte junto al eje imaginario central, a caballo entre los dos carriles, para decidir en el último momento.',
          feedback: 'Circular entre dos carriles está prohibido: en sentido único el giro a la izquierda se prepara ocupando por completo el carril izquierdo con antelación.',
        },
      ],
      explanation: 'En una vía de sentido único, el giro a la izquierda se prepara ciñéndose con suficiente antelación al borde izquierdo de la calzada: aquí, ocupando el carril izquierdo tras señalizar y comprobar que el cambio de carril es seguro.',
      rule: 'Art. 75 RGCir — cambios de dirección: colocación previa.',
    },

  ],
};
