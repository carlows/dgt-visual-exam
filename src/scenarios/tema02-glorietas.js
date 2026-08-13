import {
  addRoadZ, addRoadX, addDashesZ, addDashesX, addYieldMarks, addRoundabout,
  addCityBlocks, addSign, makeCar, addStopLine, addCrosswalk, addSemaphore,
  makeBike, makeAmbulance, makePeaton,
} from '../world.js';

// Glorieta estándar: anillo en (0,0), accesos en los cuatro puntos cardinales.
// El jugador se aproxima desde el sur (z > 0) por el carril derecho (x = 1.75).
function buildGlorietaBase(scene, { ceda = true } = {}) {
  addRoadZ(scene, { from: 12, to: 80 });
  addRoadZ(scene, { from: -80, to: -12 });
  addRoadX(scene, { from: 12, to: 80 });
  addRoadX(scene, { from: -80, to: -12 });
  addDashesZ(scene, { from: 15, to: 80 });
  addDashesZ(scene, { from: -80, to: -15 });
  addDashesX(scene, { from: 15, to: 80 });
  addDashesX(scene, { from: -80, to: -15 });
  addRoundabout(scene);
  if (ceda) {
    addYieldMarks(scene, { z: 13 });
    addSign(scene, 'ceda', { x: 4.4, z: 14 });
  }
  addCityBlocks(scene, { avoid: 20 });
}

export const TEMA = {
  id: 'glorietas',
  title: 'Glorietas',
  scenarios: [
    {
      id: 'glorieta-entrada',
      tag: 'Glorietas',
      title: 'Entrada a una glorieta',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        // Accesos a la glorieta en los cuatro puntos cardinales
        addRoadZ(scene, { from: 12, to: 80 });
        addRoadZ(scene, { from: -80, to: -12 });
        addRoadX(scene, { from: 12, to: 80 });
        addRoadX(scene, { from: -80, to: -12 });
        addDashesZ(scene, { from: 15, to: 80 });
        addDashesZ(scene, { from: -80, to: -15 });
        addDashesX(scene, { from: 15, to: 80 });
        addDashesX(scene, { from: -80, to: -15 });
        addRoundabout(scene);
        addYieldMarks(scene, { z: 13 });
        addSign(scene, 'ceda', { x: 4.4, z: 14 });
        addCityBlocks(scene, { avoid: 20 });

        const npc = makeCar(0x4a7fd4);
        scene.add(npc);
        // Circula por el anillo, se aproxima a tu entrada desde la izquierda
        return [{ mesh: npc, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.62, angSpeed: -0.35 } }];
      },
      question: 'Vas a entrar en una glorieta y un turismo circula ya por ella, aproximándose a tu entrada. ¿Qué debes hacer?',
      options: [
        {
          text: 'Cederle el paso: los vehículos que circulan por la glorieta tienen prioridad.',
          correct: true,
        },
        {
          text: 'Entrar tú primero, porque llegas por su derecha.',
          feedback: 'La norma de la derecha no se aplica: la entrada está regulada por el ceda el paso, y dentro del anillo la prioridad es de quien ya circula por él.',
        },
        {
          text: 'Acelerar para incorporarte antes de que llegue.',
          feedback: 'Forzar la entrada obliga a frenar a quien tiene prioridad: maniobra peligrosa y sancionable.',
        },
      ],
      explanation: 'Las entradas a las glorietas están reguladas con ceda el paso: quien circula por el anillo tiene prioridad, y solo debes incorporarte cuando puedas hacerlo sin obligarle a modificar su marcha.',
      rule: 'Art. 57 RGCir y señal R-1 — prioridad en glorietas.',
    },

    {
      id: 'glorieta-anillo-libre',
      tag: 'Glorietas',
      title: 'Entrada con el anillo libre',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        return [];
      },
      question: 'Llegas al ceda el paso de una glorieta y compruebas que no circula ningún vehículo por el anillo. ¿Qué debes hacer?',
      options: [
        {
          text: 'Detenerte siempre ante la marca de ceda el paso antes de entrar.',
          feedback: 'La detención incondicional es propia del STOP. El ceda el paso solo obliga a detenerse si es necesario para ceder.',
        },
        {
          text: 'Incorporarte sin detenerte, moderando la velocidad, ya que el anillo está libre.',
          correct: true,
        },
        {
          text: 'Detenerte y esperar unos segundos por si apareciera algún vehículo.',
          feedback: 'Detenerte sin necesidad entorpece la circulación de quienes te siguen. Basta con moderar la velocidad y comprobar que puedes entrar con seguridad.',
        },
      ],
      explanation: 'La señal de ceda el paso solo obliga a detenerse cuando es preciso para ceder la prioridad. Si el anillo está despejado, puedes incorporarte sin detenerte, adecuando la velocidad.',
      rule: 'Art. 151.1 RGCir — señal R-1, ceda el paso.',
    },

    {
      id: 'glorieta-prioridad-dentro',
      tag: 'Glorietas',
      title: 'Ya circulas por el anillo',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      build(scene) {
        buildGlorietaBase(scene);
        // Turismo detenido en el acceso este, esperando para incorporarse
        const npc = makeCar(0x3f9e6b);
        npc.position.set(13, 0, -1.75);
        npc.rotation.y = Math.PI / 2; // orientado hacia el anillo (−x)
        scene.add(npc);
        return [];
      },
      question: 'Te has incorporado a la glorieta con el anillo libre y vas a pasar por delante de otra entrada, donde un turismo espera para incorporarse. ¿Quién debe ceder el paso?',
      options: [
        {
          text: 'El turismo que espera en la entrada: tú ya circulas por el anillo y mantienes la prioridad.',
          correct: true,
        },
        {
          text: 'Tú, porque el turismo se encuentra a tu derecha.',
          feedback: 'La norma de la derecha no rige en las glorietas: sus entradas están reguladas con ceda el paso a favor de quien circula por el anillo.',
        },
        {
          text: 'Ninguno: debéis alternaros en orden de llegada, como en un cruce con cremallera.',
          feedback: 'La cremallera se aplica en estrechamientos por reducción de carriles, no en las entradas de una glorieta, donde la prioridad es siempre de quien circula por el anillo.',
        },
      ],
      explanation: 'Dentro de la glorieta la prioridad es de quien circula por el anillo. Los vehículos que esperan en las demás entradas deben cederte el paso, igual que tú lo hiciste al entrar.',
      rule: 'Art. 57 RGCir y señal R-1 — prioridad en glorietas.',
    },

    {
      id: 'glorieta-senalizar-salida',
      tag: 'Glorietas',
      title: 'Señalizar la salida',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        return [];
      },
      question: 'Vas a entrar en la glorieta y abandonarla por una de sus salidas. ¿Cuándo debes señalizar con el indicador de dirección derecho?',
      options: [
        {
          text: 'Ya al entrar en la glorieta, y mantenerlo durante todo el recorrido por el anillo.',
          feedback: 'Señalizar a la derecha desde la entrada induce a error: los que esperan en las entradas intermedias creerían que vas a salir antes.',
        },
        {
          text: 'No es necesario señalizar: la salida de una glorieta no se considera maniobra.',
          feedback: 'Abandonar la glorieta es un cambio de dirección y, como toda maniobra, debe advertirse a los demás usuarios.',
        },
        {
          text: 'Con antelación suficiente, al aproximarte a la salida que vas a tomar.',
          correct: true,
        },
      ],
      explanation: 'La salida de la glorieta debe advertirse con el intermitente derecho con antelación suficiente, pero solo cuando te aproximas a la salida elegida: señalizar antes confundiría al resto de conductores.',
      rule: 'Art. 109 RGCir — advertencia de las maniobras.',
    },

    {
      id: 'glorieta-seguir-de-frente',
      tag: 'Glorietas',
      title: 'Seguir de frente (segunda salida)',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        return [];
      },
      question: 'Vas a atravesar la glorieta para seguir de frente, tomando la segunda salida. Como norma general, ¿por qué carril del anillo debes circular?',
      options: [
        {
          text: 'Por el carril interior, que es el más rápido para atravesar la glorieta.',
          feedback: 'El carril interior se reserva, en su caso, para dar más recorrido al anillo (giros a la izquierda o cambio de sentido); para seguir de frente no es la elección general.',
        },
        {
          text: 'Por el carril exterior (el de la derecha), salvo que la señalización indique otra cosa.',
          correct: true,
        },
        {
          text: 'Por cualquiera de los dos indistintamente, pues dentro del anillo no rige la norma de circular por la derecha.',
          feedback: 'También en las glorietas rige la norma general de utilizar el carril más a la derecha compatible con tu trayectoria.',
        },
      ],
      explanation: 'Como norma general se circula por el carril más a la derecha. Para seguir de frente en una glorieta, lo correcto es utilizar el carril exterior, que además evita cruzar carriles al salir.',
      rule: 'RGCir — normas de utilización de los carriles.',
    },

    {
      id: 'glorieta-cambio-sentido',
      tag: 'Glorietas',
      title: 'Cambio de sentido en glorieta',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        // Turismo circulando por el anillo (carril exterior)
        const npc = makeCar(0xb0553c);
        scene.add(npc);
        return [{ mesh: npc, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.62, angSpeed: -0.35 } }];
      },
      question: 'Utilizas la glorieta para cambiar de sentido y recorres el anillo por el carril interior. ¿Cómo debes abandonarla?',
      options: [
        {
          text: 'Incorporándote antes al carril exterior, señalizando y cediendo el paso a quien circule por él, y saliendo desde ese carril.',
          correct: true,
        },
        {
          text: 'Saliendo directamente desde el carril interior si señalizas con suficiente antelación.',
          feedback: 'Cruzar el carril exterior desde el interior corta la trayectoria de quienes circulan por él: el intermitente no otorga prioridad.',
        },
        {
          text: 'Deteniéndote en el anillo hasta que el carril exterior quede completamente vacío.',
          feedback: 'Detenerse dentro del anillo crea un peligro innecesario. Lo correcto es seguir circulando y cambiarte al exterior cuando haya un hueco seguro.',
        },
      ],
      explanation: 'La salida de una glorieta se realiza siempre desde el carril exterior. Si circulas por el interior, debes cambiarte al exterior con antelación, señalizando y cediendo el paso a quien circule por él; nunca cruzar directamente hacia la salida.',
      rule: 'Art. 74 RGCir — cambios de carril.',
    },

    {
      id: 'glorieta-peaton-salida',
      tag: 'Glorietas',
      title: 'Peatón en la salida',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 13,
      panel: 'right',
      build(scene) {
        buildGlorietaBase(scene);
        // Paso de peatones en la salida de enfrente (acceso norte)
        addCrosswalk(scene, { z: -14 });
        const ped = makePeaton({ shirt: 0xd4a24a });
        // A la congelación (t = 4 s) llega al borde del paso, a punto de cruzar
        ped.position.set(-7.6, 0, -14);
        ped.rotation.y = -Math.PI / 2; // camina hacia +x
        scene.add(ped);
        return [{ mesh: ped, vel: [1.1, 0] }];
      },
      question: 'Vas a atravesar la glorieta y tomar la salida de enfrente, donde hay un paso de peatones al que se aproxima un peatón. ¿Qué debes hacer al salir?',
      options: [
        {
          text: 'Continuar: dentro y a la salida de una glorieta los vehículos tienen preferencia sobre los peatones.',
          feedback: 'En un paso para peatones la prioridad es del peatón, también en las salidas de las glorietas.',
        },
        {
          text: 'Advertir tu paso con el claxon para que el peatón espere en la acera.',
          feedback: 'El claxon no te da prioridad ni justifica no ceder el paso en un paso para peatones señalizado.',
        },
        {
          text: 'Moderar la velocidad y detenerte si es preciso para ceder el paso al peatón.',
          correct: true,
        },
      ],
      explanation: 'En los pasos para peatones debidamente señalizados la prioridad es del peatón. Al abandonar la glorieta debes hacerlo a velocidad moderada y detenerte si es necesario para cederle el paso.',
      rule: 'Art. 65 RGCir — prioridad de paso respecto de los peatones.',
    },

    {
      id: 'glorieta-ciclista-anillo',
      tag: 'Glorietas',
      title: 'Ciclista en el anillo',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        const bici = makeBike({ shirt: 0x3f9e6b });
        scene.add(bici);
        // Circula por el anillo y se aproxima a tu entrada desde la izquierda
        return [{ mesh: bici, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.62, angSpeed: -0.35 } }];
      },
      question: 'Vas a entrar en una glorieta y un ciclista circula por el anillo, aproximándose a tu entrada. ¿Qué debes hacer?',
      options: [
        {
          text: 'Entrar primero: las bicicletas deben ceder el paso a los vehículos de motor.',
          feedback: 'La bicicleta es un vehículo y, circulando por el anillo, tiene la misma prioridad que cualquier otro.',
        },
        {
          text: 'Cederle el paso, igual que a cualquier otro vehículo que circule por el anillo.',
          correct: true,
        },
        {
          text: 'Entrar a la vez, ocupando el carril interior para no molestarle.',
          feedback: 'Incorporarte cuando el ciclista se aproxima a tu entrada le obliga a rectificar y resulta especialmente peligroso para un usuario vulnerable.',
        },
      ],
      explanation: 'El ceda el paso de la entrada rige frente a todo vehículo que circule por el anillo, incluidas las bicicletas: el ciclista mantiene la prioridad y debes esperar a poder entrar sin afectarle.',
      rule: 'Art. 57 RGCir y señal R-1 — prioridad en glorietas.',
    },

    {
      id: 'glorieta-semaforo-rojo',
      tag: 'Glorietas',
      title: 'Semáforo en la entrada',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 22,
      panel: 'left',
      build(scene) {
        buildGlorietaBase(scene, { ceda: false });
        addStopLine(scene, { z: 13 });
        addSemaphore(scene, { x: 4.4, z: 13.8, active: 'red' });
        return [];
      },
      question: 'La entrada de la glorieta está regulada por un semáforo en fase roja, y no circula ningún vehículo por el anillo. ¿Qué debes hacer?',
      options: [
        {
          text: 'Detenerte ante la línea de detención y esperar a la fase verde, aunque el anillo esté vacío.',
          correct: true,
        },
        {
          text: 'Entrar con precaución: si nadie circula por el anillo, la norma de prioridad te lo permite.',
          feedback: 'El semáforo prevalece sobre las normas de prioridad: la luz roja obliga a detenerse aunque no venga nadie.',
        },
        {
          text: 'Tratar el semáforo rojo como un ceda el paso y continuar si no viene nadie.',
          feedback: 'Solo un semáforo apagado o en ámbar intermitente devuelve la vigencia a las señales de prioridad. La luz roja fija obliga siempre a detenerse.',
        },
      ],
      explanation: 'Las señales de los semáforos prevalecen sobre las normas de prioridad y sobre las señales verticales de prioridad. La luz roja no intermitente obliga a detenerse ante la línea de detención, aunque el anillo esté libre.',
      rule: 'Art. 146 RGCir — luz roja no intermitente.',
    },

    {
      id: 'glorieta-ambulancia',
      tag: 'Glorietas',
      title: 'Ambulancia en el anillo',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        const amb = makeAmbulance();
        scene.add(amb);
        this._amb = amb;
        // Circula en servicio urgente por el anillo, hacia tu entrada
        return [{ mesh: amb, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.62, angSpeed: -0.35 } }];
      },
      tick(t) {
        if (this._amb) this._amb.userData.beacon.visible = (t % 0.5) < 0.3;
      },
      question: 'Vas a entrar en la glorieta y una ambulancia en servicio urgente, con la señal luminosa encendida, circula por el anillo hacia tu entrada. ¿Qué debes hacer?',
      options: [
        {
          text: 'Entrar rápidamente para dejarle el anillo libre cuanto antes.',
          feedback: 'Incorporarte delante de un vehículo prioritario entorpece precisamente el paso que debes facilitarle.',
        },
        {
          text: 'No entrar en el anillo y facilitarle el paso, deteniéndote si es preciso.',
          correct: true,
        },
        {
          text: 'Entrar con normalidad: en las glorietas la ambulancia no goza de prioridad especial.',
          feedback: 'Los vehículos prioritarios en servicio urgente tienen prioridad sobre los demás también en las glorietas, y además la ambulancia ya circula por el anillo.',
        },
      ],
      explanation: 'Ante un vehículo prioritario en servicio urgente debes facilitarle el paso: no entres en la glorieta y, si es preciso, detente. Además, la ambulancia ya circula por el anillo, por lo que en todo caso mantiene la prioridad.',
      rule: 'Art. 69 RGCir — comportamiento respecto de los vehículos prioritarios.',
    },

    {
      id: 'glorieta-sin-hueco',
      tag: 'Glorietas',
      title: 'Sin hueco hacia tu salida',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        // Tráfico denso en el carril exterior del anillo
        const c1 = makeCar(0x4a7fd4);
        const c2 = makeCar(0xb0553c);
        scene.add(c1, c2);
        return [
          { mesh: c1, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.27, angSpeed: -0.35 } },
          { mesh: c2, orbit: { cx: 0, cz: 0, r: 8.5, angle: 4.17, angSpeed: -0.35 } },
        ];
      },
      question: 'Circulas por el carril interior del anillo y llega tu salida, pero el tráfico del carril exterior no te deja hueco para cambiarte con seguridad. ¿Qué debes hacer?',
      options: [
        {
          text: 'Reducir mucho la velocidad o detenerte en el carril interior hasta que te dejen hueco.',
          feedback: 'Detenerse o circular muy despacio dentro del anillo crea un obstáculo peligroso para el resto del tráfico.',
        },
        {
          text: 'Continuar circulando y dar otra vuelta completa a la glorieta, para intentar la salida con seguridad.',
          correct: true,
        },
        {
          text: 'Forzar el cambio al exterior señalizando: el intermitente obliga a los demás a dejarte pasar.',
          feedback: 'El intermitente advierte la maniobra, pero no otorga prioridad: quien circula por el carril exterior la mantiene.',
        },
      ],
      explanation: 'Si al llegar tu salida no puedes incorporarte al carril exterior sin riesgo, lo seguro es seguir circulando y dar otra vuelta completa al anillo: dentro de la glorieta nunca hay que detenerse ni forzar un cambio de carril.',
      rule: 'Art. 74 RGCir — cambios de carril; RGCir — normas de prioridad.',
    },

    {
      id: 'glorieta-salida-pasada',
      tag: 'Glorietas',
      title: 'Te pasas la salida',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        const npc = makeCar(0x8a5fb0);
        scene.add(npc);
        return [{ mesh: npc, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.62, angSpeed: -0.35 } }];
      },
      question: 'Circulando por una glorieta te das cuenta de que acabas de rebasar la salida que querías tomar. ¿Qué debes hacer?',
      options: [
        {
          text: 'Seguir circulando por el anillo y dar otra vuelta hasta llegar de nuevo a tu salida.',
          correct: true,
        },
        {
          text: 'Frenar bruscamente e intentar salir todavía, si la salida no ha quedado muy atrás.',
          feedback: 'Frenar bruscamente sin causa justificada sorprende a quienes te siguen y puede provocar un alcance.',
        },
        {
          text: 'Detenerte y dar marcha atrás unos metros hasta la salida.',
          feedback: 'La marcha atrás está prohibida salvo en los casos y recorridos mínimos que permite el reglamento; nunca dentro de una glorieta.',
        },
      ],
      explanation: 'Si rebasas tu salida, lo correcto es continuar circulando y completar otra vuelta al anillo. Está prohibido frenar bruscamente sin motivo y dar marcha atrás, maniobras muy peligrosas dentro de una glorieta.',
      rule: 'Art. 80 RGCir — prohibición de la marcha atrás.',
    },

    {
      id: 'glorieta-coche-lejano',
      tag: 'Glorietas',
      title: 'Vehículo aún lejos de tu entrada',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      panel: 'right',
      build(scene) {
        buildGlorietaBase(scene);
        const npc = makeCar(0x4a7fd4);
        scene.add(npc);
        // A la congelación queda en la parte norte del anillo, lejos de tu entrada
        return [{ mesh: npc, orbit: { cx: 0, cz: 0, r: 8.5, angle: 5.97, angSpeed: -0.35 } }];
      },
      question: 'Llegas al ceda el paso de la glorieta. Un turismo circula por el anillo, pero se encuentra todavía en la parte opuesta, lejos de tu entrada. ¿Puedes incorporarte?',
      options: [
        {
          text: 'No: mientras haya cualquier vehículo dentro del anillo está prohibido entrar.',
          feedback: 'El ceda el paso no prohíbe entrar con tráfico en el anillo: solo obliga a no afectar a quien tiene prioridad.',
        },
        {
          text: 'Solo si te detienes antes completamente en la marca de ceda el paso.',
          feedback: 'El ceda el paso no exige detención si no es necesaria para ceder la prioridad.',
        },
        {
          text: 'Sí, siempre que puedas hacerlo sin obligarle a modificar su velocidad ni su trayectoria.',
          correct: true,
        },
      ],
      explanation: 'Ceder el paso significa no obligar al que tiene prioridad a modificar bruscamente su velocidad o trayectoria. Si el vehículo del anillo está lo bastante lejos, puedes incorporarte con seguridad sin necesidad de detenerte.',
      rule: 'Art. 57 RGCir — prioridad en glorietas; concepto de ceder el paso.',
    },

    {
      id: 'glorieta-senal-peligro',
      tag: 'Glorietas',
      title: 'Señal de peligro: glorieta',
      playerStart: 60,
      playerSpeed: 8,
      triggerZ: 36,
      panel: 'left',
      build(scene) {
        buildGlorietaBase(scene);
        addSign(scene, 'peligro', { x: 4.4, z: 28, glyph: 'glorieta' });
        return [];
      },
      question: 'En la aproximación a una intersección observas esta señal triangular con tres flechas en círculo. ¿Qué indica y qué debes hacer?',
      options: [
        {
          text: 'Sentido giratorio obligatorio: debes rodear inmediatamente la isleta en el sentido de las flechas.',
          feedback: 'La señal de sentido giratorio obligatorio es circular y azul (R-402). La triangular solo advierte de la proximidad de la glorieta.',
        },
        {
          text: 'Peligro por la proximidad de una glorieta: reduce la velocidad y prepárate para ceder el paso al llegar.',
          correct: true,
        },
        {
          text: 'Prioridad para ti en la próxima glorieta, por venir por la vía que tiene la señal.',
          feedback: 'Una señal de advertencia de peligro nunca otorga prioridad; en la glorieta la prioridad seguirá siendo de quien circule por el anillo.',
        },
      ],
      explanation: 'La señal P-4 advierte de la proximidad de una intersección donde la circulación es giratoria. Debes reducir la velocidad y llegar preparado para ceder el paso a quienes ya circulen por el anillo.',
      rule: 'Señal P-4 — intersección con circulación giratoria (art. 149 RGCir).',
    },

    {
      id: 'glorieta-cambio-carril',
      tag: 'Glorietas',
      title: 'Del carril interior al exterior',
      playerStart: 45,
      playerSpeed: 8,
      triggerZ: 16,
      build(scene) {
        buildGlorietaBase(scene);
        // Turismo circulando por el carril exterior del anillo
        const npc = makeCar(0x3f9e6b);
        scene.add(npc);
        return [{ mesh: npc, orbit: { cx: 0, cz: 0, r: 8.5, angle: 3.62, angSpeed: -0.35 } }];
      },
      question: 'Circulas por el carril interior del anillo y quieres pasar al exterior para preparar tu salida. Por el carril exterior circula un turismo. ¿Cómo debes hacer la maniobra?',
      options: [
        {
          text: 'Cambiarte sin señalizar: dentro del anillo los intermitentes solo se usan para salir de la glorieta.',
          feedback: 'Todo cambio de carril es una maniobra y debe señalizarse, también dentro del anillo.',
        },
        {
          text: 'Señalizar y cambiarte enseguida: al preparar la salida tienes preferencia sobre el carril exterior.',
          feedback: 'Preparar la salida no te da prioridad: en un cambio de carril siempre la mantiene quien ya circula por el carril de destino.',
        },
        {
          text: 'Señalizar el cambio con antelación y ceder el paso al turismo que circula por el carril exterior.',
          correct: true,
        },
      ],
      explanation: 'El cambio de carril dentro del anillo se rige por las normas generales: hay que advertirlo con el intermitente y ceder el paso a los vehículos que circulen por el carril que se pretende ocupar.',
      rule: 'Art. 74 RGCir — cambios de carril.',
    },
  ],
};
