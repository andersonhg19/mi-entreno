/* ============================================================
   PRUEBA DE PWA, ACCESIBILIDAD Y MODO SIN CONEXIÓN
   Lo que de verdad importa cuando estás parado en el gimnasio.

   Comprueba:
     · El manifest y los iconos (instalable en iPhone y Android)
     · Que el service worker cachea y la app abre SIN INTERNET
     · Contraste real medido en los tres temas
     · Accesibilidad: idioma, textos alternativos, nombres de botones
     · Que el avance se guarda al recargar
     · Que el día marcado como HOY es el correcto
     · Recorrido completo por los 114 ejercicios en navegador real

   Uso:  node pruebas/prueba-pwa.js
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const RAIZ = path.resolve(__dirname, "..");
const PUERTO = 42001;
const errores = [];
const info = [];
function fallo(m) { errores.push(m); }

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpg": "image/jpeg", ".png": "image/png"
};

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

/* Datos, para comparar la app contra la fuente */
function cargarDatos() {
  const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ["datos-catalogo.js", "datos-planes.js"]) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, "assets/js", f), "utf8"), ctx);
  }
  return ctx;
}

/* Contraste WCAG entre dos colores rgb() */
function luminancia(rgb) {
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const la = luminancia(a), lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function aRgb(css) {
  const m = css.match(/\d+(\.\d+)?/g);
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
}

(async () => {
  const DATOS = cargarDatos();
  const servidor = await arrancarServidor();
  const navegador = await chromium.launch();
  const base = `http://127.0.0.1:${PUERTO}/index.html`;

  const ctx = await navegador.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "es-CO"
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => fallo(`excepcion JS: ${e.message}`));
  page.on("console", m => { if (m.type() === "error") fallo(`consola: ${m.text()}`); });

  await page.goto(base + "#/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());

  /* ========== 1. MANIFEST E ICONOS ========== */
  const manifest = JSON.parse(fs.readFileSync(path.join(RAIZ, "manifest.webmanifest"), "utf8"));
  for (const campo of ["name", "short_name", "start_url", "display", "icons", "theme_color", "background_color"]) {
    if (!manifest[campo]) fallo(`manifest: falta "${campo}"`);
  }
  if (manifest.display !== "standalone") fallo(`manifest: display deberia ser "standalone", es "${manifest.display}"`);
  for (const icono of manifest.icons) {
    const p = path.join(RAIZ, icono.src);
    if (!fs.existsSync(p)) { fallo(`manifest: no existe el icono ${icono.src}`); continue; }
    /* leer las dimensiones reales de la cabecera PNG */
    const b = fs.readFileSync(p);
    const ancho = b.readUInt32BE(16), alto = b.readUInt32BE(20);
    const [dw, dh] = icono.sizes.split("x").map(Number);
    if (ancho !== dw || alto !== dh) fallo(`manifest: ${icono.src} dice ${icono.sizes} pero mide ${ancho}x${alto}`);
  }
  if (!manifest.icons.some(i => (i.purpose || "").includes("maskable")))
    fallo("manifest: falta un icono maskable (Android lo recorta mal sin el)");
  /* Apple necesita el apple-touch-icon en el HTML, no le basta el manifest */
  const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
  if (!/rel="apple-touch-icon"/.test(html)) fallo("index.html: falta <link rel=apple-touch-icon> (iPhone)");
  if (!/apple-mobile-web-app-capable/.test(html)) fallo("index.html: falta apple-mobile-web-app-capable");
  info.push(`Manifest e iconos: ${manifest.icons.length} iconos correctos`);

  /* ========== 2. SERVICE WORKER Y MODO SIN CONEXIÓN ========== */
  await page.goto(base + "#/p/anderson/d/2", { waitUntil: "networkidle" });
  const registrado = await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    return !!r;
  });
  if (!registrado) fallo("el service worker no se registro");

  /* esperar a que termine de precargar y tome el control */
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(3000);

  const enCache = await page.evaluate(async () => {
    const claves = await caches.keys();
    if (!claves.length) return 0;
    const c = await caches.open(claves[0]);
    return (await c.keys()).length;
  });
  const esperadoEnCache = (fs.readFileSync(path.join(RAIZ, "sw.js"), "utf8").match(/"[^"]+"/g) || []).length;
  if (enCache < 120) fallo(`el service worker solo cacheo ${enCache} archivos (se esperaban ~124)`);
  info.push(`Service worker: ${enCache} archivos en cache`);

  /* AHORA SIN INTERNET */
  await ctx.setOffline(true);
  await page.goto(base + "#/p/anderson/d/2", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const offline = await page.evaluate(() => {
    const c = document.getElementById("contenido");
    const imgs = [...document.images];
    return {
      texto: c.textContent.trim().length,
      ejercicios: document.querySelectorAll(".ejercicio").length,
      fotosOk: imgs.length > 0 && imgs.every(i => !i.complete || i.naturalWidth > 0)
    };
  });
  if (offline.texto < 50) fallo("SIN INTERNET: la app no carga contenido");
  if (offline.ejercicios !== 8) fallo(`SIN INTERNET: el martes deberia listar 8 ejercicios, lista ${offline.ejercicios}`);
  if (!offline.fotosOk) fallo("SIN INTERNET: las fotos no cargan desde el cache");

  await page.evaluate(() => { window.location.hash = "#/p/anderson/d/2/e/0"; });
  await page.waitForTimeout(600);
  const detalleOffline = await page.evaluate(() => ({
    nombre: (document.querySelector(".detalle-nombre") || {}).textContent || "",
    fotos: [...document.querySelectorAll(".fotos img")].filter(i => i.naturalWidth > 0).length
  }));
  if (detalleOffline.fotos !== 2) fallo(`SIN INTERNET: el detalle deberia mostrar 2 fotos, muestra ${detalleOffline.fotos}`);
  info.push(`Sin internet: la app abre, lista los ejercicios y muestra las fotos ("${detalleOffline.nombre}")`);
  await ctx.setOffline(false);

  /* ========== 3. CONTRASTE REAL EN LOS TRES TEMAS ========== */
  await page.goto(base + "#/p/anderson/d/2/e/0", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  for (const tema of ["oscuro", "claro", "maximo"]) {
    await page.evaluate(t => {
      document.documentElement.setAttribute("data-tema", t);
    }, tema);
    await page.waitForTimeout(100);
    const pares = await page.evaluate(() => {
      const fondoDe = el => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c;
          n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      };
      const medir = (sel, etiqueta) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return { etiqueta, color: getComputedStyle(el).color, fondo: fondoDe(el) };
      };
      return [
        medir(".detalle-nombre", "titulo del ejercicio"),
        medir(".detalle-meta", "texto secundario"),
        medir(".pasos li span", "texto de los pasos"),
        medir("#btnSerieHecha", "boton principal"),
        medir(".foto-pie", "pie de foto"),
        medir(".aviso", "aviso de seguridad"),
        medir(".titulo-barra", "titulo de la barra")
      ].filter(Boolean);
    });
    for (const p of pares) {
      const r = contraste(aRgb(p.color), aRgb(p.fondo));
      if (r < 4.5) fallo(`contraste tema ${tema}: "${p.etiqueta}" = ${r.toFixed(1)}:1 (minimo 4.5)`);
    }
    const peor = Math.min(...pares.map(p => contraste(aRgb(p.color), aRgb(p.fondo))));
    info.push(`Contraste tema ${tema}: el peor par mide ${peor.toFixed(1)}:1`);
  }
  await page.evaluate(() => document.documentElement.setAttribute("data-tema", "oscuro"));

  /* ========== 4. ACCESIBILIDAD ========== */
  const a11y = await page.evaluate(() => {
    const problemas = [];
    if (document.documentElement.lang !== "es") problemas.push('falta lang="es" en <html>');
    if (!document.querySelector("h1")) problemas.push("no hay <h1>");

    document.querySelectorAll("img").forEach(i => {
      if (!i.hasAttribute("alt")) problemas.push(`<img> sin alt: ${i.getAttribute("src")}`);
    });
    document.querySelectorAll("button, a").forEach(el => {
      if (el.offsetParent === null && !el.hasAttribute("hidden")) return;
      const nombre = (el.getAttribute("aria-label") || el.textContent || "").trim();
      if (!nombre) problemas.push(`${el.tagName.toLowerCase()} sin nombre accesible (.${el.className})`);
    });
    /* el temporizador debe anunciarse */
    const t = document.getElementById("temporizador");
    if (t.getAttribute("aria-live") !== "assertive") problemas.push("el temporizador no tiene aria-live");
    if (!document.getElementById("numSeries").hasAttribute("aria-live")) problemas.push("el contador de series no tiene aria-live");
    /* el enlace de salto debe ser el primero */
    const primerEnfocable = document.querySelector("a[href], button, input");
    if (!primerEnfocable || !primerEnfocable.classList.contains("salto-contenido"))
      problemas.push("el enlace 'Saltar al contenido' no es el primer elemento enfocable");
    /* el zoom por pellizco no puede estar bloqueado */
    const vp = document.querySelector('meta[name="viewport"]').content;
    if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/.test(vp)) problemas.push("el viewport bloquea el zoom por pellizco");
    return problemas;
  });
  a11y.forEach(p => fallo(`accesibilidad: ${p}`));
  if (!a11y.length) info.push("Accesibilidad: idioma, alt, nombres de botones, aria-live y zoom correctos");

  /* ========== 5. EL AVANCE SE GUARDA AL RECARGAR ========== */
  await page.goto(base + "#/p/sharid/d/4/e/0", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.fill("#campoPeso", "17,5 kg");
  await page.dispatchEvent("#campoPeso", "change");
  await page.click("#btnMasSerie");
  await page.click("#btnHecho");           /* marca hecho y salta al siguiente */
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => { window.location.hash = "#/p/sharid/d/4"; });
  await page.waitForTimeout(400);
  const hechos = await page.locator('.ejercicio[data-hecho="si"]').count();
  if (hechos !== 1) fallo(`persistencia: tras recargar deberia quedar 1 ejercicio marcado, quedan ${hechos}`);
  await page.evaluate(() => { window.location.hash = "#/p/sharid/d/4/e/0"; });
  await page.waitForTimeout(400);
  const peso = await page.inputValue("#campoPeso");
  const serie = (await page.textContent("#numSeries")).trim();
  if (peso !== "17,5 kg") fallo(`persistencia: el peso no se guardo (quedo "${peso}")`);
  if (serie !== "1") fallo(`persistencia: las series no se guardaron (quedo "${serie}")`);
  info.push("Persistencia: series, peso y ejercicios hechos sobreviven a recargar");

  /* ========== 6. EL DÍA "HOY" ES EL CORRECTO ========== */
  await page.goto(base + "#/p/anderson", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const hoyApp = await page.evaluate(() =>
    (document.querySelector('.dia[data-hoy="si"] .dia-nombre') || {}).textContent || "");
  const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const hoyReal = nombres[new Date().getDay()];
  if (!hoyApp.startsWith(hoyReal)) fallo(`el dia marcado como HOY es "${hoyApp}" y hoy es ${hoyReal}`);
  info.push(`Dia de hoy: la app marca ${hoyReal}, correcto`);

  /* ========== 7. RECORRIDO COMPLETO POR TODOS LOS EJERCICIOS ========== */
  let visitados = 0;
  for (const pid of ["anderson", "sharid"]) {
    const p = DATOS.PLANES[pid];
    for (const d of p.dias) {
      for (let i = 0; i < d.ejercicios.length; i++) {
        await page.evaluate(h => { window.location.hash = h; }, `#/p/${pid}/d/${d.n}/e/${i}`);
        await page.waitForTimeout(35);
        const r = await page.evaluate(() => {
          const n = document.querySelector(".detalle-nombre");
          const fotos = [...document.querySelectorAll(".fotos img")];
          return {
            nombre: n ? n.textContent : null,
            pasos: document.querySelectorAll(".pasos li").length,
            rotas: fotos.filter(f => f.complete && f.naturalWidth === 0).length,
            donde: !!document.querySelector(".tarjeta h3"),
            video: (document.querySelector(".enlace-video") || {}).href || ""
          };
        });
        const esperado = DATOS.CATALOGO[d.ejercicios[i]];
        if (r.nombre !== esperado.nombre) fallo(`${pid} d${d.n} e${i}: muestra "${r.nombre}" y deberia ser "${esperado.nombre}"`);
        if (r.pasos !== esperado.pasos.length) fallo(`${pid} d${d.n} e${i}: ${r.pasos} pasos en pantalla vs ${esperado.pasos.length} en los datos`);
        if (r.rotas) fallo(`${pid} d${d.n} e${i}: ${r.rotas} foto(s) rotas`);
        if (!r.video.includes("youtube.com")) fallo(`${pid} d${d.n} e${i}: enlace de video invalido`);
        visitados++;
      }
    }
  }
  info.push(`Recorrido completo: ${visitados} pantallas de ejercicio abiertas en navegador real, todas correctas`);

  /* ========== 8. LOS DATOS DE LA APP COINCIDEN CON LAS PLANILLAS ========== */
  const ESPERADO = {   /* leido de documentación/extraccion-planillas.md */
    anderson: { 1: 17, 2: 8, 3: 9, 4: 9, 5: 16, 6: 0, 7: 0 },
    sharid:   { 1: 13, 2: 11, 3: 12, 4: 10, 5: 9, 6: 0, 7: 0 }
  };
  for (const [pid, dias] of Object.entries(ESPERADO)) {
    for (const [n, cuantos] of Object.entries(dias)) {
      const real = DATOS.PLANES[pid].dias.find(d => d.n === Number(n)).ejercicios.length;
      if (real !== cuantos) fallo(`datos: ${pid} dia ${n} tiene ${real} ejercicios y la planilla dice ${cuantos}`);
    }
  }
  /* los colores por dia no se pueden confundir entre las dos personas */
  const colA = DATOS.PLANES.anderson.dias.map(d => d.color).join(",");
  const colS = DATOS.PLANES.sharid.dias.map(d => d.color).join(",");
  if (colA === colS) fallo("datos: los dos tableros tienen el mismo codigo de colores, y en las planillas son distintos");
  info.push("Datos: coinciden con la tabla de extraccion de las planillas");

  await navegador.close();
  servidor.close();

  console.log("");
  info.forEach(i => console.log("  · " + i));
  console.log("");
  if (errores.length) {
    console.log("ERRORES:");
    errores.forEach(e => console.log("  x " + e));
    process.exit(1);
  }
  console.log("OK - PWA, accesibilidad, contraste, offline y datos: todo correcto.");
})();
