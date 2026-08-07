/* ============================================================
   SERVICE WORKER — permite abrir la app sin internet.
   Al instalarse descarga TODA la app y TODAS las fotos, para
   que en el gimnasio funcione aunque no haya señal.

   Si cambias archivos, sube el número de VERSION para que los
   teléfonos se actualicen.
   ============================================================ */

var VERSION = "mi-entreno-v13";

var ARCHIVOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/estilos.css",
  "assets/js/datos-catalogo.js",
  "assets/js/datos-planes.js",
  "assets/js/datos-alternativas.js",
  "assets/js/almacenamiento.js",
  "assets/js/voz.js",
  "assets/js/carrusel.js",
  "assets/js/cronometro.js",
  "assets/js/tabata.js",
  "assets/js/app.js",
  "assets/iconos/icono-180.png",
  "assets/iconos/icono-192.png",
  "assets/iconos/icono-512-maskable.png",
  "assets/iconos/icono-512.png",
  "assets/img/ejercicios/abdominales-suelo-0.jpg",
  "assets/img/ejercicios/abdominales-suelo-1.jpg",
  "assets/img/ejercicios/abdominales-suelo-ficha.jpg",
  "assets/img/ejercicios/abductor-0.jpg",
  "assets/img/ejercicios/abductor-1.jpg",
  "assets/img/ejercicios/abductor-ficha.jpg",
  "assets/img/ejercicios/aductor-banda-ficha.jpg",
  "assets/img/ejercicios/apertura-trx-ficha.jpg",
  "assets/img/ejercicios/banco-triceps-0.jpg",
  "assets/img/ejercicios/banco-triceps-1.jpg",
  "assets/img/ejercicios/banco-triceps-ficha.jpg",
  "assets/img/ejercicios/biceps-trx-ficha.jpg",
  "assets/img/ejercicios/curl-barra-0.jpg",
  "assets/img/ejercicios/curl-barra-1.jpg",
  "assets/img/ejercicios/curl-barra-ficha.jpg",
  "assets/img/ejercicios/curl-mancuerna-alternado-0.jpg",
  "assets/img/ejercicios/curl-mancuerna-alternado-1.jpg",
  "assets/img/ejercicios/curl-mancuerna-alternado-ficha.jpg",
  "assets/img/ejercicios/curl-polea-0.jpg",
  "assets/img/ejercicios/curl-polea-1.jpg",
  "assets/img/ejercicios/curl-polea-ficha.jpg",
  "assets/img/ejercicios/dominadas-0.jpg",
  "assets/img/ejercicios/dominadas-1.jpg",
  "assets/img/ejercicios/dominadas-ficha.jpg",
  "assets/img/ejercicios/elevacion-rodilla-0.jpg",
  "assets/img/ejercicios/elevacion-rodilla-1.jpg",
  "assets/img/ejercicios/elevacion-rodilla-ficha.jpg",
  "assets/img/ejercicios/elevacion-talones-hack-0.jpg",
  "assets/img/ejercicios/elevacion-talones-hack-1.jpg",
  "assets/img/ejercicios/elevacion-talones-hack-ficha.jpg",
  "assets/img/ejercicios/elevacion-tronco-maquina-0.jpg",
  "assets/img/ejercicios/elevacion-tronco-maquina-1.jpg",
  "assets/img/ejercicios/elevacion-tronco-maquina-ficha.jpg",
  "assets/img/ejercicios/extension-mancuerna-0.jpg",
  "assets/img/ejercicios/extension-mancuerna-1.jpg",
  "assets/img/ejercicios/extension-mancuerna-ficha.jpg",
  "assets/img/ejercicios/fondo-de-pecho-0.jpg",
  "assets/img/ejercicios/fondo-de-pecho-1.jpg",
  "assets/img/ejercicios/fondo-de-pecho-ficha.jpg",
  "assets/img/ejercicios/frontales-0.jpg",
  "assets/img/ejercicios/frontales-1.jpg",
  "assets/img/ejercicios/frontales-ficha.jpg",
  "assets/img/ejercicios/gluteo-pesa-rusa-0.jpg",
  "assets/img/ejercicios/gluteo-pesa-rusa-1.jpg",
  "assets/img/ejercicios/gluteo-pesa-rusa-ficha.jpg",
  "assets/img/ejercicios/gluteo-polea-0.jpg",
  "assets/img/ejercicios/gluteo-polea-1.jpg",
  "assets/img/ejercicios/gluteo-polea-ficha.jpg",
  "assets/img/ejercicios/hiperextensiones-0.jpg",
  "assets/img/ejercicios/hiperextensiones-1.jpg",
  "assets/img/ejercicios/hiperextensiones-ficha.jpg",
  "assets/img/ejercicios/jalon-delante-abierto-0.jpg",
  "assets/img/ejercicios/jalon-delante-abierto-1.jpg",
  "assets/img/ejercicios/jalon-delante-abierto-ficha.jpg",
  "assets/img/ejercicios/jalon-delante-cerrado-0.jpg",
  "assets/img/ejercicios/jalon-delante-cerrado-1.jpg",
  "assets/img/ejercicios/jalon-delante-cerrado-ficha.jpg",
  "assets/img/ejercicios/laterales-0.jpg",
  "assets/img/ejercicios/laterales-1.jpg",
  "assets/img/ejercicios/laterales-ficha.jpg",
  "assets/img/ejercicios/lazo-hombro-0.jpg",
  "assets/img/ejercicios/lazo-hombro-1.jpg",
  "assets/img/ejercicios/lazo-hombro-ficha.jpg",
  "assets/img/ejercicios/leg-curl-0.jpg",
  "assets/img/ejercicios/leg-curl-1.jpg",
  "assets/img/ejercicios/leg-curl-ficha.jpg",
  "assets/img/ejercicios/leg-extension-0.jpg",
  "assets/img/ejercicios/leg-extension-1.jpg",
  "assets/img/ejercicios/leg-extension-ficha.jpg",
  "assets/img/ejercicios/levantamiento-atras-polea-0.jpg",
  "assets/img/ejercicios/levantamiento-atras-polea-1.jpg",
  "assets/img/ejercicios/levantamiento-atras-polea-ficha.jpg",
  "assets/img/ejercicios/levantamiento-pierna-piso-0.jpg",
  "assets/img/ejercicios/levantamiento-pierna-piso-1.jpg",
  "assets/img/ejercicios/levantamiento-pierna-piso-ficha.jpg",
  "assets/img/ejercicios/pantorrilla-sentado-0.jpg",
  "assets/img/ejercicios/pantorrilla-sentado-1.jpg",
  "assets/img/ejercicios/pantorrilla-sentado-ficha.jpg",
  "assets/img/ejercicios/peck-deck-0.jpg",
  "assets/img/ejercicios/peck-deck-1.jpg",
  "assets/img/ejercicios/peck-deck-ficha.jpg",
  "assets/img/ejercicios/peso-muerto-saco-0.jpg",
  "assets/img/ejercicios/peso-muerto-saco-1.jpg",
  "assets/img/ejercicios/peso-muerto-saco-ficha.jpg",
  "assets/img/ejercicios/plancha-bosu-ficha.jpg",
  "assets/img/ejercicios/predicador-maquina-0.jpg",
  "assets/img/ejercicios/predicador-maquina-1.jpg",
  "assets/img/ejercicios/predicador-maquina-ficha.jpg",
  "assets/img/ejercicios/prensa-atletica-0.jpg",
  "assets/img/ejercicios/prensa-atletica-1.jpg",
  "assets/img/ejercicios/prensa-atletica-ficha.jpg",
  "assets/img/ejercicios/press-banca-0.jpg",
  "assets/img/ejercicios/press-banca-1.jpg",
  "assets/img/ejercicios/press-banca-ficha.jpg",
  "assets/img/ejercicios/press-frances-0.jpg",
  "assets/img/ejercicios/press-frances-1.jpg",
  "assets/img/ejercicios/press-frances-ficha.jpg",
  "assets/img/ejercicios/press-inclinado-0.jpg",
  "assets/img/ejercicios/press-inclinado-1.jpg",
  "assets/img/ejercicios/press-inclinado-ficha.jpg",
  "assets/img/ejercicios/press-inclinado-mancuerna-0.jpg",
  "assets/img/ejercicios/press-inclinado-mancuerna-1.jpg",
  "assets/img/ejercicios/press-inclinado-mancuerna-ficha.jpg",
  "assets/img/ejercicios/press-mancuerna-0.jpg",
  "assets/img/ejercicios/press-mancuerna-1.jpg",
  "assets/img/ejercicios/press-mancuerna-ficha.jpg",
  "assets/img/ejercicios/press-militar-mancuerna-0.jpg",
  "assets/img/ejercicios/press-militar-mancuerna-1.jpg",
  "assets/img/ejercicios/press-militar-mancuerna-ficha.jpg",
  "assets/img/ejercicios/press-militar-maquina-0.jpg",
  "assets/img/ejercicios/press-militar-maquina-1.jpg",
  "assets/img/ejercicios/press-militar-maquina-ficha.jpg",
  "assets/img/ejercicios/push-down-0.jpg",
  "assets/img/ejercicios/push-down-1.jpg",
  "assets/img/ejercicios/push-down-ficha.jpg",
  "assets/img/ejercicios/remo-al-pecho-0.jpg",
  "assets/img/ejercicios/remo-al-pecho-1.jpg",
  "assets/img/ejercicios/remo-al-pecho-ficha.jpg",
  "assets/img/ejercicios/remo-sentado-polea-0.jpg",
  "assets/img/ejercicios/remo-sentado-polea-1.jpg",
  "assets/img/ejercicios/remo-sentado-polea-ficha.jpg",
  "assets/img/ejercicios/salto-cajon-0.jpg",
  "assets/img/ejercicios/salto-cajon-1.jpg",
  "assets/img/ejercicios/salto-cajon-ficha.jpg",
  "assets/img/ejercicios/sentadilla-dinamica-0.jpg",
  "assets/img/ejercicios/sentadilla-dinamica-1.jpg",
  "assets/img/ejercicios/sentadilla-dinamica-ficha.jpg",
  "assets/img/ejercicios/sentadilla-iso-ficha.jpg",
  "assets/img/ejercicios/sentadilla-mancuerna-0.jpg",
  "assets/img/ejercicios/sentadilla-mancuerna-1.jpg",
  "assets/img/ejercicios/sentadilla-mancuerna-ficha.jpg",
  "assets/img/ejercicios/sentadilla-patada-lateral-ficha.jpg",
  "assets/img/ejercicios/tijeras-barra-0.jpg",
  "assets/img/ejercicios/tijeras-barra-1.jpg",
  "assets/img/ejercicios/tijeras-barra-ficha.jpg",
  "assets/img/ejercicios/triceps-copa-0.jpg",
  "assets/img/ejercicios/triceps-copa-1.jpg",
  "assets/img/ejercicios/triceps-copa-ficha.jpg",
  "assets/img/ejercicios/trx-abductor-ficha.jpg",
  "assets/img/ejercicios/trx-espalda-0.jpg",
  "assets/img/ejercicios/trx-espalda-1.jpg",
  "assets/img/ejercicios/trx-espalda-ficha.jpg",
  "assets/img/ejercicios/trx-sentadilla-profunda-ficha.jpg",
  "assets/img/ejercicios/twist-ruso-0.jpg",
  "assets/img/ejercicios/twist-ruso-1.jpg",
  "assets/img/ejercicios/twist-ruso-ficha.jpg",
  "assets/img/ejercicios/vuelo-trx-ficha.jpg"
];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(VERSION).then(function (cache) {
      /* addAll falla entero si un archivo falla; se añaden uno a uno */
      return Promise.all(ARCHIVOS.map(function (url) {
        return cache.add(url).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (k) { return k !== VERSION; })
                              .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (ev) {
  if (ev.request.method !== "GET") return;
  var url = new URL(ev.request.url);
  if (url.origin !== location.origin) return;   /* YouTube y demás van directo a la red */

  ev.respondWith(
    caches.match(ev.request).then(function (guardado) {
      if (guardado) return guardado;
      return fetch(ev.request).then(function (respuesta) {
        if (respuesta && respuesta.status === 200 && respuesta.type === "basic") {
          var copia = respuesta.clone();
          caches.open(VERSION).then(function (c) { c.put(ev.request, copia); });
        }
        return respuesta;
      }).catch(function () {
        return caches.match("index.html");
      });
    })
  );
});
