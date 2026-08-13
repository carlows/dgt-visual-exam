import {
  addRoadZ, addRoadX, addDashesZ, addDashesX, addStopLine, addSolidLineZ,
  addCrosswalk, addCityBlocks, addStreetlight, addSemaphore, addSign, addAgente,
  makePeaton, makeCar, makeTruck,
} from '../world.js';

// Referencias para animar en tick (solo un escenario activo a la vez)
let agenteBalanceo = null;
let balizaObras = null;

export const TEMA = {
  id: 'agente',
  title: 'Señales de los agentes',
  scenarios: [
    {
      id: 'agente-vs-semaforo',
      tag: 'Señales de agente',
      title: 'Agente con el brazo en alto y semáforo en verde',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });
        addAgente(scene, { x: 0, z: 0, pose: 'alto' });
        return [];
      },
      question: 'El semáforo está en verde, pero un agente regula la intersección con el brazo levantado verticalmente. ¿Qué haces?',
      options: [
        {
          text: 'Detenerte: la señal del agente obliga a parar y prevalece sobre el semáforo.',
          correct: true,
        },
        {
          text: 'Continuar, porque el semáforo en verde te permite pasar.',
          feedback: 'Las señales y órdenes de los agentes prevalecen sobre cualquier otra señal, incluido un semáforo en verde.',
        },
        {
          text: 'Detenerte solo si el agente te está mirando directamente.',
          feedback: 'El brazo levantado verticalmente obliga a detenerse a todos los usuarios que se aproximen al agente, le mire o no.',
        },
      ],
      explanation: 'El brazo levantado verticalmente obliga a detenerse a todos los usuarios que se acerquen al agente. Sus señales ocupan el primer lugar en el orden de prioridad, por encima de semáforos y señales verticales.',
      rule: 'Arts. 133 y 143 RGCir — orden de prioridad entre señales y señales de los agentes.',
    },

    {
      id: 'agente-brazo-frente',
      tag: 'Señales de agente',
      title: 'Agente de frente con el brazo extendido',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addAgente(scene, { x: 0, z: 0, pose: 'frente' });
        return [];
      },
      question: 'Un agente regula la intersección de frente a ti, con un brazo extendido horizontalmente. ¿Qué haces?',
      options: [
        {
          text: 'Detenerte: el brazo extendido obliga a parar a quienes se acercan desde direcciones que corten la indicada.',
          correct: true,
        },
        {
          text: 'Continuar, porque solo obliga a detenerse el brazo levantado verticalmente.',
          feedback: 'El brazo extendido horizontalmente también obliga a detenerse a los usuarios que se aproximen desde direcciones que corten la señalada, y la indicación se mantiene aunque el agente baje el brazo.',
        },
        {
          text: 'Reducir la velocidad y pasar con precaución.',
          feedback: 'La indicación del agente no es una advertencia: es una orden de detención.',
        },
      ],
      explanation: 'El brazo o brazos extendidos horizontalmente obligan a detenerse a los usuarios que se acerquen desde direcciones que corten la indicada por el brazo, cualquiera que sea el sentido de su marcha. La indicación subsiste aunque el agente baje el brazo.',
      rule: 'Art. 143 RGCir — señales de los agentes de circulación.',
    },

    {
      id: 'agente-brazos-cruz',
      tag: 'Señales de agente',
      title: 'Agente de frente con los brazos en cruz',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addAgente(scene, { x: 0, z: 0, pose: 'cruz' });
        return [];
      },
      question: 'Te acercas a una intersección y el agente que la regula está de frente a ti con los dos brazos extendidos en cruz. ¿Qué debes hacer?',
      options: [
        {
          text: 'Pasar, porque los brazos en cruz solo afectan al tráfico transversal.',
          feedback: 'Es al revés: al ver al agente de frente con los brazos en cruz, tu dirección corta la indicada por los brazos y debes detenerte.',
        },
        {
          text: 'Detenerte: los brazos en cruz equivalen al brazo extendido y cortan tu dirección de marcha.',
          correct: true,
        },
        {
          text: 'Reducir la velocidad y cruzar sin detenerte si no viene nadie.',
          feedback: 'No es una recomendación de precaución: es una orden de detención para quienes ven al agente de frente o de espaldas.',
        },
      ],
      explanation: 'El brazo o los brazos extendidos horizontalmente obligan a detenerse a los usuarios que se acerquen desde direcciones que corten la señalada por el brazo. Si ves al agente de frente (o de espaldas) con los brazos en cruz, tu dirección está cortada y debes parar.',
      rule: 'Art. 143 RGCir — señales de los agentes de circulación.',
    },

    {
      id: 'agente-luz-roja-noche',
      tag: 'Señales de agente',
      title: 'Agente con luz roja de noche',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);
        addStreetlight(scene, { x: -4.5, z: 18 });
        addStreetlight(scene, { x: 4.5, z: 6 });
        addStreetlight(scene, { x: -4.5, z: -8 });

        addAgente(scene, { x: 0, z: 0, pose: 'luz' });
        return [];
      },
      question: 'Circulas de noche y un agente que regula el cruce dirige hacia ti una luz roja. ¿Qué significa?',
      options: [
        {
          text: 'Que debes detenerte: la luz roja dirigida hacia ti equivale a una orden de detención.',
          correct: true,
        },
        {
          text: 'Que hay peligro y debes pasar extremando la precaución.',
          feedback: 'La luz roja del agente no es una advertencia de peligro: obliga a detenerse a los usuarios hacia los que se dirige.',
        },
        {
          text: 'Que debes apagar las luces de carretera y continuar.',
          feedback: 'No tiene relación con el alumbrado: la luz roja del agente es una orden de detención para quien la recibe.',
        },
      ],
      explanation: 'Cuando la visibilidad es escasa, los agentes pueden regular con una luz. La luz roja dirigida hacia los usuarios les obliga a detenerse, igual que el brazo levantado o extendido.',
      rule: 'Art. 143 RGCir — señales de los agentes con dispositivos luminosos.',
    },

    {
      id: 'agente-brazo-balanceo',
      tag: 'Señales de agente',
      title: 'Agente balanceando el brazo arriba y abajo',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        agenteBalanceo = addAgente(scene, { x: 0, z: 0, pose: 'lento' });
        return [];
      },
      tick(t) {
        // Balanceo del brazo derecho arriba y abajo
        const armR = agenteBalanceo && agenteBalanceo.children[6];
        if (armR) armR.rotation.z = 0.85 + Math.sin(t * 3.2) * 0.45;
      },
      question: 'El agente que ves delante mueve el brazo repetidamente de arriba abajo. ¿Qué te está indicando?',
      options: [
        {
          text: 'Que te detengas inmediatamente donde estás.',
          feedback: 'La orden de detención es el brazo levantado verticalmente o extendido en horizontal, no el balanceo de arriba abajo.',
        },
        {
          text: 'Que aceleres para despejar cuanto antes la zona.',
          feedback: 'Es justo lo contrario: el balanceo del brazo de arriba abajo ordena disminuir la velocidad.',
        },
        {
          text: 'Que reduzcas la velocidad de tu vehículo.',
          correct: true,
        },
      ],
      explanation: 'El agente puede ordenar la disminución de la velocidad balanceando el brazo de arriba abajo. Es una orden dirigida a los conductores que se acercan por el lado hacia el que hace la señal.',
      rule: 'Art. 143 RGCir — señales de los agentes de circulación.',
    },

    {
      id: 'agente-avanzar-semaforo-rojo',
      tag: 'Prioridad de señales',
      title: 'Semáforo en rojo pero el agente te da paso',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addSemaphore(scene, { x: 4.4, z: 6, active: 'red' });
        // Agente de perfil, cortando la vía transversal y dando paso a tu vía
        addAgente(scene, { x: 0, z: 0, rotY: -Math.PI / 2, pose: 'frente' });
        return [];
      },
      question: 'El semáforo de tu vía está en rojo, pero el agente que regula el cruce ha cortado la vía transversal y te hace señas de que avances. ¿Qué haces?',
      options: [
        {
          text: 'Esperar a que el semáforo se ponga en verde, porque el rojo prohíbe el paso en todo caso.',
          feedback: 'Las señales y órdenes de los agentes ocupan el primer lugar en el orden de prioridad y prevalecen sobre los semáforos.',
        },
        {
          text: 'Avanzar: las órdenes del agente prevalecen sobre el semáforo.',
          correct: true,
        },
        {
          text: 'Detenerte junto al agente para preguntarle si puedes pasar.',
          feedback: 'No debes entorpecer la regulación: la seña del agente es suficiente y debes obedecerla avanzando.',
        },
      ],
      explanation: 'En el orden de prioridad entre señales, las señales y órdenes de los agentes prevalecen sobre cualquier otra señal, incluidos los semáforos. Si el agente te da paso, debes avanzar aunque el semáforo esté en rojo.',
      rule: 'Art. 133 RGCir — orden de prioridad entre los distintos tipos de señales.',
    },

    {
      id: 'agente-paso-con-stop',
      tag: 'Prioridad de señales',
      title: 'Señal de STOP pero el agente te da paso',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addSign(scene, 'stop', { x: 4.4, z: 6 });
        // Agente de perfil, reteniendo la vía transversal y dándote paso
        addAgente(scene, { x: 0, z: 0, rotY: -Math.PI / 2, pose: 'frente' });
        return [];
      },
      question: 'Llegas a una intersección con señal de STOP, pero un agente la está regulando y te indica con la mano que continúes. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar sin detenerte: la orden del agente prevalece sobre la señal vertical.',
          correct: true,
        },
        {
          text: 'Detenerte en el STOP de todos modos y reanudar la marcha después.',
          feedback: 'Si el agente te da paso, detenerte contradice su orden. Las órdenes de los agentes prevalecen sobre las señales verticales.',
        },
        {
          text: 'Continuar solo si no se acercan vehículos por la otra vía.',
          feedback: 'La otra vía la está reteniendo el agente: debes obedecer su indicación y pasar, sin condicionarla a tu propia valoración.',
        },
      ],
      explanation: 'Cuando un agente regula una intersección, sus señales y órdenes prevalecen sobre las señales verticales, incluida la de STOP (R-2). Debes obedecer al agente y continuar.',
      rule: 'Art. 133 RGCir — orden de prioridad entre los distintos tipos de señales.',
    },

    {
      id: 'obras-bandera-roja',
      tag: 'Personal de obras',
      title: 'Personal de obras con bandera roja',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene, { avoid: 6 });

        // Camión de obras ocupando parte del carril derecho más adelante
        const camion = makeTruck(0xc9762b);
        camion.position.set(1.75, 0, -8);
        scene.add(camion);

        // Operario con torso rojo al borde de tu carril, de cara a ti
        const operario = makePeaton({ shirt: 0xc1121f });
        operario.position.set(3.2, 0, 0);
        operario.rotation.y = Math.PI;
        scene.add(operario);
        return [];
      },
      question: 'Te acercas a un tramo en obras y un operario, situado junto a tu carril, agita una bandera roja hacia ti. ¿Qué significa?',
      options: [
        {
          text: 'Que hay peligro y debes pasar despacio junto a las obras.',
          feedback: 'La bandera roja no indica solo precaución: indica que la calzada está temporalmente cerrada para quienes reciben la señal.',
        },
        {
          text: 'Que debes cambiar de carril y continuar sin detenerte.',
          feedback: 'No es una orden de desplazamiento lateral: la bandera roja te obliga a detenerte porque la calzada está temporalmente cerrada.',
        },
        {
          text: 'Que la calzada está temporalmente cerrada al tráfico y debes detenerte.',
          correct: true,
        },
      ],
      explanation: 'La bandera roja utilizada por el personal de obras indica que la calzada está temporalmente cerrada al tráfico para los usuarios a quienes se dirige la señal. Debes detenerte hasta que te den paso.',
      rule: 'Art. 144 RGCir — señales de balizamiento: la bandera roja indica calzada temporalmente cerrada.',
    },

    {
      id: 'obras-luz-amarilla-noche',
      tag: 'Personal de obras',
      title: 'Obras con luz amarilla intermitente de noche',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      panel: 'left',
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene, { avoid: 6 });
        addStreetlight(scene, { x: -4.5, z: 20 });
        addStreetlight(scene, { x: -4.5, z: -4 });

        // Camión de obras y operario junto a la zona de trabajo
        const camion = makeTruck(0xc9762b);
        camion.position.set(1.75, 0, -10);
        scene.add(camion);
        const operario = makePeaton({ shirt: 0xc1121f });
        operario.position.set(3.4, 0, -4);
        operario.rotation.y = Math.PI;
        scene.add(operario);

        // Luz amarilla intermitente balizando el inicio de las obras
        balizaObras = addSemaphore(scene, { x: 3.2, z: 2, active: 'amber' });
        return [];
      },
      tick(t) {
        if (balizaObras) balizaObras.setActive(t % 1 < 0.5 ? 'amber' : 'off');
      },
      question: 'De noche, te acercas a una zona de obras balizada con una luz amarilla intermitente. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Detenerte y no pasar hasta que la luz se apague.',
          feedback: 'La luz amarilla intermitente no prohíbe el paso: te obliga a extremar la precaución, no a detenerte.',
        },
        {
          text: 'Extremar la precaución y reducir la velocidad al pasar junto a las obras.',
          correct: true,
        },
        {
          text: 'Continuar a la misma velocidad, porque la luz amarilla solo afecta al personal de obras.',
          feedback: 'La luz amarilla intermitente se dirige a los conductores: advierte de un peligro y obliga a extremar la precaución.',
        },
      ],
      explanation: 'La luz amarilla intermitente que baliza unas obras no cierra el paso, pero obliga a los conductores a extremar la precaución y, en su caso, a reducir la velocidad ante la zona de trabajo.',
      rule: 'Arts. 144 y 146 RGCir — balizamiento de obras y luz amarilla intermitente: extremar la precaución.',
    },

    {
      id: 'agente-alto-sin-distancia',
      tag: 'Señales de agente',
      title: 'El agente levanta el brazo cuando ya no puedes parar',
      playerStart: 45,
      playerSpeed: 14,
      triggerZ: 8,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        addAgente(scene, { x: 0, z: 0, pose: 'alto' });
        return [];
      },
      question: 'El agente levanta el brazo verticalmente cuando ya estás casi encima del cruce y no puedes detenerte en condiciones de seguridad. ¿Qué debes hacer?',
      options: [
        {
          text: 'Continuar la marcha y despejar la intersección.',
          correct: true,
        },
        {
          text: 'Frenar a fondo y detenerte donde sea, aunque quedes dentro del cruce.',
          feedback: 'Detenerte sin seguridad o bloqueando la intersección crea más peligro: la obligación de parar exceptúa a quien no puede hacerlo con seguridad suficiente.',
        },
        {
          text: 'Dar marcha atrás para salir del cruce por donde entraste.',
          feedback: 'La marcha atrás en una intersección está prohibida y sería más peligrosa: debes continuar y despejar el cruce.',
        },
      ],
      explanation: 'El brazo levantado verticalmente obliga a detenerse, salvo a los conductores que ya no puedan hacerlo en condiciones de seguridad suficiente. En ese caso deben continuar y despejar la intersección.',
      rule: 'Art. 143 RGCir — el brazo en alto obliga a detenerse salvo imposibilidad de hacerlo con seguridad.',
    },

    {
      id: 'patrulla-escolar-r2',
      tag: 'Personal habilitado',
      title: 'Patrulla escolar con disco de STOP portátil',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 3 });
        addDashesZ(scene, { from: 3, to: 80 });
        addCrosswalk(scene, { z: 0 });
        addCityBlocks(scene, { avoid: 8 });
        addSign(scene, 'peligro', { x: 4.4, z: 22, glyph: 'ninos' });

        // Miembro de la patrulla escolar con el disco R-2 portátil en el paso
        const patrulla = makePeaton({ shirt: 0xf2a20c });
        patrulla.position.set(2.8, 0, 1.2);
        patrulla.rotation.y = Math.PI;
        scene.add(patrulla);
        addSign(scene, 'stop', { x: 3.5, z: 1.2, height: 1.5 });

        // Niños esperando para cruzar en la acera derecha
        const nino1 = makePeaton({ shirt: 0x4a7fd4 });
        nino1.scale.setScalar(0.7);
        nino1.position.set(4.6, 0, -0.5);
        nino1.rotation.y = Math.PI / 2;
        const nino2 = makePeaton({ shirt: 0x3aa655 });
        nino2.scale.setScalar(0.7);
        nino2.position.set(5.2, 0, 0.6);
        nino2.rotation.y = Math.PI / 2;
        scene.add(nino1, nino2);
        return [];
      },
      question: 'Ante un colegio, un miembro de la patrulla escolar te muestra un disco portátil con la señal de STOP (R-2) para que crucen los niños. ¿Qué debes hacer?',
      options: [
        {
          text: 'Reducir la velocidad y pasar, porque no es un agente de la autoridad.',
          feedback: 'Las patrullas escolares están habilitadas para regular el paso y sus señales deben obedecerse como las de un agente.',
        },
        {
          text: 'Detenerte, obedeciendo la señal como si la hiciera un agente.',
          correct: true,
        },
        {
          text: 'Detenerte solo si ves niños ya cruzando la calzada.',
          feedback: 'El disco R-2 mostrado por la patrulla te obliga a detenerte en todo caso, haya o no niños ya sobre el paso.',
        },
      ],
      explanation: 'Además de los agentes, puede regular el paso el personal habilitado para ello, como las patrullas escolares ante los centros de enseñanza. Sus indicaciones con el disco R-2 portátil obligan igual que las de un agente.',
      rule: 'Art. 143 RGCir — señales de los agentes y del personal habilitado para regular la circulación.',
    },

    {
      id: 'policia-orden-detencion',
      tag: 'Órdenes de agentes',
      title: 'Vehículo policial te ordena detenerte',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      panel: 'right',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene, { avoid: 6 });

        // Coche policial que te da alcance por el carril izquierdo
        const policia = makeCar(0x1a3a8f);
        // En la congelación (t = 4.375 s) queda en z ≈ 4, a tu izquierda
        policia.position.set(-1.75, 0, 47.75);
        return [{ mesh: policia, vel: [0, -10] }];
      },
      question: 'Un vehículo policial te ha dado alcance con las luces azules encendidas y, con una señal acústica breve, el agente te indica que te detengas. ¿Qué debes hacer?',
      options: [
        {
          text: 'Apartarte y facilitarle el paso, pero continuar tu marcha.',
          feedback: 'Facilitar el paso es lo debido ante un vehículo prioritario en servicio urgente, pero aquí la orden es que TÚ te detengas, y debes obedecerla.',
        },
        {
          text: 'Detenerte inmediatamente en el carril, en el punto donde estás.',
          feedback: 'Debes detenerte, pero en un lugar seguro: en el arcén o donde no crees peligro ni obstaculices la circulación.',
        },
        {
          text: 'Detenerte en el arcén o en el primer lugar seguro, obedeciendo la orden.',
          correct: true,
        },
      ],
      explanation: 'Las órdenes de los agentes, también las dadas desde un vehículo mediante señales luminosas y acústicas, son de obligado cumplimiento. Debes detenerte en cuanto puedas hacerlo con seguridad, en el arcén o lugar adecuado.',
      rule: 'Art. 143 RGCir y LSV — obligación de obedecer las órdenes de los agentes de la circulación.',
    },

    {
      id: 'agente-linea-continua',
      tag: 'Prioridad de señales',
      title: 'El agente te ordena pasar sobre la línea continua',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { x: 0, from: -80, to: 80 });
        addCityBlocks(scene, { avoid: 6 });

        // Camión averiado ocupando tu carril
        const camion = makeTruck(0x888888);
        camion.position.set(1.75, 0, -3);
        scene.add(camion);

        // Agente que te desvía por el carril contrario
        addAgente(scene, { x: 0.4, z: 3, pose: 'frente' });
        return [];
      },
      question: 'Un camión averiado ocupa tu carril y el agente te ordena rebasarlo pasando por encima de la línea longitudinal continua. ¿Qué haces?',
      options: [
        {
          text: 'Obedecer al agente y cruzar la línea continua: sus órdenes prevalecen sobre las marcas viales.',
          correct: true,
        },
        {
          text: 'Detenerte detrás del camión, porque la línea continua nunca puede pisarse.',
          feedback: 'Las marcas viales ocupan el último lugar en el orden de prioridad: la orden del agente te habilita a cruzar la línea continua.',
        },
        {
          text: 'Buscar otro itinerario, ya que ni el agente puede autorizar a cruzar una línea continua.',
          feedback: 'Sí puede: las señales y órdenes de los agentes prevalecen sobre todas las demás señales, incluidas las marcas viales.',
        },
      ],
      explanation: 'En el orden de prioridad, las marcas viales ocupan el último lugar y las órdenes de los agentes el primero. Si el agente te ordena rebasar el obstáculo cruzando la línea continua, debes obedecer.',
      rule: 'Art. 133 RGCir — orden de prioridad: las órdenes de los agentes prevalecen sobre las marcas viales.',
    },

    {
      id: 'agente-perfil-otra-via',
      tag: 'Señales de agente',
      title: 'Agente de perfil regulando la otra vía',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addCityBlocks(scene);

        // Agente de perfil respecto a ti, con los brazos en cruz hacia la vía transversal
        addAgente(scene, { x: 0, z: 0, rotY: Math.PI / 2, pose: 'cruz' });
        return [];
      },
      question: 'El agente que regula el cruce está de perfil respecto a ti, con los brazos en cruz cortando la vía transversal, sin hacerte ninguna señal. ¿Puedes pasar?',
      options: [
        {
          text: 'No: siempre que un agente regula un cruce hay que detenerse hasta recibir una señal de paso.',
          feedback: 'No es necesario: quienes ven al agente de perfil no tienen su dirección cortada; la orden de detención afecta a quienes lo ven de frente o de espaldas.',
        },
        {
          text: 'No: los brazos en cruz obligan a detenerse a todos los vehículos del cruce.',
          feedback: 'Los brazos extendidos solo detienen a los usuarios cuyas direcciones corten la señalada, es decir, a quienes ven al agente de frente o de espaldas.',
        },
        {
          text: 'Sí, con precaución: tu dirección de marcha no está cortada por los brazos del agente.',
          correct: true,
        },
      ],
      explanation: 'Los brazos extendidos horizontalmente detienen a los usuarios que se acercan desde direcciones que corten la indicada: los que ven al agente de frente o de espaldas. Si lo ves de perfil, tu dirección está abierta y puedes pasar con precaución.',
      rule: 'Art. 143 RGCir — señales de los agentes de circulación.',
    },

    {
      id: 'orden-prioridad-senales',
      tag: 'Prioridad de señales',
      title: 'Orden de prioridad entre los tipos de señales',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 10,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 5, to: 80 });
        addDashesZ(scene, { from: -80, to: -5 });
        addDashesX(scene, { from: 5, to: 80 });
        addDashesX(scene, { from: -80, to: -5 });
        addStopLine(scene, { z: 5.5 });
        addCityBlocks(scene);

        addSemaphore(scene, { x: 4.4, z: 6, active: 'green' });
        addAgente(scene, { x: 0, z: 0, pose: 'alto' });
        return [];
      },
      question: 'Tienes prisa, el semáforo está en verde y el agente mantiene el brazo en alto. ¿Cuál es el orden de prioridad entre los distintos tipos de señales?',
      options: [
        {
          text: 'Semáforos, señales de los agentes, señales verticales y marcas viales.',
          feedback: 'Los semáforos no encabezan el orden: las señales y órdenes de los agentes prevalecen sobre todas las demás, así que aquí debes detenerte.',
        },
        {
          text: 'Señales de los agentes, señalización circunstancial y de balizamiento, semáforos, señales verticales y marcas viales.',
          correct: true,
        },
        {
          text: 'Señales verticales, semáforos, marcas viales y, por último, señales de los agentes.',
          feedback: 'Es el orden casi inverso al correcto: los agentes ocupan el primer lugar y las marcas viales el último.',
        },
      ],
      explanation: 'El orden de prioridad es: 1.º señales y órdenes de los agentes; 2.º señalización circunstancial que modifique el régimen normal de la vía y señales de balizamiento; 3.º semáforos; 4.º señales verticales; 5.º marcas viales. Por eso, pese al verde, debes obedecer el brazo en alto y detenerte.',
      rule: 'Art. 133 RGCir — orden de prioridad entre los distintos tipos de señales de circulación.',
    },
  ],
};
