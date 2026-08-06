/* ============================================================
   EJERCICIOS ALTERNATIVOS
   ------------------------------------------------------------
   Para cuando la máquina está ocupada, que en el gimnasio pasa
   constantemente.

   EL CRITERIO ES EL PATRÓN DE MOVIMIENTO, NO LA ZONA
   --------------------------------------------------
   La primera versión agrupaba por «tren superior / tren inferior /
   core». Eso es demasiado grueso y Anderson lo dijo: no basta con
   que sea tren superior, tiene que ser **realmente compatible**.

   Así clasifican los entrenadores y las apps de gimnasio serias: por
   el patrón de movimiento (empuje y tracción, horizontal y vertical;
   bisagra de cadera; dominante de rodilla; y los aislamientos por su
   acción articular). Un empuje horizontal se sustituye por otro
   empuje horizontal. Un curl femoral **no** sustituye a una prensa
   aunque los dos sean «Pierna»: son músculos contrarios.

   DOS NIVELES, PORQUE SER ESTRICTO DEJA HUECOS
   -------------------------------------------
   Con el patrón como única regla, `leg-extension` se queda sin
   alternativas: en esta rutina no hay otra extensión de rodilla. Y
   quedarse sin nada tampoco ayuda a nadie parado frente a la máquina.

     directas       Mismo patrón Y mismo músculo. Es el cambio de
                    verdad: hace lo mismo con otro aparato.
     mismoMusculo   Mismo músculo, movimiento distinto. Sirve, pero
                    no es lo mismo, y la app lo dice con esas palabras.

   TRES REGLAS QUE COMPRUEBA `validar-datos.js`
   --------------------------------------------
   1. Toda alternativa es una clave del catálogo, así que ya trae su
      ficha del gimnasio, sus fotos revisadas y sus pasos, y se abre
      de un toque.
   2. Las `directas` comparten patrón; las `mismoMusculo`, grupo.
   3. Ninguna alternativa directa comparte puesto fijo con el
      original: si la torre de poleas está ocupada, mandar a la otra
      polea no resuelve nada. Por eso `gluteo-polea` y
      `levantamiento-atras-polea` NO se ofrecen mutuamente como
      directas aunque sean el mismo patrón.

   La app además esconde las que ya están en tu rutina de ese día.
   ============================================================ */

/* Patrón de movimiento de cada ejercicio. Lo que decide qué puede
   sustituir a qué. */
window.PATRONES = {
  /* --- empuje horizontal (pecho) --- */
  "press-banca": "pecho-empuje",
  "press-inclinado": "pecho-empuje",
  "press-mancuerna": "pecho-empuje",
  "press-inclinado-mancuerna": "pecho-empuje",
  "fondo-de-pecho": "pecho-empuje",
  "peck-deck": "pecho-apertura",
  "apertura-trx": "pecho-apertura",

  /* --- tracción vertical y horizontal (espalda) --- */
  "jalon-delante-abierto": "espalda-jalon",
  "jalon-delante-cerrado": "espalda-jalon",
  "dominadas": "espalda-jalon",
  "remo-sentado-polea": "espalda-remo",
  "remo-al-pecho": "espalda-remo",
  "trx-espalda": "espalda-remo",

  /* --- empuje vertical y aislamientos de hombro --- */
  "press-militar-maquina": "hombro-press",
  "press-militar-mancuerna": "hombro-press",
  "laterales": "hombro-lateral",
  "frontales": "hombro-frontal",
  "lazo-hombro": "hombro-frontal",
  "vuelo-trx": "hombro-posterior",

  /* --- brazo --- */
  "triceps-copa": "triceps-extension",
  "push-down": "triceps-extension",
  "extension-mancuerna": "triceps-extension",
  "press-frances": "triceps-extension",
  "banco-triceps": "triceps-fondo",
  "curl-barra": "biceps-curl",
  "curl-polea": "biceps-curl",
  "curl-mancuerna-alternado": "biceps-curl",
  "predicador-maquina": "biceps-curl",
  "biceps-trx": "biceps-curl",

  /* --- dominante de rodilla --- */
  "sentadilla-mancuerna": "rodilla-sentadilla",
  "prensa-atletica": "rodilla-sentadilla",
  "trx-sentadilla-profunda": "rodilla-sentadilla",
  "sentadilla-iso": "rodilla-sentadilla",
  "sentadilla-dinamica": "rodilla-sentadilla",
  "tijeras-barra": "rodilla-zancada",
  "elevacion-rodilla": "rodilla-zancada",
  "salto-cajon": "rodilla-zancada",
  "leg-extension": "rodilla-extension",

  /* --- dominante de cadera --- */
  "leg-curl": "femoral-flexion",
  "peso-muerto-saco": "cadera-bisagra",
  "hiperextensiones": "cadera-bisagra",
  "gluteo-pesa-rusa": "cadera-bisagra",
  "levantamiento-atras-polea": "cadera-extension",
  "gluteo-polea": "cadera-extension",
  "abductor": "cadera-abduccion",
  "trx-abductor": "cadera-abduccion",
  "sentadilla-patada-lateral": "cadera-abduccion",
  "aductor-banda": "cadera-aduccion",

  /* --- pantorrilla --- */
  "elevacion-talones-hack": "pantorrilla",
  "pantorrilla-sentado": "pantorrilla",

  /* --- core, separado por acción: flexionar, sostener y rotar no
         son lo mismo --- */
  "elevacion-tronco-maquina": "core-flexion",
  "abdominales-suelo": "core-flexion",
  "levantamiento-pierna-piso": "core-piernas",
  "plancha-bosu": "core-antiextension",
  "twist-ruso": "core-rotacion"
};

window.ALTERNATIVAS = {

  /* ---------- PECHO ---------- */
  "press-banca": {
    directas: ["press-mancuerna", "fondo-de-pecho", "press-inclinado"],
    mismoMusculo: ["peck-deck", "apertura-trx"] },
  "press-inclinado": {
    directas: ["press-inclinado-mancuerna", "press-banca", "press-mancuerna", "fondo-de-pecho"],
    mismoMusculo: ["peck-deck"] },
  "press-mancuerna": {
    directas: ["press-banca", "fondo-de-pecho", "press-inclinado-mancuerna"],
    mismoMusculo: ["peck-deck", "apertura-trx"] },
  "press-inclinado-mancuerna": {
    directas: ["press-inclinado", "press-mancuerna", "fondo-de-pecho"],
    mismoMusculo: ["peck-deck"] },
  "fondo-de-pecho": {
    directas: ["press-mancuerna", "press-banca", "press-inclinado"],
    mismoMusculo: ["peck-deck", "apertura-trx"] },
  "peck-deck": {
    directas: ["apertura-trx"],
    mismoMusculo: ["press-mancuerna", "fondo-de-pecho", "press-banca"] },
  "apertura-trx": {
    directas: ["peck-deck"],
    mismoMusculo: ["press-mancuerna", "fondo-de-pecho"] },

  /* ---------- ESPALDA ---------- */
  "jalon-delante-abierto": {
    directas: ["dominadas", "jalon-delante-cerrado"],
    mismoMusculo: ["remo-sentado-polea", "trx-espalda"] },
  "jalon-delante-cerrado": {
    directas: ["jalon-delante-abierto", "dominadas"],
    mismoMusculo: ["remo-sentado-polea", "trx-espalda"] },
  "dominadas": {
    directas: ["jalon-delante-abierto", "jalon-delante-cerrado"],
    mismoMusculo: ["trx-espalda", "remo-al-pecho"] },
  "remo-sentado-polea": {
    directas: ["remo-al-pecho", "trx-espalda"],
    mismoMusculo: ["jalon-delante-cerrado", "dominadas"] },
  "remo-al-pecho": {
    directas: ["trx-espalda", "remo-sentado-polea"],
    mismoMusculo: ["jalon-delante-abierto"] },
  "trx-espalda": {
    directas: ["remo-sentado-polea", "remo-al-pecho"],
    mismoMusculo: ["jalon-delante-cerrado", "dominadas"] },

  /* ---------- HOMBROS ----------
     Las tres cabezas del hombro no se sustituyen entre sí: una
     elevación lateral no hace lo que una frontal. Por eso cada una
     tiene su patrón y las demás caen en «mismo músculo». */
  "press-militar-maquina": {
    directas: ["press-militar-mancuerna"],
    mismoMusculo: ["laterales", "frontales"] },
  "press-militar-mancuerna": {
    directas: ["press-militar-maquina"],
    mismoMusculo: ["laterales", "frontales"] },
  "laterales": {
    directas: [],
    mismoMusculo: ["vuelo-trx", "frontales", "press-militar-mancuerna"] },
  "frontales": {
    directas: ["lazo-hombro"],
    mismoMusculo: ["laterales", "press-militar-mancuerna"] },
  "lazo-hombro": {
    directas: ["frontales"],
    mismoMusculo: ["laterales", "press-militar-mancuerna"] },
  "vuelo-trx": {
    directas: [],
    mismoMusculo: ["laterales", "frontales", "press-militar-mancuerna"] },

  /* ---------- TRÍCEPS ---------- */
  "triceps-copa": {
    directas: ["push-down", "press-frances", "extension-mancuerna"],
    mismoMusculo: ["banco-triceps"] },
  "push-down": {
    directas: ["triceps-copa", "press-frances", "extension-mancuerna"],
    mismoMusculo: ["banco-triceps"] },
  "extension-mancuerna": {
    directas: ["push-down", "press-frances", "triceps-copa"],
    mismoMusculo: ["banco-triceps"] },
  "press-frances": {
    directas: ["push-down", "triceps-copa", "extension-mancuerna"],
    mismoMusculo: ["banco-triceps"] },
  "banco-triceps": {
    directas: [],
    mismoMusculo: ["push-down", "triceps-copa", "press-frances"] },

  /* ---------- BÍCEPS ---------- */
  "curl-barra": {
    directas: ["curl-mancuerna-alternado", "curl-polea", "predicador-maquina", "biceps-trx"],
    mismoMusculo: [] },
  "curl-polea": {
    directas: ["curl-barra", "curl-mancuerna-alternado", "predicador-maquina"],
    mismoMusculo: [] },
  "curl-mancuerna-alternado": {
    directas: ["curl-barra", "curl-polea", "predicador-maquina", "biceps-trx"],
    mismoMusculo: [] },
  "predicador-maquina": {
    directas: ["curl-barra", "curl-mancuerna-alternado", "curl-polea"],
    mismoMusculo: [] },
  "biceps-trx": {
    directas: ["curl-mancuerna-alternado", "curl-barra", "curl-polea"],
    mismoMusculo: [] },

  /* ---------- PIERNA · dominante de rodilla ---------- */
  "sentadilla-mancuerna": {
    directas: ["prensa-atletica", "trx-sentadilla-profunda", "sentadilla-iso"],
    mismoMusculo: ["tijeras-barra", "leg-extension"] },
  "prensa-atletica": {
    directas: ["sentadilla-mancuerna", "trx-sentadilla-profunda", "sentadilla-iso"],
    mismoMusculo: ["tijeras-barra", "leg-extension"] },
  "trx-sentadilla-profunda": {
    directas: ["sentadilla-iso", "sentadilla-mancuerna", "prensa-atletica"],
    mismoMusculo: ["tijeras-barra"] },
  "sentadilla-iso": {
    directas: ["trx-sentadilla-profunda", "sentadilla-dinamica", "sentadilla-mancuerna"],
    mismoMusculo: ["tijeras-barra"] },
  "sentadilla-dinamica": {
    directas: ["sentadilla-iso", "trx-sentadilla-profunda", "sentadilla-mancuerna"],
    mismoMusculo: ["salto-cajon", "tijeras-barra"] },
  "tijeras-barra": {
    directas: ["elevacion-rodilla", "salto-cajon"],
    mismoMusculo: ["sentadilla-mancuerna", "prensa-atletica"] },
  "elevacion-rodilla": {
    directas: ["salto-cajon", "tijeras-barra"],
    mismoMusculo: ["sentadilla-dinamica"] },
  "salto-cajon": {
    directas: ["elevacion-rodilla", "tijeras-barra"],
    mismoMusculo: ["sentadilla-dinamica"] },
  "leg-extension": {
    directas: [],
    mismoMusculo: ["prensa-atletica", "sentadilla-mancuerna", "tijeras-barra"] },

  /* ---------- PIERNA · femoral, cadera y glúteo ---------- */
  "leg-curl": {
    directas: [],
    mismoMusculo: ["peso-muerto-saco"] },
  "peso-muerto-saco": {
    directas: ["hiperextensiones", "gluteo-pesa-rusa"],
    mismoMusculo: ["leg-curl"] },
  "hiperextensiones": {
    directas: ["peso-muerto-saco", "gluteo-pesa-rusa"],
    mismoMusculo: [] },
  "gluteo-pesa-rusa": {
    directas: ["peso-muerto-saco", "hiperextensiones"],
    mismoMusculo: ["gluteo-polea", "levantamiento-atras-polea", "sentadilla-patada-lateral"] },
  /* Los dos de polea comparten la torre: si está ocupada, el uno no
     resuelve lo del otro. Por eso van como «mismo músculo» y detrás. */
  "levantamiento-atras-polea": {
    directas: [],
    mismoMusculo: ["gluteo-pesa-rusa", "sentadilla-patada-lateral", "gluteo-polea"] },
  "gluteo-polea": {
    directas: [],
    mismoMusculo: ["gluteo-pesa-rusa", "sentadilla-patada-lateral", "levantamiento-atras-polea"] },

  /* ---------- PIERNA · abrir y cerrar ----------
     Abducir y aducir son movimientos CONTRARIOS. Nunca el uno como
     alternativa del otro, por mucho que la máquina del gimnasio haga
     las dos cosas. */
  "abductor": {
    directas: ["trx-abductor", "sentadilla-patada-lateral"],
    mismoMusculo: [] },
  "trx-abductor": {
    directas: ["abductor", "sentadilla-patada-lateral"],
    mismoMusculo: [] },
  "sentadilla-patada-lateral": {
    directas: ["abductor", "trx-abductor"],
    mismoMusculo: ["gluteo-pesa-rusa", "gluteo-polea"] },
  /* Para aducir no hay otro ejercicio en esta rutina. Lo más cercano
     es una sentadilla profunda, que carga la cara interna del muslo. */
  "aductor-banda": {
    directas: [],
    mismoMusculo: ["trx-sentadilla-profunda", "sentadilla-mancuerna"] },

  /* ---------- PANTORRILLA ----------
     Solo hay dos, y son máquinas distintas: sirve de verdad. */
  "elevacion-talones-hack": { directas: ["pantorrilla-sentado"], mismoMusculo: [] },
  "pantorrilla-sentado": { directas: ["elevacion-talones-hack"], mismoMusculo: [] },

  /* ---------- ABDOMEN ----------
     Flexionar el tronco, sostener la plancha y rotar son tres cosas
     distintas: solo las dos flexiones se sustituyen de verdad. */
  "elevacion-tronco-maquina": {
    directas: ["abdominales-suelo"],
    mismoMusculo: ["twist-ruso", "levantamiento-pierna-piso"] },
  "abdominales-suelo": {
    directas: ["elevacion-tronco-maquina"],
    mismoMusculo: ["levantamiento-pierna-piso", "twist-ruso", "plancha-bosu"] },
  "levantamiento-pierna-piso": {
    directas: [],
    mismoMusculo: ["abdominales-suelo", "elevacion-tronco-maquina", "plancha-bosu"] },
  "plancha-bosu": {
    directas: [],
    mismoMusculo: ["abdominales-suelo", "levantamiento-pierna-piso", "twist-ruso"] },
  "twist-ruso": {
    directas: [],
    mismoMusculo: ["abdominales-suelo", "elevacion-tronco-maquina", "plancha-bosu"] }
};
