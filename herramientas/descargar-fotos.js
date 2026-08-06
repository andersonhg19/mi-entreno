/* Las dos fotos reales que acompanan a cada ficha, desde free-exercise-db.

   La ficha del gimnasio es la que manda —es el carton del entrenador— y va
   primera en el carrusel. Estas dos son la referencia de como se ve el
   movimiento, y llevan rotulo cuando solo son parecidas.

   REVISION DE 2026-08-06 (Anderson: «me ha pasado mucho que no tienen nada
   que ver»). Se miraron las 55 con `herramientas/revisar-fotos.py`. Cuatro
   estaban sencillamente mal y se cambiaron:

     aductor-banda            Band_Hip_Adductions -> Side_Leg_Raises
       la foto era un senor DE PIE sin hacer nada; la banda no se veia.
     apertura-trx             Bodyweight_Flyes -> Dumbbell_Flyes
       la foto eran flexiones con mancuernas en el suelo, no una apertura.
     trx-abductor             Lunge_Pass_Through -> Thigh_Abductor
       la foto era una zancada caminando con pesa rusa, nada de abduccion.
     trx-sentadilla-profunda  Suspended_Split_Squat -> Chair_Squat
       la foto era sentadilla a UNA pierna; la ficha es a dos, con apoyo.

   Se dejaron a proposito, aunque parezcan chocantes:

     salto-cajon y sentadilla-dinamica ensenan el SALTO. La tarjeta tambien
     lo ensena: el salto es el ejercicio. Lo que cambia es la adaptacion que
     escribio el entrenador a mano («SIN SALTO»), y eso se resuelve poniendo
     ese aviso ANTES del carrusel, no falseando la foto.                   */
const fs = require("fs");
const path = require("path");
const https = require("https");

const RAIZ = "C:/Users/ander/Documents/Anderson/Personales/entreno";
const IMG = path.join(RAIZ, "assets/img/ejercicios");
const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const MAPEO = {
  "sentadilla-mancuerna": "Dumbbell_Squat",
  "leg-curl": "Seated_Leg_Curl",
  "elevacion-talones-hack": "Calf_Press",
  "extension-mancuerna": "Seated_Triceps_Press",
  "predicador-maquina": "Machine_Preacher_Curls",
  "vuelo-trx": "Reverse_Flyes",
  "biceps-trx": "Dumbbell_Bicep_Curl",
  "levantamiento-pierna-piso": "Flat_Bench_Lying_Leg_Raise",
  "plancha-bosu": "Plank",
  "levantamiento-atras-polea": "Glute_Kickback",
  "sentadilla-patada-lateral": "Squats_-_With_Bands",
  "trx-sentadilla-profunda": "Chair_Squat",
  "trx-abductor": "Thigh_Abductor",
  "sentadilla-iso": "Bodyweight_Squat",
  "elevacion-rodilla": "Step-up_with_Knee_Raise",
  "aductor-banda": "Side_Leg_Raises",
  "sentadilla-dinamica": "Freehand_Jump_Squat",
  "peso-muerto-saco": "Stiff-Legged_Dumbbell_Deadlift",
  "trx-espalda": "Suspended_Row",
  "apertura-trx": "Dumbbell_Flyes",
};

function bajar(url, destino) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return bajar(res.headers.location, destino).then(resolve, reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`${res.statusCode} ${url}`)); }
      const trozos = [];
      res.on("data", d => trozos.push(d));
      res.on("end", () => { fs.writeFileSync(destino, Buffer.concat(trozos)); resolve(); });
    }).on("error", reject);
  });
}

(async () => {
  let ok = 0;
  const fallos = [];
  for (const [clave, id] of Object.entries(MAPEO)) {
    for (const n of [0, 1]) {
      const destino = path.join(IMG, `${clave}-${n}.jpg`);
      try { await bajar(`${BASE}/${id}/${n}.jpg`, destino); ok++; }
      catch (e) { fallos.push(`${clave}-${n} (${id}): ${e.message}`); }
    }
  }
  console.log(`Fotos restauradas: ${ok} de ${Object.keys(MAPEO).length * 2}`);
  if (fallos.length) { console.log("FALLOS:"); fallos.forEach(f => console.log("  x " + f)); }
})();
