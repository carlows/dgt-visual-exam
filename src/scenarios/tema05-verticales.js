import {
  addRoadZ, addRoadX, addDashesZ, addDashesX, addSolidLineZ, addCrosswalk,
  addCityBlocks, addSign, addTunnel, addLaneArrow,
  makeCar, makeTruck, makePeaton, laneCenter,
} from '../world.js';

export const TEMA = {
  id: 'verticales',
  title: 'Señales verticales',
  scenarios: [
    {
      id: 'velocidad-40-poblado',
      tag: 'Prohibición',
      title: 'Límite de 40 en poblado',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'velocidad', { x: 4.4, z: 6.5, value: 40 });
        return [];
      },
      question: 'Circulas por una vía urbana y ves esta señal con el número 40. ¿Qué te obliga a hacer?',
      options: [
        {
          text: 'Nada: es una velocidad aconsejada que puedes superar si no hay peligro.',
          feedback: 'La velocidad aconsejada se indica con un panel cuadrado azul. Esta señal es la R-301, de prohibición: el límite es obligatorio.',
        },
        {
          text: 'No superar los 40 km/h a partir del lugar donde está colocada la señal.',
          correct: true,
        },
        {
          text: 'Circular exactamente a 40 km/h, sin ir más despacio.',
          feedback: 'La R-301 fija una velocidad MÁXIMA, no una velocidad obligatoria: puedes circular más despacio si las circunstancias lo aconsejan.',
        },
      ],
      explanation: 'La señal R-301 (velocidad máxima) prohíbe circular a velocidad superior a la indicada desde el lugar en que está situada. Es una señal de prohibición, no una recomendación.',
      rule: 'Art. 154 RGCir — señal R-301, velocidad máxima.',
    },

    {
      id: 'fin-limitaciones',
      tag: 'Fin de prohibición',
      title: 'Fin de prohibiciones en carretera',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -100, to: 100 });
        addDashesZ(scene, { from: -100, to: 100 });
        addSign(scene, 'velocidad', { x: 4.4, z: 38, value: 60 });
        addSign(scene, 'finLimitaciones', { x: 4.4, z: 6.5 });
        return [];
      },
      question: 'En esta carretera convencional pasaste hace unos metros una señal de velocidad máxima 60 y ahora ves esta señal blanca con franjas. Conduces un turismo, ¿qué indica?',
      options: [
        {
          text: 'Terminan las prohibiciones anteriores: vuelve a regir el límite genérico de la vía, 90 km/h para tu turismo.',
          correct: true,
        },
        {
          text: 'Que puedes circular a la velocidad que quieras, porque ya no hay límite.',
          feedback: 'Nunca desaparece el límite: al acabar la limitación específica vuelve a regir el límite genérico de la vía (90 km/h en carretera convencional para turismos).',
        },
        {
          text: 'Que la limitación de 60 km/h sigue vigente hasta la próxima intersección.',
          feedback: 'Es justo lo contrario: la señal R-500 pone fin en ese punto a las prohibiciones señalizadas anteriormente, incluida la de velocidad.',
        },
      ],
      explanation: 'La señal R-500 (fin de prohibiciones) señala el lugar donde dejan de regir las prohibiciones indicadas por señales anteriores. Desde ella rige de nuevo el límite genérico de la vía: 90 km/h para turismos en carretera convencional.',
      rule: 'Art. 154 RGCir — señal R-500, fin de prohibiciones; art. 48 RGCir — velocidades máximas genéricas.',
    },

    {
      id: 'prohibido-adelantar',
      tag: 'Prohibición',
      title: 'Turismo lento con adelantamiento prohibido',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -100, to: 100 });
        addSolidLineZ(scene, { x: 0, from: -80, to: 35 });
        addDashesZ(scene, { from: 35, to: 100 });
        addSign(scene, 'prohibidoAdelantar', { x: 4.4, z: 7 });

        const lento = makeCar(0x7a7f4a);
        lento.position.set(laneCenter(1), 0, 19.5); // a los 4,1 s quedará ~10 m por delante
        scene.add(lento);
        return [{ mesh: lento, vel: [0, -4] }];
      },
      question: 'El turismo que te precede circula muy despacio y no viene nadie de frente, pero acabas de ver esta señal. ¿Puedes adelantarlo?',
      options: [
        {
          text: 'Sí, porque no viene ningún vehículo en sentido contrario.',
          feedback: 'Que la maniobra parezca segura no la hace legal: la señal R-305 prohíbe adelantar, haya o no tráfico de frente.',
        },
        {
          text: 'Sí, porque circula por debajo de la velocidad normal de la vía.',
          feedback: 'La lentitud del vehículo precedente no te autoriza a incumplir la prohibición de adelantamiento.',
        },
        {
          text: 'No: la señal prohíbe el adelantamiento y debes mantenerte detrás.',
          correct: true,
        },
      ],
      explanation: 'La señal R-305 (adelantamiento prohibido) prohíbe adelantar a los vehículos de motor que circulan por la calzada. Debes adaptar tu velocidad y esperar al fin de la prohibición, aunque el vehículo de delante circule despacio.',
      rule: 'Art. 154 RGCir — señal R-305, adelantamiento prohibido.',
    },

    {
      id: 'fin-prohibido-adelantar',
      tag: 'Fin de prohibición',
      title: 'Fin de la prohibición de adelantar',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -100, to: 100 });
        addSolidLineZ(scene, { x: 0, from: 30, to: 100 });
        addDashesZ(scene, { from: -100, to: 30 });
        addSign(scene, 'finProhibidoAdelantar', { x: 4.4, z: 7 });

        const camion = makeTruck();
        camion.position.set(laneCenter(1), 0, 15.5); // a los 4 s quedará ~11 m por delante
        scene.add(camion);
        return [{ mesh: camion, vel: [0, -3.5] }];
      },
      question: 'Sigues a un camión lento. Ves esta señal y la marca longitudinal pasa a ser discontinua. ¿Puedes adelantar?',
      options: [
        {
          text: 'No, la prohibición de adelantar se mantiene hasta la próxima intersección.',
          feedback: 'La señal R-502 marca precisamente el punto donde TERMINA la prohibición de adelantamiento.',
        },
        {
          text: 'Sí, si te aseguras de que la maniobra puede hacerse sin peligro: la prohibición ha terminado y la línea discontinua permite rebasarla.',
          correct: true,
        },
        {
          text: 'Solo cuando la línea vuelva a ser continua.',
          feedback: 'Es al revés: la línea continua prohíbe rebasarla. La discontinua es la que permite invadir el otro carril para adelantar.',
        },
      ],
      explanation: 'La señal R-502 indica el fin de la prohibición de adelantamiento y la marca discontinua permite rebasarla. Aun así, el adelantamiento solo es lícito si se puede realizar con seguridad: visibilidad, espacio y ausencia de tráfico que lo impida.',
      rule: 'Art. 154 RGCir — señal R-502; arts. 84 y ss. RGCir — normas del adelantamiento.',
    },

    {
      id: 'entrada-prohibida-giro',
      tag: 'Prohibición',
      title: 'Entrada prohibida en la calle del giro',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // A la entrada de la calle de la derecha, encarada a quien pretenda entrar
        addSign(scene, 'prohibidoEntrada', { x: 8, z: -5.5, rotY: -1.0 });
        return [];
      },
      question: 'Pensabas girar a la derecha en la próxima calle, pero en su entrada ves esta señal circular roja con franja blanca. ¿Qué debes hacer?',
      options: [
        {
          text: 'Desistir del giro: la entrada a esa calle está prohibida a todos los vehículos; seguramente es de sentido único en dirección contraria.',
          correct: true,
        },
        {
          text: 'Entrar con precaución, porque la prohibición solo afecta a camiones y autobuses.',
          feedback: 'La señal R-101 (entrada prohibida) afecta a toda clase de vehículos, no solo a los pesados.',
        },
        {
          text: 'Entrar despacio si solo vas a recorrer unos metros para estacionar.',
          feedback: 'No existe esa excepción: la entrada está prohibida por ese acceso, sea cual sea el recorrido que pretendas hacer.',
        },
      ],
      explanation: 'La señal R-101 (entrada prohibida) prohíbe el acceso a toda clase de vehículos por ese punto. Es la señal típica de las calles de sentido único vistas desde el sentido contrario: debes buscar otro itinerario.',
      rule: 'Art. 152 RGCir — señal R-101, entrada prohibida.',
    },

    {
      id: 'circulacion-prohibida',
      tag: 'Prohibición',
      title: 'Circulación prohibida en ambos sentidos',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'circulacionProhibida', { x: 4.4, z: 6.5 });
        return [];
      },
      question: 'Ves este disco blanco con orla roja, sin ningún símbolo en su interior. ¿Qué indica?',
      options: [
        {
          text: 'Prohíbe solo entrar en ese sentido; en sentido contrario sí se puede circular.',
          feedback: 'Esa es la R-101 (entrada prohibida), el disco rojo con franja blanca. La R-100 prohíbe circular en AMBOS sentidos.',
        },
        {
          text: 'Prohíbe el paso únicamente a los vehículos de motor.',
          feedback: 'La R-100 afecta a toda clase de vehículos, también a los ciclos y demás vehículos sin motor.',
        },
        {
          text: 'Prohibición de circular a toda clase de vehículos, en ambos sentidos, por esa vía.',
          correct: true,
        },
      ],
      explanation: 'La señal R-100 (circulación prohibida) prohíbe la circulación de toda clase de vehículos en ambos sentidos por la vía en la que está situada. No debe confundirse con la R-101, que solo prohíbe la entrada por uno de los accesos.',
      rule: 'Art. 152 RGCir — señal R-100, circulación prohibida.',
    },

    {
      id: 'sentido-obligatorio-derecha',
      tag: 'Obligación',
      title: 'Sentido obligatorio a la derecha',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -5, to: 80 }); // tu calle acaba en la transversal
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);
        addLaneArrow(scene, { z: 9, dir: 'right' });
        addSign(scene, 'sentidoObligatorio', { x: 4.4, z: 6.5, dir: 'right' });
        return [];
      },
      question: 'Llegas a esta intersección y ves la señal azul con la flecha hacia la derecha. ¿Qué debes hacer?',
      options: [
        {
          text: 'Girar a la derecha: es el único sentido que puedes tomar.',
          correct: true,
        },
        {
          text: 'Nada en especial: la flecha solo aconseja el itinerario más cómodo.',
          feedback: 'Las señales azules circulares son de OBLIGACIÓN, no de recomendación: estás obligado a seguir la dirección de la flecha.',
        },
        {
          text: 'Puedes girar a la derecha o a la izquierda, pero no seguir de frente.',
          feedback: 'La R-400 con una única flecha obliga a seguir exactamente esa dirección; girar a la izquierda también está excluido.',
        },
      ],
      explanation: 'La señal R-400 (sentido obligatorio) obliga a todos los conductores a seguir la dirección indicada por la flecha, en este caso girar a la derecha.',
      rule: 'Art. 155 RGCir — señal R-400, sentido obligatorio.',
    },

    {
      id: 'peligro-ninos-colegio',
      tag: 'Peligro',
      title: 'Peligro: niños junto a un colegio',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'peligro', { x: 4.4, z: 6.5, glyph: 'ninos' });

        const nino1 = makePeaton({ shirt: 0xd4a017 });
        nino1.scale.set(0.65, 0.65, 0.65);
        nino1.position.set(5.7, 0, 2);
        scene.add(nino1);
        const nino2 = makePeaton({ shirt: 0x3f9e6b });
        nino2.scale.set(0.7, 0.7, 0.7);
        nino2.position.set(6.4, 0, 4);
        scene.add(nino2);
        return [];
      },
      question: 'Pasas junto a un colegio, ves esta señal triangular y hay niños en la acera. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Advertir tu presencia con el claxon y mantener la velocidad.',
          feedback: 'El claxon no elimina el peligro. Lo exigible es moderar la velocidad y estar en condiciones de detenerte si un niño irrumpe en la calzada.',
        },
        {
          text: 'Reducir la velocidad y extremar la precaución ante la posible irrupción de niños en la calzada.',
          correct: true,
        },
        {
          text: 'Detenerte obligatoriamente, aunque nadie vaya a cruzar.',
          feedback: 'La señal de peligro no obliga a detenerse siempre, sino a circular prevenido y detenerte solo si es necesario.',
        },
      ],
      explanation: 'La señal P-21 (niños) advierte de la proximidad de un lugar frecuentado por niños, como un colegio o zona de juegos. Obliga a moderar la velocidad y a extremar la atención, porque los niños pueden irrumpir en la calzada de forma imprevisible.',
      rule: 'Art. 149 RGCir — señal P-21; art. 46 RGCir — moderación de la velocidad.',
    },

    {
      id: 'paso-peatones-s13',
      tag: 'Indicación',
      title: 'Señal de situación de paso para peatones',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 4, to: 80 });
        addDashesZ(scene, { from: -80, to: -4 });
        addCrosswalk(scene, { z: 0 });
        addCityBlocks(scene);
        addSign(scene, 'pasoPeatonesAzul', { x: 4.4, z: 6.5 });

        const peaton = makePeaton({ shirt: 0xc14f4f });
        peaton.position.set(9.7, 0, 0); // a los 4,1 s llegará al borde de la calzada
        peaton.rotation.y = Math.PI / 2; // camina hacia -x
        scene.add(peaton);
        return [{ mesh: peaton, vel: [-1, 0] }];
      },
      question: 'La señal azul indica un paso para peatones y una persona se acerca por la derecha para cruzar. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar: en los pasos señalizados solo con esta señal los peatones deben esperar a los vehículos.',
          feedback: 'En un paso para peatones la prioridad es del peatón: debes cederle el paso.',
        },
        {
          text: 'Tocar el claxon para que espere en la acera hasta que pases.',
          feedback: 'No puedes exigir al peatón que renuncie a su prioridad; lo correcto es moderar la marcha y dejarle cruzar.',
        },
        {
          text: 'Moderar la velocidad y detenerte si es preciso para ceder el paso al peatón que va a cruzar.',
          correct: true,
        },
      ],
      explanation: 'La señal S-13 indica la situación de un paso para peatones. En los pasos debidamente señalizados los conductores deben ceder el paso a los peatones, moderando la velocidad y deteniéndose si es necesario.',
      rule: 'Art. 159 RGCir — señal S-13; art. 65 RGCir — prioridad de los peatones en los pasos señalizados.',
    },

    {
      id: 'peligro-peatones-p20',
      tag: 'Peligro',
      title: 'Advertencia de proximidad de paso de peatones',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -16, to: 80 });
        addDashesZ(scene, { from: -80, to: -24 });
        addCrosswalk(scene, { z: -20 }); // el paso queda más adelante
        addCityBlocks(scene);
        addSign(scene, 'peligro', { x: 4.4, z: 7, glyph: 'peatones' });
        return [];
      },
      question: 'Ves esta señal triangular con un peatón y, más adelante, un paso de peatones. ¿Qué significa la señal?',
      options: [
        {
          text: 'Es una señal de PELIGRO que advierte de la proximidad de un paso de peatones: debes moderar la velocidad al acercarte.',
          correct: true,
        },
        {
          text: 'Es la señal de indicación que marca la situación exacta del paso de peatones.',
          feedback: 'Esa es la S-13, cuadrada y azul, colocada en el propio paso. La triangular P-20 es de peligro y se sitúa ANTES, para advertir de su proximidad.',
        },
        {
          text: 'Prohíbe a los peatones cruzar la calzada por ese tramo.',
          feedback: 'Las señales triangulares con orla roja no prohíben: advierten de un peligro. Esta anuncia la cercanía de un lugar de cruce de peatones.',
        },
      ],
      explanation: 'La señal P-20 advierte del peligro por la proximidad de un lugar frecuentado por peatones o de un paso de peatones. A diferencia de la S-13 (indicación, en el propio paso), la P-20 se coloca antes para que llegues al paso a velocidad moderada.',
      rule: 'Art. 149 RGCir — señal P-20, peatones.',
    },

    {
      id: 'tunel-luces',
      tag: 'Indicación',
      title: 'Entrada a un túnel de día',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -100, to: 100 });
        addDashesZ(scene, { from: -100, to: 100 });
        addTunnel(scene, { from: -10, to: -70 });
        addSign(scene, 'tunel', { x: 4.4, z: 7 });
        return [];
      },
      question: 'Es de día, hace sol, y esta señal anuncia el túnel que ves más adelante. ¿Qué alumbrado debes llevar dentro?',
      options: [
        {
          text: 'Solo las luces de posición, porque es de día.',
          feedback: 'Las luces de posición no bastan: dentro del túnel es obligatorio el alumbrado de corto alcance (luz de cruce).',
        },
        {
          text: 'El alumbrado de corto alcance (luz de cruce), aunque sea de día.',
          correct: true,
        },
        {
          text: 'Ninguno, si el túnel dispone de iluminación artificial suficiente.',
          feedback: 'La obligación de llevar encendida la luz de cruce en los túneles no depende de que estén iluminados.',
        },
      ],
      explanation: 'La señal S-5 indica la entrada a un túnel. En los túneles y pasos inferiores es obligatorio circular con el alumbrado de corto alcance encendido, también de día, para ver y ser visto.',
      rule: 'Art. 100 RGCir — alumbrado de corto alcance en túneles; art. 159 RGCir — señal S-5.',
    },

    {
      id: 'estacionamiento-prohibido',
      tag: 'Prohibición',
      title: 'Estacionamiento prohibido: ¿puedo parar?',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'estacionamientoProhibido', { x: 4.4, z: 6.5 });
        return [];
      },
      question: 'Quieres detenerte un momento a recoger a un pasajero en el tramo donde está esta señal azul con una franja roja. ¿Puedes?',
      options: [
        {
          text: 'No: esta señal prohíbe tanto la parada como el estacionamiento.',
          feedback: 'Esa es la R-307, con DOS franjas rojas en aspa. La R-308, de una sola franja, prohíbe estacionar pero permite la parada.',
        },
        {
          text: 'Puedes incluso estacionar, siempre que permanezcas cerca del vehículo.',
          feedback: 'Estacionar está prohibido en todo caso; quedarte cerca del coche no convierte un estacionamiento en parada.',
        },
        {
          text: 'Sí: puedes parar menos de dos minutos sin abandonar el vehículo, pero no estacionar.',
          correct: true,
        },
      ],
      explanation: 'La señal R-308 prohíbe el estacionamiento en el lado de la vía en que está colocada, pero no la parada: una inmovilización que no supere los dos minutos y sin que el conductor abandone el vehículo.',
      rule: 'Art. 154 RGCir — señal R-308; Anexo I LSV — definiciones de parada y estacionamiento.',
    },

    {
      id: 'parada-prohibida',
      tag: 'Prohibición',
      title: 'Parada y estacionamiento prohibidos',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'paradaProhibida', { x: 4.4, z: 6.5 });
        return [];
      },
      question: 'Ves esta señal azul con dos franjas rojas en aspa. ¿Qué prohíbe en el lado de la vía donde está colocada?',
      options: [
        {
          text: 'Tanto la parada como el estacionamiento.',
          correct: true,
        },
        {
          text: 'Solo el estacionamiento: puedes parar hasta dos minutos si no bajas del vehículo.',
          feedback: 'Esa posibilidad existe con la R-308 (una sola franja). La R-307, en aspa, prohíbe también la parada.',
        },
        {
          text: 'Solo detenerse más de cinco minutos.',
          feedback: 'La R-307 prohíbe cualquier parada voluntaria, por breve que sea, además del estacionamiento.',
        },
      ],
      explanation: 'La señal R-307 (parada y estacionamiento prohibido) prohíbe las dos cosas en el lado de la vía en que está situada: ni siquiera está permitida la inmovilización breve que constituye la parada.',
      rule: 'Art. 154 RGCir — señal R-307, parada y estacionamiento prohibido.',
    },

    {
      id: 'calzada-con-prioridad',
      tag: 'Prioridad',
      title: 'Calzada con prioridad',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);
        addSign(scene, 'prioridad', { x: 4.4, z: 6.5 });

        const npc = makeCar(0x4a7fd4);
        npc.position.set(28.5, 0, -laneCenter(1)); // se aproxima despacio por la derecha
        npc.rotation.y = Math.PI / 2;
        scene.add(npc);
        return [{ mesh: npc, vel: [-4, 0] }];
      },
      question: 'Ves esta señal cuadrada amarilla y blanca antes de la intersección, y un turismo se aproxima por la vía transversal. ¿Quién tiene prioridad?',
      options: [
        {
          text: 'El turismo, porque se aproxima por tu derecha.',
          feedback: 'La norma de la derecha solo rige sin señalización. La R-3 establece que la prioridad es de tu calzada.',
        },
        {
          text: 'Tú: la señal indica que tu calzada tiene prioridad y quienes acceden desde las vías transversales deben cederte el paso.',
          correct: true,
        },
        {
          text: 'Ninguno: debéis pasar por orden de llegada a la intersección.',
          feedback: 'El «orden de llegada» no es un criterio de prioridad. Con la R-3, los vehículos de las vías transversales están obligados a ceder el paso.',
        },
      ],
      explanation: 'La señal R-3 (calzada con prioridad) indica que los vehículos que circulan por tu calzada tienen preferencia de paso en las intersecciones sobre los que acceden desde las vías transversales, hasta que una señal de fin de prioridad o de ceda/STOP indique lo contrario.',
      rule: 'Art. 151 RGCir — señal R-3, calzada con prioridad.',
    },

    {
      id: 'zona-residencial',
      tag: 'Indicación',
      title: 'Entrada en calle residencial',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'zonaResidencial', { x: 4.4, z: 6.5 });

        const peaton = makePeaton({ shirt: 0x4a7fd4 });
        peaton.position.set(-2.1, 0, 2); // camina despacio por la calzada hacia +x
        peaton.rotation.y = -Math.PI / 2;
        scene.add(peaton);
        const nino = makePeaton({ shirt: 0xd4a017 });
        nino.scale.set(0.65, 0.65, 0.65);
        nino.position.set(-1, 0, -3);
        scene.add(nino);
        return [{ mesh: peaton, vel: [0.5, 0] }];
      },
      question: 'Esta señal azul marca la entrada a una calle residencial y hay peatones caminando por la calzada. ¿Cómo debes circular?',
      options: [
        {
          text: 'A un máximo de 30 km/h, avisando a los peatones para que suban a la acera.',
          feedback: 'En calle residencial el límite es de 20 km/h y los peatones pueden usar toda la zona: no puedes exigirles que se aparten a la acera.',
        },
        {
          text: 'Con normalidad: dentro de poblado los peatones no pueden caminar por la calzada.',
          feedback: 'Precisamente la S-28 crea una zona compartida donde los peatones tienen prioridad y pueden usar toda la vía, incluso para jugar.',
        },
        {
          text: 'A 20 km/h como máximo, cediendo el paso a los peatones, que tienen prioridad y pueden usar toda la zona, incluidos los juegos.',
          correct: true,
        },
      ],
      explanation: 'La señal S-28 (calle residencial) delimita una zona donde rigen normas especiales: velocidad máxima de 20 km/h, prioridad de los peatones, que pueden utilizar toda la vía y están autorizados los juegos, y estacionamiento solo en los lugares señalizados.',
      rule: 'Art. 159 RGCir — señal S-28, calle residencial.',
    },
  ],
};
