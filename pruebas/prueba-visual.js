/* ============================================================
   PRUEBA VISUAL E INTERACTIVA (Playwright + Chromium)

   Abre la app en un navegador real con el CSS aplicado y comprueba
   lo que jsdom NO puede ver: qué se ve, qué tapa qué, si algo se
   sale de la pantalla, si las imágenes cargan de verdad, y si los
   controles (carrusel, temporizador, filtros, ajustes) responden.

   Uso:  npm install
         npx playwright install chromium
         node pruebas/prueba-visual.js

   Deja las capturas en  pruebas/capturas/
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const RAIZ = path.resolve(__dirname, "..");
const CAPTURAS = path.join(__dirname, "capturas");
const PUERTO = 41999;

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpg": "image/jpeg", ".png": "image/png"
};

const errores = [];
const avisos = [];
const info = [];
function fallo(pantalla, msg) { errores.push(`[${pantalla}] ${msg}`); }

function arrancarServidor() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      let ruta = decodeURIComponent(req.url.split("?")[0]);
      if (ruta === "/") ruta = "/index.html";
      const destino = path.join(RAIZ, ruta);
      if (!destino.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
      fs.readFile(destino, (err, datos) => {
        if (err) { res.writeHead(404).end("no"); return; }
        res.writeHead(200, { "Content-Type": TIPOS[path.extname(destino).toLowerCase()] || "application/octet-stream" });
        res.end(datos);
      });
    });
    s.listen(PUERTO, "127.0.0.1", () => resolve(s));
  });
}

function datos() {
  const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ["datos-catalogo.js", "datos-planes.js"]) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, "assets/js", f), "utf8"), ctx);
  }
  return ctx;
}

/* ---------- auditoría de una pantalla ya renderizada ---------- */
async function auditar(page, pantalla, op = {}) {
  /* 1. El temporizador solo puede verse si se ha iniciado */
  const timer = await page.evaluate(() => {
    const t = document.getElementById("temporizador");
    const cs = getComputedStyle(t);
    const r = t.getBoundingClientRect();
    return { display: cs.display, visible: cs.display !== "none" && r.width > 0 && r.height > 0 };
  });
  if (op.timerVisible) {
    if (!timer.visible) fallo(pantalla, "el temporizador deberia estar visible y no lo esta");
  } else if (timer.visible) {
    fallo(pantalla, `el temporizador esta TAPANDO la pantalla (display: ${timer.display})`);
  }

  /* 2. Contenido real visible */
  const cont = await page.evaluate(() => {
    const c = document.getElementById("contenido");
    const r = c.getBoundingClientRect();
    return { texto: c.textContent.trim().length, alto: r.height, visible: getComputedStyle(c).display !== "none" };
  });
  if (!cont.visible || cont.alto < 50) fallo(pantalla, "el contenido principal no se ve");
  if (cont.texto < 20) fallo(pantalla, "el contenido principal esta practicamente vacio");

  /* 3. Nada se sale de la pantalla a lo ancho */
  const overflow = await page.evaluate(() => {
    const ancho = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= ancho + 1) return null;
    const culpables = [];
    document.querySelectorAll("body *").forEach(el => {
      const r = el.getBoundingClientRect();
      /* la pista del carrusel desborda a proposito: es scroll horizontal propio */
      if (el.closest(".carrusel-pista")) return;
      /* el enlace de salto vive fuera de pantalla a proposito */
      if (el.classList.contains("salto-contenido")) return;
      if (r.width > 0 && r.right > ancho + 1) {
        culpables.push(`${el.tagName.toLowerCase()}.${el.className || "?"}`);
      }
    });
    return { ancho, scroll: document.documentElement.scrollWidth, culpables: culpables.slice(0, 4) };
  });
  if (overflow) fallo(pantalla, `se sale a lo ancho (${overflow.scroll} vs ${overflow.ancho}px): ${overflow.culpables.join(" | ")}`);

  /* 4. Todas las imágenes cargan */
  const rotas = await page.evaluate(() =>
    [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute("src")));
  if (rotas.length) fallo(pantalla, `imagenes que no cargan: ${rotas.join(", ")}`);

  /* 5. Áreas tocables >= 44 px (un input pequeño vale si su label llega) */
  const pequenos = await page.evaluate(() => {
    const malos = [];
    document.querySelectorAll("button, a, input, select").forEach(el => {
      if (el.hasAttribute("hidden") || el.offsetParent === null) return;
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.height >= 44) return;
      const et = el.closest("label");
      if (et && et.getBoundingClientRect().height >= 44) return;
      malos.push(`${el.tagName.toLowerCase()}.${el.className || "?"} = ${Math.round(r.height)}px`);
    });
    return malos;
  });
  if (pequenos.length) fallo(pantalla, `tocables por debajo de 44px: ${pequenos.slice(0, 5).join(", ")}`);

  /* 6. Con la página arriba del todo, la barra superior no puede tapar el
        primer bloque de contenido. (Si la página está desplazada, que el
        contenido pase por debajo de la barra pegajosa es lo correcto.) */
  const tapado = await page.evaluate(() => {
    if (window.scrollY > 2) return null;
    const barra = document.querySelector(".barra-superior").getBoundingClientRect();
    const primero = document.querySelector("#contenido > *");
    if (!primero) return null;
    const r = primero.getBoundingClientRect();
    return (r.top < barra.bottom - 2) ? { top: Math.round(r.top), barra: Math.round(barra.bottom) } : null;
  });
  if (tapado) fallo(pantalla, `la barra superior tapa el contenido (${tapado.top} < ${tapado.barra})`);

  if (op.captura !== false) {
    await page.screenshot({ path: path.join(CAPTURAS, `${pantalla}.png`), fullPage: !op.soloViewport });
  }
}

async function ir(page, hash, espera = 150) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(espera);
}

/* Abrir una pantalla desde cero: la app siempre arranca en el selector,
   así que hay que cargar y después navegar, igual que hace una persona. */
async function abrir(page, base, hash, espera = 500) {
  await page.goto(base, { waitUntil: "networkidle" });
  await ir(page, hash, espera);
}

(async () => {
  const D = datos();
  fs.mkdirSync(CAPTURAS, { recursive: true });
  /* Solo se borran las capturas de esta prueba. Aquí dentro también deja
     hojas `herramientas/revisar-fotos.py`, en su propia carpeta, y borrar
     una carpeta con unlink revienta. */
  for (const f of fs.readdirSync(CAPTURAS)) {
    const p = path.join(CAPTURAS, f);
    if (fs.statSync(p).isFile()) fs.unlinkSync(p);
  }

  const servidor = await arrancarServidor();
  const navegador = await chromium.launch();
  const base = `http://127.0.0.1:${PUERTO}/index.html`;

  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: "es-CO"
  });
  const page = await ctx.newPage();

  const urlsPedidas = new Set();
  page.on("console", m => { if (m.type() === "error") errores.push(`[consola] ${m.text()}`); });
  page.on("pageerror", e => errores.push(`[excepcion JS] ${e.message}`));
  page.on("request", r => urlsPedidas.add(r.url()));
  page.on("requestfailed", r => {
    if (!r.url().includes("favicon")) errores.push(`[red] fallo ${r.url()} (${r.failure()?.errorText})`);
  });
  page.on("response", r => {
    if (r.status() >= 400 && !r.url().includes("favicon")) {
      errores.push(`[red] ${r.status()} en ${r.url()}`);
    }
  });

  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());

  /* ====== 0. La app SIEMPRE abre en el selector de persona ====== */
  for (const entrada of ["", "#/", "#/p/anderson", "#/p/sharid/d/3/e/2", "#/p/anderson/lista"]) {
    /* Cambiar solo el fragmento NO recarga el documento: hay que salir de
       la pagina para que sea una apertura de verdad, como cuando se toca
       el icono de la app. */
    await page.goto("about:blank");
    await page.goto(base + entrada, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const estado = await page.evaluate(() => ({
      personas: document.querySelectorAll(".persona").length,
      hash: location.hash,
      titulo: document.getElementById("tituloBarra").textContent
    }));
    if (estado.personas !== 2)
      fallo("00-arranque", `abriendo en "${entrada}" no sale el selector (${estado.personas} personas)`);
    if (estado.hash !== "#/" && estado.hash !== "")
      fallo("00-arranque", `abriendo en "${entrada}" la direccion queda en "${estado.hash}"`);
    if (estado.titulo !== "Mi Entreno")
      fallo("00-arranque", `abriendo en "${entrada}" el titulo es "${estado.titulo}"`);
  }
  /* Y tras elegir persona, recargar tiene que devolver al selector */
  await abrir(page, base, "#/p/anderson/d/2/e/0", 400);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  if (await page.locator(".persona").count() !== 2)
    fallo("00-arranque", "al recargar no vuelve al selector de persona");
  info.push("Arranque: abre en el selector desde cualquier direccion, y al recargar tambien");

  /* ====== 1. Recorrido de pantallas con captura ====== */
  await page.goto(base, { waitUntil: "networkidle" });
  await auditar(page, "01-inicio");

  await ir(page, "#/p/anderson", 250);
  await auditar(page, "02-semana-anderson");

  await ir(page, "#/p/anderson/lista", 400);
  await auditar(page, "03-lista-todos");

  await ir(page, "#/p/anderson/lista/2", 250);
  await auditar(page, "04-lista-filtro-martes");

  await ir(page, "#/p/anderson/x/press-banca", 350);
  await auditar(page, "05-consulta-ejercicio");

  await ir(page, "#/p/anderson/d/2", 300);
  await auditar(page, "06-dia-martes");

  await ir(page, "#/p/anderson/d/2/e/0", 350);
  await auditar(page, "07-ejercicio-entreno");

  await ir(page, "#/p/anderson/d/1/e/0", 350);
  await auditar(page, "08-ejercicio-foto-parecida");

  await ir(page, "#/p/sharid", 250);
  await auditar(page, "09-semana-sharid");

  /* ====== 2. Panel de ajustes ====== */
  await page.click("#btnAjustes");
  await page.waitForTimeout(150);
  if (!await page.evaluate(() => getComputedStyle(document.getElementById("panelAjustes")).display !== "none"))
    fallo("10-ajustes", "el panel de ajustes no se abre");

  /* Las casillas TIENEN que verse. Con `appearance: none` se quedan
     invisibles (sin cuadro ni marca) y el ajuste deja de existir de hecho. */
  const casillas = await page.evaluate(() =>
    [...document.querySelectorAll('#panelAjustes input[type="checkbox"]')].map(el => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { ancho: Math.round(r.width), alto: Math.round(r.height), apariencia: cs.appearance };
    }));
  if (casillas.length !== 2) fallo("10-ajustes", `hay ${casillas.length} casillas y deberian ser 2`);
  casillas.forEach((c, i) => {
    if (c.ancho < 16 || c.alto < 16) fallo("10-ajustes", `la casilla ${i + 1} mide ${c.ancho}x${c.alto}`);
    if (c.apariencia === "none") fallo("10-ajustes", `la casilla ${i + 1} es invisible (appearance: none)`);
  });

  /* Y los datos guardados se explican y se pueden descargar o borrar */
  const infoDatos = await page.evaluate(() => ({
    explica: /solo en este tel/i.test(document.getElementById("notaDatos").textContent),
    resumen: document.getElementById("resumenDatos").textContent.length > 20,
    exportar: !!document.getElementById("btnExportar"),
    borrar: !!document.getElementById("btnBorrarDatos"),
    version: document.getElementById("versionApp").textContent
  }));
  if (!infoDatos.explica) fallo("10-ajustes", "no se explica donde se guardan los datos");
  if (!infoDatos.resumen) fallo("10-ajustes", "no se muestra cuanto hay guardado");
  if (!infoDatos.exportar || !infoDatos.borrar) fallo("10-ajustes", "faltan los botones de copia o de borrado");
  if (!/versi/i.test(infoDatos.version)) fallo("10-ajustes", "no se muestra la version de la app");

  await auditar(page, "10-ajustes");
  await page.click("#btnAjustes");
  await page.waitForTimeout(150);
  if (await page.evaluate(() => getComputedStyle(document.getElementById("panelAjustes")).display !== "none"))
    fallo("10-ajustes", "el panel de ajustes no se cierra");

  /* ====== 3. CARRUSEL: recorrido COMPLETO de ida y vuelta ======
     Esta es la prueba que faltaba. El bug era que «Anterior» bajaba de la 3
     a la 2 y ahí se quedaba clavado: deshabilitar el botón enfocado cancelaba
     el desplazamiento. Solo se veía encadenando varios clics, así que aquí se
     recorre 1→2→3→2→1 y se comprueba el contador Y la posición del scroll en
     cada paso. */
  await ir(page, "#/p/anderson/d/2/e/0", 500);   /* peck-deck: 3 laminas */

  const estadoCarrusel = () => page.evaluate(() => ({
    laminas: document.querySelectorAll(".carrusel-lamina").length,
    num: document.querySelector(".carrusel-num").textContent,
    scroll: Math.round(document.querySelector(".carrusel-pista").scrollLeft),
    prevAria: document.querySelector('.carrusel-flecha[data-paso="-1"]').getAttribute("aria-disabled"),
    nextAria: document.querySelector('.carrusel-flecha[data-paso="1"]').getAttribute("aria-disabled"),
    algunoDisabled: !!document.querySelector(".carrusel-flecha[disabled]"),
    puntos: document.querySelectorAll(".carrusel-punto").length
  }));

  /* Los botones nunca llevan `disabled`, así que se pulsan con dispatchEvent:
     Playwright se niega a hacer clic sobre algo con aria-disabled. */
  const pulsar = paso => page.evaluate(p => {
    document.querySelector(`.carrusel-flecha[data-paso="${p}"]`).click();
  }, paso);

  const c0 = await estadoCarrusel();
  if (c0.laminas !== 3) fallo("11-carrusel", `deberia haber 3 laminas, hay ${c0.laminas}`);
  if (c0.puntos !== 0) fallo("11-carrusel", "los puntos numerados deberian haberse quitado");
  if (c0.algunoDisabled) fallo("11-carrusel", "ninguna flecha debe usar el atributo disabled");
  if (c0.prevAria !== "true") fallo("11-carrusel", "en la lamina 1, Anterior debe ir con aria-disabled");
  if (c0.nextAria === "true") fallo("11-carrusel", "en la lamina 1, Siguiente no puede ir deshabilitada");

  const recorrido = [
    { paso: "1",  espera: "2", scrollSube: true },
    { paso: "1",  espera: "3", scrollSube: true },
    { paso: "-1", espera: "2", scrollSube: false },
    { paso: "-1", espera: "1", scrollSube: false }
  ];
  let previo = c0;
  for (const r of recorrido) {
    await pulsar(r.paso);
    await page.waitForTimeout(800);
    const e = await estadoCarrusel();
    if (e.num !== r.espera)
      fallo("11-carrusel", `tras pulsar ${r.paso} el contador dice "${e.num}" y deberia decir ${r.espera}`);
    if (r.scrollSube && e.scroll <= previo.scroll)
      fallo("11-carrusel", `tras pulsar ${r.paso} la pista no avanzo (${previo.scroll} -> ${e.scroll})`);
    if (!r.scrollSube && e.scroll >= previo.scroll)
      fallo("11-carrusel", `tras pulsar ${r.paso} la pista no retrocedio (${previo.scroll} -> ${e.scroll})`);
    previo = e;
  }
  if (previo.prevAria !== "true") fallo("11-carrusel", "de vuelta en la 1, Anterior debe ir con aria-disabled");
  if (previo.scroll !== 0) fallo("11-carrusel", `de vuelta en la 1 el scroll deberia ser 0 y es ${previo.scroll}`);

  /* En los extremos no pasa nada */
  await pulsar("-1"); await page.waitForTimeout(500);
  if ((await page.textContent(".carrusel-num")) !== "1")
    fallo("11-carrusel", "pulsar Anterior en la primera lamina no debe hacer nada");

  /* teclado */
  await page.focus(".carrusel-pista");
  await page.keyboard.press("End");
  await page.waitForTimeout(800);
  if ((await page.textContent(".carrusel-num")) !== "3")
    fallo("11-carrusel", "la tecla Fin no lleva a la ultima lamina");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(800);
  if ((await page.textContent(".carrusel-num")) !== "2")
    fallo("11-carrusel", "la flecha izquierda del teclado no retrocede");
  await page.keyboard.press("Home");
  await page.waitForTimeout(800);
  if ((await page.textContent(".carrusel-num")) !== "1")
    fallo("11-carrusel", "la tecla Inicio no vuelve a la primera lamina");
  await auditar(page, "11-carrusel", { soloViewport: true });

  /* El enlace al video va justo DEBAJO de las imagenes */
  const orden = await page.evaluate(() => {
    const c = document.querySelector(".carrusel");
    const v = document.querySelector(".enlace-video");
    const p = document.querySelector(".pasos");
    if (!c || !v || !p) return null;
    return {
      videoTrasCarrusel: !!(c.compareDocumentPosition(v) & 4),
      videoAntesDePasos: !!(v.compareDocumentPosition(p) & 4),
      distancia: Math.round(v.getBoundingClientRect().top - c.getBoundingClientRect().bottom)
    };
  });
  if (!orden) fallo("11-carrusel", "falta el carrusel, el video o los pasos");
  else {
    if (!orden.videoTrasCarrusel) fallo("11-carrusel", "el video no va despues del carrusel");
    if (!orden.videoAntesDePasos) fallo("11-carrusel", "el video deberia ir antes de los pasos");
    if (orden.distancia > 60) fallo("11-carrusel", `el video queda a ${orden.distancia}px del carrusel, muy lejos`);
  }

  /* Un ejercicio cuya foto es solo parecida: 3 laminas igual, con el aviso */
  await ir(page, "#/p/anderson/d/1/e/0", 500);
  const parecida = await page.evaluate(() => ({
    laminas: document.querySelectorAll(".carrusel-lamina").length,
    flechas: document.querySelectorAll(".carrusel-flecha").length,
    aviso: /parecid/.test(document.getElementById("contenido").textContent),
    rotulos: [...document.querySelectorAll(".foto-pie")].map(x => x.textContent).join(" | ")
  }));
  if (parecida.laminas !== 3 || parecida.flechas !== 2 || !parecida.aviso)
    fallo("11-carrusel", `ejercicio con foto parecida: ${JSON.stringify(parecida)}`);

  /* ====== 4. TEMPORIZADOR ====== */
  await ir(page, "#/p/anderson/d/2/e/0", 350);
  await page.click("#btnSerieHecha");
  await page.waitForTimeout(300);
  await auditar(page, "12-temporizador", { timerVisible: true, soloViewport: true });

  const t0 = await page.evaluate(() => ({
    num: document.getElementById("temporizadorNumero").textContent,
    offset: document.getElementById("anilloProgreso").getAttribute("stroke-dashoffset"),
    fase: document.getElementById("temporizadorReloj").getAttribute("data-fase")
  }));
  if (!/^\d+$/.test(t0.num.trim())) fallo("12-temporizador", `la cuenta muestra "${t0.num}"`);
  if (Number(t0.num) < 55 || Number(t0.num) > 60) fallo("12-temporizador", `deberia arrancar cerca de 60, muestra ${t0.num}`);

  await page.waitForTimeout(2500);
  const t1 = await page.evaluate(() => ({
    num: Number(document.getElementById("temporizadorNumero").textContent),
    offset: Number(document.getElementById("anilloProgreso").getAttribute("stroke-dashoffset"))
  }));
  if (t1.num >= Number(t0.num)) fallo("12-temporizador", `la cuenta atras no baja (${t0.num} -> ${t1.num})`);
  if (t1.offset <= Number(t0.offset)) fallo("12-temporizador", "el anillo de progreso no avanza");

  await page.click("#btnMasTiempo");
  await page.waitForTimeout(200);
  const t2 = await page.evaluate(() => Number(document.getElementById("temporizadorNumero").textContent));
  if (t2 < t1.num + 25) fallo("12-temporizador", `el boton +30 s no suma (${t1.num} -> ${t2})`);

  await page.click("#btnPararTiempo");
  await page.waitForTimeout(250);
  if (!await page.evaluate(() => getComputedStyle(document.getElementById("temporizador")).display === "none"))
    fallo("12-temporizador", "el temporizador no se cierra al pulsar Terminar");

  /* y al cambiar de pantalla tampoco debe quedarse abierto */
  await page.click("#btnSerieHecha");
  await page.waitForTimeout(200);
  await ir(page, "#/p/anderson/d/2", 300);
  if (!await page.evaluate(() => getComputedStyle(document.getElementById("temporizador")).display === "none"))
    fallo("12-temporizador", "el temporizador sigue abierto tras cambiar de pantalla");

  /* ====== 5. Contador de series ====== */
  await ir(page, "#/p/sharid/d/1/e/0", 350);
  if ((await page.textContent("#numSeries")).trim() !== "0")
    fallo("13-series", "un ejercicio nuevo deberia empezar en 0");
  await page.click("#btnMasSerie");
  await page.click("#btnMasSerie");
  if ((await page.textContent("#numSeries")).trim() !== "2") fallo("13-series", "el boton + no suma");
  await page.click("#btnMenosSerie");
  if ((await page.textContent("#numSeries")).trim() !== "1") fallo("13-series", "el boton − no resta");
  await page.click("#btnMenosSerie");
  await page.click("#btnMenosSerie");
  if ((await page.textContent("#numSeries")).trim() !== "0") fallo("13-series", "el contador no se queda en 0");
  await page.click("#btnMasSerie");
  await ir(page, "#/p/sharid/d/1", 200);
  await ir(page, "#/p/sharid/d/1/e/0", 350);
  if ((await page.textContent("#numSeries")).trim() !== "1")
    fallo("13-series", "las series no se guardan al salir y volver");

  /* ====== 6. Filtros de la lista ====== */
  await ir(page, "#/p/sharid/lista", 400);
  const total = await page.locator(".ejercicio").count();
  for (const d of D.PLANES.sharid.dias.filter(x => x.ejercicios.length)) {
    await page.locator(`.filtro[data-filtro="${d.n}"]`).click();
    await page.waitForTimeout(250);
    const n = await page.locator(".ejercicio").count();
    const esperado = new Set(d.ejercicios).size;
    if (n !== esperado) fallo("14-filtro", `${d.dia}: muestra ${n} y deberia mostrar ${esperado}`);
    const marcado = await page.locator(`.filtro[data-filtro="${d.n}"]`).getAttribute("aria-pressed");
    if (marcado !== "true") fallo("14-filtro", `${d.dia}: el chip no queda marcado`);
  }
  await page.locator('.filtro[data-filtro="todos"]').click();
  await page.waitForTimeout(250);
  if (await page.locator(".ejercicio").count() !== total)
    fallo("14-filtro", "el filtro Todos no restaura la lista completa");
  await auditar(page, "14-filtro-todos-sharid");

  /* ====== 7. Marcar hecho y estado final del día ====== */
  await page.evaluate(() => localStorage.clear());
  await ir(page, "#/p/anderson/d/2", 300);
  for (let i = 0; i < 8; i++) {
    await ir(page, `#/p/anderson/d/2/e/${i}`, 250);
    await page.click("#btnHecho");
    await page.waitForTimeout(200);
  }
  await ir(page, "#/p/anderson/d/2", 350);
  const completo = await page.evaluate(() => ({
    marcados: document.querySelectorAll('.ejercicio[data-hecho="si"]').length,
    final: !!document.querySelector(".estado-final")
  }));
  if (completo.marcados !== 8) fallo("15-dia-completo", `${completo.marcados} de 8 marcados`);
  if (!completo.final) fallo("15-dia-completo", "falta el estado de dia completo");
  await auditar(page, "15-dia-completo");
  await page.evaluate(() => localStorage.clear());

  /* ====== 8. Temas y letra al máximo ====== */
  for (const tema of ["claro", "maximo"]) {
    await ir(page, "#/p/anderson/d/2/e/0", 300);
    await page.click("#btnAjustes");
    await page.click(`button[data-tema="${tema}"]`);
    await page.click("#btnAjustes");
    await page.waitForTimeout(250);
    await auditar(page, `16-tema-${tema}`);
  }
  await page.click("#btnAjustes");
  await page.click('button[data-tema="oscuro"]');
  await page.click("#btnAjustes");

  await ir(page, "#/p/anderson/d/2/e/0", 250);
  await page.click("#btnAjustes");
  for (let i = 0; i < 9; i++) await page.click("#btnLetraMas");
  await page.click("#btnAjustes");
  await page.waitForTimeout(300);
  await auditar(page, "17-letra-maxima");
  await page.click("#btnAjustes");
  for (let i = 0; i < 9; i++) await page.click("#btnLetraMenos");
  await page.click("#btnAjustes");

  /* ====== 8b. TABATA: configuración y cuenta atrás real ====== */
  await ir(page, "#/tabata", 400);
  const cfgTabata = await page.evaluate(() => ({
    presets: document.querySelectorAll(".tabata-preset").length,
    ajustes: document.querySelectorAll(".tabata-fila").length,
    trabajo: document.getElementById("tv-trabajo").textContent.trim(),
    descanso: document.getElementById("tv-descanso").textContent.trim(),
    rondas: document.getElementById("tv-rondas").textContent.trim(),
    resumen: document.getElementById("tabataResumen").textContent
  }));
  if (cfgTabata.presets < 3) fallo("21-tabata", "faltan preajustes");
  if (cfgTabata.ajustes !== 6) fallo("21-tabata", `hay ${cfgTabata.ajustes} ajustes y deberian ser 6`);
  if (cfgTabata.trabajo !== "20 s" || cfgTabata.descanso !== "10 s" || cfgTabata.rondas !== "8")
    fallo("21-tabata", `por defecto deberia ser 20 s / 10 s / 8 rondas y es ${JSON.stringify(cfgTabata)}`);
  /* 10 s de preparacion + 8 x 20 s de trabajo + 7 x 10 s de descanso = 240 s */
  if (!/4:00/.test(cfgTabata.resumen))
    fallo("21-tabata", `la duracion del Tabata clasico deberia ser 4:00 -> "${cfgTabata.resumen}"`);
  await auditar(page, "21-tabata-config");

  /* Los + y − mueven el valor */
  await page.click('.tabata-mas-menos[data-campo="trabajo"][data-delta="1"]');
  if ((await page.textContent("#tv-trabajo")).trim() !== "25 s")
    fallo("21-tabata", "el boton + de trabajo no suma 5 s");
  await page.click('.tabata-mas-menos[data-campo="trabajo"][data-delta="-1"]');

  /* Sesión mínima para ver la cuenta atrás de verdad: sin preparación,
     5 s de trabajo y 1 ronda. */
  for (let i = 0; i < 3; i++) await page.click('.tabata-mas-menos[data-campo="preparacion"][data-delta="-1"]');
  for (let i = 0; i < 5; i++) await page.click('.tabata-mas-menos[data-campo="trabajo"][data-delta="-1"]');
  for (let i = 0; i < 10; i++) await page.click('.tabata-mas-menos[data-campo="rondas"][data-delta="-1"]');
  const mini = await page.evaluate(() => ({
    prep: document.getElementById("tv-preparacion").textContent.trim(),
    trabajo: document.getElementById("tv-trabajo").textContent.trim(),
    rondas: document.getElementById("tv-rondas").textContent.trim()
  }));
  if (mini.prep !== "0 s" || mini.trabajo !== "5 s" || mini.rondas !== "1")
    fallo("21-tabata", `los limites no se respetan: ${JSON.stringify(mini)}`);

  await page.click("#btnTabataEmpezar");
  await page.waitForTimeout(600);
  const tb1 = await page.evaluate(() => ({
    fase: document.getElementById("tabataFase").textContent,
    seg: Number(document.getElementById("tabataSegundos").textContent),
    ronda: document.getElementById("tabataRonda").textContent,
    faseAttr: document.getElementById("tabataPantalla").getAttribute("data-fase")
  }));
  if (!/Trabaja/.test(tb1.fase)) fallo("21-tabata", `sin preparacion deberia empezar trabajando, dice "${tb1.fase}"`);
  if (tb1.faseAttr !== "trabajo") fallo("21-tabata", "el atributo data-fase no acompana");
  if (!(tb1.seg >= 4 && tb1.seg <= 5)) fallo("21-tabata", `la cuenta arranca en ${tb1.seg} y deberia ir por 5`);
  if (!/Ronda 1 de 1/.test(tb1.ronda)) fallo("21-tabata", `el contador de ronda dice "${tb1.ronda}"`);
  await auditar(page, "21-tabata-marcha", { soloViewport: true });

  /* Pausa: el numero deja de bajar */
  await page.click("#btnTabataPausa");
  const pausado = await page.evaluate(() => document.getElementById("tabataSegundos").textContent);
  await page.waitForTimeout(1300);
  if ((await page.textContent("#tabataSegundos")) !== pausado)
    fallo("21-tabata", "en pausa la cuenta atras sigue bajando");
  if (!/Reanudar/.test(await page.textContent("#btnTabataPausa")))
    fallo("21-tabata", "el boton no cambia a Reanudar");
  await page.click("#btnTabataPausa");
  await page.waitForTimeout(1400);
  const tb2 = await page.evaluate(() => Number(document.getElementById("tabataSegundos").textContent));
  if (tb2 >= Number(pausado)) fallo("21-tabata", `tras reanudar no baja (${pausado} -> ${tb2})`);

  /* Que llegue al final solo */
  await page.waitForTimeout(6000);
  const fin = await page.evaluate(() => ({
    fase: document.getElementById("tabataFase").textContent,
    ronda: document.getElementById("tabataRonda").textContent
  }));
  if (!/Terminado/.test(fin.fase)) fallo("21-tabata", `no llega al final solo: "${fin.fase}"`);
  if (!/completa/.test(fin.ronda)) fallo("21-tabata", "no avisa de sesion completa");

  await page.click("#btnTabataParar");
  await page.waitForTimeout(300);
  if (!await page.evaluate(() => !!document.getElementById("btnTabataEmpezar")))
    fallo("21-tabata", "al terminar no vuelve a la configuracion");
  info.push("Tabata: preajustes, limites, cuenta atras, pausa y final automatico");

  /* Y a 320 px con la letra al 180 % tampoco se sale */
  {
    const c = await navegador.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    const pg = await c.newPage();
    pg.on("pageerror", e => errores.push(`[tabata 320px] excepcion: ${e.message}`));
    await pg.goto(base, { waitUntil: "networkidle" });
    await pg.evaluate(() => document.documentElement.style.setProperty("--escala", 1.8));
    await ir(pg, "#/tabata", 500);
    await auditar(pg, "22-tabata-320px", { captura: false });
    await pg.click("#btnTabataEmpezar");
    await pg.waitForTimeout(600);
    await auditar(pg, "22-tabata-320px-marcha", { soloViewport: true });
    await c.close();
  }

  /* ====== 9. Ningún enlace roto ====== */
  await ir(page, "#/p/anderson", 250);
  const enlaces = new Set();
  for (const pid of ["anderson", "sharid"]) {
    for (const d of D.PLANES[pid].dias) {
      for (let i = 0; i < d.ejercicios.length; i++) {
        await ir(page, `#/p/${pid}/d/${d.n}/e/${i}`, 40);
        (await page.evaluate(() => [...document.querySelectorAll("a[href]")].map(a => a.href)))
          .forEach(h => enlaces.add(h));
      }
    }
  }
  for (const h of enlaces) {
    if (h.startsWith("http://127.0.0.1") || h.startsWith("https://www.youtube.com/results?search_query=")) continue;
    fallo("18-enlaces", `enlace inesperado: ${h}`);
  }
  info.push(`Enlaces externos revisados: ${enlaces.size}, todos a busquedas de YouTube bien formadas`);

  await ctx.close();

  /* ====== 10. El caso extremo: 320 px CON la letra al 180 % ======
     Es el criterio Reflow 1.4.10 de WCAG, y aquí no es teórico: un iPhone con
     el Zoom de pantalla activado —que alguien con baja visión sí usa— se
     comporta como 320 px de ancho. Si además sube la letra en la app, se juntan
     las dos cosas. Ya se salió una vez el bloque de series/repes. */
  for (const escala of [1, 1.8]) {
    const c = await navegador.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    const pg = await c.newPage();
    pg.on("pageerror", e => errores.push(`[320px x${escala}] excepcion: ${e.message}`));
    await pg.goto(base, { waitUntil: "networkidle" });
    await pg.evaluate(e => document.documentElement.style.setProperty("--escala", e), escala);
    for (const h of ["#/", "#/p/anderson", "#/p/anderson/lista", "#/p/anderson/d/2",
                     "#/p/anderson/d/2/e/0", "#/p/anderson/d/1/e/0"]) {
      await ir(pg, h, 450);
      await auditar(pg, `18-320px-x${escala}${h.replace(/\//g, "_")}`, { captura: false });
    }
    /* y con el temporizador abierto, que es el bloque más ancho */
    await ir(pg, "#/p/anderson/d/2/e/0", 400);
    await pg.click("#btnSerieHecha");
    await pg.waitForTimeout(400);
    await auditar(pg, `18-320px-x${escala}-temporizador`, { timerVisible: true, soloViewport: true });
    await c.close();
  }
  info.push("Aguanta 320 px de ancho, tambien con la letra al 180 %");

  /* ====== 11. Pantallas pequeñas ====== */
  for (const disp of [
    { nombre: "19-iphone-se", w: 375, h: 667 },
    { nombre: "20-android", w: 412, h: 915 }
  ]) {
    const c = await navegador.newContext({ viewport: { width: disp.w, height: disp.h }, isMobile: true, hasTouch: true });
    const pg = await c.newPage();
    pg.on("pageerror", e => errores.push(`[${disp.nombre}] excepcion: ${e.message}`));
    await abrir(pg, base, "#/p/anderson/d/2/e/0", 600);
    await auditar(pg, disp.nombre);
    await c.close();
  }

  await navegador.close();
  servidor.close();

  console.log(`Capturas en: ${path.relative(RAIZ, CAPTURAS)}`);
  info.forEach(i => console.log("  · " + i));
  console.log("");
  if (avisos.length) { console.log("AVISOS:"); avisos.forEach(a => console.log("  - " + a)); console.log(""); }
  if (errores.length) {
    console.log("ERRORES VISUALES:");
    errores.forEach(e => console.log("  x " + e));
    process.exit(1);
  }
  console.log("OK - Prueba visual e interactiva superada.");
})();
