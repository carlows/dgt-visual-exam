import {
  addRoadZ, addRoadX, addRoadSeg, addDashesZ, addSolidLineZ, addCrosswalk, addStopLine,
  addLaneArrow, addCityBlocks, addSign, addSemaphore, addStreetlight,
  makePeaton, makeBike, makeTruck,
} from '../world.js';

let semRezagado = null;

export const TEMA = {
  id: 'vulnerables',
  title: 'Peatones, ciclistas y usuarios vulnerables',
  scenarios: [
    {
      id: 'paso-peatones',
      tag: 'Usuarios vulnerables',
      title: 'Peatón a punto de cruzar',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 4, to: 80 });
        addDashesZ(scene, { from: -80, to: -4 });
        addCrosswalk(scene, { z: 0 });
        addStopLine(scene, { z: 3 });
        addCityBlocks(scene);

        const peaton = makePeaton();
        peaton.position.set(6.5, 0, 0);
        peaton.rotation.y = Math.PI / 2; // camina hacia la calzada
        scene.add(peaton);
        return [{ mesh: peaton, vel: [-0.6, 0] }];
      },
      question: 'Te aproximas a un paso de peatones y una persona se dispone a cruzar desde la acera derecha. ¿Qué debes hacer?',
      options: [
        {
          text: 'Reducir la velocidad y detenerte si es preciso para cederle el paso.',
          correct: true,
        },
        {
          text: 'Continuar, porque el peatón todavía no ha bajado de la acera.',
          feedback: 'La prioridad del peatón en el paso no exige que ya esté sobre la calzada: si se dispone a cruzar, debes cederle el paso.',
        },
        {
          text: 'Advertirle con el claxon y pasar antes de que cruce.',
          feedback: 'El claxon no te da prioridad: en un paso de peatones la preferencia es del peatón.',
        },
      ],
      explanation: 'En los pasos de peatones debidamente señalizados los conductores tienen la obligación de ceder el paso a los peatones, moderando la velocidad al aproximarse y deteniéndose cuando sea necesario.',
      rule: 'Art. 65 RGCir — prioridad de paso de los peatones.',
    },

    {
      id: 'adelantar-ciclista',
      tag: 'Usuarios vulnerables',
      title: 'Adelantar a un ciclista',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { x: 0, from: -80, to: 80 });

        const bici = makeBike();
        bici.position.set(2.4, 0, 16.5); // a 14 m del jugador en la congelación
        scene.add(bici);
        return [{ mesh: bici, vel: [0, -4] }];
      },
      question: 'Circulas por una carretera con línea continua y alcanzas a un ciclista. ¿Cómo debes adelantarlo?',
      options: [
        {
          text: 'No puedes adelantarlo en ningún caso mientras la marca sea continua.',
          feedback: 'Para adelantar a ciclistas está permitido rebasar la línea continua si hay visibilidad suficiente y la maniobra no entraña riesgo.',
        },
        {
          text: 'Reduciendo considerablemente la velocidad y dejando una separación lateral mínima de 1,5 m, pudiendo pisar la línea continua si es seguro.',
          correct: true,
        },
        {
          text: 'Sin salir de tu carril y manteniendo la velocidad, para no invadir el sentido contrario.',
          feedback: 'Si no puedes garantizar 1,5 m de separación lateral no debes adelantar; además hay que reducir considerablemente la velocidad.',
        },
      ],
      explanation: 'Al adelantar a un ciclista es obligatorio dejar una separación lateral mínima de 1,5 m y reducir considerablemente la velocidad. Está permitido rebasar la línea longitudinal continua para hacerlo, siempre que la maniobra sea segura y no se ponga en peligro a la circulación en sentido contrario.',
      rule: 'Arts. 85 y 88 RGCir — adelantamiento a ciclos: separación mínima de 1,5 m.',
    },

    {
      id: 'grupo-ciclistas-cruce',
      tag: 'Usuarios vulnerables',
      title: 'Grupo de ciclistas en el cruce',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: -60, to: 60 });
        addDashesZ(scene, { from: 6, to: 80 });
        addDashesZ(scene, { from: -80, to: -6 });
        addCityBlocks(scene, { avoid: 16 });

        const bicis = [];
        const inicioX = [16, 20, 24]; // en la congelación: x ≈ 0.5, 4.5 y 8.5
        const offZ = [-0.4, 0.4, -0.4];
        for (let i = 0; i < 3; i += 1) {
          const b = makeBike({ shirt: [0xd45050, 0x4a7fd4, 0x4caf50][i] });
          b.position.set(inicioX[i], 0, offZ[i]);
          b.rotation.y = Math.PI / 2; // circulan hacia −x
          scene.add(b);
          bicis.push({ mesh: b, vel: [-4, 0] });
        }
        return bicis;
      },
      question: 'Llegas a un cruce sin señalizar y un grupo de ciclistas lo atraviesa por tu derecha: el primero ya ha entrado en la intersección. ¿Qué debes hacer?',
      options: [
        {
          text: 'Pasar en cuanto haya un hueco entre las bicicletas.',
          feedback: 'No debes cortar el grupo: si el primer ciclista ya ha entrado en el cruce, el resto del grupo también tiene prioridad.',
        },
        {
          text: 'Ceder el paso solo al primer ciclista y continuar, porque los demás aún no han entrado.',
          feedback: 'Los ciclistas en grupo se consideran una unidad a efectos de prioridad: entrado el primero, tienen preferencia todos.',
        },
        {
          text: 'Ceder el paso a todo el grupo y no reanudar la marcha hasta que haya pasado el último.',
          correct: true,
        },
      ],
      explanation: 'Los ciclistas tienen prioridad de paso cuando, circulando en grupo, el primero haya iniciado ya el cruce. En ese caso el grupo se comporta como una unidad y los demás conductores deben dejar pasar a todos sus integrantes sin cortarlo.',
      rule: 'Art. 64 RGCir — prioridad de paso de los ciclistas que circulan en grupo.',
    },

    {
      id: 'zona-residencial-s28',
      tag: 'Usuarios vulnerables',
      title: 'Calle residencial (S-28)',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'zonaResidencial', { x: 4.4, z: 24 });

        const nino = makePeaton({ shirt: 0xe0b040 });
        nino.position.set(3.0, 0, -1);
        nino.rotation.y = Math.PI / 2; // cruza hacia −x
        scene.add(nino);

        const adulto = makePeaton({ shirt: 0x4caf50 });
        adulto.position.set(-2.7, 0, 3);
        adulto.rotation.y = -Math.PI / 2; // camina hacia +x
        scene.add(adulto);

        return [
          { mesh: nino, vel: [-0.5, 0] },
          { mesh: adulto, vel: [0.3, 0] },
        ];
      },
      question: 'Entras en una calle señalizada como zona residencial (S-28) y hay peatones y niños caminando por la calzada. ¿Cómo debes circular?',
      options: [
        {
          text: 'A un máximo de 20 km/h, cediendo el paso a los peatones, que tienen prioridad en toda la zona.',
          correct: true,
        },
        {
          text: 'A un máximo de 30 km/h, como en cualquier calle urbana de un solo carril.',
          feedback: 'En las calles residenciales señalizadas con S-28 el límite es de 20 km/h, no de 30.',
        },
        {
          text: 'A velocidad normal, avisando con el claxon para que los peatones se aparten.',
          feedback: 'En zona residencial los peatones pueden usar toda la zona de circulación y tienen prioridad: eres tú quien debe adaptarse a ellos.',
        },
      ],
      explanation: 'La señal S-28 delimita una calle residencial: la velocidad máxima es de 20 km/h, los peatones pueden utilizar toda la zona de circulación y tienen prioridad, y los juegos están permitidos en ella.',
      rule: 'Señal S-28 (RGCir) — calle residencial: máximo 20 km/h y prioridad de los peatones.',
    },

    {
      id: 'vmp-en-carril',
      tag: 'Usuarios vulnerables',
      title: 'Patinete (VMP) en tu carril',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const vmp = makeBike({ shirt: 0x333333 });
        vmp.position.set(2.0, 0, 16.7); // a 12 m del jugador en la congelación
        scene.add(vmp);
        return [{ mesh: vmp, vel: [0, -3.5] }];
      },
      question: 'Un patinete eléctrico (vehículo de movilidad personal) circula delante de ti, ocupando tu carril. ¿Qué debes hacer?',
      options: [
        {
          text: 'Tocarle el claxon con insistencia para que se arrime al bordillo y te deje pasar.',
          feedback: 'Presionar o acosar con el claxon a un usuario vulnerable es una conducta peligrosa y sancionable; el VMP tiene derecho a circular por la calzada.',
        },
        {
          text: 'Rebasarlo dentro de tu propio carril, porque un patinete no es un vehículo.',
          feedback: 'El VMP sí es un vehículo: debes adelantarlo como tal, con separación lateral suficiente, no rebasarlo rozándolo dentro del carril.',
        },
        {
          text: 'Tratarlo como a cualquier otro vehículo: mantener la distancia y adelantarlo solo con margen lateral suficiente.',
          correct: true,
        },
      ],
      explanation: 'Los vehículos de movilidad personal son vehículos y sus conductores, usuarios vulnerables. Debes mantener la distancia de seguridad, no presionarlos con el claxon y adelantarlos únicamente cuando puedas dejar un margen lateral suficiente.',
      rule: 'Art. 85 RGCir — adelantamiento con separación lateral de seguridad; el VMP es un vehículo.',
    },

    {
      id: 'peaton-fuera-de-paso',
      tag: 'Usuarios vulnerables',
      title: 'Peatón cruzando fuera del paso',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 15,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const peaton = makePeaton({ shirt: 0xa05fb0 });
        peaton.position.set(5.2, 0, 0);
        peaton.rotation.y = Math.PI / 2; // cruza hacia −x
        scene.add(peaton);
        return [{ mesh: peaton, vel: [-0.7, 0] }];
      },
      question: 'Un peatón cruza la calzada delante de ti por un lugar donde no hay paso de peatones. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Mantener la velocidad: la prioridad es tuya porque no cruza por un paso.',
          feedback: 'Tener prioridad no te exime del deber de evitar el atropello: siempre debes moderar la velocidad ante un peatón en la calzada.',
        },
        {
          text: 'Moderar la velocidad y detenerte si es necesario, aunque el peatón no tenga prioridad.',
          correct: true,
        },
        {
          text: 'Hacerle señales con las luces y el claxon para que retroceda a la acera, sin reducir.',
          feedback: 'Intimidar al peatón no evita el riesgo: lo exigible es moderar la velocidad y, si hace falta, detenerse.',
        },
      ],
      explanation: 'Aunque el peatón que cruza fuera de un paso no tiene prioridad, el conductor está obligado a moderar la velocidad cuando hay peatones en la parte de la vía que utiliza y a hacer todo lo posible por evitar el atropello.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante peatones en la calzada.',
    },

    {
      id: 'peligro-ninos',
      tag: 'Usuarios vulnerables',
      title: 'Peligro: niños',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addSign(scene, 'peligro', { x: 4.4, z: 22, glyph: 'ninos' });

        const nino1 = makePeaton({ shirt: 0xd45050 });
        nino1.position.set(5.6, 0, -1);
        nino1.rotation.y = Math.PI / 2;
        scene.add(nino1);

        const nino2 = makePeaton({ shirt: 0xe0b040 });
        nino2.position.set(6.4, 0, 2);
        nino2.rotation.y = Math.PI / 2;
        scene.add(nino2);

        return [
          { mesh: nino1, vel: [-0.15, 0] },
          { mesh: nino2, vel: [-0.2, 0] },
        ];
      },
      question: 'Pasas junto a una señal de peligro por proximidad de niños y ves a varios jugando junto al borde de la acera. ¿Qué debes hacer?',
      options: [
        {
          text: 'Reducir mucho la velocidad, anticipando que un niño pueda invadir la calzada de forma imprevista.',
          correct: true,
        },
        {
          text: 'Mantener la velocidad, porque los niños están en la acera y no en la calzada.',
          feedback: 'La reacción de un niño es imprevisible: la señal te advierte precisamente de que puede irrumpir en la calzada de repente.',
        },
        {
          text: 'Seguir igual y tocar el claxon justo al pasar a su altura.',
          feedback: 'Un claxonazo repentino puede asustarlos y provocar justo lo que quieres evitar; lo correcto es reducir la velocidad con antelación.',
        },
      ],
      explanation: 'Ante una señal de peligro por proximidad de niños hay que reducir considerablemente la velocidad y extremar la atención: los niños pueden irrumpir en la calzada de forma súbita e imprevisible, por ejemplo detrás de un balón.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante la presencia de niños.',
    },

    {
      id: 'bus-escolar-parado',
      tag: 'Usuarios vulnerables',
      title: 'Autobús escolar detenido',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 15,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);

        const bus = makeTruck(0xf2c230); // autobús escolar detenido junto al borde derecho
        bus.position.set(4.7, 0, -1);
        scene.add(bus);

        const nino1 = makePeaton({ shirt: 0xd45050 });
        nino1.position.set(6.7, 0, 1);
        nino1.rotation.y = Math.PI / 2;
        scene.add(nino1);

        const nino2 = makePeaton({ shirt: 0x4a7fd4 });
        nino2.position.set(6.0, 0, 3);
        scene.add(nino2);

        return [{ mesh: nino1, vel: [-0.3, 0] }];
      },
      question: 'Un autobús de transporte escolar está detenido en el lado derecho y varios niños acaban de bajar de él. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Pasar a tu velocidad normal: el autobús está correctamente parado y no invade tu carril.',
          feedback: 'El riesgo no es el autobús, sino los niños: pueden cruzar de forma imprevista, incluso por delante del propio autobús.',
        },
        {
          text: 'Moderar la velocidad y aumentar la atención, previendo que algún niño cruce por delante del autobús.',
          correct: true,
        },
        {
          text: 'Detenerte siempre y no reanudar la marcha hasta que el autobús se vaya.',
          feedback: 'No es obligatorio detenerse siempre; lo exigible es moderar la velocidad y estar en condiciones de detenerte si un niño invade la calzada.',
        },
      ],
      explanation: 'En las inmediaciones de un transporte escolar detenido hay que moderar la velocidad y extremar la precaución: los niños pueden cruzar de forma súbita, a menudo por delante del autobús, donde quedan ocultos hasta el último momento.',
      rule: 'Art. 46 RGCir — moderación de la velocidad; precaución ante el transporte escolar.',
    },

    {
      id: 'mayor-cruzando-verde',
      tag: 'Usuarios vulnerables',
      title: 'Persona mayor cruzando despacio',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addCrosswalk(scene, { z: 0 });
        addStopLine(scene, { z: 3 });
        addCityBlocks(scene);
        addSemaphore(scene, { x: 4.4, z: 5, active: 'green' });

        const mayor = makePeaton({ shirt: 0x888888 });
        mayor.position.set(2.85, 0, 0);
        mayor.rotation.y = Math.PI / 2; // cruza despacio hacia −x
        scene.add(mayor);
        return [{ mesh: mayor, vel: [-0.4, 0] }];
      },
      question: 'Tu semáforo está en verde, pero una persona mayor que empezó a cruzar antes todavía está en el paso, avanzando despacio. ¿Qué haces?',
      options: [
        {
          text: 'Avanzar despacio hacia ella para indicarle que debe darse prisa.',
          feedback: 'Nunca debes presionar a un peatón que cruza; avanzar hacia él es peligroso e intimidatorio.',
        },
        {
          text: 'Tocar el claxon: con tu semáforo en verde la preferencia es tuya.',
          feedback: 'El verde no te autoriza a arrollar a quien ya está cruzando: el peatón debe poder terminar el cruce con seguridad.',
        },
        {
          text: 'Esperar detenido a que termine de cruzar con calma, aunque tu semáforo esté en verde.',
          correct: true,
        },
      ],
      explanation: 'Aunque el semáforo se haya puesto verde para ti, el peatón que ya ha iniciado el cruce debe poder terminarlo con seguridad. Con usuarios especialmente vulnerables, como las personas mayores, hay que esperar sin presionarles de ningún modo.',
      rule: 'RGCir — protección de los peatones: no reanudar la marcha hasta que terminen de cruzar.',
    },

    {
      id: 'noche-peaton-arcen',
      tag: 'Usuarios vulnerables',
      title: 'Peatón en el arcén de noche',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addSolidLineZ(scene, { x: 3.9, from: -80, to: 80 });
        addSolidLineZ(scene, { x: -3.9, from: -80, to: 80 });
        addStreetlight(scene, { x: -4.6, z: 30 });
        addStreetlight(scene, { x: -4.6, z: -15 });

        const peaton = makePeaton({ shirt: 0x666666 });
        peaton.position.set(4.3, 0, -0.9);
        peaton.rotation.y = Math.PI; // camina de frente al tráfico, hacia +z
        scene.add(peaton);
        return [{ mesh: peaton, vel: [0, 0.8] }];
      },
      question: 'Circulas de noche por una carretera y distingues a un peatón caminando por el arcén derecho, en tu sentido de aproximación. ¿Qué debes hacer?',
      options: [
        {
          text: 'Moderar la velocidad y separarte lateralmente de él todo lo posible al pasar.',
          correct: true,
        },
        {
          text: 'Mantener la velocidad: es el peatón quien debe apartarse fuera de la calzada y su arcén.',
          feedback: 'El peatón puede circular por el arcén; eres tú quien debe moderar la velocidad y aumentar la separación, más aún de noche.',
        },
        {
          text: 'Hacerle ráfagas con la luz de carretera para avisarle, sin variar la velocidad.',
          feedback: 'Las ráfagas pueden deslumbrarlo y no reducen el riesgo: lo eficaz es reducir la velocidad y apartarte de él.',
        },
      ],
      explanation: 'De noche los peatones se detectan muy tarde. Ante un peatón en el arcén hay que moderar la velocidad y aumentar al máximo la separación lateral al rebasarlo, extremando la precaución por la escasa visibilidad.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante peatones; precaución extra de noche.',
    },

    {
      id: 'noche-ciclista-cortas',
      tag: 'Usuarios vulnerables',
      title: 'Ciclista delante de noche',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'left',
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addStreetlight(scene, { x: -4.6, z: 20 });
        addStreetlight(scene, { x: -4.6, z: -20 });

        const bici = makeBike({ shirt: 0xdddddd });
        bici.position.set(2.2, 0, 17.3); // a 15 m del jugador en la congelación
        scene.add(bici);
        return [{ mesh: bici, vel: [0, -4.5] }];
      },
      question: 'Circulas de noche con la luz de carretera (largas) y alcanzas a un ciclista que circula delante de ti con sus luces. ¿Qué debes hacer?',
      options: [
        {
          text: 'Mantener las largas mientras lo sigues, para verlo mejor.',
          feedback: 'Debes cambiar al alumbrado de cruce en cuanto puedas deslumbrar a otro usuario, también al que circula delante en tu mismo sentido.',
        },
        {
          text: 'Cambiar a la luz de cruce y mantener una distancia amplia hasta poder adelantarlo con margen suficiente.',
          correct: true,
        },
        {
          text: 'Adelantarlo inmediatamente y muy pegado, para dejar de molestarlo cuanto antes.',
          feedback: 'Adelantar sin la separación lateral mínima de 1,5 m está prohibido; la prisa no justifica poner en riesgo al ciclista.',
        },
      ],
      explanation: 'De noche hay que sustituir la luz de carretera por la de cruce en cuanto exista posibilidad de deslumbrar a otros usuarios, incluidos los que preceden en el mismo sentido. Al ciclista se le mantiene una distancia amplia y solo se le adelanta con el margen lateral reglamentario.',
      rule: 'Art. 102 RGCir — evitar el deslumbramiento; Art. 85 RGCir — adelantamiento a ciclos.',
    },

    {
      id: 'carril-bici-giro-derecha',
      tag: 'Usuarios vulnerables',
      title: 'Carril bici en tu giro a la derecha',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 14,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addRoadX(scene, { from: 4, to: 60 }); // calle lateral a la derecha
        addDashesZ(scene, { from: 6, to: 80 });
        addDashesZ(scene, { from: -80, to: -6 });
        // carril bici paralelo a tu derecha, cruzando la calle lateral
        addRoadSeg(scene, { x: 5.6, z: 0, rotY: 0, len: 160, width: 1.6, color: 0x8a4a4a });
        addCrosswalk(scene, { z: 0, width: 14 }); // paso para ciclistas en la intersección
        addLaneArrow(scene, { z: 10, dir: 'right' });
        addCityBlocks(scene, { avoid: 16 });

        const bici = makeBike({ shirt: 0x4caf50 });
        bici.position.set(5.6, 0, 22.4); // en la congelación queda a tu derecha, llegando al cruce
        scene.add(bici);
        return [{ mesh: bici, vel: [0, -4.5] }];
      },
      question: 'Vas a girar a la derecha y tu trayectoria cruza un carril bici por el que un ciclista sigue recto. ¿Quién tiene prioridad?',
      options: [
        {
          text: 'Tú: acelera para completar el giro antes de que llegue el ciclista.',
          feedback: 'Al girar cortas la trayectoria del ciclista que sigue recto por su carril bici: la prioridad es suya.',
        },
        {
          text: 'Tú, girando despacio: el ciclista debe cederte el paso porque circulas por la calzada.',
          feedback: 'El ciclista que circula por un carril bici o paso para ciclistas tiene prioridad frente al vehículo que gira.',
        },
        {
          text: 'El ciclista: debes cederle el paso y girar solo cuando haya pasado.',
          correct: true,
        },
      ],
      explanation: 'Los ciclistas tienen prioridad de paso cuando circulan por un carril bici o paso para ciclistas y otro vehículo gira para entrar en otra vía cortando su trayectoria. Debes cederle el paso y completar el giro después.',
      rule: 'Art. 64 RGCir — prioridad de los ciclistas en carril bici o paso para ciclistas.',
    },

    {
      id: 'carrito-bebe-paso',
      tag: 'Usuarios vulnerables',
      title: 'Peatón con carrito de bebé',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: 4, to: 80 });
        addDashesZ(scene, { from: -80, to: -4 });
        addCrosswalk(scene, { z: 0 });
        addStopLine(scene, { z: 3 });
        addCityBlocks(scene);

        const peaton = makePeaton({ shirt: 0xd47fa6 });
        peaton.position.set(7.5, 0, 0);
        peaton.rotation.y = Math.PI / 2; // inicia el cruce empujando el carrito
        scene.add(peaton);
        return [{ mesh: peaton, vel: [-0.8, 0] }];
      },
      question: 'Una persona con un carrito de bebé inicia el cruce por el paso de peatones. ¿Qué debes hacer?',
      options: [
        {
          text: 'Reducir la velocidad y detenerte por completo si es preciso, hasta que haya terminado de cruzar.',
          correct: true,
        },
        {
          text: 'Pasar rápido, antes de que el carrito baje a la calzada.',
          feedback: 'Si se dispone a cruzar por el paso ya debes cederle el paso; acelerar para "ganarle" el paso es una maniobra gravemente peligrosa.',
        },
        {
          text: 'Continuar sin variar la velocidad, porque todavía está junto a la acera.',
          feedback: 'La prioridad del peatón en el paso se aplica también cuando se dispone a cruzar: debes moderar y detenerte si hace falta.',
        },
      ],
      explanation: 'En los pasos de peatones el conductor debe ceder el paso, deteniéndose por completo cuando sea necesario. Con usuarios especialmente vulnerables, como quien cruza con un carrito de bebé, la protección debe ser máxima.',
      rule: 'Art. 65 RGCir — prioridad de paso de los peatones.',
    },

    {
      id: 'via-estrecha-peatones',
      tag: 'Usuarios vulnerables',
      title: 'Vía estrecha sin aceras',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 15,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80, width: 6 });

        const p1 = makePeaton({ shirt: 0x4a7fd4 });
        p1.position.set(2.4, 0, -0.4);
        p1.rotation.y = Math.PI; // camina de frente al jugador
        scene.add(p1);

        const p2 = makePeaton({ shirt: 0xe0b040 });
        p2.position.set(2.4, 0, 3.1);
        p2.rotation.y = Math.PI;
        scene.add(p2);

        return [
          { mesh: p1, vel: [0, 0.9] },
          { mesh: p2, vel: [0, 0.9] },
        ];
      },
      question: 'Circulas por una vía estrecha sin aceras y dos peatones caminan por la calzada de frente a ti. ¿Cómo debes actuar?',
      options: [
        {
          text: 'Seguir por el centro de tu carril: son los peatones quienes deben subirse al borde.',
          feedback: 'En una vía sin aceras los peatones circulan legítimamente por la calzada; eres tú quien debe adaptarse a ellos.',
        },
        {
          text: 'Moderar la velocidad y desplazarte, dejando una separación lateral de seguridad suficiente al rebasarlos.',
          correct: true,
        },
        {
          text: 'Tocar el claxon repetidamente para que se coloquen en fila india contra el borde.',
          feedback: 'El claxon no sustituye a la maniobra segura: debes reducir la velocidad y apartarte de ellos al pasar.',
        },
      ],
      explanation: 'En vías sin aceras los peatones utilizan la calzada, normalmente por su izquierda para ver venir los vehículos. El conductor debe moderar la velocidad y rebasarlos dejando una separación lateral de seguridad suficiente.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante peatones en la calzada.',
    },

    {
      id: 'verde-peaton-rezagado',
      tag: 'Usuarios vulnerables',
      title: 'Verde con peatón rezagado',
      playerStart: 12,
      playerSpeed: 2,
      triggerZ: 9,
      panel: 'left',
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addCrosswalk(scene, { z: 0 });
        addStopLine(scene, { z: 3 });
        addCityBlocks(scene);
        semRezagado = addSemaphore(scene, { x: 4.4, z: 5, active: 'red' });

        const peaton = makePeaton({ shirt: 0x5a8f5a });
        peaton.position.set(1.5, 0, 0);
        peaton.rotation.y = Math.PI / 2; // termina de cruzar hacia −x
        scene.add(peaton);
        return [{ mesh: peaton, vel: [-0.6, 0] }];
      },
      tick(t) {
        if (semRezagado) semRezagado.setActive(t < 0.8 ? 'red' : 'green');
      },
      question: 'Estabas detenido en el semáforo, se acaba de poner verde, pero un peatón rezagado sigue cruzando por el paso. ¿Qué haces?',
      options: [
        {
          text: 'Permanecer detenido y dejar que termine de cruzar antes de reanudar la marcha.',
          correct: true,
        },
        {
          text: 'Arrancar despacio y esquivarlo, pasando por detrás de él.',
          feedback: 'Iniciar la marcha con un peatón aún sobre el paso es peligroso: debe poder terminar de cruzar sin verse rodeado por vehículos.',
        },
        {
          text: 'Avisarle con el claxon, porque con tu verde él ya no tiene preferencia.',
          feedback: 'El cambio a verde no elimina la protección del peatón que ya cruzaba: hay que dejarle terminar sin presionarle.',
        },
      ],
      explanation: 'Aunque el semáforo se ponga verde para los vehículos, el peatón que ya estaba cruzando debe poder terminar el cruce con seguridad. El conductor no debe reanudar la marcha ni presionarle hasta que haya abandonado el paso.',
      rule: 'RGCir — protección de los peatones en pasos regulados por semáforo.',
    },
  ],
};
