/* ============================================================
   PRUEBAS DE REGRESIÓN (Playwright + Chromium)

   Un caso por cada bug que YA se coló alguna vez, más los sitios
   donde la app se ha demostrado frágil. La idea no es cubrir la
   app entera —de eso van prueba-visual y prueba-pwa— sino que
   ninguno de estos vuelva a pasar sin que salte una prueba.

   Historial que se defiende aquí:
     1. El temporizador tapaba la app entera porque una regla CSS
        `display:grid` le ganaba al atributo `hidden` del HTML.
     2. Las casillas de voz eran invisibles: un `appearance:none`
        global les quitó el dibujo nativo.
     3. El carrusel se quedaba clavado: al poner `disabled` en la
        flecha que tenía el foco, el navegador movía el foco y eso
        cancelaba el desplazamiento suave en curso.
     4. Al recargar, la app entraba en un perfil en vez del inicio.
     5. A 320 px con la letra al 180 % se salían cosas a lo ancho.

   Uso:  node pruebas/prueba-regresiones.js
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const RAIZ = path.resolve(__dirname, "..");
const PUERTO = 41997;

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpg": "image/jpeg", ".png": "image/png"
};

const errores = [];
const hechas = [];
function fallo(caso, msg) { errores.push(`[${caso}] ${msg}`); }
function pasa(caso) { hechas.push(caso); }

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

const RUTAS = [
  "#/", "#/p/anderson", "#/p/anderson/lista", "#/p/anderson/lista/pierna",
  "#/p/anderson/d/1", "#/p/anderson/d/1/e/0", "#/p/anderson/x/sentadilla",
  "#/p/sharid", "#/p/sharid/d/2", "#/p/sharid/d/2/e/1", "#/tabata"
];

async function ir(page, hash, espera = 250) {
  await page.evaluate(h => { window.location.hash = h; }, hash);
  await page.waitForTimeout(espera);
}

/* ------------------------------------------------------------------
   1. `hidden` manda siempre. Si una regla CSS le gana a `hidden`, el
      elemento aparece donde no debe — que es exactamente como el
      temporizador acabó tapando la app entera.
   ------------------------------------------------------------------ */
async function casoHidden(page, base) {
  for (const ruta of RUTAS) {
    await ir(page, ruta);
    const visibles = await page.evaluate(() =>
      [...document.querySelectorAll("[hidden]")]
        .filter(el => getComputedStyle(el).display !== "none")
        .map(el => `${el.tagName.toLowerCase()}#${el.id || "?"} = ${getComputedStyle(el).display}`));
    if (visibles.length) {
      fallo("hidden manda", `en ${ruta} se ven elementos marcados hidden: ${visibles.join(", ")}`);
      return;
    }
  }
  pasa("hidden manda sobre el CSS en todas las rutas");
}

/* ------------------------------------------------------------------
   2. Casillas y radios tienen que seguir dibujándose. El
      `appearance:none` que se aplica a los demás controles no puede
      alcanzarlas o desaparecen sin dejar rastro en el DOM.
   ------------------------------------------------------------------ */
async function casoCasillas(page) {
  await page.evaluate(() => document.getElementById("btnAjustes").click());
  await page.waitForTimeout(200);
  const malas = await page.evaluate(() =>
    [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')].map(el => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { id: el.id || el.name || "?", ancho: r.width, alto: r.height, apariencia: cs.appearance };
    }).filter(x => x.ancho < 16 || x.alto < 16 || x.apariencia === "none"));
  if (malas.length) {
    fallo("casillas visibles", `casillas sin dibujo o diminutas: ${JSON.stringify(malas)}`);
  } else {
    pasa("las casillas de ajustes se dibujan y miden 16 px o más");
  }
  await page.evaluate(() => document.getElementById("btnAjustes").click());
  await page.waitForTimeout(150);
}

/* ------------------------------------------------------------------
   3. El carrusel. Dos cosas: que las flechas NUNCA usen `disabled`
      (era la causa del atasco) y que aguante una tanda rápida de
      clics de ida y vuelta terminando donde debe.
   ------------------------------------------------------------------ */
async function casoCarrusel(page) {
  await ir(page, "#/p/anderson/d/1/e/0", 700);

  const conDisabled = await page.evaluate(() =>
    [...document.querySelectorAll(".carrusel-flecha[disabled]")].length);
  if (conDisabled) {
    fallo("carrusel", `${conDisabled} flechas usan disabled; deshabilitar la flecha ` +
      "que tiene el foco cancela el desplazamiento y deja el carrusel clavado. Usa aria-disabled.");
  } else {
    pasa("las flechas del carrusel usan aria-disabled, nunca disabled");
  }

  const total = await page.evaluate(() =>
    document.querySelectorAll(".carrusel-pista .carrusel-lamina").length);
  if (total < 2) { fallo("carrusel", "no hay láminas que recorrer"); return; }

  const leer = () => page.evaluate(() => {
    const p = document.querySelector(".carrusel-pista");
    return {
      indice: Number(document.querySelector(".carrusel-num").textContent),
      scroll: Math.round(p.scrollLeft),
      ancho: Math.round(p.clientWidth)
    };
  });
  const pulsar = paso => page.evaluate(p => {
    const b = document.querySelector(`.carrusel-flecha[data-paso="${p}"]`);
    if (b) b.click();
  }, paso);

  /* Ida hasta el final, una a una */
  for (let i = 1; i < total; i++) {
    await pulsar(1);
    await page.waitForTimeout(450);
    const e = await leer();
    if (e.indice !== i + 1) {
      fallo("carrusel", `al avanzar ${i} vez/veces deberia estar en ${i + 1} y esta en ${e.indice}`);
      return;
    }
  }
  /* Vuelta hasta el principio: aquí es donde se quedaba clavado */
  for (let i = total - 1; i >= 1; i--) {
    await pulsar(-1);
    await page.waitForTimeout(450);
    const e = await leer();
    if (e.indice !== i) {
      fallo("carrusel", `al retroceder deberia estar en ${i} y esta en ${e.indice} ` +
        "(el bug original: de la 2 no volvia a la 1)");
      return;
    }
  }
  const fin = await leer();
  if (fin.scroll > 8) {
    fallo("carrusel", `vuelve a la lamina 1 pero el desplazamiento se queda en ${fin.scroll}px`);
  } else {
    pasa(`el carrusel recorre ${total} laminas ida y vuelta y vuelve al origen`);
  }
}

/* ------------------------------------------------------------------
   4. Arrancar siempre en el selector de persona. Son dos personas y
      dos teléfonos: entrar en el perfil del otro es un fallo real.
   ------------------------------------------------------------------ */
async function casoArranque(page, base) {
  for (const ruta of RUTAS) {
    await page.goto(base + ruta, { waitUntil: "networkidle" });
    /* OJO: navegar a una URL que solo cambia en el # NO recarga la
       página, así que el arranque de la app no llegaba a ejecutarse y
       la prueba fallaba sin que hubiera nada roto. Hay que recargar
       de verdad, que es justo lo que hace él al abrir la app. */
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const donde = await page.evaluate(() => location.hash);
    if (donde !== "#/" && donde !== "") {
      fallo("arranque", `abrir en ${ruta} deja la app en ${donde}, deberia ir al selector`);
      return;
    }
  }
  pasa(`abrir la app en cualquiera de las ${RUTAS.length} rutas lleva al selector`);
}

/* ------------------------------------------------------------------
   5. Nada se sale a lo ancho en el caso peor: 320 px de pantalla,
      letra al 180 % y el espaciado de texto que exige la WCAG 1.4.12.
   ------------------------------------------------------------------ */
async function casoEstrecho(page, base) {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--escala", "1.8");
    const s = document.createElement("style");
    /* WCAG 1.4.12: el texto tiene que aguantar este espaciado */
    s.textContent = `* { line-height: 1.5 !important; letter-spacing: .12em !important;
                          word-spacing: .16em !important; }
                     p { margin-bottom: 2em !important; }`;
    document.head.appendChild(s);
  });

  for (const ruta of RUTAS) {
    await ir(page, ruta, 350);
    /* El temporizador es una capa por encima: si no se abre, su contenido
       —incluido el aviso «Luego: <ejercicio>», que puede ser largo— nunca se
       mide. Se abre a proposito en la pantalla de ejercicio. */
    if (/\/e\/\d+$/.test(ruta)) {
      await page.evaluate(() => {
        const b = document.getElementById("btnSerieHecha");
        if (b) b.click();
      });
      await page.waitForTimeout(350);
    }
    const desborde = await page.evaluate(() => {
      const ancho = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= ancho + 1) return null;
      const culpables = [];
      document.querySelectorAll("body *").forEach(el => {
        if (el.closest(".carrusel-pista")) return;          /* scroll propio, a propósito */
        if (el.classList.contains("salto-contenido")) return; /* vive fuera de pantalla */
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > ancho + 1) culpables.push(`${el.tagName.toLowerCase()}.${el.className || "?"}`);
      });
      return { scroll: document.documentElement.scrollWidth, ancho, culpables: culpables.slice(0, 3) };
    });
    /* Y que el temporizador quepa entero de alto, no solo de ancho */
    const cortado = await page.evaluate(() => {
      const t = document.getElementById("temporizador");
      if (!t || t.hidden) return null;
      const c = t.querySelector(".temporizador-caja") || t;
      const r = c.getBoundingClientRect();
      return (r.height > window.innerHeight + 1) ? Math.round(r.height) : null;
    });
    if (cortado) {
      fallo("320 px al 180 %", `el temporizador mide ${cortado}px de alto y no cabe en la pantalla`);
    }
    await page.evaluate(() => {
      const b = document.getElementById("btnPararTiempo");
      if (b && !document.getElementById("temporizador").hidden) b.click();
    });

    if (desborde) {
      fallo("320 px al 180 %", `${ruta} se sale (${desborde.scroll} vs ${desborde.ancho}px): ${desborde.culpables.join(" | ")}`);
      await page.setViewportSize({ width: 390, height: 844 });
      return;
    }
  }
  pasa("a 320 px con la letra al 180 %: nada se sale, ni con el temporizador abierto");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.clear());
}

/* ------------------------------------------------------------------
   6. Ningún id repetido. Al pintar cada vista con innerHTML es fácil
      dejar dos elementos con el mismo id, y a partir de ahí
      getElementById devuelve el que no es y el fallo es invisible.
   ------------------------------------------------------------------ */
async function casoIdsUnicos(page) {
  for (const ruta of RUTAS) {
    await ir(page, ruta);
    const repes = await page.evaluate(() => {
      const vistos = {}, malos = [];
      document.querySelectorAll("[id]").forEach(el => {
        vistos[el.id] = (vistos[el.id] || 0) + 1;
        if (vistos[el.id] === 2) malos.push(el.id);
      });
      return malos;
    });
    if (repes.length) {
      fallo("ids unicos", `en ${ruta} hay ids repetidos: ${repes.join(", ")}`);
      return;
    }
  }
  pasa("no hay ids repetidos en ninguna ruta");
}

/* ------------------------------------------------------------------
   7. Lo que se anota se guarda de verdad y sigue ahí al volver.
      Es la promesa que hace la pantalla de ajustes.
   ------------------------------------------------------------------ */
async function casoPersistencia(page) {
  await ir(page, "#/p/anderson/d/1/e/0", 600);
  await page.evaluate(() => {
    const c = document.getElementById("campoPeso");
    c.value = "37,5 kg";
    c.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("btnMasSerie").click();
    document.getElementById("btnMasSerie").click();
  });
  await page.waitForTimeout(200);

  await ir(page, "#/p/anderson/d/1", 300);
  await ir(page, "#/p/anderson/d/1/e/0", 600);

  const estado = await page.evaluate(() => ({
    peso: document.getElementById("campoPeso").value,
    series: document.getElementById("numSeries").textContent.trim()
  }));
  if (estado.peso !== "37,5 kg") fallo("persistencia", `el peso no vuelve: "${estado.peso}"`);
  else if (estado.series !== "2") fallo("persistencia", `las series no vuelven: "${estado.series}"`);
  else pasa("el peso y las series anotadas siguen ahi al volver al ejercicio");

  /* No dejar rastro: las demás pruebas cuentan con empezar limpias */
  await page.evaluate(() => localStorage.clear());
}

/* ------------------------------------------------------------------
   8. El contador de series no puede bajar de cero.
   ------------------------------------------------------------------ */
async function casoSeriesNoNegativas(page) {
  await ir(page, "#/p/sharid/d/2/e/0", 600);
  await page.evaluate(() => {
    for (let i = 0; i < 5; i++) document.getElementById("btnMenosSerie").click();
  });
  await page.waitForTimeout(150);
  const n = await page.evaluate(() => document.getElementById("numSeries").textContent.trim());
  if (n !== "0") fallo("series", `restando de mas queda en "${n}", deberia quedarse en 0`);
  else pasa("el contador de series se queda en 0 y no baja a negativos");
  await page.evaluate(() => localStorage.clear());
}

/* ------------------------------------------------------------------
   9. El temporizador de descanso: se abre, dice lo que viene después
      y se cierra sin dejar la pantalla tapada.
   ------------------------------------------------------------------ */
async function casoTemporizador(page) {
  await ir(page, "#/p/anderson/d/1/e/0", 600);
  await page.evaluate(() => document.getElementById("btnSerieHecha").click());
  await page.waitForTimeout(400);

  const abierto = await page.evaluate(() => {
    const t = document.getElementById("temporizador");
    const s = document.getElementById("temporizadorSiguiente");
    return {
      visible: !t.hidden && getComputedStyle(t).display !== "none",
      numero: document.getElementById("temporizadorNumero").textContent.trim(),
      siguiente: s ? (s.hidden ? "" : s.textContent.trim()) : null
    };
  });
  if (!abierto.visible) { fallo("temporizador", "no se abre al dar Serie hecha"); return; }
  if (!/^\d+$/.test(abierto.numero)) fallo("temporizador", `la cuenta atras muestra "${abierto.numero}"`);
  if (abierto.siguiente === null) fallo("temporizador", "falta el aviso de lo que viene despues");
  else if (!/^(Luego: .+|Este es el último del día\.)$/.test(abierto.siguiente)) {
    fallo("temporizador", `el aviso dice "${abierto.siguiente}"`);
  }

  await page.evaluate(() => document.getElementById("btnPararTiempo").click());
  await page.waitForTimeout(250);
  const cerrado = await page.evaluate(() => {
    const t = document.getElementById("temporizador");
    return t.hidden && getComputedStyle(t).display === "none";
  });
  if (!cerrado) fallo("temporizador", "sigue tapando la pantalla despues de Terminar");
  else pasa("el temporizador se abre, avisa de lo que viene y se cierra del todo");
  await page.evaluate(() => localStorage.clear());
}

/* ------------------------------------------------------------------
   10. El botón principal de cada pantalla es el más fácil de acertar.
       Se toca de pie y sin mirar fino.
   ------------------------------------------------------------------ */
async function casoBotonPrincipal(page) {
  await ir(page, "#/p/anderson/d/1/e/0", 600);
  const bajos = await page.evaluate(() => {
    const min = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--toque-principal")) || 58;
    return [...document.querySelectorAll(".btn-principal")]
      .filter(b => b.offsetParent !== null)
      .map(b => ({ txt: b.textContent.trim().slice(0, 24), alto: b.getBoundingClientRect().height, min }))
      .filter(x => x.alto < x.min - 1);
  });
  if (bajos.length) fallo("boton principal", `por debajo de --toque-principal: ${JSON.stringify(bajos)}`);
  else pasa("los botones principales llegan a --toque-principal");
}

/* ------------------------------------------------------------------
   11. Cada imagen o se describe, o se declara decorativa.

       Ojo con la regla fácil «toda imagen necesita alt con texto»:
       es falsa y hace daño. Las miniaturas de las listas van dentro
       de un botón que YA dice el nombre del ejercicio, así que su
       alt tiene que ir vacío o el lector de pantalla lo dice dos
       veces. Lo que sí es un fallo es que falte el atributo (el
       lector lee entonces el nombre del archivo) o que una imagen
       decorativa no tenga ningún texto alrededor que la sustituya.
   ------------------------------------------------------------------ */
async function casoAlt(page) {
  for (const ruta of RUTAS) {
    await ir(page, ruta, 350);
    const malas = await page.evaluate(() => {
      const malos = [];
      for (const i of document.images) {
        if (i.getAttribute("aria-hidden") === "true") continue;
        const alt = i.getAttribute("alt");
        if (alt === null) { malos.push(`sin atributo alt: ${i.getAttribute("src")}`); continue; }
        if (alt.trim()) continue;                       /* se describe sola */
        /* Decorativa: tiene que haber texto cerca que haga su papel */
        const cont = i.closest("button, a, figure, li, .tarjeta") || i.parentElement;
        const texto = cont ? cont.textContent.replace(/\s+/g, " ").trim() : "";
        if (texto.length < 3) malos.push(`decorativa y sin texto al lado: ${i.getAttribute("src")}`);
      }
      return malos;
    });
    if (malas.length) {
      fallo("alt", `en ${ruta}: ${malas.slice(0, 3).join(" | ")}`);
      return;
    }
  }
  pasa("cada imagen se describe o es decorativa con texto que la sustituye");
}

/* ------------------------------------------------------------------
   12. El foco se ve. Sin marca de foco, moverse con teclado o con
       switch es imposible.
   ------------------------------------------------------------------ */
async function casoFoco(page) {
  await ir(page, "#/p/anderson/d/1", 400);
  const sinMarca = await page.evaluate(() => {
    const malos = [];
    const focos = [...document.querySelectorAll("#contenido button, #contenido a")].slice(0, 8);
    for (const el of focos) {
      el.focus();
      const cs = getComputedStyle(el);
      const tiene = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) ||
                    cs.boxShadow !== "none";
      if (!tiene) malos.push(el.textContent.trim().slice(0, 20) || el.className);
    }
    return malos;
  });
  if (sinMarca.length) fallo("foco", `sin marca visible de foco: ${sinMarca.join(", ")}`);
  else pasa("los controles muestran marca de foco");
}

/* ------------------------------------------------------------------
   13. De qué tablero salió cada ficha.

   Los dos tableros son la misma baraja de tarjetas, pero la franja de
   músculo es AZUL MARINO en el de Anderson y GRANATE en el de Sharid.
   Eso es una firma que no se puede falsificar: basta mirar el color.

   Solo tres fichas deben venir del tablero de Sharid, las que en el de
   Anderson quemó el flash. Si un día se regeneran las imágenes y esa
   lista cambia sin querer, aquí salta.
   ------------------------------------------------------------------ */
const FICHAS_DE_SHARID = ["pantorrilla-sentado", "sentadilla-mancuerna", "prensa-atletica"];

async function casoOrigenFichas(page, base) {
  await page.goto(base, { waitUntil: "networkidle" });
  const claves = await page.evaluate(() => Object.keys(window.CATALOGO));

  const resultado = await page.evaluate(async (lista) => {
    async function franja(clave) {
      const img = new Image();
      img.src = `assets/img/ejercicios/${clave}-ficha.jpg`;
      try { await img.decode(); } catch (e) { return null; }
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const x0 = Math.round(c.width * 0.04), x1 = Math.round(c.width * 0.17);
      const y0 = Math.round(c.height * 0.20), y1 = Math.round(c.height * 0.90);
      const d = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
      const rs = [], gs = [], bs = [];
      for (let i = 0; i < d.length; i += 4) {
        /* La franja lleva el nombre del músculo en letras blancas grandes:
           si no se descartan, la mediana sale blanca y no dice nada. */
        if (Math.max(d[i], d[i + 1], d[i + 2]) > 190) continue;
        rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]);
      }
      if (rs.length < 200) return null;
      const med = a => { a.sort((x, y) => x - y); return a[a.length >> 1]; };
      const r = med(rs), g = med(gs), b = med(bs);
      return { r, g, b, quien: (r > g + 35 && r > b + 25) ? "sharid" : "anderson" };
    }
    const fuera = {};
    for (const clave of lista) fuera[clave] = await franja(clave);
    return fuera;
  }, claves);

  const malos = [];
  for (const clave of claves) {
    const f = resultado[clave];
    if (!f) { malos.push(`${clave}: no se pudo leer la franja de su ficha`); continue; }
    const esperado = FICHAS_DE_SHARID.includes(clave) ? "sharid" : "anderson";
    if (f.quien !== esperado) {
      malos.push(`${clave}: la franja es rgb(${f.r},${f.g},${f.b}) -> tablero de ` +
                 `${f.quien}, y deberia ser el de ${esperado}`);
    }
  }
  if (malos.length) fallo("origen de las fichas", malos.slice(0, 4).join(" | "));
  else pasa(`las ${claves.length} fichas vienen del tablero previsto ` +
            `(${FICHAS_DE_SHARID.length} del de Sharid, el resto del de Anderson)`);
}

/* ------------------------------------------------------------------ */
async function main() {
  const servidor = await arrancarServidor();
  const base = `http://127.0.0.1:${PUERTO}/`;
  const navegador = await chromium.launch();
  const page = await navegador.newPage({ viewport: { width: 390, height: 844 } });

  const erroresConsola = [];
  page.on("pageerror", e => erroresConsola.push(String(e)));
  page.on("console", m => { if (m.type() === "error") erroresConsola.push(m.text()); });

  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await casoHidden(page, base);
    await casoCasillas(page);
    await casoCarrusel(page);
    await casoIdsUnicos(page);
    await casoPersistencia(page);
    await casoSeriesNoNegativas(page);
    await casoTemporizador(page);
    await casoBotonPrincipal(page);
    await casoAlt(page);
    await casoFoco(page);
    await casoOrigenFichas(page, base);
    await casoArranque(page, base);
    await casoEstrecho(page, base);
  } finally {
    if (erroresConsola.length) {
      fallo("consola", `errores de JavaScript durante las pruebas: ${erroresConsola.slice(0, 4).join(" | ")}`);
    }
    await navegador.close();
    servidor.close();
  }

  console.log("PRUEBAS DE REGRESION\n");
  hechas.forEach(h => console.log("  OK   " + h));
  if (errores.length) {
    console.log("\nFALLOS:");
    errores.forEach(e => console.log("  X    " + e));
    console.log(`\n${errores.length} fallo(s).`);
    process.exit(1);
  }
  console.log(`\n${hechas.length} casos de regresion, todos en verde.`);
}

main().catch(e => { console.error(e); process.exit(1); });
