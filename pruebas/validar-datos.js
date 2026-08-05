/* ============================================================
   VALIDACIÓN DE DATOS
   Sin dependencias. Comprueba que la app es coherente:
   sintaxis, campos obligatorios, imágenes, referencias cruzadas
   y precarga del service worker.

   Uso:  node pruebas/validar-datos.js
   ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
let errores = [], avisos = [];

/* --- 1. Sintaxis de todos los JS --- */
const jsFiles = fs.readdirSync(path.join(ROOT, "assets/js")).filter(f => f.endsWith(".js"));
for (const f of jsFiles) {
  const p = path.join(ROOT, "assets/js", f);
  try { new vm.Script(fs.readFileSync(p, "utf8"), { filename: p }); }
  catch (e) { errores.push(`SINTAXIS ${f}: ${e.message}`); }
}
for (const f of ["sw.js", "servidor.js"]) {
  const p = path.join(ROOT, f);
  try { new vm.Script(fs.readFileSync(p, "utf8"), { filename: p }); }
  catch (e) { errores.push(`SINTAXIS ${f}: ${e.message}`); }
}

/* --- 2. Cargar los datos en un contexto aislado --- */
const ctx = { window: {}, navigator: {}, document: {} };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["datos-catalogo.js", "datos-planes.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js", f), "utf8"), ctx, { filename: f });
}
const CAT = ctx.CATALOGO, PLANES = ctx.PLANES, COLORES = ctx.COLORES_DIA;

/* --- 3. Integridad del catálogo --- */
const DIR_IMG = path.join(ROOT, "assets/img/ejercicios");
const campos = ["nombre", "grupo", "equipo", "fotosOk", "donde", "pasos", "buscar"];
const GRUPOS = ["Pierna", "Pantorrilla", "Espalda", "Lumbar", "Pecho", "Tríceps",
                "Hombros", "Bíceps", "Antebrazos", "Abdomen", "Glúteos"];
const esperadas = new Set();

for (const [k, e] of Object.entries(CAT)) {
  for (const c of campos) if (e[c] === undefined) errores.push(`CATALOGO ${k}: falta el campo "${c}"`);
  if (!Array.isArray(e.pasos) || e.pasos.length < 3) errores.push(`CATALOGO ${k}: necesita al menos 3 pasos`);
  if (!GRUPOS.includes(e.grupo)) errores.push(`CATALOGO ${k}: grupo desconocido "${e.grupo}" (rompe el color por músculo)`);

  /* La ficha del gimnasio es obligatoria: es la única imagen que
     con seguridad corresponde al ejercicio. */
  const ficha = `${k}-ficha.jpg`;
  esperadas.add(ficha);
  if (!fs.existsSync(path.join(DIR_IMG, ficha))) errores.push(`FALTA la ficha: ${ficha}`);

  /* Todas las fotos reales existen. `fotosOk` solo dice si son el ejercicio
     exacto o un movimiento parecido; el rótulo de la lámina lo avisa. */
  for (const n of [0, 1]) {
    const foto = `${k}-${n}.jpg`;
    esperadas.add(foto);
    if (!fs.existsSync(path.join(DIR_IMG, foto))) errores.push(`FALTA la foto: ${foto}`);
  }
}

/* Ninguna imagen huérfana en la carpeta */
for (const f of fs.readdirSync(DIR_IMG)) {
  if (f.endsWith(".jpg") && !esperadas.has(f)) errores.push(`IMAGEN huérfana (no la usa nadie): ${f}`);
}

/* --- 4. Los planes solo pueden referenciar claves existentes --- */
const usados = new Set();
for (const [pid, p] of Object.entries(PLANES)) {
  if (!p.dias || p.dias.length !== 7) errores.push(`PLAN ${pid}: debe tener 7 días`);
  for (const d of p.dias) {
    if (!COLORES[d.color]) errores.push(`PLAN ${pid} día ${d.n}: color desconocido "${d.color}"`);
    for (const k of d.ejercicios) {
      usados.add(k);
      if (!CAT[k]) errores.push(`PLAN ${pid} día ${d.n}: ejercicio inexistente "${k}"`);
    }
    const dup = d.ejercicios.filter((x, i) => d.ejercicios.indexOf(x) !== i);
    if (dup.length) avisos.push(`PLAN ${pid} día ${d.n}: ejercicios repetidos -> ${dup.join(", ")}`);
  }
}
for (const k of Object.keys(CAT)) if (!usados.has(k)) avisos.push(`CATALOGO ${k}: no lo usa ningún día`);

/* --- 5. El service worker debe precargar todo lo que la app usa --- */
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
for (const img of esperadas) {
  if (!sw.includes(`assets/img/ejercicios/${img}`)) errores.push(`SW no precarga ${img}`);
}
for (const f of ["assets/css/estilos.css", "assets/js/app.js", "assets/js/carrusel.js",
                 "assets/js/cronometro.js", "assets/js/voz.js", "assets/js/almacenamiento.js",
                 "index.html", "manifest.webmanifest"]) {
  if (!sw.includes(f)) errores.push(`SW no precarga ${f}`);
}
/* …y no debe precargar nada que ya no exista (daría 404 en cada instalación) */
for (const m of sw.matchAll(/"(assets\/[^"]+)"/g)) {
  if (!fs.existsSync(path.join(ROOT, m[1]))) errores.push(`SW precarga un archivo inexistente: ${m[1]}`);
}
/* Todos los scripts del HTML deben estar en el service worker */
for (const m of fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="([^"]+)"/g)) {
  if (!sw.includes(m[1])) errores.push(`SW no precarga el script ${m[1]}`);
}

/* --- 5a. La versión mostrada y la del service worker deben coincidir ---
   Es lo que permite confirmar desde Ajustes que el teléfono ya se actualizó. */
const vSw = (fs.readFileSync(path.join(ROOT, "sw.js"), "utf8")
  .match(/VERSION = "mi-entreno-v(\d+)"/) || [])[1];
if (vSw !== String(ctx.VERSION_APP)) {
  errores.push(`VERSION_APP es "${ctx.VERSION_APP}" y sw.js dice "v${vSw}": tienen que coincidir`);
}

/* --- 5b. Guardia del atributo `hidden` ---
   Cualquier `display` puesto en una clase pisa al atributo `hidden`.
   Sin la regla global, el temporizador queda visible tapando toda la app.
   Este fallo ya ocurrió una vez; esta comprobación lo impide. */
const css = fs.readFileSync(path.join(ROOT, "assets/css/estilos.css"), "utf8");
const htmlIndex = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if (!/\[hidden\]\s*\{[^}]*display:\s*none\s*!important/.test(css)) {
  errores.push('CSS: falta la regla `[hidden] { display: none !important; }` - sin ella el temporizador tapa la app');
}
for (const id of ["temporizador", "panelAjustes"]) {
  const etiqueta = (htmlIndex.match(new RegExp('<[^>]*id="' + id + '"[^>]*>')) || [""])[0];
  if (!/\bhidden\b/.test(etiqueta)) errores.push(`index.html: #${id} deberia arrancar con el atributo hidden`);
}

/* --- 6. index.html no puede referenciar archivos inexistentes --- */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
for (const m of html.matchAll(/(?:src|href)="([^":]+)"/g)) {
  if (m[1].startsWith("#")) continue;
  if (!fs.existsSync(path.join(ROOT, m[1]))) errores.push(`index.html referencia un archivo que no existe: ${m[1]}`);
}

/* --- 7. Todo getElementById debe tener su elemento --- */
const app = fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");
const idsHtml = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const idsQueCreaApp = new Set([...app.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
for (const m of app.matchAll(/getElementById\("([^"]+)"\)/g)) {
  if (!idsHtml.has(m[1]) && !idsQueCreaApp.has(m[1])) errores.push(`app.js busca #${m[1]} y no existe en ninguna parte`);
}
const cron = fs.readFileSync(path.join(ROOT, "assets/js/cronometro.js"), "utf8");
for (const m of cron.matchAll(/getElementById\("([^"]+)"\)/g)) {
  if (!idsHtml.has(m[1])) errores.push(`cronometro.js busca #${m[1]} y no existe en el HTML`);
}

/* --- 8. Resumen --- */
console.log(`Ejercicios en catalogo : ${Object.keys(CAT).length}`);
console.log(`Ejercicios usados      : ${usados.size}`);
console.log(`Con fotos reales       : ${Object.values(CAT).filter(e => e.fotosOk).length}`);
console.log(`Solo ficha del gimnasio: ${Object.values(CAT).filter(e => !e.fotosOk).length}`);
for (const [, p] of Object.entries(PLANES)) {
  const tot = p.dias.reduce((a, d) => a + d.ejercicios.length, 0);
  console.log(`  ${p.nombre.padEnd(10)} ${tot} ejercicios/semana  ->  ` +
    p.dias.filter(d => d.ejercicios.length).map(d => `${d.dia.slice(0, 3)}:${d.ejercicios.length}`).join("  "));
}
console.log("");
if (avisos.length) { console.log("AVISOS:"); avisos.forEach(a => console.log("  - " + a)); console.log(""); }
if (errores.length) { console.log("ERRORES:"); errores.forEach(e => console.log("  x " + e)); process.exit(1); }
console.log("OK - Datos correctos: sin errores.");
