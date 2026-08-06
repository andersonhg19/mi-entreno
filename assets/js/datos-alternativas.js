/* ============================================================
   EJERCICIOS ALTERNATIVOS
   ------------------------------------------------------------
   Para cuando la máquina está ocupada, que en el gimnasio pasa
   constantemente. Cada ejercicio ofrece otros que trabajan lo
   mismo con OTRO implemento.

   TRES REGLAS QUE NO SE ROMPEN
   ----------------------------
   1. Toda alternativa es una clave del propio catálogo. Nada de
      inventar ejercicios nuevos: así la alternativa ya trae su
      ficha del gimnasio, sus fotos revisadas y sus pasos, y se
      puede abrir de un toque. Lo comprueba `validar-datos.js`.

   2. La alternativa usa OTRA cosa. Si la prensa está ocupada no
      sirve mandarte a otra máquina de pierna que también puede
      estarlo: se ofrece mancuerna, barra, polea, TRX o el propio
      peso del cuerpo.

   3. Mismo músculo Y mismo movimiento. Dentro de «Pierna» hay
      cuádriceps, femoral y abductores, que no se sustituyen
      entre sí: hacer curl femoral en vez de prensa no es la
      misma sesión. Por eso la tabla está escrita a mano y
      agrupada por función, no generada por grupo muscular.

   La app además esconde las que YA están en tu rutina de ese
   día: no tiene sentido ofrecerte como alternativa algo que de
   todos modos vas a hacer.

   Van ordenadas de más a menos parecida.
   ============================================================ */

window.ALTERNATIVAS = {

  /* ---------- PIERNA · cuádriceps y sentadilla ---------- */
  "sentadilla-mancuerna":     ["prensa-atletica", "tijeras-barra", "trx-sentadilla-profunda", "sentadilla-iso"],
  "prensa-atletica":          ["sentadilla-mancuerna", "tijeras-barra", "leg-extension", "trx-sentadilla-profunda"],
  "leg-extension":            ["prensa-atletica", "sentadilla-mancuerna", "sentadilla-iso", "tijeras-barra"],
  "tijeras-barra":            ["sentadilla-mancuerna", "prensa-atletica", "elevacion-rodilla", "trx-sentadilla-profunda"],
  "trx-sentadilla-profunda":  ["sentadilla-iso", "sentadilla-mancuerna", "sentadilla-dinamica", "prensa-atletica"],
  "sentadilla-iso":           ["trx-sentadilla-profunda", "sentadilla-dinamica", "sentadilla-mancuerna", "prensa-atletica"],
  "sentadilla-dinamica":      ["sentadilla-iso", "trx-sentadilla-profunda", "salto-cajon", "sentadilla-mancuerna"],
  "salto-cajon":              ["elevacion-rodilla", "sentadilla-dinamica", "tijeras-barra"],
  "elevacion-rodilla":        ["salto-cajon", "tijeras-barra", "sentadilla-dinamica"],

  /* ---------- PIERNA · femoral (parte de atrás del muslo) ---------- */
  "leg-curl":                 ["peso-muerto-saco", "hiperextensiones", "gluteo-pesa-rusa"],
  "peso-muerto-saco":         ["leg-curl", "gluteo-pesa-rusa", "hiperextensiones"],

  /* ---------- PIERNA · abductores y aductores ----------
     Ojo: abducir (abrir) y aducir (cerrar) son movimientos CONTRARIOS.
     No se ofrecen el uno como alternativa del otro por mucho que la
     máquina del gimnasio haga las dos cosas. */
  "abductor":                 ["trx-abductor", "sentadilla-patada-lateral"],
  "trx-abductor":             ["abductor", "sentadilla-patada-lateral"],
  /* Para aducir no hay otro ejercicio en esta rutina: lo más cercano es
     una sentadilla profunda, que carga la cara interna del muslo. */
  "aductor-banda":            ["trx-sentadilla-profunda", "sentadilla-mancuerna"],

  /* ---------- PECHO ---------- */
  "peck-deck":                ["apertura-trx", "press-mancuerna", "fondo-de-pecho", "press-banca"],
  "press-banca":              ["press-mancuerna", "fondo-de-pecho", "peck-deck", "press-inclinado"],
  "press-inclinado":          ["press-inclinado-mancuerna", "press-banca", "press-mancuerna", "peck-deck"],
  "press-mancuerna":          ["press-banca", "peck-deck", "fondo-de-pecho", "apertura-trx"],
  "press-inclinado-mancuerna":["press-inclinado", "press-mancuerna", "press-banca", "peck-deck"],
  "fondo-de-pecho":           ["press-mancuerna", "press-banca", "peck-deck", "apertura-trx"],
  "apertura-trx":             ["peck-deck", "press-mancuerna", "fondo-de-pecho"],

  /* ---------- ESPALDA ---------- */
  "jalon-delante-abierto":    ["dominadas", "jalon-delante-cerrado", "trx-espalda", "remo-sentado-polea"],
  "jalon-delante-cerrado":    ["jalon-delante-abierto", "remo-sentado-polea", "dominadas", "trx-espalda"],
  "remo-sentado-polea":       ["remo-al-pecho", "trx-espalda", "jalon-delante-cerrado"],
  "remo-al-pecho":            ["remo-sentado-polea", "trx-espalda", "jalon-delante-abierto"],
  "dominadas":                ["jalon-delante-abierto", "jalon-delante-cerrado", "trx-espalda"],
  "trx-espalda":              ["remo-sentado-polea", "remo-al-pecho", "jalon-delante-cerrado"],

  /* ---------- HOMBROS ---------- */
  "press-militar-maquina":    ["press-militar-mancuerna", "laterales", "frontales"],
  "press-militar-mancuerna":  ["press-militar-maquina", "laterales", "frontales"],
  "laterales":                ["vuelo-trx", "frontales", "press-militar-mancuerna"],
  "frontales":                ["laterales", "lazo-hombro", "press-militar-mancuerna"],
  "vuelo-trx":                ["laterales", "frontales", "press-militar-mancuerna"],
  "lazo-hombro":              ["frontales", "laterales", "press-militar-mancuerna"],

  /* ---------- TRÍCEPS ---------- */
  "triceps-copa":             ["extension-mancuerna", "push-down", "press-frances", "banco-triceps"],
  "push-down":                ["triceps-copa", "press-frances", "banco-triceps", "extension-mancuerna"],
  "extension-mancuerna":      ["triceps-copa", "push-down", "press-frances"],
  "press-frances":            ["push-down", "triceps-copa", "extension-mancuerna", "banco-triceps"],
  "banco-triceps":            ["push-down", "triceps-copa", "press-frances"],

  /* ---------- BÍCEPS ---------- */
  "curl-barra":               ["curl-mancuerna-alternado", "curl-polea", "predicador-maquina", "biceps-trx"],
  "curl-polea":               ["curl-barra", "curl-mancuerna-alternado", "predicador-maquina"],
  "curl-mancuerna-alternado": ["curl-barra", "curl-polea", "predicador-maquina", "biceps-trx"],
  "predicador-maquina":       ["curl-barra", "curl-mancuerna-alternado", "curl-polea"],
  "biceps-trx":               ["curl-mancuerna-alternado", "curl-barra", "curl-polea"],

  /* ---------- ABDOMEN ---------- */
  "elevacion-tronco-maquina": ["abdominales-suelo", "twist-ruso", "levantamiento-pierna-piso"],
  "levantamiento-pierna-piso":["abdominales-suelo", "plancha-bosu", "elevacion-tronco-maquina"],
  "plancha-bosu":             ["abdominales-suelo", "levantamiento-pierna-piso", "twist-ruso"],
  "twist-ruso":               ["abdominales-suelo", "plancha-bosu", "elevacion-tronco-maquina"],
  "abdominales-suelo":        ["elevacion-tronco-maquina", "levantamiento-pierna-piso", "twist-ruso"],

  /* ---------- GLÚTEOS ---------- */
  /* Los dos de polea van al final el uno del otro: si la torre de poleas
     está ocupada, mandarte a la otra polea no resuelve nada. */
  "levantamiento-atras-polea":["gluteo-pesa-rusa", "sentadilla-patada-lateral", "gluteo-polea"],
  "gluteo-polea":             ["gluteo-pesa-rusa", "sentadilla-patada-lateral", "levantamiento-atras-polea"],
  "gluteo-pesa-rusa":         ["sentadilla-patada-lateral", "gluteo-polea", "peso-muerto-saco"],
  "sentadilla-patada-lateral":["gluteo-pesa-rusa", "gluteo-polea", "levantamiento-atras-polea"],

  /* ---------- PANTORRILLA ----------
     Solo hay dos en la rutina, así que cada una tiene una sola
     alternativa. Es lo que hay: mejor una de verdad que tres inventadas. */
  "elevacion-talones-hack":   ["pantorrilla-sentado"],
  "pantorrilla-sentado":      ["elevacion-talones-hack"],

  /* ---------- LUMBAR ---------- */
  "hiperextensiones":         ["peso-muerto-saco", "gluteo-pesa-rusa"]
};
