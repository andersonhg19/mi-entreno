/* ============================================================
   CATÁLOGO DE EJERCICIOS
   ------------------------------------------------------------
   Cada ejercicio trae:
     nombre    : nombre en español, tal como se dice en el gimnasio
     grupo     : músculo principal
     equipo    : qué máquina o implemento se necesita
     fotos     : imágenes (posición inicial y posición final)
     exacta    : true  -> la foto es exactamente ese ejercicio
                 false -> la foto es un movimiento muy parecido (referencia)
     donde     : cómo reconocer/ubicar la máquina en el gimnasio (baja visión)
     pasos     : instrucciones habladas, cortas, una acción por paso
     ojo       : advertencia de seguridad o adaptación personal
     buscar    : término para buscar el video en YouTube
   ============================================================ */

window.CATALOGO = {

  /* ---------- PIERNA ---------- */
  "sentadilla-mancuerna": {
    nombre: "Sentadilla con mancuernas", grupo: "Pierna", equipo: "Dos mancuernas", exacta: true,
    donde: "No necesitas máquina. Solo un espacio libre y dos mancuernas del mismo peso.",
    pasos: [
      "Párate con los pies separados al ancho de los hombros.",
      "Toma una mancuerna en cada mano, con los brazos colgando a los lados.",
      "Baja doblando las rodillas, como si te fueras a sentar en una silla.",
      "Baja hasta que los muslos queden casi paralelos al piso.",
      "Sube empujando con los talones hasta quedar de pie otra vez."
    ],
    ojo: "Mantén la espalda recta y la mirada al frente. Si pierdes el equilibrio, hazla al lado de una pared o del rack para apoyarte.",
    buscar: "sentadilla con mancuernas tecnica"
  },
  "prensa-atletica": {
    nombre: "Prensa atlética (leg press)", grupo: "Pierna", equipo: "Máquina de prensa inclinada", exacta: true,
    donde: "Máquina grande e inclinada donde te sientas casi acostado y empujas una plataforma con los pies. Los discos van a los lados.",
    pasos: [
      "Siéntate en la máquina con la espalda bien apoyada en el espaldar.",
      "Pon los pies en la plataforma, separados al ancho de la cadera.",
      "Quita el seguro de la máquina con las palancas de los lados.",
      "Baja la plataforma doblando las rodillas hasta formar 90 grados.",
      "Empuja con toda la planta del pie hasta estirar casi por completo las piernas."
    ],
    ojo: "No estires las rodillas de golpe ni las bloquees al final. Vuelve a poner el seguro antes de salir.",
    buscar: "prensa de piernas leg press tecnica"
  },
  "leg-extension": {
    nombre: "Leg extension (extensión de cuádriceps)", grupo: "Pierna", equipo: "Máquina de extensión", exacta: true,
    donde: "Silla con un rodillo acolchado al frente, a la altura de los tobillos.",
    pasos: [
      "Siéntate y acomoda el rodillo justo encima de los tobillos.",
      "Agárrate de las manijas laterales del asiento.",
      "Estira las piernas hacia adelante hasta quedar rectas.",
      "Aguanta un segundo arriba.",
      "Baja despacio, sin dejar caer el peso."
    ],
    ojo: "Movimiento controlado. Si sientes molestia en la rodilla, baja el peso.",
    buscar: "leg extension extension de cuadriceps"
  },
  "leg-curl": {
    nombre: "Leg curl (femoral)", grupo: "Pierna", equipo: "Máquina de femoral", exacta: true,
    donde: "Máquina parecida a la de extensión, pero el rodillo va DETRÁS de las piernas, en la parte de atrás del tobillo.",
    pasos: [
      "Acomódate en la máquina con el rodillo detrás de los tobillos.",
      "Sujétate de las manijas.",
      "Dobla las rodillas llevando los talones hacia los glúteos.",
      "Aguanta un segundo en el punto más cerrado.",
      "Regresa despacio a la posición inicial."
    ],
    ojo: "No arquees la espalda para ayudarte con el impulso.",
    buscar: "leg curl femoral maquina tecnica"
  },
  "tijeras-barra": {
    nombre: "Tijeras (zancadas) con barra", grupo: "Pierna", equipo: "Barra", exacta: true,
    donde: "Espacio libre. La barra va apoyada sobre los hombros, detrás del cuello.",
    pasos: [
      "Pon la barra sobre la parte alta de la espalda, no sobre el cuello.",
      "Da un paso largo hacia adelante con una pierna.",
      "Baja doblando las dos rodillas hasta que la de atrás casi toque el piso.",
      "Empuja con la pierna de adelante para volver a subir.",
      "Cambia de pierna y repite."
    ],
    ojo: "Este ejercicio exige equilibrio. Si te sientes inestable, hazlo sin barra o con mancuernas, cerca de una pared.",
    buscar: "zancadas con barra tecnica"
  },
  "abductor": {
    nombre: "Abductor (abrir piernas)", grupo: "Pierna", equipo: "Máquina abductora", exacta: true,
    donde: "Máquina donde te sientas y hay dos apoyos acolchados por FUERA de los muslos. Abres las piernas contra el peso.",
    pasos: [
      "Siéntate con la espalda pegada al espaldar.",
      "Pon la parte de afuera de los muslos contra los apoyos.",
      "Abre las piernas separándolas todo lo que puedas.",
      "Aguanta un segundo.",
      "Cierra despacio, sin soltar el peso de golpe."
    ],
    ojo: "Es la máquina que ABRE. Si el apoyo queda por dentro de los muslos, esa es la aductora, no es esta.",
    buscar: "maquina abductora gluteo medio"
  },
  "elevacion-talones-hack": {
    nombre: "Elevación de talones en hack", grupo: "Pantorrilla", equipo: "Máquina hack o prensa", exacta: false,
    donde: "Misma máquina de prensa o la hack. Solo apoyas la punta de los pies en el borde de la plataforma.",
    pasos: [
      "Ponte en la máquina con la punta de los pies en el borde de la plataforma.",
      "Deja que los talones bajen por debajo del borde, estirando la pantorrilla.",
      "Empuja con la punta de los pies lo más alto que puedas.",
      "Aguanta un segundo arriba.",
      "Baja despacio hasta sentir el estirón."
    ],
    ojo: "Rango completo y lento. La pantorrilla responde al recorrido, no al peso.",
    buscar: "elevacion de talones en prensa pantorrilla"
  },
  "pantorrilla-sentado": {
    nombre: "Pantorrilla sentado", grupo: "Pantorrilla", equipo: "Máquina de pantorrilla sentado", exacta: true,
    donde: "Banco bajo con dos almohadillas que se apoyan sobre los muslos, cerca de las rodillas.",
    pasos: [
      "Siéntate y pon la punta de los pies en la plataforma baja.",
      "Baja las almohadillas sobre los muslos y quita el seguro.",
      "Deja bajar los talones para estirar la pantorrilla.",
      "Sube empujando con la punta de los pies.",
      "Baja despacio y repite."
    ],
    ojo: "Recorrido completo, arriba y abajo.",
    buscar: "elevacion de talones sentado pantorrilla"
  },

  /* ---------- ESPALDA ---------- */
  "jalon-delante-abierto": {
    nombre: "Jalón al pecho, agarre abierto", grupo: "Espalda", equipo: "Polea alta con barra larga", exacta: true,
    donde: "Máquina con asiento, una almohadilla que aprieta los muslos y una barra larga colgando arriba.",
    pasos: [
      "Siéntate y ajusta la almohadilla sobre los muslos.",
      "Toma la barra con las manos MÁS ABIERTAS que los hombros, palmas hacia adelante.",
      "Saca un poco el pecho y jala la barra hasta la parte alta del pecho.",
      "Aprieta la espalda un segundo.",
      "Sube la barra despacio hasta estirar los brazos."
    ],
    ojo: "Jala hacia el pecho, nunca por detrás de la nuca.",
    buscar: "jalon al pecho agarre abierto polea"
  },
  "jalon-delante-cerrado": {
    nombre: "Jalón al pecho, agarre cerrado", grupo: "Espalda", equipo: "Polea alta con triángulo o barra corta", exacta: true,
    donde: "Misma máquina del jalón, pero con el agarre en triángulo o las manos juntas.",
    pasos: [
      "Siéntate y ajusta la almohadilla sobre los muslos.",
      "Toma el agarre con las manos JUNTAS.",
      "Jala hacia la parte alta del pecho, llevando los codos pegados al cuerpo.",
      "Aprieta un segundo.",
      "Sube despacio hasta estirar."
    ],
    ojo: "Codos cerca del cuerpo. El pecho va al frente.",
    buscar: "jalon al pecho agarre cerrado"
  },
  "remo-sentado-polea": {
    nombre: "Remo sentado en polea", grupo: "Espalda", equipo: "Polea baja con triángulo", exacta: true,
    donde: "Estación baja con un asiento largo y dos apoyos para los pies al frente.",
    pasos: [
      "Siéntate y apoya los pies en las plataformas.",
      "Toma el triángulo con las dos manos y estira los brazos.",
      "Con la espalda recta, jala el triángulo hasta el ombligo.",
      "Junta los omóplatos y aguanta un segundo.",
      "Estira los brazos despacio."
    ],
    ojo: "No te tumbes hacia atrás. El movimiento lo hacen los brazos y la espalda, no la cintura.",
    buscar: "remo sentado en polea tecnica"
  },
  "remo-al-pecho": {
    nombre: "Remo al pecho con barra", grupo: "Espalda", equipo: "Barra", exacta: true,
    donde: "Espacio libre con una barra cargada en el piso.",
    pasos: [
      "Párate con los pies al ancho de la cadera y la barra al frente.",
      "Dobla un poco las rodillas e inclina el tronco hacia adelante, espalda recta.",
      "Toma la barra con las dos manos, palmas hacia abajo.",
      "Jala la barra hacia la parte baja del pecho.",
      "Baja despacio hasta estirar los brazos."
    ],
    ojo: "Nunca redondees la espalda. Si te cuesta el equilibrio, pídelo con mancuernas apoyando una mano en el banco.",
    buscar: "remo con barra tecnica espalda"
  },
  "dominadas": {
    nombre: "Dominadas", grupo: "Espalda", equipo: "Barra fija o máquina asistida", exacta: true,
    donde: "Barra fija arriba. Si hay máquina asistida, es la que tiene una rodillera o plataforma donde te apoyas.",
    pasos: [
      "Toma la barra con las manos un poco más abiertas que los hombros.",
      "Cuelga con los brazos estirados.",
      "Jala tu cuerpo hacia arriba hasta pasar la barbilla por encima de la barra.",
      "Baja despacio y controlado.",
      "Repite sin balancearte."
    ],
    ojo: "Si no salen completas, usa la máquina asistida o pide al entrenador que te ayude empujando los pies.",
    buscar: "dominadas tecnica principiantes"
  },
  "hiperextensiones": {
    nombre: "Hiperextensiones (lumbares)", grupo: "Lumbar", equipo: "Banco romano", exacta: true,
    donde: "Banco inclinado con dos rodillos para trabar los tobillos y una almohadilla para la cadera.",
    pasos: [
      "Acomódate boca abajo, con la cadera sobre la almohadilla y los pies trabados.",
      "Cruza los brazos sobre el pecho.",
      "Baja el tronco doblando la cintura, despacio.",
      "Sube hasta que el cuerpo quede en línea recta.",
      "No pases de la línea recta hacia atrás."
    ],
    ojo: "Sin peso al principio. Movimiento lento; si sientes mareo por bajar la cabeza, hazlo con menos recorrido.",
    buscar: "hiperextensiones lumbares banco romano"
  },

  /* ---------- PECHO ---------- */
  "peck-deck": {
    nombre: "Peck deck (contractora)", grupo: "Pecho", equipo: "Máquina contractora", exacta: true,
    donde: "Máquina con asiento y dos brazos con almohadillas verticales a los lados, que se juntan al frente.",
    pasos: [
      "Siéntate con la espalda pegada al espaldar.",
      "Apoya los antebrazos en las almohadillas, codos a la altura de los hombros.",
      "Junta los brazos al frente hasta que casi se toquen.",
      "Aprieta el pecho un segundo.",
      "Abre despacio hasta sentir el estirón."
    ],
    ojo: "No abras más allá de lo cómodo para el hombro.",
    buscar: "peck deck contractora de pecho"
  },
  "press-banca": {
    nombre: "Press banca con barra", grupo: "Pecho", equipo: "Banco plano y barra", exacta: true,
    donde: "Banco plano con dos soportes en forma de gancho donde descansa la barra.",
    pasos: [
      "Acuéstate en el banco con los ojos debajo de la barra.",
      "Toma la barra un poco más abierto que los hombros.",
      "Saca la barra de los ganchos y llévala sobre el pecho.",
      "Baja la barra despacio hasta rozar la mitad del pecho.",
      "Empuja hacia arriba hasta estirar los brazos."
    ],
    ojo: "Siempre con alguien que te cuide o con los seguros puestos. Nunca sueltes la barra de golpe.",
    buscar: "press de banca tecnica correcta"
  },
  "press-inclinado": {
    nombre: "Press inclinado con barra", grupo: "Pecho", equipo: "Banco inclinado y barra", exacta: true,
    donde: "Igual al press banca, pero el espaldar está levantado unos 30 a 45 grados.",
    pasos: [
      "Acuéstate en el banco inclinado.",
      "Toma la barra un poco más abierto que los hombros.",
      "Sácala de los ganchos y llévala sobre la parte alta del pecho.",
      "Baja despacio hasta rozar el pecho, cerca de las clavículas.",
      "Empuja hacia arriba hasta estirar."
    ],
    ojo: "Pide que te cuiden. Baja el peso frente al press plano.",
    buscar: "press inclinado con barra tecnica"
  },
  "press-mancuerna": {
    nombre: "Press de pecho con mancuernas", grupo: "Pecho", equipo: "Banco plano y mancuernas", exacta: true,
    donde: "Banco plano y dos mancuernas iguales.",
    pasos: [
      "Siéntate en la punta del banco con una mancuerna sobre cada muslo.",
      "Acuéstate empujando las mancuernas con los muslos hasta el pecho.",
      "Sube las dos mancuernas hasta estirar los brazos sobre el pecho.",
      "Baja despacio hasta que los codos queden a la altura del pecho.",
      "Empuja de nuevo hacia arriba."
    ],
    ojo: "Para terminar, baja las mancuernas a los muslos y siéntate; no las sueltes hacia atrás.",
    buscar: "press de pecho con mancuernas tecnica"
  },
  "press-inclinado-mancuerna": {
    nombre: "Press inclinado con mancuernas", grupo: "Pecho", equipo: "Banco inclinado y mancuernas", exacta: true,
    donde: "Banco con espaldar levantado 30 a 45 grados, con dos mancuernas.",
    pasos: [
      "Siéntate en el banco inclinado con una mancuerna en cada muslo.",
      "Recuéstate llevando las mancuernas a la altura del pecho.",
      "Empuja hacia arriba hasta estirar los brazos.",
      "Baja despacio hasta la altura del pecho alto.",
      "Repite con control."
    ],
    ojo: "Muñecas firmes y codos ligeramente por dentro, no abiertos del todo.",
    buscar: "press inclinado con mancuernas"
  },
  "fondo-de-pecho": {
    nombre: "Fondos de pecho", grupo: "Pecho", equipo: "Barras paralelas", exacta: true,
    donde: "Dos barras paralelas a la altura de la cadera, o la máquina asistida de fondos.",
    pasos: [
      "Súbete y sostente con los brazos estirados sobre las barras.",
      "Inclina un poco el tronco hacia adelante.",
      "Baja doblando los codos hasta sentir el pecho estirado.",
      "Empuja hacia arriba hasta estirar los brazos.",
      "No bajes más de lo cómodo para el hombro."
    ],
    ojo: "Si no sale completo, usa la máquina asistida.",
    buscar: "fondos en paralelas para pecho"
  },

  /* ---------- TRÍCEPS ---------- */
  "triceps-copa": {
    nombre: "Tríceps copa (extensión sobre la cabeza)", grupo: "Tríceps", equipo: "Una mancuerna", exacta: true,
    donde: "Una sola mancuerna, tomada por el disco con las dos manos, como una copa.",
    pasos: [
      "Toma la mancuerna con las dos manos, agarrando el disco de arriba.",
      "Súbela por encima de la cabeza con los brazos estirados.",
      "Baja la mancuerna por detrás de la nuca doblando solo los codos.",
      "Los codos apuntan al frente y no se abren.",
      "Sube hasta estirar los brazos otra vez."
    ],
    ojo: "Empieza con poco peso; se hace detrás de la cabeza y hay que controlarla bien.",
    buscar: "extension de triceps sobre la cabeza mancuerna"
  },
  "push-down": {
    nombre: "Push down en polea", grupo: "Tríceps", equipo: "Polea alta con barra o cuerda", exacta: true,
    donde: "Polea alta. Se le pone una barra corta recta o una cuerda.",
    pasos: [
      "Párate frente a la polea y toma la barra con las palmas hacia abajo.",
      "Pega los codos a los costados del cuerpo.",
      "Empuja la barra hacia abajo hasta estirar los brazos.",
      "Aprieta el tríceps un segundo.",
      "Sube despacio sin despegar los codos."
    ],
    ojo: "Los codos no se mueven de los costados. El tronco queda quieto.",
    buscar: "push down triceps en polea"
  },
  "extension-mancuerna": {
    nombre: "Extensión de tríceps con mancuerna", grupo: "Tríceps", equipo: "Una mancuerna y banco", exacta: true,
    donde: "Banco con espaldar. Una sola mancuerna.",
    pasos: [
      "Siéntate con la espalda apoyada en el espaldar.",
      "Sube la mancuerna por encima de la cabeza con las dos manos.",
      "Baja doblando los codos hasta detrás de la nuca.",
      "Mantén los codos apuntando hacia arriba.",
      "Estira los brazos de nuevo."
    ],
    ojo: "Movimiento lento; cuidado al llevarla detrás de la cabeza.",
    buscar: "extension de triceps sentado con mancuerna"
  },
  "press-frances": {
    nombre: "Press francés", grupo: "Tríceps", equipo: "Barra Z y banco plano", exacta: true,
    donde: "Banco plano y una barra en zigzag (barra Z).",
    pasos: [
      "Acuéstate en el banco con la barra Z sobre el pecho.",
      "Sube la barra hasta estirar los brazos, perpendicular al piso.",
      "Baja la barra doblando solo los codos, hacia la frente.",
      "Los brazos de arriba quedan quietos.",
      "Estira los codos para subir."
    ],
    ojo: "Peso moderado. Si sientes molestia en el codo, cambia por push down.",
    buscar: "press frances triceps barra z"
  },
  "banco-triceps": {
    nombre: "Fondos de tríceps en banco", grupo: "Tríceps", equipo: "Un banco", exacta: true,
    donde: "Un banco plano cualquiera. Te sientas en el borde y te sostienes con las manos.",
    pasos: [
      "Siéntate en el borde del banco y apoya las manos a los lados de la cadera.",
      "Adelanta la cadera hasta quedar suspendido, con los pies apoyados en el piso.",
      "Baja doblando los codos hacia atrás.",
      "Baja hasta que los codos formen 90 grados.",
      "Empuja para subir hasta estirar los brazos."
    ],
    ojo: "Si molesta el hombro, baja menos. Con las rodillas dobladas es más fácil.",
    buscar: "fondos de triceps en banco"
  },

  /* ---------- HOMBROS ---------- */
  "press-militar-maquina": {
    nombre: "Press militar en máquina", grupo: "Hombros", equipo: "Máquina de press de hombro", exacta: true,
    donde: "Asiento con espaldar vertical y dos manijas a la altura de los hombros que se empujan hacia arriba.",
    pasos: [
      "Siéntate con la espalda pegada al espaldar.",
      "Ajusta el asiento para que las manijas queden a la altura de los hombros.",
      "Toma las manijas con las palmas al frente.",
      "Empuja hacia arriba hasta casi estirar los brazos.",
      "Baja despacio hasta la altura de los hombros."
    ],
    ojo: "No bloquees los codos arriba ni bajes más allá de los hombros.",
    buscar: "press militar en maquina hombro"
  },
  "laterales": {
    nombre: "Elevaciones laterales", grupo: "Hombros", equipo: "Dos mancuernas livianas", exacta: true,
    donde: "Espacio libre y dos mancuernas livianas.",
    pasos: [
      "Párate con una mancuerna en cada mano, a los lados del cuerpo.",
      "Con los codos un poco doblados, sube los brazos hacia los lados.",
      "Sube solo hasta la altura de los hombros.",
      "Aguanta un segundo.",
      "Baja despacio."
    ],
    ojo: "Peso liviano. Si tienes que impulsarte con el cuerpo, está muy pesado.",
    buscar: "elevaciones laterales hombro tecnica"
  },
  "frontales": {
    nombre: "Elevaciones frontales", grupo: "Hombros", equipo: "Dos mancuernas livianas", exacta: true,
    donde: "Espacio libre y dos mancuernas livianas.",
    pasos: [
      "Párate con las mancuernas al frente de los muslos, palmas hacia el cuerpo.",
      "Sube un brazo estirado hacia el frente hasta la altura del hombro.",
      "Baja despacio.",
      "Repite con el otro brazo.",
      "Puedes alternar o subir los dos a la vez."
    ],
    ojo: "No pases de la altura del hombro ni te balancees.",
    buscar: "elevaciones frontales hombro mancuernas"
  },
  "press-militar-mancuerna": {
    nombre: "Press militar con mancuernas", grupo: "Hombros", equipo: "Dos mancuernas y banco con espaldar", exacta: true,
    donde: "Banco con espaldar vertical y dos mancuernas.",
    pasos: [
      "Siéntate con la espalda apoyada y una mancuerna en cada mano.",
      "Sube las mancuernas a la altura de las orejas, palmas al frente.",
      "Empuja hacia arriba hasta casi estirar los brazos.",
      "Baja despacio hasta la altura de las orejas.",
      "Repite con control."
    ],
    ojo: "No arquees la espalda baja. Si te cuesta, apoya bien la zona lumbar en el espaldar.",
    buscar: "press militar con mancuernas sentado"
  },
  "vuelo-trx": {
    nombre: "Vuelo posterior en TRX", grupo: "Hombros", equipo: "TRX (cintas colgantes)", exacta: false,
    donde: "Las cintas negras con manijas amarillas que cuelgan de un anclaje alto.",
    pasos: [
      "Toma una manija en cada mano y camina hacia atrás inclinando el cuerpo.",
      "Empieza con los brazos estirados al frente.",
      "Abre los brazos hacia los lados, como si fueras a volar.",
      "Junta los omóplatos arriba.",
      "Vuelve despacio a la posición del principio."
    ],
    ojo: "Entre más inclinado estés, más pesado es. Empieza casi de pie.",
    buscar: "TRX reverse fly vuelo posterior"
  },
  "lazo-hombro": {
    nombre: "Lazo (cuerdas de batalla)", grupo: "Hombros", equipo: "Cuerdas gruesas ancladas", exacta: true,
    donde: "Dos cuerdas gruesas ancladas a una columna o argolla en el piso.",
    pasos: [
      "Toma una punta de la cuerda en cada mano.",
      "Párate con las rodillas un poco dobladas y el tronco firme.",
      "Sube y baja los brazos alternados, haciendo olas con la cuerda.",
      "Mantén el ritmo constante.",
      "Respira sin parar durante todo el tiempo."
    ],
    ojo: "Es trabajo de tiempo, no de repeticiones. Empieza con tandas de 20 a 30 segundos.",
    buscar: "cuerdas de batalla battle ropes principiantes"
  },

  /* ---------- BÍCEPS ---------- */
  "curl-barra": {
    nombre: "Curl de bíceps con barra", grupo: "Bíceps", equipo: "Barra recta o barra Z", exacta: true,
    donde: "Espacio libre con una barra cargada.",
    pasos: [
      "Párate con los pies al ancho de la cadera.",
      "Toma la barra con las palmas hacia arriba, al ancho de los hombros.",
      "Con los codos pegados al cuerpo, sube la barra hasta el pecho.",
      "Aprieta un segundo.",
      "Baja despacio hasta estirar los brazos."
    ],
    ojo: "El cuerpo no se balancea. Solo se doblan los codos.",
    buscar: "curl de biceps con barra tecnica"
  },
  "curl-polea": {
    nombre: "Curl de bíceps en polea", grupo: "Bíceps", equipo: "Polea baja con barra", exacta: true,
    donde: "Polea baja, con una barra corta enganchada abajo.",
    pasos: [
      "Párate frente a la polea y toma la barra con las palmas hacia arriba.",
      "Pega los codos a los costados.",
      "Sube la barra hasta el pecho doblando los codos.",
      "Aprieta un segundo.",
      "Baja despacio sin soltar la tensión."
    ],
    ojo: "La polea mantiene tensión todo el recorrido: no hace falta mucho peso.",
    buscar: "curl de biceps en polea baja"
  },
  "curl-mancuerna-alternado": {
    nombre: "Curl alternado con mancuernas", grupo: "Bíceps", equipo: "Dos mancuernas", exacta: true,
    donde: "Espacio libre y dos mancuernas.",
    pasos: [
      "Párate con una mancuerna en cada mano, brazos estirados a los lados.",
      "Sube una mancuerna doblando el codo, girando la palma hacia arriba.",
      "Aprieta arriba un segundo.",
      "Baja despacio.",
      "Repite con el otro brazo."
    ],
    ojo: "Un brazo a la vez, sin impulso del tronco.",
    buscar: "curl alternado con mancuernas"
  },
  "predicador-maquina": {
    nombre: "Predicador en máquina (banco Scott)", grupo: "Bíceps", equipo: "Máquina o banco predicador", exacta: true,
    donde: "Banco con una tabla inclinada donde se apoyan los brazos por encima del codo.",
    pasos: [
      "Siéntate y apoya la parte de atrás de los brazos en la tabla inclinada.",
      "Toma la barra o las manijas con las palmas hacia arriba.",
      "Sube doblando los codos hasta arriba.",
      "Aprieta un segundo.",
      "Baja despacio, SIN estirar del todo de golpe."
    ],
    ojo: "Al final de la serie no sueltes el peso de golpe: puede tironear el codo.",
    buscar: "curl predicador banco scott maquina"
  },
  "biceps-trx": {
    nombre: "Curl de bíceps en TRX", grupo: "Bíceps", equipo: "TRX (cintas colgantes)", exacta: false,
    donde: "Las cintas colgantes con manijas.",
    pasos: [
      "Toma una manija en cada mano, palmas hacia arriba.",
      "Camina hacia atrás e inclina el cuerpo, brazos estirados.",
      "Dobla los codos llevando las manos hacia la frente.",
      "Los codos quedan quietos y en alto.",
      "Estira despacio para volver."
    ],
    ojo: "Entre más inclinado, más difícil. Ajusta la inclinación al empezar.",
    buscar: "TRX biceps curl tecnica"
  },

  /* ---------- ABDOMEN ---------- */
  "elevacion-tronco-maquina": {
    nombre: "Elevación de tronco 90° en máquina", grupo: "Abdomen", equipo: "Máquina abdominal", exacta: true,
    donde: "Máquina con asiento y una almohadilla sobre el pecho o unas manijas arriba; el movimiento es doblar el tronco hacia adelante.",
    pasos: [
      "Siéntate y ajusta el respaldo y el peso.",
      "Sujeta las manijas o pon el pecho contra la almohadilla.",
      "Dobla el tronco hacia adelante, encogiendo el abdomen.",
      "Aguanta un segundo apretando.",
      "Regresa despacio sin soltar el peso."
    ],
    ojo: "El movimiento sale del abdomen, no de jalar con los brazos.",
    buscar: "maquina de abdominales crunch tecnica"
  },
  "levantamiento-pierna-piso": {
    nombre: "Levantamiento de piernas en el piso", grupo: "Abdomen", equipo: "Colchoneta", exacta: false,
    donde: "Una colchoneta en el piso.",
    pasos: [
      "Acuéstate boca arriba con las manos debajo de los glúteos.",
      "Estira las piernas juntas.",
      "Sube las piernas hasta que queden verticales.",
      "Baja despacio sin dejar que los talones toquen el piso.",
      "Repite manteniendo la espalda baja pegada al piso."
    ],
    ojo: "Si la espalda baja se despega o duele, sube las piernas con las rodillas dobladas.",
    buscar: "elevacion de piernas acostado abdominales"
  },
  "plancha-bosu": {
    nombre: "Plancha sobre BOSU", grupo: "Abdomen", equipo: "BOSU (media pelota)", exacta: false,
    donde: "La media pelota azul con base plana. Se usa con la parte redonda hacia arriba o hacia abajo.",
    pasos: [
      "Apoya los antebrazos sobre el BOSU.",
      "Estira las piernas hacia atrás y apoya las puntas de los pies.",
      "El cuerpo queda en línea recta de la cabeza a los talones.",
      "Aprieta el abdomen y los glúteos.",
      "Aguanta el tiempo indicado respirando normal."
    ],
    ojo: "Es por tiempo, no por repeticiones. Empieza con 20 segundos. No dejes caer la cadera.",
    buscar: "plancha isometrica en bosu"
  },
  "twist-ruso": {
    nombre: "Abdominales twist ruso", grupo: "Abdomen", equipo: "Balón medicinal o disco", exacta: true,
    donde: "Colchoneta y un balón medicinal, disco liviano o mancuerna pequeña.",
    pasos: [
      "Siéntate en el piso con las rodillas dobladas y los talones apoyados.",
      "Inclina el tronco hacia atrás hasta sentir el abdomen.",
      "Sostén el peso con las dos manos frente al pecho.",
      "Gira el tronco hacia un lado y toca el piso al lado de la cadera.",
      "Gira al otro lado. Eso es una repetición."
    ],
    ojo: "Gira el tronco, no solo los brazos. Espalda recta.",
    buscar: "russian twist abdominales tecnica"
  },
  "abdominales-suelo": {
    nombre: "Abdominales en el suelo", grupo: "Abdomen", equipo: "Colchoneta", exacta: true,
    donde: "Una colchoneta en el piso.",
    pasos: [
      "Acuéstate boca arriba con las rodillas dobladas y los pies apoyados.",
      "Pon las manos a los lados de la cabeza, sin jalar el cuello.",
      "Despega los hombros del piso encogiendo el abdomen.",
      "Aguanta un segundo arriba.",
      "Baja despacio."
    ],
    ojo: "No jales la cabeza con las manos. La mirada va al techo.",
    buscar: "abdominales crunch tecnica correcta"
  },

  /* ---------- GLÚTEOS ---------- */
  "levantamiento-atras-polea": {
    nombre: "Levantamiento de pierna atrás en polea", grupo: "Glúteos", equipo: "Polea baja con tobillera", exacta: false,
    donde: "Polea baja con una tobillera (correa acolchada que se pone en el tobillo).",
    pasos: [
      "Ponte la tobillera en un tobillo y engánchala a la polea baja.",
      "Párate de frente a la máquina y agárrate del marco.",
      "Lleva la pierna hacia atrás, estirada, apretando el glúteo.",
      "Aguanta un segundo atrás.",
      "Regresa despacio sin soltar la tensión."
    ],
    ojo: "El tronco queda firme. Agárrate bien de la máquina para no perder el equilibrio.",
    buscar: "patada de gluteo en polea tecnica"
  },
  "gluteo-polea": {
    nombre: "Glúteo con polea", grupo: "Glúteos", equipo: "Polea baja con tobillera", exacta: true,
    donde: "Polea baja con tobillera. Misma estación del ejercicio anterior.",
    pasos: [
      "Ponte la tobillera y engánchala a la polea baja.",
      "Párate de frente a la máquina, agarrado del marco.",
      "Con la rodilla ligeramente doblada, lleva la pierna hacia atrás y arriba.",
      "Aprieta el glúteo un segundo.",
      "Vuelve despacio a la posición inicial."
    ],
    ojo: "Sin arquear la espalda baja. El recorrido es corto y controlado.",
    buscar: "gluteo en polea baja kickback"
  },
  "gluteo-pesa-rusa": {
    nombre: "Sentadilla con pesa rusa (kettlebell)", grupo: "Glúteos", equipo: "Pesa rusa (kettlebell)", exacta: true,
    donde: "La pesa con forma de bola y manija arriba.",
    pasos: [
      "Toma la pesa rusa con las dos manos, a la altura del pecho.",
      "Párate con los pies un poco más abiertos que los hombros.",
      "Baja en sentadilla manteniendo el pecho arriba.",
      "Baja hasta donde puedas sin redondear la espalda.",
      "Sube empujando con los talones y apretando los glúteos."
    ],
    ojo: "Tener el peso adelante ayuda al equilibrio: es más segura que la sentadilla con barra.",
    buscar: "goblet squat con kettlebell tecnica"
  },
  "sentadilla-patada-lateral": {
    nombre: "Sentadilla con patada lateral", grupo: "Glúteos", equipo: "Banda elástica", exacta: false,
    donde: "Una banda elástica puesta alrededor de los muslos o los tobillos.",
    pasos: [
      "Ponte la banda alrededor de los muslos, arriba de las rodillas.",
      "Baja en sentadilla con los pies al ancho de los hombros.",
      "Sube a la posición de pie.",
      "Al subir, abre una pierna hacia el lado contra la banda.",
      "Regresa y repite alternando el lado."
    ],
    ojo: "Si el equilibrio falla, hazlo apoyando una mano en la pared o en una máquina.",
    buscar: "sentadilla con patada lateral banda"
  },

  /* ---------- FUNCIONALES ---------- */
  "trx-sentadilla-profunda": {
    nombre: "TRX sentadilla profunda", grupo: "Pierna", equipo: "TRX (cintas colgantes)", exacta: false,
    donde: "Cintas colgantes con manijas ancladas arriba.",
    pasos: [
      "Toma una manija en cada mano y estira los brazos al frente.",
      "Párate con los pies al ancho de los hombros.",
      "Baja en sentadilla lo más profundo que puedas, dejando que las cintas te sostengan.",
      "El pecho se mantiene arriba y la espalda recta.",
      "Sube jalando un poco de las cintas y empujando con los talones."
    ],
    ojo: "Este es el ejercicio ideal si te cuesta el equilibrio: las cintas te sostienen.",
    buscar: "TRX squat sentadilla profunda"
  },
  "trx-abductor": {
    nombre: "TRX abductor", grupo: "Pierna", equipo: "TRX (cintas colgantes)", exacta: false,
    donde: "Cintas colgantes con manijas.",
    pasos: [
      "Toma las manijas con las dos manos y estira los brazos al frente.",
      "Abre las piernas más allá del ancho de los hombros.",
      "Baja el peso del cuerpo hacia un lado, doblando esa rodilla.",
      "La otra pierna queda estirada, sintiendo la parte interna del muslo.",
      "Vuelve al centro y cambia de lado."
    ],
    ojo: "Las cintas te dan estabilidad. No fuerces la apertura.",
    buscar: "TRX lateral lunge abductor"
  },
  "sentadilla-iso": {
    nombre: "Sentadilla isométrica (aguantada)", grupo: "Pierna", equipo: "BOSU o pared", exacta: false,
    donde: "El BOSU (media pelota) o simplemente una pared lisa.",
    pasos: [
      "Párate sobre el BOSU o con la espalda apoyada en la pared.",
      "Baja hasta que las rodillas queden en 90 grados.",
      "Quédate quieto en esa posición.",
      "Mantén la espalda recta y el abdomen apretado.",
      "Aguanta el tiempo indicado y sube."
    ],
    ojo: "Es aguantar, no repetir. Empieza con 20 segundos. Sobre el BOSU exige equilibrio; contra la pared es más seguro.",
    buscar: "sentadilla isometrica pared wall sit"
  },
  "elevacion-rodilla": {
    nombre: "Elevación de rodilla", grupo: "Pierna", equipo: "BOSU o step", exacta: false,
    donde: "El BOSU con la parte plana hacia arriba, o un escalón bajo.",
    pasos: [
      "Párate sobre el BOSU o el step con los dos pies.",
      "Sube una rodilla hacia el pecho.",
      "Aguanta un segundo manteniendo el equilibrio.",
      "Baja el pie con control.",
      "Repite con la otra pierna."
    ],
    ojo: "Si el equilibrio falla, hazlo en el piso plano o apoyando una mano en la pared.",
    buscar: "elevacion de rodillas equilibrio bosu"
  },
  "aductor-banda": {
    nombre: "Aductor con banda", grupo: "Pierna", equipo: "Banda elástica", exacta: true,
    donde: "Banda elástica anclada a un punto fijo bajo, o una colchoneta.",
    pasos: [
      "Acuéstate de lado o ponte de pie con la banda en el tobillo.",
      "La banda jala la pierna hacia afuera.",
      "Lleva la pierna hacia adentro, cruzando la línea del cuerpo.",
      "Aprieta la parte interna del muslo.",
      "Regresa despacio."
    ],
    ojo: "Aductor es CERRAR la pierna. Abductor es abrirla.",
    buscar: "aductor con banda elastica ejercicio"
  },
  "sentadilla-dinamica": {
    nombre: "Sentadilla dinámica", grupo: "Pierna", equipo: "Peso corporal", exacta: false,
    donde: "Espacio libre en el piso.",
    pasos: [
      "Párate con los pies al ancho de los hombros.",
      "Baja en sentadilla con el pecho arriba.",
      "Sube rápido, con energía, pero SIN despegar los pies del piso.",
      "Estira las caderas arriba.",
      "Baja de nuevo con control."
    ],
    ojo: "IMPORTANTE: el entrenador escribió SIN SALTO. Sube rápido pero los pies no se despegan del piso.",
    buscar: "sentadilla dinamica sin salto"
  },
  "peso-muerto-saco": {
    nombre: "Peso muerto con saco", grupo: "Pierna", equipo: "Saco búlgaro o pesa rusa", exacta: false,
    donde: "Un saco de arena, pesa rusa o mancuerna.",
    pasos: [
      "Párate con los pies al ancho de la cadera y el peso al frente.",
      "Con la espalda recta, empuja la cadera hacia atrás.",
      "Baja el peso rozando las piernas hasta la mitad de la canilla.",
      "Sube estirando la cadera y apretando los glúteos.",
      "Termina de pie, sin echarte hacia atrás."
    ],
    ojo: "La espalda NUNCA se redondea. Si sientes la espalda baja, baja menos y usa menos peso.",
    buscar: "peso muerto tecnica espalda recta"
  },
  "salto-cajon": {
    nombre: "Salto al cajón", grupo: "Pierna", equipo: "Cajón o step", exacta: false,
    donde: "Un cajón de madera o un step de altura baja.",
    pasos: [
      "Párate frente al cajón, a un paso de distancia.",
      "SIN SALTAR: sube un pie al cajón.",
      "Sube el otro pie hasta quedar de pie encima.",
      "Baja un pie y luego el otro, con control.",
      "Repite alternando la pierna que sube primero."
    ],
    ojo: "IMPORTANTE: el entrenador escribió SIN SALTO. Se hace subiendo un pie a la vez, como un escalón.",
    buscar: "step up subir al cajon sin salto"
  },
  "trx-espalda": {
    nombre: "TRX espalda (remo suspendido)", grupo: "Espalda", equipo: "TRX (cintas colgantes)", exacta: true,
    donde: "Cintas colgantes con manijas ancladas arriba.",
    pasos: [
      "Toma una manija en cada mano, palmas enfrentadas.",
      "Camina hacia adelante e inclina el cuerpo hacia atrás, brazos estirados.",
      "El cuerpo queda en línea recta, apoyado en los talones.",
      "Jala el cuerpo hacia arriba doblando los codos, pegados al cuerpo.",
      "Baja despacio hasta estirar los brazos."
    ],
    ojo: "Entre más acostado estés, más pesado. Para hacerlo más fácil, ponte más vertical.",
    buscar: "TRX row remo suspendido tecnica"
  },
  "apertura-trx": {
    nombre: "Apertura de pecho en TRX", grupo: "Pecho", equipo: "TRX (cintas colgantes)", exacta: true,
    donde: "Cintas colgantes con manijas.",
    pasos: [
      "Toma una manija en cada mano y ponte de frente al anclaje.",
      "Inclina el cuerpo hacia adelante, brazos estirados al frente.",
      "Abre los brazos hacia los lados, bajando el pecho.",
      "Siente el estirón del pecho.",
      "Junta los brazos al frente para volver a subir."
    ],
    ojo: "Cuerpo en línea recta, sin doblar la cadera. Entre más inclinado, más difícil.",
    buscar: "TRX chest fly apertura de pecho"
  }
};
