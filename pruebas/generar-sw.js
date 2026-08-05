/* ============================================================
   Regenera la lista de archivos que precarga el service worker.

   Hay que ejecutarlo cada vez que se añadan o quiten imágenes:
       node pruebas/generar-sw.js

   Sube tú el número de VERSION en sw.js aparte; esto solo toca la
   lista, para no cambiar la versión sin querer.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const SW = path.join(RAIZ, "sw.js");

const FIJOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/estilos.css",
  "assets/js/datos-catalogo.js",
  "assets/js/datos-planes.js",
  "assets/js/almacenamiento.js",
  "assets/js/voz.js",
  "assets/js/carrusel.js",
  "assets/js/cronometro.js",
  "assets/js/app.js",
];

const iconos = fs.readdirSync(path.join(RAIZ, "assets/iconos"))
  .filter(f => f.endsWith(".png")).sort()
  .map(f => "assets/iconos/" + f);

const imagenes = fs.readdirSync(path.join(RAIZ, "assets/img/ejercicios"))
  .filter(f => f.endsWith(".jpg")).sort()
  .map(f => "assets/img/ejercicios/" + f);

const lista = [...FIJOS, ...iconos, ...imagenes];

let src = fs.readFileSync(SW, "utf8");
const nuevo = "var ARCHIVOS = [\n" +
  lista.map(u => '  "' + u + '"').join(",\n") +
  "\n];";

/* `\r?\n` porque en Windows el archivo puede quedar con saltos CRLF.
   Se comprueba que el bloque EXISTE, no que el resultado cambie: si la
   lista ya estaba al día, el texto es idéntico y eso no es un error. */
const BLOQUE = /var ARCHIVOS = \[[\s\S]*?\r?\n\];/;
if (!BLOQUE.test(src)) {
  console.error("ERROR: no se encontró el bloque `var ARCHIVOS = [...]` en sw.js");
  process.exit(1);
}
const reemplazado = src.replace(BLOQUE, nuevo);
fs.writeFileSync(SW, reemplazado, "utf8");

console.log(`sw.js ${reemplazado === src ? "ya estaba al día" : "actualizado"}: ` +
            `${lista.length} archivos (${iconos.length} iconos, ${imagenes.length} imágenes)`);
