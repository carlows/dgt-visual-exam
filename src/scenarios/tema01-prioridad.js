import {
  addRoadZ, addRoadX, addDashesZ, addDashesX, addStopLine, addYieldMarks,
  addCityBlocks, addSign, addSemaphore, addRoadSeg, addLaneArrow,
  makeCar, makeTruck, makeBike, makeAmbulance, makePeaton, laneCenter,
} from '../world.js';

export const TEMA = {
  id: 'prioridad',
  title: 'Prioridad de paso en intersecciones',
  scenarios: [
    {
      id: 'prioridad-derecha',
      tag: 'Prioridad de paso',
      title: 'Intersección sin señalizar',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        const npc = makeCar(0x4a7fd4);
        npc.position.set(45, 0, -laneCenter(1));
        npc.rotation.y = Math.PI / 2; // circula hacia -x, se aproxima por tu derecha
        scene.add(npc);
        return [{ mesh: npc, vel: [-8, 0] }];
      },
      question: 'Llegas a una intersección sin señalizar y un turismo se aproxima por tu derecha. ¿Qué debes hacer?',
      options: [
        {
          text: 'Ceder el paso al turismo, porque se aproxima por tu derecha.',
          correct: true,
        },
        {
          text: 'Continuar, porque el que circula de frente tiene prioridad.',
          feedback: 'Circular «de frente» no otorga prioridad. Sin señalización, decide la norma general: prioridad para quien viene por la derecha.',
        },
        {
          text: 'Acelerar para cruzar antes de que llegue.',
          feedback: 'Acelerar en una intersección sin visibilidad ni prioridad es una maniobra peligrosa y sancionable.',
        },
      ],
      explanation: 'En las intersecciones sin señalizar rige la norma general de prioridad: debes ceder el paso a los vehículos que se aproximen por tu derecha.',
      rule: 'Art. 21 LSV y art. 57 RGCir — norma general de prioridad en intersecciones.',
    },

    {
      id: 'stop-sin-trafico',
      tag: 'Prioridad de paso',
      title: 'STOP con la intersección despejada',
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
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addSign(scene, 'stop', { x: 4.4, z: 6.5 });
        return [];
      },
      question: 'Llegas a un STOP con línea de detención y no se ve ningún vehículo en la vía transversal. ¿Qué debes hacer?',
      options: [
        {
          text: 'Detenerte completamente ante la línea de detención, aunque no venga nadie.',
          correct: true,
        },
        {
          text: 'Reducir la velocidad y pasar sin detenerte si la vía está despejada.',
          feedback: 'Eso sería lo correcto ante un CEDA EL PASO. La señal de STOP obliga siempre a la detención completa.',
        },
        {
          text: 'Detenerte solo si se aproximan vehículos por la izquierda.',
          feedback: 'La detención en el STOP es incondicional: hay que parar aunque la intersección esté despejada.',
        },
      ],
      explanation: 'La señal R-2 (STOP) obliga a detener el vehículo por completo ante la línea de detención y ceder el paso. La detención es obligatoria aunque no circule nadie por la otra vía.',
      rule: 'Art. 151.2 RGCir — señal R-2, detención obligatoria.',
    },

    {
      id: 'ceda-con-trafico',
      tag: 'Prioridad de paso',
      title: 'Ceda el paso con tráfico por la izquierda',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addYieldMarks(scene, { z: 5.5 });
        addCityBlocks(scene);

        addSign(scene, 'ceda', { x: 4.4, z: 6.5 });

        const npc = makeCar(0x3f9e6b);
        npc.position.set(-38, 0, laneCenter(1));
        npc.rotation.y = -Math.PI / 2; // circula hacia +x por la vía preferente
        scene.add(npc);
        return [{ mesh: npc, vel: [8, 0] }];
      },
      question: 'Llegas a un CEDA EL PASO y un turismo se aproxima por tu izquierda por la vía preferente. ¿Qué debes hacer?',
      options: [
        {
          text: 'Cederle el paso: la preferencia es de quien circula por la otra vía, venga por donde venga.',
          correct: true,
        },
        {
          text: 'Continuar, porque solo debes ceder el paso a los vehículos que vienen por la derecha.',
          feedback: 'La norma de la derecha solo rige en intersecciones sin señalizar. Con un CEDA, la prioridad es de toda la vía transversal.',
        },
        {
          text: 'Detenerte obligatoriamente, como en un STOP.',
          feedback: 'El CEDA no obliga a detenerse siempre: solo si es necesario para ceder el paso. La detención incondicional es propia del STOP.',
        },
      ],
      explanation: 'La señal R-1 (ceda el paso) obliga a ceder el paso a todos los vehículos que circulen por la vía a la que te aproximas, y a detenerte solo si es preciso.',
      rule: 'Art. 151.1 RGCir — señal R-1, ceda el paso.',
    },

    {
      id: 'izquierda-sin-senalizar',
      tag: 'Prioridad de paso',
      title: 'Intersección sin señalizar: vehículo por la izquierda',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // Congelación en t = (45-16)/8 = 3.625 s → el coche queda en x ≈ -8
        const npc = makeCar(0xc06b3e);
        npc.position.set(-37, 0, laneCenter(1));
        npc.rotation.y = -Math.PI / 2; // circula hacia +x, se aproxima por tu izquierda
        scene.add(npc);
        return [{ mesh: npc, vel: [8, 0] }];
      },
      question: 'Llegas a una intersección sin señalizar y un turismo se aproxima por tu izquierda. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Detenerte y dejarle pasar, porque él llegará antes a la intersección.',
          feedback: 'Llegar antes no otorga prioridad en una intersección. Sin señalizar, rige la norma de la derecha, y tú llegas por su derecha.',
        },
        {
          text: 'Continuar con precaución, sin acelerar: la prioridad es tuya porque tú te aproximas por su derecha.',
          correct: true,
        },
        {
          text: 'Acelerar para atravesar la intersección antes de que llegue.',
          feedback: 'Aunque la prioridad sea tuya, debes atravesar la intersección con precaución y a velocidad moderada, nunca acelerando.',
        },
      ],
      explanation: 'En una intersección sin señalizar, quien se aproxima por la izquierda debe cederte el paso. Tener prioridad no te exime de aproximarte con precaución y comprobar que el otro conductor la respeta.',
      rule: 'Art. 21 LSV y art. 57 RGCir — norma general de prioridad en intersecciones.',
    },

    {
      id: 'giro-izquierda-frente',
      tag: 'Prioridad de paso',
      title: 'Giro a la izquierda con tráfico de frente',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addLaneArrow(scene, { x: laneCenter(1), z: 9, dir: 'left' });
        addCityBlocks(scene);

        // Congelación en t = 4.125 s → el coche de frente queda en z ≈ -8
        const npc = makeCar(0x9350b8);
        npc.position.set(-laneCenter(1), 0, -41);
        npc.rotation.y = Math.PI; // circula hacia +z, viene de frente
        scene.add(npc);
        return [{ mesh: npc, vel: [0, 8] }];
      },
      question: 'Te dispones a girar a la izquierda en la intersección y un turismo se aproxima de frente, en sentido contrario, siguiendo recto. ¿Qué debes hacer?',
      options: [
        {
          text: 'Cederle el paso y girar solo cuando haya pasado: al girar a la izquierda cortas su trayectoria.',
          correct: true,
        },
        {
          text: 'Girar primero, porque quien ya está dentro de la intersección tiene prioridad.',
          feedback: 'Estar dentro de la intersección no te da preferencia sobre el sentido contrario: quien gira a la izquierda corta la trayectoria del que sigue recto y debe cederle el paso.',
        },
        {
          text: 'Hacer señales luminosas para que el otro conductor te deje girar.',
          feedback: 'Las señales luminosas no transfieren la prioridad. El que gira a la izquierda debe esperar a que pase el tráfico que circula de frente.',
        },
      ],
      explanation: 'Quien gira a la izquierda abandona su trayectoria y corta la del sentido contrario, por lo que debe ceder el paso a los vehículos que se aproximan de frente siguiendo recto.',
      rule: 'Arts. 57 y 74 RGCir — quien gira a la izquierda cede el paso al sentido contrario.',
    },

    {
      id: 'via-preferente-r3',
      tag: 'Prioridad de paso',
      title: 'Calzada con prioridad (R-3)',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        addSign(scene, 'prioridad', { x: 4.4, z: 6.5 });
        // Ceda para la vía transversal (tráfico que circula hacia -x)
        addSign(scene, 'ceda', { x: 6.5, z: -4.4, rotY: Math.PI / 2 });

        // Congelación en t = 4.125 s → el coche queda en x ≈ 11
        const npc = makeCar(0x4a7fd4);
        npc.position.set(36, 0, -laneCenter(1));
        npc.rotation.y = Math.PI / 2; // circula hacia -x, llega por tu derecha
        scene.add(npc);
        return [{ mesh: npc, vel: [-6, 0] }];
      },
      question: 'Circulas por una calzada con prioridad (señal R-3) y un turismo llega por tu derecha por una vía con ceda el paso. ¿Qué debes hacer?',
      options: [
        {
          text: 'Cederle el paso, porque se aproxima por tu derecha.',
          feedback: 'La norma de la derecha solo rige en intersecciones sin señalizar. Aquí la señalización establece que tu calzada es preferente.',
        },
        {
          text: 'Detenerte antes de la intersección por si el otro no respeta su ceda.',
          feedback: 'Detenerte sin motivo en una vía preferente puede provocar un alcance. Basta con circular atento y con precaución.',
        },
        {
          text: 'Continuar tu marcha: tu calzada es preferente y el otro conductor debe cederte el paso.',
          correct: true,
        },
      ],
      explanation: 'La señal R-3 indica que circulas por una calzada con prioridad en las intersecciones: los vehículos de las vías transversales, regulados por ceda el paso, deben dejarte pasar.',
      rule: 'Señal R-3 (calzada con prioridad) y art. 57 RGCir.',
    },

    {
      id: 'fin-de-prioridad',
      tag: 'Prioridad de paso',
      title: 'Después del fin de prioridad',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // La rebasas durante la aproximación (z = 28)
        addSign(scene, 'finPrioridad', { x: 4.4, z: 28 });

        // Congelación en t = 4.125 s → el coche queda en x ≈ 11
        const npc = makeCar(0x3f9e6b);
        npc.position.set(44, 0, -laneCenter(1));
        npc.rotation.y = Math.PI / 2; // circula hacia -x, llega por tu derecha
        scene.add(npc);
        return [{ mesh: npc, vel: [-8, 0] }];
      },
      question: 'Acabas de rebasar la señal de fin de prioridad y llegas a una intersección sin señalizar donde un turismo se aproxima por tu derecha. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar, porque tu vía sigue siendo preferente hasta que una señal indique lo contrario.',
          feedback: 'Es justo al revés: la señal de fin de prioridad anuncia que tu vía deja de ser preferente y vuelve a regir la norma general.',
        },
        {
          text: 'Ceder el paso al turismo: tu vía ya no es preferente y vuelve a regir la norma de la derecha.',
          correct: true,
        },
        {
          text: 'Advertir con el claxon y pasar primero.',
          feedback: 'El claxon no otorga prioridad. Al terminar la prioridad de tu vía, debes ceder el paso a quien viene por la derecha.',
        },
      ],
      explanation: 'La señal de fin de prioridad (R-4) indica que tu calzada deja de ser preferente. En la siguiente intersección sin señalizar rige de nuevo la norma general: ceder el paso a quien se aproxima por la derecha.',
      rule: 'Señal R-4 (fin de prioridad); art. 57 RGCir — norma general de la derecha.',
    },

    {
      id: 'semaforo-apagado',
      tag: 'Prioridad de paso',
      title: 'Semáforo apagado en la intersección',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        addSemaphore(scene, { x: 4.4, z: 6.5, active: 'off' });
        addSemaphore(scene, { x: 6.5, z: -4.4, rotY: Math.PI / 2, active: 'off' });

        // Congelación en t = 4.125 s → el coche queda en x ≈ 11
        const npc = makeCar(0xd45050);
        npc.position.set(44, 0, -laneCenter(1));
        npc.rotation.y = Math.PI / 2; // circula hacia -x, llega por tu derecha
        scene.add(npc);
        return [{ mesh: npc, vel: [-8, 0] }];
      },
      question: 'El semáforo de la intersección está apagado y no hay señales verticales de prioridad. Un turismo se aproxima por tu derecha. ¿Qué debes hacer?',
      options: [
        {
          text: 'Cederle el paso: sin regulación efectiva rige la norma general de la derecha.',
          correct: true,
        },
        {
          text: 'Continuar sin más, porque un semáforo apagado equivale a luz verde.',
          feedback: 'Un semáforo apagado no equivale a vía libre: la intersección pasa a regirse por las señales verticales y, si no las hay, por la norma de la derecha.',
        },
        {
          text: 'Detenerte y esperar a que el semáforo vuelva a funcionar.',
          feedback: 'No hay que esperar a que se restablezca: la intersección se cruza aplicando las normas de prioridad que correspondan, en este caso la de la derecha.',
        },
      ],
      explanation: 'Cuando un semáforo está apagado, la intersección se rige por las señales verticales existentes y, en su defecto, por la norma general de prioridad: ceder el paso a quien se aproxima por la derecha.',
      rule: 'Art. 57 RGCir — norma general de prioridad en ausencia de regulación.',
    },

    {
      id: 'ambulancia-prioritaria',
      tag: 'Prioridad de paso',
      title: 'Ambulancia en servicio urgente',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // Congelación en t = 3.625 s → la ambulancia queda en x ≈ -8
        const amb = makeAmbulance();
        amb.position.set(-44, 0, laneCenter(1));
        amb.rotation.y = -Math.PI / 2; // circula hacia +x, cruza por tu izquierda
        scene.add(amb);
        this._amb = amb;
        return [{ mesh: amb, vel: [10, 0] }];
      },
      tick(t) {
        if (this._amb) this._amb.userData.beacon.visible = (t % 0.5) < 0.3;
      },
      question: 'Una ambulancia en servicio urgente, con las señales luminosas en funcionamiento, va a cruzar la intersección por tu izquierda. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar: viene por tu izquierda y en una intersección sin señalizar la prioridad es tuya.',
          feedback: 'Los vehículos prioritarios en servicio urgente tienen prioridad sobre los demás: debes facilitarles el paso aunque la norma general te la diera a ti.',
        },
        {
          text: 'Detenerte dentro de la intersección para que pase por detrás de tu vehículo.',
          feedback: 'Detenerte dentro de la intersección entorpece su paso. Hay que dejar libre la intersección, apartándose o deteniéndose antes de ella si es preciso.',
        },
        {
          text: 'Facilitarle el paso, deteniéndote antes de la intersección si es preciso, aunque la prioridad fuera tuya.',
          correct: true,
        },
      ],
      explanation: 'Los vehículos de emergencias en servicio urgente que anuncian su presencia con las señales luminosas y acústicas tienen prioridad de paso: los demás conductores deben facilitarles el paso, apartándose o deteniéndose si es necesario.',
      rule: 'Arts. 68 y 69 RGCir — vehículos prioritarios y comportamiento de los demás conductores.',
    },

    {
      id: 'estrechamiento-ceda',
      tag: 'Prioridad de paso',
      title: 'Estrechamiento con prioridad del sentido contrario',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: 2, to: 80 });
        addRoadZ(scene, { from: -80, to: -30 });
        addRoadZ(scene, { from: -30, to: 2, width: 4 }); // tramo estrecho
        addDashesZ(scene, { from: 12, to: 80 });
        addDashesZ(scene, { from: -80, to: -30 });
        addCityBlocks(scene);

        addSign(scene, 'estrechamientoCede', { x: 4.4, z: 8 });

        // Congelación en t = 4.125 s → el camión queda en z ≈ -10
        const truck = makeTruck(0x2d6da3);
        truck.position.set(0, 0, -39);
        truck.rotation.y = Math.PI; // circula hacia +z, viene de frente
        scene.add(truck);
        return [{ mesh: truck, vel: [0, 7] }];
      },
      question: 'Llegas a un estrechamiento donde la señal da prioridad al sentido contrario y un camión se aproxima de frente. ¿Qué debes hacer?',
      options: [
        {
          text: 'Ceder el paso y esperar antes del estrechamiento a que el camión lo haya cruzado.',
          correct: true,
        },
        {
          text: 'Entrar tú primero, porque tu vehículo es más estrecho y pasará sin dificultad.',
          feedback: 'El tamaño de tu vehículo es irrelevante: la señal establece que la prioridad en el tramo estrecho es del sentido contrario.',
        },
        {
          text: 'Entrar a la vez que el camión, ciñéndote todo lo posible a tu derecha.',
          feedback: 'En un estrechamiento no caben los dos sentidos a la vez: debes detenerte antes y dejar pasar al camión, que tiene la prioridad.',
        },
      ],
      explanation: 'La señal de prioridad al sentido contrario (R-5) obliga a ceder el paso en el tramo estrecho a los vehículos que vienen de frente, deteniéndote antes de entrar si es necesario.',
      rule: 'Señal R-5 y art. 60 RGCir — prioridad en tramos estrechos.',
    },

    {
      id: 'estrechamiento-prioridad',
      tag: 'Prioridad de paso',
      title: 'Estrechamiento con tu prioridad, camión ya dentro',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: 2, to: 80 });
        addRoadZ(scene, { from: -80, to: -30 });
        addRoadZ(scene, { from: -30, to: 2, width: 4 }); // tramo estrecho
        addDashesZ(scene, { from: 12, to: 80 });
        addDashesZ(scene, { from: -80, to: -30 });
        addCityBlocks(scene);

        addSign(scene, 'estrechamientoPrio', { x: 4.4, z: 8 });

        // Congelación en t = 4.125 s → el camión queda en z ≈ -3, dentro del tramo
        const truck = makeTruck(0xc9762b);
        truck.position.set(0, 0, -28);
        truck.rotation.y = Math.PI; // circula hacia +z, ya dentro del estrechamiento
        scene.add(truck);
        return [{ mesh: truck, vel: [0, 6] }];
      },
      question: 'La señal te da prioridad en el estrechamiento, pero el camión que viene en sentido contrario ya está circulando por su interior. ¿Qué debes hacer?',
      options: [
        {
          text: 'Entrar de todos modos: la señal te da prioridad y es el camión quien debe retroceder.',
          feedback: 'La prioridad no te autoriza a forzar el paso: el camión ya está dentro del estrechamiento y obligarle a retroceder sería peligroso y antirreglamentario.',
        },
        {
          text: 'Esperar antes del estrechamiento y dejar que el camión termine de salir.',
          correct: true,
        },
        {
          text: 'Advertirle con señales acústicas para que se detenga dentro del estrechamiento.',
          feedback: 'Detener al camión dentro del tramo estrecho bloquearía la vía. Lo correcto es esperar fuera a que lo abandone.',
        },
      ],
      explanation: 'Aunque la señal te otorgue la prioridad en el estrechamiento, si el otro vehículo ya ha entrado debes facilitarle la salida y esperar: la prioridad nunca autoriza a forzar el paso ni a crear una situación de peligro.',
      rule: 'Señal R-6 y art. 60 RGCir — la prioridad no permite forzar el paso a quien ya está dentro del tramo estrecho.',
    },

    {
      id: 'giro-derecha-peaton',
      tag: 'Prioridad de paso',
      title: 'Giro a la derecha con peatón cruzando',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addLaneArrow(scene, { x: laneCenter(1), z: 9, dir: 'right' });
        addCityBlocks(scene);

        // Congelación en t = 4.125 s → el peatón queda en z ≈ -1, en mitad de la calle
        const peaton = makePeaton({ shirt: 0xd4a018 });
        peaton.position.set(9, 0, -6);
        peaton.rotation.y = Math.PI; // camina hacia +z, cruzando la calle transversal
        scene.add(peaton);
        return [{ mesh: peaton, vel: [0, 1.2] }];
      },
      question: 'Vas a girar a la derecha para entrar en la calle transversal y un peatón la está cruzando, sin que exista paso de peatones. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar el giro: al no haber paso de peatones, la prioridad es del vehículo.',
          feedback: 'Al girar para entrar en otra vía debes ceder el paso a los peatones que la estén cruzando, aunque no exista paso para ellos.',
        },
        {
          text: 'Apurar el giro pasando por delante del peatón antes de que llegue a tu trayectoria.',
          feedback: 'Apurar la maniobra ante un peatón que ya cruza es peligroso: debes dejarle terminar de cruzar antes de completar el giro.',
        },
        {
          text: 'Cederle el paso: al girar para entrar en otra vía debes dejar cruzar a los peatones aunque no haya paso marcado.',
          correct: true,
        },
      ],
      explanation: 'Los conductores deben ceder el paso a los peatones cuando giran para entrar en otra vía y hay peatones cruzándola, aunque no exista paso para peatones.',
      rule: 'Art. 65 RGCir — prioridad de los peatones al girar el vehículo para entrar en otra vía.',
    },

    {
      id: 'via-pavimentada',
      tag: 'Prioridad de paso',
      title: 'Cruce con camino sin pavimentar',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        // Camino de tierra que desemboca por tu derecha
        addRoadSeg(scene, { x: 21, z: 0, rotY: Math.PI / 2, len: 40, width: 6, color: 0x7a5c3a });
        addCityBlocks(scene);

        // Congelación en t = 4.125 s → el coche queda en x ≈ 11
        const npc = makeCar(0x8a8f98);
        npc.position.set(40, 0, -laneCenter(1));
        npc.rotation.y = Math.PI / 2; // circula hacia -x por el camino de tierra
        scene.add(npc);
        return [{ mesh: npc, vel: [-7, 0] }];
      },
      question: 'Circulas por una vía pavimentada y llegas a un cruce sin señalizar donde un turismo se aproxima por tu derecha desde un camino sin pavimentar. ¿Quién tiene prioridad?',
      options: [
        {
          text: 'Tú: los vehículos que circulan por vía pavimentada tienen prioridad sobre los que proceden de un camino sin pavimentar.',
          correct: true,
        },
        {
          text: 'El turismo, porque se aproxima por tu derecha.',
          feedback: 'La norma de la derecha tiene excepciones: quien circula por vía pavimentada tiene prioridad frente a quien procede de una vía sin pavimentar, venga por donde venga.',
        },
        {
          text: 'Ninguno: en los cruces con caminos ambos vehículos deben detenerse siempre.',
          feedback: 'No existe tal obligación de detención para ambos: la ley da la prioridad al vehículo que circula por la vía pavimentada.',
        },
      ],
      explanation: 'Es una de las excepciones a la norma de la derecha: en los cruces entre una vía pavimentada y otra sin pavimentar, la prioridad corresponde a quien circula por la pavimentada. Aun así, atraviesa el cruce con precaución.',
      rule: 'Art. 21 LSV y art. 57 RGCir — prioridad de la vía pavimentada sobre la no pavimentada.',
    },

    {
      id: 'verde-salida-bloqueada',
      tag: 'Prioridad de paso',
      title: 'Semáforo en verde con la salida bloqueada',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        addSemaphore(scene, { x: 4.4, z: 6.5, active: 'green' });

        // Cola detenida ocupando tu carril tras la intersección
        [
          [0x4a7fd4, -5], [0xd45050, -10.5], [0x3f9e6b, -16], [0xc9b7a4, -21.5],
        ].forEach(([color, z]) => {
          const c = makeCar(color);
          c.position.set(laneCenter(1), 0, z);
          scene.add(c);
        });
        return [];
      },
      question: 'El semáforo está en verde, pero al otro lado de la intersección hay una cola de vehículos detenidos que ocupa tu carril. ¿Qué debes hacer?',
      options: [
        {
          text: 'Entrar en la intersección: la luz verde te da derecho a pasar en cualquier caso.',
          feedback: 'La luz verde autoriza a pasar solo si vas a poder abandonar la intersección: si la salida está bloqueada, no debes entrar.',
        },
        {
          text: 'No entrar en la intersección, aunque el semáforo esté en verde, hasta que puedas atravesarla y salir de ella.',
          correct: true,
        },
        {
          text: 'Entrar y esperar dentro de la intersección a que la cola avance.',
          feedback: 'Quedar detenido dentro de la intersección obstruye la circulación transversal. Debes esperar antes de ella.',
        },
      ],
      explanation: 'Aun teniendo prioridad, ningún conductor debe penetrar en una intersección si la situación de la circulación hace previsible que quede detenido dentro, obstruyendo la circulación transversal.',
      rule: 'Art. 59.1 RGCir — prohibición de entrar en una intersección si se puede quedar detenido en ella.',
    },

    {
      id: 'ciclista-por-derecha',
      tag: 'Prioridad de paso',
      title: 'Intersección sin señalizar: ciclista por la derecha',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // Congelación en t = 4.125 s → el ciclista queda en x ≈ 10
        const bike = makeBike({ shirt: 0x2d9e6b });
        bike.position.set(31, 0, -laneCenter(1));
        bike.rotation.y = Math.PI / 2; // circula hacia -x, llega por tu derecha
        scene.add(bike);
        return [{ mesh: bike, vel: [-5, 0] }];
      },
      question: 'Llegas a una intersección sin señalizar y un ciclista se aproxima por tu derecha. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar: las bicicletas deben ceder siempre el paso a los turismos.',
          feedback: 'La bicicleta es un vehículo y goza de las mismas normas de prioridad: no existe una preferencia general de los turismos sobre las bicicletas.',
        },
        {
          text: 'Acelerar para cruzar antes de que el ciclista llegue a la intersección.',
          feedback: 'Acelerar ante un usuario vulnerable que además tiene la prioridad es una maniobra especialmente peligrosa.',
        },
        {
          text: 'Cederle el paso: la bicicleta es un vehículo y rige la norma general de la derecha.',
          correct: true,
        },
      ],
      explanation: 'Las bicicletas son vehículos a todos los efectos: en una intersección sin señalizar debes ceder el paso al ciclista que se aproxima por tu derecha, igual que harías con cualquier otro vehículo.',
      rule: 'Art. 57 RGCir — norma general de la derecha, aplicable a las bicicletas como vehículos.',
    },
  ],
};
