/* Devuelve al proyecto las 40 fotos reales que se habian borrado.

   El usuario las quiere: le servian como referencia aunque no sean el
   ejercicio exacto. Ahora conviven con la ficha del gimnasio (que si es
   exacta y va primero) y llevan un rotulo que dice claramente cuando el
   movimiento es solo parecido.                                          */
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
  "trx-sentadilla-profunda": "Suspended_Split_Squat",
  "trx-abductor": "Lunge_Pass_Through",
  "sentadilla-iso": "Bodyweight_Squat",
  "elevacion-rodilla": "Step-up_with_Knee_Raise",
  "aductor-banda": "Band_Hip_Adductions",
  "sentadilla-dinamica": "Freehand_Jump_Squat",
  "peso-muerto-saco": "Stiff-Legged_Dumbbell_Deadlift",
  "trx-espalda": "Suspended_Row",
  "apertura-trx": "Bodyweight_Flyes",
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
