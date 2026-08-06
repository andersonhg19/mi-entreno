/* ============================================================
   PRUEBA DE COMPLETITUD

   Es la garantía de que la app contiene TODA la planificación y de
   que cada pieza está completa y es la que corresponde.

   Aquí abajo está escrita, a mano y por separado, la planificación
   tal y como se leyó de las planillas físicas (ver
   `documentación/extraccion-planillas.md`). Es una SEGUNDA FUENTE:
   si alguien toca `datos-planes.js` y se equivoca, esta prueba lo
   caza porque las dos listas dejan de coincidir.

   Límite honesto: las dos listas salen de la misma lectura de las
   fotos. Esto garantiza que la app no se ha desviado de lo que se
   leyó; no sustituye a contrastar una vez contra el papel.

   Uso:  node pruebas/prueba-completitud.js
   ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const RAIZ = path.resolve(__dirname, "..");
const IMG = path.join(RAIZ, "assets/img/ejercicios");
const errores = [];
const info = [];

/* ============================================================
   FUENTE INDEPENDIENTE: la planificación leída de las planillas
   ============================================================ */
const PLAN_ESPERADO = {
  anderson: {
    color: { 1: "naranja", 2: "rojo", 3: "celeste", 4: "rosado", 5: "verde" },
    dias: {
      1: ["trx-sentadilla-profunda", "trx-abductor", "sentadilla-iso", "elevacion-rodilla",
          "aductor-banda", "sentadilla-dinamica", "trx-espalda", "apertura-trx",
          "banco-triceps", "vuelo-trx", "lazo-hombro", "plancha-bosu", "twist-ruso",
          "abdominales-suelo", "biceps-trx", "gluteo-pesa-rusa", "sentadilla-patada-lateral"],
      2: ["peck-deck", "press-banca", "press-inclinado", "fondo-de-pecho",
          "triceps-copa", "push-down", "extension-mancuerna", "press-frances"],
      3: ["jalon-delante-abierto", "jalon-delante-cerrado", "remo-sentado-polea",
          "dominadas", "hiperextensiones", "curl-barra", "curl-polea",
          "curl-mancuerna-alternado", "predicador-maquina"],
      4: ["press-militar-maquina", "press-militar-mancuerna", "laterales", "frontales",
          "fondo-de-pecho", "triceps-copa", "push-down", "extension-mancuerna", "press-frances"],
      5: ["elevacion-tronco-maquina", "levantamiento-pierna-piso", "trx-sentadilla-profunda",
          "trx-abductor", "sentadilla-iso", "elevacion-rodilla", "aductor-banda",
          "sentadilla-dinamica", "trx-espalda", "apertura-trx", "plancha-bosu",
          "twist-ruso", "abdominales-suelo", "biceps-trx", "gluteo-pesa-rusa",
          "sentadilla-patada-lateral"],
      6: [], 7: []
    }
  },
  sharid: {
    color: { 1: "naranja", 2: "verde", 3: "rosado", 4: "celeste", 5: "rojo" },
    dias: {
      1: ["sentadilla-mancuerna", "prensa-atletica", "leg-extension", "abductor",
          "elevacion-talones-hack", "press-militar-maquina", "laterales", "frontales",
          "trx-sentadilla-profunda", "sentadilla-iso", "elevacion-rodilla",
          "vuelo-trx", "lazo-hombro"],
      2: ["jalon-delante-abierto", "jalon-delante-cerrado", "remo-sentado-polea",
          "remo-al-pecho", "hiperextensiones", "curl-barra", "curl-polea",
          "curl-mancuerna-alternado", "predicador-maquina", "trx-espalda", "biceps-trx"],
      3: ["leg-curl", "tijeras-barra", "abductor", "pantorrilla-sentado",
          "levantamiento-atras-polea", "gluteo-polea", "trx-abductor", "aductor-banda",
          "peso-muerto-saco", "salto-cajon", "gluteo-pesa-rusa", "sentadilla-patada-lateral"],
      4: ["peck-deck", "press-mancuerna", "press-inclinado-mancuerna", "fondo-de-pecho",
          "triceps-copa", "push-down", "extension-mancuerna", "press-frances",
          "apertura-trx", "banco-triceps"],
      5: ["elevacion-tronco-maquina", "levantamiento-pierna-piso", "elevacion-rodilla",
          "trx-espalda", "vuelo-trx", "lazo-hombro", "plancha-bosu",
          "abdominales-suelo", "biceps-trx"],
      6: [], 7: []
    }
  }
};

/* Las dos anotaciones manuscritas del entrenador que NO se pueden perder */
const AVISOS_OBLIGATORIOS = {
  "sentadilla-dinamica": "SIN SALTO",
  "salto-cajon": "SIN SALTO"
};

/* ============================================================ */
const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ["datos-catalogo.js", "datos-planes.js"]) {
  vm.runInContext(fs.readFileSync(path.join(RAIZ, "assets/js", f), "utf8"), ctx);
}
const CAT = ctx.CATALOGO, PLANES = ctx.PLANES;

/* ---------- 1. La planificación completa, día a día ---------- */
let totalAsignaciones = 0;
for (const [pid, esperado] of Object.entries(PLAN_ESPERADO)) {
  const p = PLANES[pid];
  if (!p) { errores.push(`PLAN: falta la persona "${pid}"`); continue; }

  for (const [n, lista] of Object.entries(esperado.dias)) {
    const dia = p.dias.find(d => d.n === Number(n));
    if (!dia) { errores.push(`${pid}: falta el dia ${n}`); continue; }

    const real = dia.ejercicios;
    totalAsignaciones += lista.length;

    if (real.length !== lista.length) {
      errores.push(`${pid} dia ${n}: tiene ${real.length} ejercicios y la planilla dice ${lista.length}`);
    }
    /* Comparación uno a uno, en orden */
    for (let i = 0; i < Math.max(real.length, lista.length); i++) {
      if (real[i] !== lista[i]) {
        errores.push(`${pid} dia ${n} posicion ${i + 1}: la app pone "${real[i] || "(nada)"}" ` +
                     `y la planilla dice "${lista[i] || "(nada)"}"`);
      }
    }
    /* Ninguno repetido dentro del mismo día */
    const rep = real.filter((x, i) => real.indexOf(x) !== i);
    if (rep.length) errores.push(`${pid} dia ${n}: ejercicios repetidos -> ${rep.join(", ")}`);

    /* El color del día debe ser el de SU tablero */
    if (esperado.color[n] && dia.color !== esperado.color[n]) {
      errores.push(`${pid} dia ${n}: color "${dia.color}" y la planilla dice "${esperado.color[n]}"`);
    }
  }
}
/* Los dos códigos de color tienen que ser distintos entre sí */
const cA = Object.values(PLAN_ESPERADO.anderson.color).join(",");
const cS = Object.values(PLAN_ESPERADO.sharid.color).join(",");
if (cA === cS) errores.push("Los dos tableros no pueden tener el mismo codigo de colores");

info.push(`Planificacion: ${totalAsignaciones} asignaciones comprobadas una a una contra la planilla`);

/* ---------- 2. Cada ejercicio, completo ---------- */
const nombresVistos = new Map();
for (const [k, e] of Object.entries(CAT)) {
  const q = (c, cond, msg) => { if (!cond) errores.push(`${k}.${c}: ${msg}`); };

  q("nombre", typeof e.nombre === "string" && e.nombre.length >= 4, "nombre vacio o demasiado corto");
  q("grupo", typeof e.grupo === "string" && e.grupo.length >= 5, "grupo vacio");
  q("equipo", typeof e.equipo === "string" && e.equipo.length >= 4, "equipo vacio");
  q("donde", typeof e.donde === "string" && e.donde.length >= 25,
    `la descripcion de donde esta la maquina es demasiado corta (${(e.donde || "").length} caracteres)`);
  q("buscar", typeof e.buscar === "string" && e.buscar.split(" ").length >= 2,
    "el termino de busqueda del video es demasiado pobre");
  q("fotos", ["exactas", "parecidas", "solo-ficha"].includes(e.fotos),
    `fotos="${e.fotos}" no es exactas/parecidas/solo-ficha`);

  q("pasos", Array.isArray(e.pasos) && e.pasos.length >= 3, "necesita al menos 3 pasos");
  (e.pasos || []).forEach((t, i) => {
    q("pasos", typeof t === "string" && t.length >= 15, `el paso ${i + 1} es demasiado corto`);
    q("pasos", /[.!?]$/.test(String(t).trim()), `el paso ${i + 1} no termina en punto`);
  });

  if (nombresVistos.has(e.nombre)) {
    errores.push(`nombre duplicado "${e.nombre}" en ${k} y en ${nombresVistos.get(e.nombre)}`);
  }
  nombresVistos.set(e.nombre, k);

  /* El termino de busqueda debe tener que ver con el ejercicio */
  const palabras = e.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 3);
  const busq = (e.buscar || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (palabras.length && !palabras.some(w => busq.includes(w))) {
    errores.push(`${k}.buscar: "${e.buscar}" no comparte ninguna palabra con "${e.nombre}"`);
  }
}

/* ---------- 3. Los avisos manuscritos del entrenador ---------- */
for (const [k, texto] of Object.entries(AVISOS_OBLIGATORIOS)) {
  const e = CAT[k];
  if (!e) { errores.push(`falta el ejercicio ${k}`); continue; }
  if (!e.ojo || !e.ojo.includes(texto)) {
    errores.push(`${k}: el aviso "${texto}" que escribio el entrenador a mano NO aparece en el campo ojo`);
  }
}
info.push(`Avisos manuscritos del entrenador: ${Object.keys(AVISOS_OBLIGATORIOS).length} presentes`);

/* ---------- 4. Imágenes: existen, pesan, y ninguna se repite ---------- */
function dimensionesJPG(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marca = buf[i + 1];
    if (marca >= 0xC0 && marca <= 0xCF && marca !== 0xC4 && marca !== 0xC8 && marca !== 0xCC) {
      return { alto: buf.readUInt16BE(i + 5), ancho: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

const huellas = new Map();
let nFichas = 0, nFotos = 0;
for (const [k, e] of Object.entries(CAT)) {
  const archivos = e.fotos === "solo-ficha"
    ? [`${k}-ficha.jpg`]
    : [`${k}-ficha.jpg`, `${k}-0.jpg`, `${k}-1.jpg`];

  for (const a of archivos) {
    const p = path.join(IMG, a);
    if (!fs.existsSync(p)) { errores.push(`FALTA la imagen ${a}`); continue; }
    const buf = fs.readFileSync(p);
    if (buf.length < 6000) errores.push(`${a}: pesa solo ${buf.length} bytes, parece rota o vacia`);

    const dim = dimensionesJPG(buf);
    if (!dim) errores.push(`${a}: no se pudo leer el tamano (¿no es un JPEG?)`);
    else if (dim.ancho < 300 || dim.alto < 200)
      errores.push(`${a}: ${dim.ancho}x${dim.alto}, demasiado pequena para verse bien`);
    /* La ficha es LA imagen que manda: es lo que Anderson amplia con el
       pellizco, asi que su lienzo no puede encoger sin querer. */
    else if (a.endsWith("-ficha.jpg") && (dim.ancho !== 1400 || dim.alto !== 1050))
      errores.push(`${a}: ${dim.ancho}x${dim.alto}; las fichas van a 1400x1050`);

    /* Ninguna imagen puede estar repetida en dos ejercicios distintos:
       ese fue el error que hizo que TRX abductor mostrara la maquina. */
    const h = crypto.createHash("md5").update(buf).digest("hex");
    if (huellas.has(h)) {
      errores.push(`IMAGEN REPETIDA: ${a} es identica a ${huellas.get(h)} ` +
                   `(dos ejercicios distintos no pueden compartir imagen)`);
    }
    huellas.set(h, a);
    if (a.endsWith("-ficha.jpg")) nFichas++; else nFotos++;
  }
}
info.push(`Imagenes: ${nFichas} fichas del gimnasio + ${nFotos} fotos reales, todas distintas entre si`);

/* ---------- 5. La app abre en el selector, no en un perfil ---------- */
const app = fs.readFileSync(path.join(RAIZ, "assets/js/app.js"), "utf8");
if (/location\.hash\s*=\s*"#\/p\//.test(app.split("Arranque")[1] || "")) {
  errores.push("app.js: al arrancar salta a un perfil. Debe abrir siempre en el selector de persona.");
}
const manifest = JSON.parse(fs.readFileSync(path.join(RAIZ, "manifest.webmanifest"), "utf8"));
if (/#\/p\//.test(manifest.start_url || "")) {
  errores.push(`manifest: start_url "${manifest.start_url}" abre en un perfil; debe abrir en el selector`);
}
for (const s of manifest.shortcuts || []) {
  if (/#\/p\//.test(s.url)) {
    errores.push(`manifest: el acceso directo "${s.name}" abre en un perfil, y al arrancar la app siempre va al selector`);
  }
}
info.push("Arranque: la app abre en el selector de persona");

/* ---------- 6. Todo el catálogo se usa y nada falta ---------- */
const usados = new Set();
Object.values(PLANES).forEach(p => p.dias.forEach(d => d.ejercicios.forEach(k => usados.add(k))));
for (const k of Object.keys(CAT)) if (!usados.has(k)) errores.push(`CATALOGO ${k}: no lo usa ningun dia`);
for (const k of usados) if (!CAT[k]) errores.push(`PLAN: usa "${k}" y no existe en el catalogo`);
info.push(`Catalogo: ${Object.keys(CAT).length} ejercicios, todos usados y todos completos`);

/* ---------- Resultado ---------- */
console.log("");
info.forEach(i => console.log("  · " + i));
console.log("");
if (errores.length) {
  console.log("ERRORES DE COMPLETITUD:");
  errores.forEach(e => console.log("  x " + e));
  process.exit(1);
}
console.log("OK - La planificacion esta completa y cada pieza es la que corresponde.");
