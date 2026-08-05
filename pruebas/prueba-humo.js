/* ============================================================
   PRUEBA DE HUMO
   Carga la app en un DOM simulado (jsdom) y recorre todas las
   pantallas de las dos rutinas, comprobando que renderizan y
   que los controles responden.

   Uso:  npm install   (una sola vez)
         node pruebas/prueba-humo.js
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const errores = [];
const dom = new JSDOM(html, {
  url: "http://localhost/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
window.addEventListener("error", e => errores.push("window.onerror: " + e.message));

/* APIs que la app usa y jsdom no trae */
window.speechSynthesis = {
  getVoices: () => [{ lang: "es-CO", name: "prueba" }],
  speak() {}, cancel() {}, speaking: false
};
window.SpeechSynthesisUtterance = function (t) { this.text = t; };
window.navigator.vibrate = () => true;
window.alert = () => {};
window.scrollTo = () => {};

/* Cargar los scripts en el mismo orden que el HTML */
for (const f of ["assets/js/datos-catalogo.js", "assets/js/datos-planes.js",
                 "assets/js/almacenamiento.js", "assets/js/voz.js",
                 "assets/js/carrusel.js", "assets/js/cronometro.js", "assets/js/app.js"]) {
  try { window.eval(fs.readFileSync(path.join(ROOT, f), "utf8")); }
  catch (e) { errores.push(`Al cargar ${f}: ${e.message}`); }
}

const doc = window.document;
function ir(hash) {
  window.location.hash = hash;
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
}
function texto() { return doc.getElementById("contenido").textContent; }
function comprobar(cond, msg) { if (!cond) errores.push("FALLA: " + msg); }

let pantallas = 0;

/* ---------- 1. Pantalla de inicio ---------- */
ir("#/");
comprobar(/entrenar/.test(texto()), "la pantalla de inicio no muestra el selector de persona");
comprobar(doc.querySelectorAll(".persona").length === 2, "deberian aparecer 2 personas");
pantallas++;

/* ---------- 2, 3 y 4. Semana, dias y ejercicios de cada persona ---------- */
for (const pid of ["anderson", "sharid"]) {
  ir("#/p/" + pid);
  pantallas++;
  comprobar(doc.querySelectorAll(".dia").length === 7, `${pid}: deberian verse 7 dias`);
  comprobar(doc.querySelectorAll('.dia[data-hoy="si"]').length === 1,
    `${pid}: debe marcarse exactamente un dia como HOY`);

  /* Lista completa: sin filtro salen todos los ejercicios distintos */
  ir(`#/p/${pid}/lista`);
  pantallas++;
  const distintos = new Set();
  window.PLANES[pid].dias.forEach(d => d.ejercicios.forEach(k => distintos.add(k)));
  comprobar(doc.querySelectorAll(".ejercicio").length === distintos.size,
    `${pid}: la lista completa deberia mostrar ${distintos.size} ejercicios`);
  comprobar(doc.querySelectorAll(".filtro").length === 6,
    `${pid}: deberian verse 6 filtros (Todos + 5 dias)`);

  /* Lista filtrada por cada dia de entreno */
  for (const d of window.PLANES[pid].dias.filter(x => x.ejercicios.length)) {
    ir(`#/p/${pid}/lista/${d.n}`);
    pantallas++;
    comprobar(doc.querySelectorAll(".ejercicio").length === new Set(d.ejercicios).size,
      `${pid}: el filtro de ${d.dia} no muestra los ejercicios correctos`);
    comprobar(doc.querySelector('.filtro[data-filtro="' + d.n + '"]').getAttribute("aria-pressed") === "true",
      `${pid}: el filtro de ${d.dia} no queda marcado como activo`);
  }

  /* Modo consulta desde la lista */
  const claveEjemplo = window.PLANES[pid].dias.find(d => d.ejercicios.length).ejercicios[0];
  ir(`#/p/${pid}/x/${claveEjemplo}`);
  pantallas++;
  comprobar(doc.querySelector(".detalle-nombre").textContent === window.CATALOGO[claveEjemplo].nombre,
    `${pid}: el modo consulta no muestra el ejercicio correcto`);
  comprobar(!doc.getElementById("btnSerieHecha"),
    `${pid}: el modo consulta no deberia tener contador de series`);
  comprobar(/Cuando te toca|Cuándo te toca/.test(texto()),
    `${pid}: el modo consulta deberia decir que dias toca ese ejercicio`);

  for (const d of window.PLANES[pid].dias) {
    ir(`#/p/${pid}/d/${d.n}`);
    pantallas++;
    comprobar(doc.querySelectorAll(".ejercicio").length === d.ejercicios.length,
      `${pid} dia ${d.n}: numero de tarjetas distinto al esperado`);

    for (let i = 0; i < d.ejercicios.length; i++) {
      ir(`#/p/${pid}/d/${d.n}/e/${i}`);
      pantallas++;
      const cat = window.CATALOGO[d.ejercicios[i]];
      comprobar(doc.querySelector(".detalle-nombre").textContent === cat.nombre,
        `${pid} d${d.n} e${i}: el nombre no coincide`);
      /* Carrusel: SIEMPRE 3 laminas — la ficha del gimnasio primero (exacta
         por definicion) y las dos fotos del movimiento. */
      const nLaminas = doc.querySelectorAll(".carrusel-lamina").length;
      comprobar(nLaminas === 3, `${pid} d${d.n} e${i}: ${nLaminas} laminas y deberian ser 3`);
      const srcs = [...doc.querySelectorAll(".carrusel-lamina img")].map(x => x.getAttribute("src"));
      comprobar(srcs[0] && srcs[0].endsWith(`${d.ejercicios[i]}-ficha.jpg`),
        `${pid} d${d.n} e${i}: la primera lamina debe ser SU ficha del gimnasio`);
      comprobar(srcs[1] && srcs[1].endsWith(`${d.ejercicios[i]}-0.jpg`),
        `${pid} d${d.n} e${i}: la segunda lamina no es su foto de inicio`);
      comprobar(srcs[2] && srcs[2].endsWith(`${d.ejercicios[i]}-1.jpg`),
        `${pid} d${d.n} e${i}: la tercera lamina no es su foto final`);
      comprobar(doc.querySelectorAll(".carrusel-lamina .foto-pie").length === 3,
        `${pid} d${d.n} e${i}: cada lamina necesita su rotulo escrito`);
      doc.querySelectorAll(".carrusel-lamina img").forEach(im => {
        comprobar((im.getAttribute("alt") || "").length > 10,
          `${pid} d${d.n} e${i}: una lamina no tiene texto alternativo util`);
      });
      comprobar(doc.querySelectorAll(".carrusel-punto").length === 3,
        `${pid} d${d.n} e${i}: faltan puntos de posicion`);
      comprobar(/Imagen/.test(doc.querySelector(".carrusel-posicion").textContent),
        `${pid} d${d.n} e${i}: falta el contador escrito "Imagen X de Y"`);
      comprobar(doc.querySelector('.carrusel-flecha[data-paso="-1"]').disabled,
        `${pid} d${d.n} e${i}: la flecha anterior debe empezar deshabilitada`);

      /* Cuando la foto no es el ejercicio exacto hay que decirlo */
      const rotulos = [...doc.querySelectorAll(".carrusel-lamina .foto-pie")]
        .map(x => x.textContent).join(" ");
      if (!cat.fotosOk) {
        comprobar(/parecida/.test(rotulos),
          `${pid} d${d.n} e${i}: las fotos son parecidas y el rotulo no lo dice`);
        comprobar(/parecido/.test(texto()),
          `${pid} d${d.n} e${i}: falta el aviso de que la foto es parecida`);
      } else {
        comprobar(!/parecida/.test(rotulos),
          `${pid} d${d.n} e${i}: las fotos son exactas y el rotulo dice que son parecidas`);
      }

      /* El video va justo debajo de las imagenes, no al final de todo */
      const carrusel = doc.querySelector(".carrusel");
      const video = doc.querySelector(".enlace-video");
      comprobar(video && carrusel.compareDocumentPosition(video) & 4,
        `${pid} d${d.n} e${i}: el enlace de video deberia ir despues del carrusel`);
      const pasos = doc.querySelector(".pasos");
      comprobar(pasos && video.compareDocumentPosition(pasos) & 4,
        `${pid} d${d.n} e${i}: el video deberia ir ANTES de los pasos`);

      comprobar(doc.querySelectorAll(".pasos li").length === cat.pasos.length,
        `${pid} d${d.n} e${i}: los pasos mostrados no coinciden`);
      comprobar(doc.getElementById("btnLeer") && doc.getElementById("btnSerieHecha"),
        `${pid} d${d.n} e${i}: faltan los botones de voz o de serie`);
      comprobar(/youtube[.]com/.test(doc.querySelector(".enlace-video").href),
        `${pid} d${d.n} e${i}: el enlace de video esta mal formado`);
      comprobar(texto().includes(cat.donde),
        `${pid} d${d.n} e${i}: no se muestra donde esta la maquina`);
      if (cat.ojo) comprobar(texto().includes(cat.ojo),
        `${pid} d${d.n} e${i}: no se muestra la advertencia`);
      comprobar(!!doc.querySelector(".pildora-grupo"),
        `${pid} d${d.n} e${i}: falta la pildora del grupo muscular`);
    }
  }
}

/* ---------- 5. Contador de series y temporizador ---------- */
ir("#/p/anderson/d/2/e/0");
doc.getElementById("btnMasSerie").click();
doc.getElementById("btnMasSerie").click();
comprobar(doc.getElementById("numSeries").textContent === "2", "el contador de series no sube");
doc.getElementById("btnMenosSerie").click();
comprobar(doc.getElementById("numSeries").textContent === "1", "el contador de series no baja");

doc.getElementById("btnSerieHecha").click();
comprobar(doc.getElementById("temporizador").hidden === false, "el temporizador no se abrio");
doc.getElementById("btnPararTiempo").click();
comprobar(doc.getElementById("temporizador").hidden === true, "el temporizador no se cerro");

/* ---------- 6. Marcar como hecho ---------- */
ir("#/p/anderson/d/2/e/0");
doc.getElementById("btnHecho").click();
comprobar(/^#\/p\/anderson\/d\/2\/e\/1$/.test(window.location.hash),
  "al marcar hecho deberia pasar al siguiente ejercicio, quedo en " + window.location.hash);
ir("#/p/anderson/d/2");
comprobar(doc.querySelectorAll('.ejercicio[data-hecho="si"]').length === 1,
  "el ejercicio hecho no quedo marcado en la lista");

/* ---------- 7. Ajustes de visualizacion ---------- */
ir("#/");
doc.getElementById("btnLetraMas").click();
comprobar(doc.documentElement.style.getPropertyValue("--escala") === "1.1",
  "el tamano de letra no cambio (deberia quedar en 1.1)");
doc.querySelector('button[data-tema="maximo"]').click();
comprobar(doc.documentElement.getAttribute("data-tema") === "maximo",
  "el tema de maximo contraste no se aplico");
doc.getElementById("btnLetraMenos").click();
doc.querySelector('button[data-tema="oscuro"]').click();

/* ---------- 8. Rutas invalidas ---------- */
for (const mala of ["#/p/nadie", "#/p/anderson/d/99", "#/p/anderson/d/1/e/999", "#/basura/x/y",
                    "#/p/anderson/lista/99", "#/p/anderson/x/no-existe", "#/p/nadie/lista"]) {
  ir(mala);
  comprobar(texto().trim().length > 0, `la ruta invalida ${mala} dejo la pantalla vacia`);
}

/* ---------- Resultado ---------- */
if (errores.length) {
  console.log("ERRORES ENCONTRADOS:");
  errores.forEach(e => console.log("  x " + e));
  process.exit(1);
}
console.log(`OK - Prueba de humo superada: ${pantallas} pantallas renderizan y responden.`);
