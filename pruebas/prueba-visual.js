/* ============================================================
   PRUEBA VISUAL (Playwright + Chromium)
   Abre la app en un navegador real con el CSS aplicado y
   comprueba lo que jsdom NO puede ver: qué se ve, qué tapa qué,
   si algo se sale de la pantalla y si las fotos cargan.

   Uso:  npm install
         npx playwright install chromium
         node pruebas/prueba-visual.js

   Deja las capturas en  pruebas/capturas/
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const RAIZ = path.resolve(__dirname, "..");
const CAPTURAS = path.join(__dirname, "capturas");
const PUERTO = 41999;

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpg": "image/jpeg", ".png": "image/png"
};

const errores = [];
const avisos = [];
function fallo(pantalla, msg) { errores.push(`[${pantalla}] ${msg}`); }

/* ---------- servidor de pruebas ---------- */
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

/* ---------- comprobaciones sobre la página ya renderizada ---------- */
async function auditar(page, pantalla, opciones = {}) {
  /* 1. El temporizador no puede estar tapando la app salvo que se haya iniciado */
  const timer = await page.evaluate(() => {
    const t = document.getElementById("temporizador");
    const cs = getComputedStyle(t);
    const r = t.getBoundingClientRect();
    return { display: cs.display, visible: cs.display !== "none" && r.width > 0 && r.height > 0 };
  });
  if (opciones.timerVisible) {
    if (!timer.visible) fallo(pantalla, "el temporizador deberia estar visible y no lo esta");
  } else if (timer.visible) {
    fallo(pantalla, `el temporizador esta TAPANDO la pantalla (display: ${timer.display})`);
  }

  /* 2. Tiene que verse contenido real */
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
      if (r.width > 0 && (r.right > ancho + 1 || r.left < -1)) {
        culpables.push(`${el.tagName.toLowerCase()}.${el.className || "?"} (${Math.round(r.left)}..${Math.round(r.right)} vs ${ancho})`);
      }
    });
    return { ancho, scroll: document.documentElement.scrollWidth, culpables: culpables.slice(0, 4) };
  });
  if (overflow) fallo(pantalla, `se sale de la pantalla a lo ancho (${overflow.scroll}px vs ${overflow.ancho}px): ${overflow.culpables.join(" | ")}`);

  /* 4. Todas las fotos cargan */
  const fotosRotas = await page.evaluate(() =>
    [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute("src")));
  if (fotosRotas.length) fallo(pantalla, `fotos que no cargan: ${fotosRotas.join(", ")}`);

  /* 5. Areas tocables comodas (>= 44 px, el minimo de Apple).
        Se exime un input pequeño si su <label> envolvente ya mide 44 px:
        en ese caso el area que responde al toque es la etiqueta entera. */
  const pequenos = await page.evaluate(() => {
    const malos = [];
    document.querySelectorAll("button, a, input, select").forEach(el => {
      if (el.hasAttribute("hidden") || el.offsetParent === null) return;
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.height >= 44) return;
      const etiqueta = el.closest("label");
      if (etiqueta && etiqueta.getBoundingClientRect().height >= 44) return;
      malos.push(`${el.tagName.toLowerCase()}.${el.className || "?"} = ${Math.round(r.height)}px`);
    });
    return malos;
  });
  if (pequenos.length) fallo(pantalla, `elementos tocables por debajo de 44px: ${pequenos.slice(0, 5).join(", ")}`);

  /* 6. Ningun texto se solapa con su contenedor de forma evidente */
  const cortados = await page.evaluate(() => {
    const malos = [];
    document.querySelectorAll(".ejercicio-nombre, .dia-nombre, .detalle-nombre, .titulo-barra").forEach(el => {
      if (el.offsetParent === null) return;
      const cs = getComputedStyle(el);
      if (cs.overflow === "hidden" && cs.textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2) {
        malos.push(el.className);
      }
    });
    return malos;
  });
  if (cortados.length) avisos.push(`[${pantalla}] texto recortado sin puntos suspensivos: ${cortados.join(", ")}`);

  /* 7. Captura */
  await page.screenshot({ path: path.join(CAPTURAS, `${pantalla}.png`), fullPage: !opciones.soloViewport });
}

async function ir(page, hash) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(120);
}

(async () => {
  fs.mkdirSync(CAPTURAS, { recursive: true });
  for (const f of fs.readdirSync(CAPTURAS)) fs.unlinkSync(path.join(CAPTURAS, f));

  const servidor = await arrancarServidor();
  const navegador = await chromium.launch();
  const base = `http://127.0.0.1:${PUERTO}/index.html`;

  /* ============ Recorrido principal en tamaño iPhone ============ */
  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 },   /* iPhone 14 */
    deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
    locale: "es-CO"
  });
  const page = await ctx.newPage();

  page.on("console", m => { if (m.type() === "error") errores.push(`[consola] ${m.text()}`); });
  page.on("pageerror", e => errores.push(`[excepcion JS] ${e.message}`));
  page.on("requestfailed", r => {
    if (!r.url().includes("favicon")) errores.push(`[red] fallo ${r.url()} (${r.failure()?.errorText})`);
  });

  await page.goto(base + "#/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + "#/", { waitUntil: "networkidle" });
  await auditar(page, "01-inicio");

  await ir(page, "#/p/anderson");
  await page.waitForTimeout(200);
  await auditar(page, "02-semana-anderson");

  await ir(page, "#/p/anderson/lista");
  await page.waitForTimeout(300);
  await auditar(page, "03-lista-todos");

  await ir(page, "#/p/anderson/lista/2");
  await page.waitForTimeout(200);
  await auditar(page, "04-lista-filtro-martes");

  await ir(page, "#/p/anderson/x/press-banca");
  await page.waitForTimeout(300);
  await auditar(page, "05-consulta-ejercicio");

  await ir(page, "#/p/anderson/d/2");
  await page.waitForTimeout(300);
  await auditar(page, "06-dia-martes");

  await ir(page, "#/p/anderson/d/2/e/0");
  await page.waitForTimeout(300);
  await auditar(page, "07-ejercicio-entreno");

  /* --- ejercicio con foto aproximada: debe salir el aviso --- */
  await ir(page, "#/p/anderson/d/1/e/0");
  await page.waitForTimeout(300);
  const avisoAprox = await page.evaluate(() => document.body.textContent.includes("muy parecido"));
  if (!avisoAprox) fallo("08-foto-aproximada", "falta el aviso de foto aproximada");
  await auditar(page, "08-foto-aproximada");

  /* --- panel de ajustes --- */
  await ir(page, "#/p/anderson");
  await page.click("#btnAjustes");
  await page.waitForTimeout(150);
  const panelAbierto = await page.evaluate(() =>
    getComputedStyle(document.getElementById("panelAjustes")).display !== "none");
  if (!panelAbierto) fallo("09-ajustes", "el panel de ajustes no se abre");
  await auditar(page, "09-ajustes");

  /* --- temporizador de descanso: debe aparecer SOLO al pulsar --- */
  await ir(page, "#/p/anderson/d/2/e/0");
  await page.waitForTimeout(250);
  await page.click("#btnSerieHecha");
  await page.waitForTimeout(250);
  await auditar(page, "10-temporizador", { timerVisible: true, soloViewport: true });
  const numeroTimer = await page.textContent("#temporizadorNumero");
  if (!/^\d+$/.test(numeroTimer.trim())) fallo("10-temporizador", `la cuenta atras muestra "${numeroTimer}"`);
  await page.click("#btnPararTiempo");
  await page.waitForTimeout(200);
  const timerCerrado = await page.evaluate(() =>
    getComputedStyle(document.getElementById("temporizador")).display === "none");
  if (!timerCerrado) fallo("10-temporizador", "el temporizador no se cierra al pulsar Terminar");

  /* --- contador de series: empieza en 0, sube con + y baja con − --- */
  await ir(page, "#/p/sharid/d/1/e/0");
  await page.waitForTimeout(250);
  if ((await page.textContent("#numSeries")).trim() !== "0")
    fallo("11-series", "un ejercicio nuevo deberia empezar en 0 series");
  await page.click("#btnMasSerie");
  await page.click("#btnMasSerie");
  if ((await page.textContent("#numSeries")).trim() !== "2")
    fallo("11-series", `tras 2 toques en + deberia ir en 2, va en ${await page.textContent("#numSeries")}`);
  await page.click("#btnMenosSerie");
  if ((await page.textContent("#numSeries")).trim() !== "1")
    fallo("11-series", "el boton − no resta");
  /* y el valor debe sobrevivir a salir y volver */
  await ir(page, "#/p/sharid/d/1");
  await ir(page, "#/p/sharid/d/1/e/0");
  await page.waitForTimeout(250);
  if ((await page.textContent("#numSeries")).trim() !== "1")
    fallo("11-series", "las series no se guardan al salir y volver al ejercicio");

  /* --- filtro de la lista funciona de verdad al hacer clic --- */
  await ir(page, "#/p/sharid/lista");
  await page.waitForTimeout(300);
  const totalTodos = await page.locator(".ejercicio").count();
  await page.locator('.filtro[data-filtro="3"]').click();
  await page.waitForTimeout(250);
  const totalMiercoles = await page.locator(".ejercicio").count();
  const esperado = window_esperado("sharid", 3);
  if (totalMiercoles !== esperado) fallo("12-filtro", `el filtro de miercoles muestra ${totalMiercoles} y deberia mostrar ${esperado}`);
  if (totalMiercoles >= totalTodos) fallo("12-filtro", "el filtro no reduce la lista");
  await auditar(page, "12-filtro-miercoles-sharid");

  /* --- tema claro y maximo contraste --- */
  for (const tema of ["claro", "maximo"]) {
    await ir(page, "#/p/anderson/d/2/e/0");
    await page.waitForTimeout(200);
    await page.click("#btnAjustes");
    await page.click(`button[data-tema="${tema}"]`);
    await page.click("#btnAjustes");
    await page.waitForTimeout(200);
    await auditar(page, `13-tema-${tema}`);
  }
  await page.click("#btnAjustes");
  await page.click('button[data-tema="oscuro"]');
  await page.click("#btnAjustes");

  /* --- letra al maximo: nada se debe salir --- */
  await ir(page, "#/p/anderson/d/2/e/0");
  await page.click("#btnAjustes");
  for (let i = 0; i < 9; i++) await page.click("#btnLetraMas");
  await page.click("#btnAjustes");
  await page.waitForTimeout(250);
  await auditar(page, "14-letra-maxima");
  await page.click("#btnAjustes");
  for (let i = 0; i < 9; i++) await page.click("#btnLetraMenos");
  await page.click("#btnAjustes");

  await ctx.close();

  /* ============ Pantalla pequeña (iPhone SE) y Android ============ */
  for (const disp of [
    { nombre: "15-iphone-se", w: 375, h: 667 },
    { nombre: "16-android",   w: 412, h: 915 }
  ]) {
    const c = await navegador.newContext({ viewport: { width: disp.w, height: disp.h }, isMobile: true, hasTouch: true });
    const pg = await c.newPage();
    pg.on("pageerror", e => errores.push(`[${disp.nombre}] excepcion: ${e.message}`));
    await pg.goto(base + "#/p/anderson/d/1/e/0", { waitUntil: "networkidle" });
    await pg.waitForTimeout(400);
    await auditar(pg, disp.nombre);
    await c.close();
  }

  await navegador.close();
  servidor.close();

  /* ---------- Resultado ---------- */
  console.log(`Capturas en: ${path.relative(RAIZ, CAPTURAS)}`);
  console.log("");
  if (avisos.length) { console.log("AVISOS:"); avisos.forEach(a => console.log("  - " + a)); console.log(""); }
  if (errores.length) {
    console.log("ERRORES VISUALES:");
    errores.forEach(e => console.log("  x " + e));
    process.exit(1);
  }
  console.log("OK - Prueba visual superada.");
})();

/* Cuantos ejercicios distintos tiene una persona en un dia (leido de los datos) */
function window_esperado(persona, nDia) {
  const vm = require("vm");
  const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ["datos-catalogo.js", "datos-planes.js"]) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, "assets/js", f), "utf8"), ctx);
  }
  const d = ctx.PLANES[persona].dias.find(x => x.n === nDia);
  return new Set(d.ejercicios).size;
}
