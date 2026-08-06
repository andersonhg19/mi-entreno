/* ============================================================
   PLANES DE ENTRENAMIENTO — Life Gym
   Extraídos de las planillas físicas entregadas el 2026-08-04.
   Vigencia: 04/08/2026 → 04/11/2026 (3 meses)

   NOTA DE PRIVACIDAD: este archivo se publica en internet.
   Por eso aquí solo van los nombres de pila. Los apellidos, la
   edad y las medidas corporales (peso, IMC, % de grasa) están
   en `recursos/datos-personales.md`, que no se sube a git.

   Cada persona tiene su propio código de colores para los días,
   tal como venía marcado en su tablero. Los colores se conservan
   para que puedas comparar con la hoja física si hace falta.
   ============================================================ */

/* Debe coincidir con VERSION de sw.js (lo comprueba validar-datos.js).
   Se muestra en Ajustes para poder confirmar de un vistazo que el teléfono
   ya tiene la última versión. */
window.VERSION_APP = "10";

window.PARAMETROS = {
  series: "3 a 4 series",
  repeticiones: "10 a 15 repeticiones",
  descanso: 60,                  // segundos entre series
  descansoTexto: "1 minuto entre series",
  incrementoPeso: "Subir el peso de 10% a 20% cuando las 15 repeticiones salgan fáciles",
  diasPorSemana: "5 días de entreno, 2 de descanso",
  cardio: "15 a 20 minutos de bicicleta, caminadora, elíptica, spinning, aeróbicos o funcional",
  vigenciaInicio: "2026-08-04",
  vigenciaFin: "2026-11-04",
  gimnasio: "Life Gym — Centro de Entrenamiento Físico",
  telefonoGimnasio: "318 7231172"
};

window.PLANES = {

  /* ========================= ANDERSON ========================= */
  anderson: {
    id: "anderson",
    nombre: "Anderson",
    tema: "azul",
    objetivos: [
      "Bajar de peso y tonificar",
      "Rutina fija por 3 meses"
    ],
    condiciones: [
      "Deficiencia visual",
      "Equilibrio limitado"
    ],
    metodo: "Cargas progresivas y movilidad articular",
    notaImportante: "Por el tema de equilibrio, tu rutina carga más en trabajo funcional con TRX y apoyos. Si un ejercicio te deja inestable, hazlo cerca de una pared o pídele el cambio al entrenador.",
    dias: [
      {
        n: 1, dia: "Lunes", color: "naranja",
        titulo: "Funcional — cuerpo completo",
        resumen: "Día de trabajo funcional. Casi todo con TRX, banda y BOSU.",
        ejercicios: [
          "trx-sentadilla-profunda", "trx-abductor", "sentadilla-iso",
          "elevacion-rodilla", "aductor-banda", "sentadilla-dinamica",
          "trx-espalda", "apertura-trx", "banco-triceps",
          "vuelo-trx", "lazo-hombro",
          "plancha-bosu", "twist-ruso", "abdominales-suelo",
          "biceps-trx", "gluteo-pesa-rusa", "sentadilla-patada-lateral"
        ]
      },
      {
        n: 2, dia: "Martes", color: "rojo",
        titulo: "Pecho y tríceps",
        resumen: "Empujes. Todo en máquinas y barra.",
        ejercicios: [
          "peck-deck", "press-banca", "press-inclinado", "fondo-de-pecho",
          "triceps-copa", "push-down", "extension-mancuerna", "press-frances"
        ]
      },
      {
        n: 3, dia: "Miércoles", color: "celeste",
        titulo: "Espalda y bíceps",
        resumen: "Jalones. Espalda primero, bíceps al final.",
        ejercicios: [
          "jalon-delante-abierto", "jalon-delante-cerrado", "remo-sentado-polea",
          "dominadas", "hiperextensiones",
          "curl-barra", "curl-polea", "curl-mancuerna-alternado", "predicador-maquina"
        ]
      },
      {
        n: 4, dia: "Jueves", color: "rosado",
        titulo: "Hombros y tríceps",
        resumen: "Hombro completo y otra pasada de tríceps.",
        ejercicios: [
          "press-militar-maquina", "press-militar-mancuerna", "laterales", "frontales",
          "fondo-de-pecho", "triceps-copa", "push-down", "extension-mancuerna", "press-frances"
        ]
      },
      {
        n: 5, dia: "Viernes", color: "verde",
        titulo: "Funcional y abdomen",
        resumen: "Repite el funcional del lunes y suma abdomen en máquina.",
        ejercicios: [
          "elevacion-tronco-maquina", "levantamiento-pierna-piso",
          "trx-sentadilla-profunda", "trx-abductor", "sentadilla-iso",
          "elevacion-rodilla", "aductor-banda", "sentadilla-dinamica",
          "trx-espalda", "apertura-trx",
          "plancha-bosu", "twist-ruso", "abdominales-suelo",
          "biceps-trx", "gluteo-pesa-rusa", "sentadilla-patada-lateral"
        ]
      },
      { n: 6, dia: "Sábado",  color: "descanso", titulo: "Descanso", resumen: "Día libre. Camina si quieres, pero sin pesas.", ejercicios: [] },
      { n: 7, dia: "Domingo", color: "descanso", titulo: "Descanso", resumen: "Día libre. Recuperación.", ejercicios: [] }
    ]
  },

  /* ========================= SHARID ========================= */
  sharid: {
    id: "sharid",
    nombre: "Sharid",
    tema: "fucsia",
    objetivos: [
      "Bajar de peso y tonificar",
      "Rutina fija por 3 meses"
    ],
    condiciones: [],
    metodo: "Cargas progresivas y movilidad articular",
    notaImportante: "En el salto al cajón el entrenador anotó SIN SALTO: se sube un pie a la vez, como un escalón.",
    dias: [
      {
        n: 1, dia: "Lunes", color: "naranja",
        titulo: "Pierna y hombro",
        resumen: "Cuádriceps y hombro. Empieza por las máquinas grandes.",
        ejercicios: [
          "sentadilla-mancuerna", "prensa-atletica", "leg-extension", "abductor",
          "elevacion-talones-hack",
          "press-militar-maquina", "laterales", "frontales",
          "trx-sentadilla-profunda", "sentadilla-iso", "elevacion-rodilla",
          "vuelo-trx", "lazo-hombro"
        ]
      },
      {
        n: 2, dia: "Martes", color: "verde",
        titulo: "Espalda y bíceps",
        resumen: "Jalones y remos. Bíceps al final.",
        ejercicios: [
          "jalon-delante-abierto", "jalon-delante-cerrado", "remo-sentado-polea",
          "remo-al-pecho", "hiperextensiones",
          "curl-barra", "curl-polea", "curl-mancuerna-alternado", "predicador-maquina",
          "trx-espalda", "biceps-trx"
        ]
      },
      {
        n: 3, dia: "Miércoles", color: "rosado",
        titulo: "Pierna y glúteo",
        resumen: "Femoral, glúteo y pantorrilla.",
        ejercicios: [
          "leg-curl", "tijeras-barra", "abductor", "pantorrilla-sentado",
          "levantamiento-atras-polea", "gluteo-polea",
          "trx-abductor", "aductor-banda", "peso-muerto-saco", "salto-cajon",
          "gluteo-pesa-rusa", "sentadilla-patada-lateral"
        ]
      },
      {
        n: 4, dia: "Jueves", color: "celeste",
        titulo: "Pecho y tríceps",
        resumen: "Empujes con mancuerna y máquina.",
        ejercicios: [
          "peck-deck", "press-mancuerna", "press-inclinado-mancuerna", "fondo-de-pecho",
          "triceps-copa", "push-down", "extension-mancuerna", "press-frances",
          "apertura-trx", "banco-triceps"
        ]
      },
      {
        n: 5, dia: "Viernes", color: "rojo",
        titulo: "Abdomen y funcional",
        resumen: "Core y trabajo funcional para cerrar la semana.",
        ejercicios: [
          "elevacion-tronco-maquina", "levantamiento-pierna-piso",
          "elevacion-rodilla", "trx-espalda", "vuelo-trx", "lazo-hombro",
          "plancha-bosu", "abdominales-suelo", "biceps-trx"
        ]
      },
      { n: 6, dia: "Sábado",  color: "descanso", titulo: "Descanso", resumen: "Día libre.", ejercicios: [] },
      { n: 7, dia: "Domingo", color: "descanso", titulo: "Descanso", resumen: "Día libre.", ejercicios: [] }
    ]
  }
};

/* Colores de los días, tal como venían marcados en cada tablero.
   Se usan solo como etiqueta de referencia contra la hoja física. */
window.COLORES_DIA = {
  naranja:  { etiqueta: "Naranja",  hex: "#f59e0b" },
  rojo:     { etiqueta: "Rojo",     hex: "#dc2626" },
  celeste:  { etiqueta: "Celeste",  hex: "#38bdf8" },
  rosado:   { etiqueta: "Rosado",   hex: "#ec4899" },
  verde:    { etiqueta: "Verde",    hex: "#65a30d" },
  descanso: { etiqueta: "Descanso", hex: "#64748b" }
};
