/* ============================================================
   Servidor local para probar la app en el computador o en el
   celular estando en la misma red WiFi.

   Uso:   node servidor.js
   Luego abre la dirección que imprime en pantalla.
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PUERTO = process.env.PUERTO || 41317;
const RAIZ = __dirname;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8"
};

http.createServer((req, res) => {
  let ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta === "/") ruta = "/index.html";

  const destino = path.join(RAIZ, ruta);
  if (!destino.startsWith(RAIZ)) { res.writeHead(403).end("Prohibido"); return; }

  fs.readFile(destino, (err, datos) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado"); return; }
    res.writeHead(200, {
      "Content-Type": TIPOS[path.extname(destino).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(datos);
  });
}).listen(PUERTO, () => {
  /* Se descartan los adaptadores virtuales (VMware, WSL, Hyper-V, Docker):
     esas direcciones no las alcanza el celular y solo confunden. */
  const VIRTUAL = /vmware|vethernet|wsl|hyper-v|virtual|docker|loopback/i;
  const ips = Object.entries(os.networkInterfaces())
    .filter(([nombre]) => !VIRTUAL.test(nombre))
    .flatMap(([, lista]) => lista || [])
    .filter(i => i.family === "IPv4" && !i.internal)
    .map(i => i.address);

  console.log("\n  Mi Entreno - servidor local\n");
  console.log("  En este computador:  http://localhost:" + PUERTO);
  if (ips.length) {
    ips.forEach(ip => console.log("  Desde el celular:    http://" + ip + ":" + PUERTO));
    console.log("\n  (el celular debe estar en la misma red WiFi)");
  } else {
    console.log("\n  No se detecto una red WiFi o cableada para probar desde el celular.");
  }
  console.log("  Ctrl+C para detener\n");
});
