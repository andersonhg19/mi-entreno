/* Las dos fotos reales que acompañan a la ficha, desde free-exercise-db.

   La ficha del gimnasio es la que manda —es el cartón del entrenador— y va
   primera en el carrusel. Estas dos son la referencia de cómo se ve el
   movimiento en una persona.

   REGLA, después de que Anderson lo señalara DOS veces
   ----------------------------------------------------
   Una foto solo se muestra si es **el mismo movimiento con el mismo tipo de
   implemento**. Si no lo es, el ejercicio se queda **solo con la ficha**.

   Rotularla como «parecida» no arregla un dato malo, solo lo documenta: para
   quien tiene baja visión y mira la foto para saber qué hacer, una apertura
   en TRX ilustrada con unas aperturas tumbado en banco es información falsa.

   POR QUÉ NUEVE EJERCICIOS SE QUEDAN SIN FOTO
   -------------------------------------------
   Son los de TRX, BOSU y banda elástica. Se buscó de verdad:
   free-exercise-db (873 ejercicios) no tiene ni uno de suspensión, BOSU o
   banda con ese movimiento, y wger —la otra base con licencia libre— tiene
   360 imágenes en total y tampoco. No es que no se haya mirado: es que no
   existe con una licencia que se pueda publicar.

   Para esos, la ficha del tablero **ya enseña el TRX o el BOSU**, así que se
   pierde menos de lo que parece.

   Excepción razonada: `trx-espalda` sí lleva foto, porque `Suspended_Row` es
   un remo en anillas — suspensión de verdad, el mismo gesto.               */
const fs = require("fs");
const path = require("path");
const https = require("https");

const RAIZ = "C:/Users/ander/Documents/Anderson/Personales/entreno";
const IMG = path.join(RAIZ, "assets/img/ejercicios");
const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const MAPEO = {
  "sentadilla-mancuerna": "Dumbbell_Squat",
  "leg-curl": "Lying_Leg_Curls",
  "elevacion-talones-hack": "Calf_Press_On_The_Leg_Press_Machine",
  "extension-mancuerna": "Dumbbell_One-Arm_Triceps_Extension",
  "predicador-maquina": "Machine_Preacher_Curls",
  "levantamiento-pierna-piso": "Flat_Bench_Lying_Leg_Raise",
  "levantamiento-atras-polea": "One-Legged_Cable_Kickback",
  "elevacion-rodilla": "Step-up_with_Knee_Raise",
  "sentadilla-dinamica": "Freehand_Jump_Squat",
  "peso-muerto-saco": "Stiff-Legged_Dumbbell_Deadlift",
  "trx-espalda": "Suspended_Row",
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
