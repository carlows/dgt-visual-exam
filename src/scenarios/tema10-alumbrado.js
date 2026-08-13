// Rellenado por el proceso de autoría — ver docs/AUTORIA.md
import {
  addRoadZ, addDashesZ, addCityBlocks, addStreetlight, addTunnel,
  addSign, makeCar, makePeaton,
} from '../world.js';

export const TEMA = {
  id: 'alumbrado',
  title: 'Alumbrado y condiciones adversas',
  scenarios: [
    {
      id: 'noche-poblado-cruce',
      tag: 'Alumbrado',
      title: 'De noche por una calle con farolas',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -80, to: 80 });
        addDashesZ(scene, { from: -80, to: 80 });
        addCityBlocks(scene);
        addStreetlight(scene, { x: 5.2, z: 26 });
        addStreetlight(scene, { x: 5.2, z: 12 });
        addStreetlight(scene, { x: 5.2, z: -2 });
        addStreetlight(scene, { x: 5.2, z: -16 });
        return [];
      },
      question: 'Circulas de noche por una vía urbana suficientemente iluminada por farolas. ¿Qué alumbrado debes utilizar?',
      options: [
        {
          text: 'La luz de carretera, para ver mejor a los peatones.',
          feedback: 'La luz de carretera (largas) está prohibida en poblado cuando la vía está suficientemente iluminada: deslumbra al resto de usuarios sin ser necesaria.',
        },
        {
          text: 'La luz de cruce (cortas).',
          correct: true,
        },
        {
          text: 'Basta con las luces de posición, porque las farolas ya iluminan la vía.',
          feedback: 'Las luces de posición solas no bastan para circular: sirven para señalar la presencia del vehículo, no para circular de noche. Debes llevar al menos la luz de cruce.',
        },
      ],
      explanation: 'Entre el ocaso y la salida del sol hay que circular con alumbrado. En poblado, en vías suficientemente iluminadas, se utiliza la luz de cruce; la luz de carretera está prohibida en esas condiciones.',
      rule: 'Art. 100 RGCir — luces de carretera y de cruce.',
    },

    {
      id: 'noche-carretera-largas',
      tag: 'Alumbrado',
      title: 'Carretera sin alumbrado y sin tráfico de frente',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        return [];
      },
      question: 'Circulas de noche por una carretera sin iluminación y no viene nadie en sentido contrario. ¿Qué alumbrado es el adecuado?',
      options: [
        {
          text: 'La luz de carretera (largas), mientras no haya riesgo de deslumbrar a otros usuarios.',
          correct: true,
        },
        {
          text: 'La luz de cruce en todo caso; las largas solo se permiten en autopista.',
          feedback: 'Fuera de poblado, en vías insuficientemente iluminadas, la luz de carretera es la adecuada siempre que no se deslumbre a otros usuarios; no está limitada a las autopistas.',
        },
        {
          text: 'Las luces antiniebla delanteras, que iluminan más el arcén.',
          feedback: 'El alumbrado antiniebla solo procede con niebla, lluvia intensa u otras condiciones que disminuyan mucho la visibilidad, no en una noche despejada.',
        },
      ],
      explanation: 'Fuera de poblado, en vías insuficientemente iluminadas, se circula con la luz de carretera para ver a la mayor distancia posible, sustituyéndola por la de cruce cuando exista riesgo de deslumbrar.',
      rule: 'Art. 100 RGCir — luces de carretera y de cruce.',
    },

    {
      id: 'noche-cruce-al-cruzarse',
      tag: 'Alumbrado',
      title: 'Vehículo de frente circulando con largas',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        const oncoming = makeCar(0x4a7fd4);
        oncoming.position.set(-1.75, 0, -57.5);
        oncoming.rotation.y = Math.PI;
        scene.add(oncoming);
        return [{ mesh: oncoming, vel: [0, 12] }];
      },
      question: 'Circulas de noche con la luz de carretera y se aproxima un vehículo en sentido contrario. ¿Qué debes hacer?',
      options: [
        {
          text: 'Mantener las largas hasta cruzarte, para no perder visibilidad.',
          feedback: 'Mantener la luz de carretera deslumbraría al conductor que se aproxima, creando un peligro grave. Hay que cambiar a la de cruce con antelación suficiente.',
        },
        {
          text: 'Hacerle ráfagas para que sea él quien apague sus largas.',
          feedback: 'Lo primero es no deslumbrar tú: debes cambiar a la luz de cruce en cuanto aprecies la posibilidad de deslumbrar al que viene de frente.',
        },
        {
          text: 'Sustituir la luz de carretera por la de cruce antes de que pueda deslumbrarle.',
          correct: true,
        },
      ],
      explanation: 'Quien circula con la luz de carretera debe sustituirla por la de cruce tan pronto como aprecie la posibilidad de deslumbrar a otros usuarios, incluidos los que se aproximan en sentido contrario.',
      rule: 'Arts. 100 y 101 RGCir — deslumbramiento.',
    },

    {
      id: 'noche-te-deslumbran',
      tag: 'Alumbrado',
      title: 'Te deslumbra un vehículo que viene de frente',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'right',
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        const oncoming = makeCar(0xdddddd);
        oncoming.position.set(-1.75, 0, -53.5);
        oncoming.rotation.y = Math.PI;
        scene.add(oncoming);
        return [{ mesh: oncoming, vel: [0, 12] }];
      },
      question: 'Un vehículo que se acerca en sentido contrario te deslumbra con sus luces. ¿Cómo debes reaccionar?',
      options: [
        {
          text: 'Poner tú las largas para compensar la pérdida de visión.',
          feedback: 'Responder con las largas deslumbra también al otro conductor y duplica el peligro. La reacción correcta es reducir la velocidad.',
        },
        {
          text: 'Reducir la velocidad e incluso detenerte si es preciso, evitando mirar directamente a los faros.',
          correct: true,
        },
        {
          text: 'Cerrar los ojos un instante y mantener la velocidad para salir antes de la zona de deslumbramiento.',
          feedback: 'Nunca se debe seguir circulando a la misma velocidad sin ver: si quedas deslumbrado, reduce la velocidad y detente si es necesario.',
        },
      ],
      explanation: 'El conductor deslumbrado debe reducir la velocidad, e incluso detenerse si fuera preciso, para no circular sin visibilidad. Ayuda dirigir la vista hacia el borde derecho de la vía en lugar de mirar a los faros.',
      rule: 'Art. 101 RGCir — deslumbramiento.',
    },

    {
      id: 'niebla-densa-antiniebla',
      tag: 'Cond. adversas',
      title: 'Niebla densa en carretera',
      playerStart: 45,
      playerSpeed: 6,
      triggerZ: 12,
      env: { mode: 'fog' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        return [];
      },
      question: 'Te sorprende un banco de niebla densa. ¿Qué alumbrado debes utilizar?',
      options: [
        {
          text: 'Luz antiniebla delantera o de cruce, y la luz antiniebla trasera.',
          correct: true,
        },
        {
          text: 'La luz de carretera, que es la que más ilumina.',
          feedback: 'Con niebla, la luz de carretera empeora la visión: la niebla refleja el haz y crea una pantalla luminosa delante del vehículo.',
        },
        {
          text: 'Solo las luces de posición, para no reflejar en la niebla.',
          feedback: 'Las luces de posición solas no permiten ver ni ser visto lo suficiente. Con niebla densa procede el alumbrado antiniebla, y el trasero es especialmente importante para que te vean.',
        },
      ],
      explanation: 'Con niebla densa se utiliza la luz antiniebla delantera, sola o con la de cruce, y la luz antiniebla trasera para ser visto desde atrás. La luz de carretera es contraproducente porque la niebla refleja el haz.',
      rule: 'Art. 106 RGCir — utilización del alumbrado antiniebla.',
    },

    {
      id: 'tunel-dia-cruce',
      tag: 'Alumbrado',
      title: 'Entrada a un túnel de día',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'day' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        addTunnel(scene, { from: -50, to: 0 });
        addSign(scene, 'tunel', { x: 4.4, z: 8 });
        return [];
      },
      question: 'Es de día y vas a entrar en un túnel. ¿Qué alumbrado debes llevar en su interior?',
      options: [
        {
          text: 'Ninguno si el túnel está iluminado artificialmente.',
          feedback: 'En los túneles el alumbrado es obligatorio aunque estén iluminados: sirve también para que los demás te vean.',
        },
        {
          text: 'Las luces de emergencia, para advertir de tu presencia.',
          feedback: 'Las luces de emergencia señalan un peligro o una inmovilización, no sustituyen al alumbrado de circulación dentro del túnel.',
        },
        {
          text: 'Al menos la luz de cruce, también de día.',
          correct: true,
        },
      ],
      explanation: 'Dentro de los túneles y pasos inferiores es obligatorio circular con alumbrado, como mínimo la luz de cruce, aunque sea de día y el túnel esté iluminado.',
      rule: 'Arts. 98 y 100 RGCir — utilización del alumbrado en túneles.',
    },

    {
      id: 'tunel-salida-luminosidad',
      tag: 'Cond. adversas',
      title: 'Salida del túnel a plena luz',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 8,
      env: { mode: 'day' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        addTunnel(scene, { from: 0, to: 30 });
        return [];
      },
      question: 'Circulas por el interior de un túnel y te acercas a la salida, a plena luz del día. ¿Qué debes tener en cuenta?',
      options: [
        {
          text: 'Frenar con decisión justo en la boca del túnel para adaptarte a la luz.',
          feedback: 'Frenar bruscamente en la salida es peligroso para quien te sigue. Basta con extremar la precaución mientras la vista se adapta, sin maniobras bruscas.',
        },
        {
          text: 'Extremar la precaución: el cambio brusco de luminosidad reduce tu visión unos instantes.',
          correct: true,
        },
        {
          text: 'Nada especial: al haber más luz fuera, la visibilidad mejora inmediatamente.',
          feedback: 'El ojo tarda unos instantes en adaptarse al pasar de la penumbra a la plena luz; durante ese tiempo tu visión está reducida.',
        },
      ],
      explanation: 'Al salir de un túnel a plena luz, el ojo necesita un tiempo para adaptarse al cambio de luminosidad. Hay que anticiparlo y extremar la precaución, evitando frenazos bruscos que sorprendan a los que circulan detrás.',
      rule: 'RGCir — conducción adaptada a las condiciones de visibilidad.',
    },

    {
      id: 'ocaso-encender-alumbrado',
      tag: 'Alumbrado',
      title: 'Atardecer: ¿cuándo encender las luces?',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'dusk' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        return [];
      },
      question: 'Está atardeciendo y todavía se ve la carretera. ¿Desde qué momento es obligatorio circular con el alumbrado encendido?',
      options: [
        {
          text: 'Desde el ocaso hasta la salida del sol, aunque aún quede algo de claridad.',
          correct: true,
        },
        {
          text: 'Solo cuando ya sea noche cerrada y no se vea la calzada.',
          feedback: 'La obligación empieza en el ocaso, no cuando ya es de noche: en el crepúsculo el alumbrado sirve sobre todo para que los demás te vean.',
        },
        {
          text: 'Cuando lo enciendan los demás vehículos que circulan por la vía.',
          feedback: 'La obligación no depende de lo que hagan otros conductores: rige desde la puesta de sol para todos los vehículos.',
        },
      ],
      explanation: 'El alumbrado es obligatorio entre el ocaso y la salida del sol. Encenderlo al atardecer, aunque aún haya claridad, te hace visible para el resto de usuarios cuando la luz empieza a ser engañosa.',
      rule: 'Art. 98 RGCir — obligación de utilizar el alumbrado.',
    },

    {
      id: 'averia-noche-posicion',
      tag: 'Alumbrado',
      title: 'Inmovilizado de noche en el arcén',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        const broken = makeCar(0x888888);
        broken.position.set(4.6, 0, 0);
        scene.add(broken);
        return [];
      },
      question: 'Tu vehículo sufre una avería de noche y debes dejarlo inmovilizado en el arcén de una vía sin iluminación. ¿Qué alumbrado debe mantener?',
      options: [
        {
          text: 'La luz de cruce encendida, para iluminar la zona de la avería.',
          feedback: 'Para señalar un vehículo inmovilizado de noche se utilizan las luces de posición, no la de cruce, además de la señalización de peligro reglamentaria.',
        },
        {
          text: 'Ninguno, para no agotar la batería mientras esperas auxilio.',
          feedback: 'Un vehículo inmovilizado de noche en la vía o el arcén sin sus luces de posición es prácticamente invisible: debe mantenerlas encendidas y señalizarse reglamentariamente.',
        },
        {
          text: 'Las luces de posición encendidas, además de señalizar el vehículo con el dispositivo de peligro reglamentario.',
          correct: true,
        },
      ],
      explanation: 'Un vehículo inmovilizado de noche en la calzada o el arcén de una vía insuficientemente iluminada debe mantener encendidas las luces de posición y señalizarse con el dispositivo de preseñalización de peligro reglamentario.',
      rule: 'Arts. 98 y 130 RGCir — vehículo inmovilizado y su señalización.',
    },

    {
      id: 'niebla-velocidad-visibilidad',
      tag: 'Cond. adversas',
      title: 'Niebla: ¿a qué velocidad circular?',
      playerStart: 45,
      playerSpeed: 6,
      triggerZ: 12,
      env: { mode: 'fog' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        return [];
      },
      question: 'Circulas con niebla que reduce mucho la visibilidad. ¿Qué velocidad es la adecuada?',
      options: [
        {
          text: 'La máxima genérica de la vía, que sigue vigente con niebla.',
          feedback: 'El límite genérico es un máximo, no una velocidad garantizada: con visibilidad reducida hay que moderar la velocidad muy por debajo si es necesario.',
        },
        {
          text: 'Una que te permita detener el vehículo dentro de la distancia que alcanzas a ver.',
          correct: true,
        },
        {
          text: 'La misma que llevan los demás vehículos, para no entorpecer.',
          feedback: 'Seguir el ritmo de otros con niebla es lo que provoca los alcances en cadena. Tu velocidad debe depender de lo que tú ves, no de lo que hagan los demás.',
        },
      ],
      explanation: 'Con visibilidad reducida, la regla básica es circular a una velocidad que permita detener el vehículo dentro de los límites del campo de visión: si solo ves a 40 metros, debes poder pararte en menos de 40 metros.',
      rule: 'Art. 46 RGCir — moderación de la velocidad.',
    },

    {
      id: 'noche-rafagas-adelantamiento',
      tag: 'Alumbrado',
      title: 'Advertir un adelantamiento de noche',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      panel: 'left',
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        const slow = makeCar(0x2f8f4e);
        slow.position.set(1.75, 0, 19.7);
        scene.add(slow);
        return [{ mesh: slow, vel: [0, -5.5] }];
      },
      question: 'De noche, fuera de poblado, quieres advertir al vehículo que te precede de tu intención de adelantarlo. ¿Cómo lo haces?',
      options: [
        {
          text: 'Con una señal óptica: ráfagas cortas alternando las luces.',
          correct: true,
        },
        {
          text: 'Con toques prolongados de claxon hasta que se aparte.',
          feedback: 'De noche la advertencia adecuada es la óptica (ráfagas); el uso del claxon debe ser breve y solo cuando sea necesario, no de forma insistente.',
        },
        {
          text: 'Acercándote mucho a su parte trasera con las largas fijas.',
          feedback: 'Pegarte con la luz de carretera fija deslumbra al conductor por los retrovisores y reduce tu distancia de seguridad: es peligroso y no es la señal reglamentaria.',
        },
      ],
      explanation: 'Fuera de poblado puede advertirse el propósito de adelantar con una señal acústica u óptica; de noche es preferible la advertencia luminosa (ráfagas), que avisa sin generar ruido innecesario y sin deslumbrar de forma continuada.',
      rule: 'Art. 74 RGCir — advertencias luminosas.',
    },

    {
      id: 'niebla-distancia-seguridad',
      tag: 'Cond. adversas',
      title: 'Niebla: distancia con el que va delante',
      playerStart: 45,
      playerSpeed: 6,
      triggerZ: 12,
      panel: 'left',
      env: { mode: 'fog' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        const ahead = makeCar(0xb0413e);
        ahead.position.set(1.75, 0, 24.5);
        scene.add(ahead);
        return [{ mesh: ahead, vel: [0, -6] }];
      },
      question: 'Con niebla, distingues las luces traseras de un vehículo que circula delante de ti. ¿Qué haces con la distancia de seguridad?',
      options: [
        {
          text: 'Reducirla y seguir sus luces de cerca, para no perder la referencia.',
          feedback: '«Pegarse» a las luces del de delante es muy peligroso: si frena, no tendrás espacio para detenerte, y además condicionas tu velocidad a la suya en lugar de a tu visibilidad.',
        },
        {
          text: 'Mantener la misma que en condiciones normales: la niebla no cambia la frenada.',
          feedback: 'Con niebla reaccionas más tarde porque ves el peligro más tarde, y el firme suele estar húmedo: la distancia de seguridad debe aumentarse claramente.',
        },
        {
          text: 'Aumentarla claramente respecto a la habitual.',
          correct: true,
        },
      ],
      explanation: 'Con niebla hay que aumentar la distancia de seguridad: el peligro se percibe más tarde y el firme puede estar deslizante. Seguir de cerca las luces traseras del vehículo precedente es una causa típica de colisiones por alcance.',
      rule: 'Art. 54 RGCir — distancia de seguridad entre vehículos.',
    },

    {
      id: 'noche-peaton-oscuro',
      tag: 'Cond. adversas',
      title: 'Peatón con ropa oscura en el borde de la calzada',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'night' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        const p = makePeaton({ shirt: 0x333333 });
        p.position.set(4.0, 0, 0);
        scene.add(p);
        return [];
      },
      question: 'De noche, en una vía sin iluminación, adviertes a un peatón vestido de oscuro caminando por el borde derecho de la calzada. ¿Qué debes hacer?',
      options: [
        {
          text: 'Tocar el claxon con insistencia y mantener la velocidad, puesto que ya le has visto.',
          feedback: 'Haberlo visto no elimina el riesgo: puede tropezar o desviarse hacia la calzada. Lo correcto es moderar la velocidad y separarte de él al pasar.',
        },
        {
          text: 'Moderar la velocidad, aumentar la separación lateral y estar preparado para detenerte.',
          correct: true,
        },
        {
          text: 'Poner las largas fijas apuntándole para verlo mejor mientras pasas a su lado.',
          feedback: 'Deslumbrar al peatón puede desorientarlo y hacer que invada la calzada. La clave es la anticipación: reducir la velocidad y pasar con amplia separación.',
        },
      ],
      explanation: 'Un peatón con ropa oscura de noche apenas resulta visible hasta tenerlo muy cerca. Hay que anticiparse al máximo: moderar la velocidad, ampliar la separación lateral y estar preparado para detenerse si hace un movimiento imprevisto.',
      rule: 'Art. 46 RGCir — moderación de la velocidad ante peatones y circunstancias de la vía.',
    },

    {
      id: 'niebla-ligera-trasera-no',
      tag: 'Cond. adversas',
      title: 'Niebla poco intensa: ¿antiniebla trasera?',
      playerStart: 45,
      playerSpeed: 7,
      triggerZ: 12,
      env: { mode: 'fog' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        return [];
      },
      question: 'Circulas de día con una niebla poco intensa que apenas reduce la visibilidad. ¿Debes llevar encendida la luz antiniebla trasera?',
      options: [
        {
          text: 'No: solo debe usarse con niebla densa, precipitación intensa u otra condición que disminuya mucho la visibilidad.',
          correct: true,
        },
        {
          text: 'Sí, siempre que haya cualquier rastro de niebla, por leve que sea.',
          feedback: 'La antiniebla trasera es muy potente y deslumbra a quien circula detrás: solo está justificada cuando la visibilidad está seriamente reducida, no con niebla ligera.',
        },
        {
          text: 'Sí, y conviene dejarla encendida también después, por si vuelve la niebla.',
          feedback: 'Mantenerla encendida sin necesidad deslumbra y molesta a los conductores que te siguen; hay que apagarla en cuanto mejora la visibilidad.',
        },
      ],
      explanation: 'La luz antiniebla trasera solo debe utilizarse cuando la visibilidad está seriamente disminuida: niebla densa, lluvia o nevada intensas, o nubes densas de polvo. Con niebla ligera su intenso haz rojo deslumbra innecesariamente a quien circula detrás.',
      rule: 'Art. 106 RGCir — utilización del alumbrado antiniebla.',
    },

    {
      id: 'drl-no-bastan-noche',
      tag: 'Alumbrado',
      title: 'Luces diurnas al caer la noche',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 12,
      env: { mode: 'dusk' },
      build(scene) {
        addRoadZ(scene, { from: -120, to: 80 });
        addDashesZ(scene, { from: -120, to: 80 });
        addCityBlocks(scene);
        addStreetlight(scene, { x: 5.2, z: 20 });
        addStreetlight(scene, { x: 5.2, z: 4 });
        addStreetlight(scene, { x: 5.2, z: -12 });
        return [];
      },
      question: 'Tu vehículo lleva luces de circulación diurna (DRL) que se encienden solas. Cae la noche: ¿basta con ellas para seguir circulando?',
      options: [
        {
          text: 'Sí, porque ya llevas una luz encendida y los demás te ven.',
          feedback: 'Las luces diurnas solo funcionan por delante: la parte trasera del vehículo queda sin alumbrado y, además, no iluminan la calzada.',
        },
        {
          text: 'Sí, siempre que circules por vías urbanas con farolas.',
          feedback: 'Tampoco en ciudad: con las DRL la trasera del vehículo va apagada y no llevas el alumbrado reglamentario. Desde el ocaso hay que encender la luz de cruce.',
        },
        {
          text: 'No: debes encender el alumbrado de cruce, porque las DRL no iluminan ni encienden las luces traseras.',
          correct: true,
        },
      ],
      explanation: 'Las luces de circulación diurna sirven solo para ser visto de día y no activan el alumbrado trasero ni el de la placa de matrícula. Desde el ocaso es obligatorio el alumbrado normal, como mínimo la luz de cruce.',
      rule: 'Art. 98 RGCir — obligación de utilizar el alumbrado entre el ocaso y la salida del sol.',
    },
  ],
};
