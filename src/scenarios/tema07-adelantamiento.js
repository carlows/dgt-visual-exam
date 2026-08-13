import * as THREE from 'three';
import {
  addRoadZ, addRoadX, addSolidLineZ, addDashesZ, addCrosswalk, addLaneArrow,
  addCityBlocks, addSign, makeCar, makeTruck, makeBike, makePeaton, laneCenter,
} from '../world.js';

// Luz intermitente (indicador o emergencia) para animar desde tick()
function makeBlinker(x, y, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.14, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xffa020 })
  );
  m.position.set(x, y, z);
  return m;
}

export const TEMA = {
  id: 'adelantamiento',
  title: 'Adelantamiento',
  scenarios: [
    {
      id: 'linea-continua-adelantamiento',
      tag: 'Adelantamiento',
      title: 'Vehículo lento y línea continua',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const npc = makeCar(0x8a9a3d);
        npc.position.set(laneCenter(1), 0, 25); // delante de ti, en tu carril
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }]; // circula lento en tu mismo sentido
      },
      question: 'Alcanzas a un turismo que circula muy lento y la marca longitudinal central es continua. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'No: la línea continua no debe atravesarse ni circular sobre ella.',
          correct: true,
        },
        {
          text: 'Sí, siempre que no venga ningún vehículo en sentido contrario.',
          feedback: 'Que no venga nadie no habilita la maniobra: la marca continua prohíbe atravesarla.',
        },
        {
          text: 'Sí, porque circula anormalmente lento y entorpece el tráfico.',
          feedback: 'La lentitud del otro vehículo no anula la prohibición de la marca. (Existe una excepción, si es seguro, para adelantar a ciclistas y ciclomotores.)',
        },
      ],
      explanation: 'Una línea longitudinal continua prohíbe atravesarla y circular sobre ella. Para adelantar debes esperar a un tramo con línea discontinua. Solo hay excepción, garantizando la seguridad, para adelantar a bicicletas, ciclos y ciclomotores.',
      rule: 'Arts. 88 y 167 RGCir — marcas longitudinales continuas y adelantamiento.',
    },

    {
      id: 'discontinua-turismo-lento',
      tag: 'Adelantamiento',
      title: 'Línea discontinua y vía libre',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const npc = makeCar(0x8a9a3d);
        npc.position.set(laneCenter(1), 0, 23); // z = 10 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'Alcanzas a un turismo lento, la línea central es discontinua y el carril contrario está libre en un largo tramo. ¿Cómo debes adelantarlo?',
      options: [
        {
          text: 'Por la derecha, para no invadir en ningún momento el sentido contrario.',
          feedback: 'Como norma general el adelantamiento se efectúa por la izquierda del vehículo adelantado.',
        },
        {
          text: 'Por la izquierda, señalizando la maniobra con suficiente antelación.',
          correct: true,
        },
        {
          text: 'No puedes adelantar: en vías de doble sentido está siempre prohibido.',
          feedback: 'En doble sentido puede adelantarse si la marca lo permite y hay espacio libre suficiente en el sentido contrario.',
        },
      ],
      explanation: 'Con línea discontinua y espacio libre suficiente en el sentido contrario, el adelantamiento se realiza por la izquierda, advirtiéndolo con antelación y sin entorpecer a nadie.',
      rule: 'Arts. 82 y 84 RGCir — sentido del adelantamiento y obligaciones previas.',
    },

    {
      id: 'ciclista-linea-continua',
      tag: 'Adelantamiento',
      title: 'Ciclista con línea continua',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const bici = makeBike({ shirt: 0x2f9e44 });
        bici.position.set(laneCenter(1) + 0.6, 0, 17.1); // z ≈ 9 en la congelación
        scene.add(bici);
        return [{ mesh: bici, vel: [0, -2.5] }];
      },
      question: 'Circulas tras un ciclista y la línea central es continua. No viene nadie de frente. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'No: la línea continua prohíbe el adelantamiento en todo caso.',
          feedback: 'Existe una excepción: se permite cruzar la continua para adelantar a bicicletas, ciclos y ciclomotores si es seguro.',
        },
        {
          text: 'Sí, pero solo si puedes hacerlo sin salirte en absoluto de tu carril.',
          feedback: 'Al contrario: la norma exige dejar una separación lateral mínima de 1,5 m, y para ello permite pisar o cruzar la continua si es seguro.',
        },
        {
          text: 'Sí: tras comprobar que es seguro, puedes cruzar la línea continua dejando al menos 1,5 m de separación lateral.',
          correct: true,
        },
      ],
      explanation: 'Para adelantar a ciclistas se permite, garantizada la seguridad, ocupar el sentido contrario aunque la línea sea continua. Es obligatorio dejar una separación lateral mínima de 1,5 metros.',
      rule: 'Arts. 85 y 88 RGCir — adelantamiento a ciclos: separación mínima de 1,5 m y supuesto especial.',
    },

    {
      id: 'senal-prohibido-adelantar',
      tag: 'Adelantamiento',
      title: 'Señal de adelantamiento prohibido',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'prohibidoAdelantar', { x: 4.4, z: 10 });

        const camion = makeTruck(0x6a8f5a);
        camion.position.set(laneCenter(1), 0, 15.4); // z ≈ 4 en la congelación
        scene.add(camion);
        return [{ mesh: camion, vel: [0, -3.5] }];
      },
      question: 'Un camión circula muy lento delante de ti y a la derecha ves la señal de adelantamiento prohibido. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'No: la señal prohíbe adelantar a partir del lugar en que está situada.',
          correct: true,
        },
        {
          text: 'Sí, porque la marca vial es discontinua y las marcas permiten la maniobra.',
          feedback: 'Las señales verticales prevalecen sobre las marcas viales: rige la prohibición de la señal.',
        },
        {
          text: 'Sí, porque a los camiones lentos siempre se les puede adelantar.',
          feedback: 'La lentitud del vehículo no deja sin efecto una señal de prohibición.',
        },
      ],
      explanation: 'La señal R-305 prohíbe adelantar desde el punto donde está colocada. En caso de discrepancia, las señales verticales prevalecen sobre las marcas viales.',
      rule: 'Art. 133 RGCir (orden de prioridad de la señalización) y señal R-305.',
    },

    {
      id: 'fin-prohibicion-adelantar',
      tag: 'Adelantamiento',
      title: 'Fin de la prohibición de adelantar',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'finProhibidoAdelantar', { x: 4.4, z: 10 });

        const npc = makeCar(0xb0632f);
        npc.position.set(laneCenter(1), 0, 16); // z = 3 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'Sigues a un turismo lento y ves la señal de fin de la prohibición de adelantamiento; la línea central es discontinua. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'No: esta señal solo pone fin a la prohibición para los camiones.',
          feedback: 'La señal R-502 pone fin a la prohibición de adelantar para todos los vehículos a los que afectaba.',
        },
        {
          text: 'Sí: a partir de la señal puedes adelantar si compruebas que la maniobra es segura.',
          correct: true,
        },
        {
          text: 'Sí, incluso aunque venga un vehículo de frente: la señal te da prioridad.',
          feedback: 'La señal no otorga prioridad: sigue siendo obligatorio que exista espacio libre suficiente en el sentido contrario.',
        },
      ],
      explanation: 'La señal de fin de prohibición levanta la restricción, pero adelantar sigue exigiendo las condiciones generales: visibilidad, espacio libre suficiente y no poner en peligro ni entorpecer a nadie.',
      rule: 'Arts. 84 y 85 RGCir y señal R-502 — fin de la prohibición de adelantamiento.',
    },

    {
      id: 'adelantar-interseccion',
      tag: 'Adelantamiento',
      title: 'Vehículo lento antes de una intersección',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -60, to: 60 });
        addDashesZ(scene, { from: 6, to: 80 });
        addDashesZ(scene, { from: -80, to: -6 });
        addCityBlocks(scene);

        const npc = makeCar(0x555fa8);
        npc.position.set(laneCenter(1), 0, 21); // z = 8 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'Te aproximas a una intersección sin señales de prioridad y el turismo que te precede circula muy lento. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'No: está prohibido adelantar en las intersecciones y en sus proximidades.',
          correct: true,
        },
        {
          text: 'Sí, si calculas que terminarás la maniobra antes de llegar a la intersección.',
          feedback: 'La prohibición alcanza también a las proximidades de la intersección, no solo al cruce en sí.',
        },
        {
          text: 'Sí, porque no se acerca ningún vehículo por la vía transversal.',
          feedback: 'La prohibición no depende del tráfico que veas: solo decae en supuestos como circular por vía con prioridad o adelantar a vehículos de dos ruedas.',
        },
      ],
      explanation: 'Está prohibido adelantar en las intersecciones y sus proximidades, salvo excepciones como glorietas, circular por una calzada con prioridad señalizada o adelantar a vehículos de dos ruedas.',
      rule: 'Art. 87 RGCir — prohibiciones de adelantamiento: intersecciones y proximidades.',
    },

    {
      id: 'rasante-sin-visibilidad',
      tag: 'Adelantamiento',
      title: 'Cambio de rasante sin visibilidad',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const camion = makeTruck(0x9a5a3a);
        camion.position.set(laneCenter(1), 0, 19.4); // z ≈ 8 en la congelación
        scene.add(camion);
        return [{ mesh: camion, vel: [0, -3.5] }];
      },
      question: 'Sigues a un camión lento y te acercas a un cambio de rasante que impide ver el tramo siguiente; la línea central es continua. ¿Puedes adelantar?',
      options: [
        {
          text: 'Sí, acelerando al máximo para permanecer poco tiempo en el sentido contrario.',
          feedback: 'Ir más rápido no soluciona el problema: no puedes comprobar que el carril contrario esté libre.',
        },
        {
          text: 'Sí, avisando con el claxon a los vehículos que puedan venir de frente.',
          feedback: 'Las advertencias acústicas no sustituyen a la visibilidad exigida para adelantar.',
        },
        {
          text: 'No: está prohibido adelantar en cambios de rasante y curvas de visibilidad reducida.',
          correct: true,
        },
      ],
      explanation: 'Está prohibido adelantar en curvas y cambios de rasante de visibilidad reducida y, en general, donde no pueda comprobarse que el tramo a ocupar está libre, salvo que la maniobra no exija invadir el sentido contrario.',
      rule: 'Art. 87 RGCir — prohibición de adelantar sin visibilidad suficiente.',
    },

    {
      id: 'rebasar-vehiculo-averiado',
      tag: 'Adelantamiento',
      title: 'Vehículo averiado en tu carril',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const averiado = makeCar(0xc9c9c9);
        averiado.position.set(laneCenter(1), 0, 6); // inmóvil, 13 m por delante
        const izq = makeBlinker(-0.75, 0.55, 1.75);
        const der = makeBlinker(0.75, 0.55, 1.75);
        averiado.add(izq, der);
        scene.add(averiado);
        this._warn = [izq, der];
        return [];
      },
      tick(t) {
        const on = t % 0.8 < 0.4;
        for (const m of this._warn) m.visible = on;
      },
      question: 'Un turismo averiado, con las luces de emergencia encendidas, está inmovilizado bloqueando tu carril. La línea central es continua. ¿Qué debes hacer?',
      options: [
        {
          text: 'Esperar detrás hasta que lo retiren: la línea continua no puede cruzarse nunca.',
          feedback: 'Rebasar un vehículo inmovilizado es un supuesto especial: se permite cruzar la continua si la seguridad lo permite.',
        },
        {
          text: 'Rebasarlo, ocupando el sentido contrario y cruzando la línea continua si es imprescindible, tras comprobar que es seguro.',
          correct: true,
        },
        {
          text: 'Rebasarlo rápidamente y sin señalizar, porque pasar junto a un vehículo parado no es una maniobra.',
          feedback: 'Es un rebasamiento: exige señalizarlo, comprobar el sentido contrario y hacerlo con seguridad.',
        },
      ],
      explanation: 'Rebasar un vehículo inmovilizado que ocupa parcial o totalmente tu carril es un supuesto especial: puedes invadir el sentido contrario, incluso con línea continua, siempre que compruebes que la maniobra no crea peligro y la señalices.',
      rule: 'Art. 88 RGCir — supuestos especiales de adelantamiento o rebasamiento.',
    },

    {
      id: 'te-estan-adelantando',
      tag: 'Adelantamiento',
      title: 'Otro vehículo te adelanta',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const npc = makeCar(0xd45050);
        npc.position.set(laneCenter(-1), 0, 52); // sale detrás y te rebasa por la izquierda
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -12] }]; // z = 13 en la congelación
      },
      question: 'El turismo rojo te está adelantando por el carril izquierdo. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Ceñirte al borde derecho y no aumentar la velocidad; reducirla incluso, si es preciso, para facilitar su regreso al carril.',
          correct: true,
        },
        {
          text: 'Acelerar para que ambos terminéis antes la maniobra.',
          feedback: 'Está expresamente prohibido: el adelantado no debe aumentar la velocidad mientras lo adelantan.',
        },
        {
          text: 'Desplazarte hacia el centro de la calzada para vigilarlo mejor.',
          feedback: 'Justo lo contrario: debes ceñirte al borde derecho para dejarle espacio.',
        },
      ],
      explanation: 'El conductor que va a ser adelantado debe ceñirse al borde derecho de la calzada y no aumentar la velocidad; incluso debe disminuirla si es necesario para que el otro pueda reincorporarse con seguridad.',
      rule: 'Art. 86 RGCir — obligaciones del conductor que va a ser adelantado.',
    },

    {
      id: 'tercero-senaliza-izquierda',
      tag: 'Adelantamiento',
      title: 'El de delante ya señaliza a la izquierda',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const lento = makeCar(0x8a9a3d);
        lento.position.set(laneCenter(1), 0, 7.75); // z = -2 en la congelación
        scene.add(lento);

        const medio = makeCar(0x4a7fd4);
        medio.position.set(laneCenter(1), 0, 22.6); // z = 8 en la congelación
        const intermitente = makeBlinker(-0.85, 0.5, 1.75);
        medio.add(intermitente);
        scene.add(medio);
        this._intermitente = intermitente;

        return [{ mesh: lento, vel: [0, -3] }, { mesh: medio, vel: [0, -4.5] }];
      },
      tick(t) {
        this._intermitente.visible = t % 0.8 < 0.4;
      },
      question: 'Quieres adelantar, pero el turismo azul que te precede ya ha encendido su intermitente izquierdo para adelantar al vehículo que va delante de él. ¿Qué debes hacer?',
      options: [
        {
          text: 'Adelantar a los dos a la vez aprovechando el mismo hueco.',
          feedback: 'No puedes iniciar la maniobra: quien te precede ya ha indicado que va a ocupar ese espacio.',
        },
        {
          text: 'Tocar el claxon y adelantar tú primero, porque circulas más deprisa.',
          feedback: 'Ir más deprisa no te da preferencia: él señalizó antes su desplazamiento hacia la izquierda.',
        },
        {
          text: 'No iniciar tu adelantamiento y esperar a que complete el suyo.',
          correct: true,
        },
      ],
      explanation: 'Antes de adelantar debes cerciorarte de que el vehículo que te precede en el mismo carril no ha indicado su propósito de desplazarse hacia el mismo lado. Si ya lo señalizó, no puedes iniciar tu maniobra.',
      rule: 'Art. 84 RGCir — obligaciones antes de iniciar el adelantamiento.',
    },

    {
      id: 'adelantar-paso-peatones',
      tag: 'Adelantamiento',
      title: 'Vehículo lento y paso de peatones',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 6, to: 80 });
        addDashesZ(scene, { from: -80, to: -6 });
        addCrosswalk(scene, { z: 0 });
        addSign(scene, 'pasoPeatonesAzul', { x: 4.4, z: 3 });
        addCityBlocks(scene);

        const peaton = makePeaton({ shirt: 0xd4a24a });
        peaton.position.set(5.2, 0, 0);
        peaton.rotation.y = Math.PI / 2; // mirando hacia la calzada
        scene.add(peaton);

        const npc = makeCar(0x777fa0);
        npc.position.set(laneCenter(1), 0, 20.4); // z ≈ 9 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -3.5] }];
      },
      question: 'Sigues a un turismo lento y más adelante hay un paso de peatones señalizado. ¿Puedes adelantarlo en el paso?',
      options: [
        {
          text: 'Sí, si en ese momento no hay ningún peatón sobre el paso.',
          feedback: 'Que el paso parezca libre no lo permite: la prohibición protege frente a peatones que puedan aparecer ocultos por el vehículo.',
        },
        {
          text: 'No: está prohibido adelantar en los pasos para peatones; solo cabría rebasarlo a una velocidad tan reducida que te permita detenerte a tiempo.',
          correct: true,
        },
        {
          text: 'Sí, porque el vehículo lento está obligado a facilitarte la maniobra donde sea.',
          feedback: 'La obligación del adelantado no anula las prohibiciones: en los pasos para peatones no se puede adelantar.',
        },
      ],
      explanation: 'Está prohibido adelantar en los pasos para peatones señalizados, salvo que se haga a una velocidad tan reducida que permita detenerse a tiempo si surgiera peligro de atropello.',
      rule: 'Art. 87 RGCir — prohibición de adelantar en pasos para peatones.',
    },

    {
      id: 'autobus-en-parada',
      tag: 'Adelantamiento',
      title: 'Autobús detenido en la parada',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const bus = makeTruck(0x3a6fd8); // autobús detenido junto al bordillo
        bus.position.set(2.6, 0, 5); // ocupa parte de tu carril, 14 m por delante
        scene.add(bus);

        const peaton = makePeaton({ shirt: 0xc0554a });
        peaton.position.set(4.6, 0, 3.2); // junto a la parte delantera del autobús
        peaton.rotation.y = Math.PI / 2;
        scene.add(peaton);
        return [];
      },
      question: 'Un autobús está detenido en su parada ocupando parte de tu carril. ¿Cómo debes rebasarlo?',
      options: [
        {
          text: 'Con precaución y a velocidad moderada, previendo que algún peatón pueda cruzar saliendo por delante del autobús.',
          correct: true,
        },
        {
          text: 'Lo más rápido posible, para ocupar el menor tiempo el sentido contrario.',
          feedback: 'La velocidad debe moderarse: un peatón oculto por el autobús puede aparecer de repente.',
        },
        {
          text: 'No puedes rebasarlo: debes detenerte y esperar a que reanude la marcha.',
          feedback: 'Puedes rebasarlo si es seguro; lo exigible es hacerlo con precaución y velocidad moderada.',
        },
      ],
      explanation: 'En las paradas de transporte público debe moderarse la velocidad y extremarse la precaución: los peatones que bajan del autobús pueden cruzar por delante de él, ocultos a tu vista hasta el último momento.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante paradas de transporte público.',
    },

    {
      id: 'orden-maniobra-adelantar',
      tag: 'Adelantamiento',
      title: 'Orden correcto de la maniobra',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const npc = makeCar(0x8a6fa8);
        npc.position.set(laneCenter(1), 0, 22); // z = 9 en la congelación
        scene.add(npc);
        return [{ mesh: npc, vel: [0, -4] }];
      },
      question: 'Vas a adelantar al turismo que te precede. ¿Cuál es el orden correcto de la maniobra?',
      options: [
        {
          text: 'Señalizar primero: desde ese momento los demás deben facilitarte hueco, y después mirar los espejos.',
          feedback: 'El intermitente no crea derechos: primero hay que observar; señalizar no obliga a nadie a abrirte hueco.',
        },
        {
          text: 'Acercarte al máximo al vehículo, señalizar y salir acelerando bruscamente.',
          feedback: 'Pegarse al vehículo reduce tu visibilidad y tu margen de reacción: no es la forma segura de iniciar la maniobra.',
        },
        {
          text: 'Observar espejos y ángulo muerto, señalizar con antelación y ejecutar el adelantamiento sin entorpecer a nadie.',
          correct: true,
        },
      ],
      explanation: 'Antes de adelantar debes cerciorarte de que puedes hacerlo sin peligro: observar los espejos y el ángulo muerto, comprobar el espacio libre, advertir la maniobra con antelación y solo entonces ejecutarla.',
      rule: 'Arts. 84 y 85 RGCir — obligaciones previas y ejecución del adelantamiento.',
    },

    {
      id: 'regreso-al-carril',
      tag: 'Adelantamiento',
      title: 'Volver al carril tras adelantar',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'left',
      playerLane: -1.75, // estás terminando el adelantamiento por el carril izquierdo
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addLaneArrow(scene, { x: laneCenter(-1), z: 6, dir: 'return' });
        addCityBlocks(scene);

        const adelantado = makeCar(0x8a9a3d);
        adelantado.position.set(laneCenter(1), 0, 26); // z = 13 en la congelación, a tu derecha
        scene.add(adelantado);
        return [{ mesh: adelantado, vel: [0, -4] }];
      },
      question: 'Estás completando el adelantamiento al turismo verde. ¿Cómo debes reincorporarte a tu carril?',
      options: [
        {
          text: 'Frenando en cuanto lo rebases y colocándote justo delante de él.',
          feedback: 'Eso es cortarle la trayectoria: le obligarías a frenar bruscamente.',
        },
        {
          text: 'Señalizando el regreso y volviendo al carril derecho lo antes posible, de forma gradual y sin cortar la trayectoria del adelantado.',
          correct: true,
        },
        {
          text: 'Permaneciendo en el carril izquierdo por si más adelante tienes que volver a adelantar.',
          feedback: 'No puedes quedarte en el sentido contrario: debes volver a tu mano tan pronto como sea posible.',
        },
      ],
      explanation: 'Terminado el adelantamiento hay que volver al carril derecho tan pronto como sea posible y de modo gradual, señalizándolo y sin obligar al vehículo adelantado a modificar su trayectoria o velocidad.',
      rule: 'Art. 85 RGCir — ejecución del adelantamiento y regreso al carril.',
    },

    {
      id: 'avance-por-la-derecha',
      tag: 'Adelantamiento',
      title: 'Avance por la derecha en poblado',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 19,
      panel: 'right',
      playerLane: 5.25, // carril derecho de los dos de tu sentido
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80, width: 14 });
        addSolidLineZ(scene, { x: 0, from: -80, to: 80 });
        addDashesZ(scene, { x: 3.5, from: -80, to: 80 });
        addDashesZ(scene, { x: -3.5, from: -80, to: 80 });
        addCityBlocks(scene, { avoid: 18 });

        const cola = [];
        const colores = [0xd45050, 0x4a7fd4, 0xc9b23a];
        [22.25, 30.25, 38.25].forEach((z, i) => { // z = 6, 14, 22 en la congelación
          const c = makeCar(colores[i]);
          c.position.set(1.75, 0, z);
          scene.add(c);
          cola.push({ mesh: c, vel: [0, -5] });
        });
        return cola;
      },
      question: 'En poblado, circulas por el carril derecho de los dos de tu sentido. El carril izquierdo va saturado y el tuyo avanza más deprisa. ¿Puedes rebasar por la derecha a esos vehículos?',
      options: [
        {
          text: 'No: avanzar por la derecha está prohibido en cualquier circunstancia.',
          feedback: 'Con circulación densa en calzadas de varios carriles del mismo sentido, ese avance no se considera adelantamiento.',
        },
        {
          text: 'Sí, y también puedes ir cambiando de carril en zigzag para ganar posiciones.',
          feedback: 'El zigzag entre carriles para sortear vehículos sí es una maniobra antirreglamentaria y peligrosa.',
        },
        {
          text: 'Sí: cuando la circulación es tan densa que cada carril avanza según su cola, que un carril vaya más deprisa que otro no se considera adelantamiento.',
          correct: true,
        },
      ],
      explanation: 'En calzadas con varios carriles para el mismo sentido y circulación densa, cada vehículo depende del que le precede en su carril: el hecho de que los de un carril avancen más deprisa que los de otro no se considera adelantamiento, siempre que se mantenga el carril.',
      rule: 'Arts. 82 y 83 RGCir — sentido y normas generales del adelantamiento.',
    },
  ],
};
