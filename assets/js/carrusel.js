/* ============================================================
   MI ENTRENO — Carrusel de láminas del ejercicio

   Sin librerías. El movimiento lo hace el CSS (scroll-snap);
   este archivo solo:
     · construye el HTML,
     · pinta los controles (flechas, puntos, «Imagen 2 de 3»),
     · añade teclado (← → Inicio Fin),
     · reencuadra al girar el teléfono.

   NUNCA captura eventos táctiles: el deslizamiento y el pellizco
   para ampliar son los nativos del navegador. Eso es innegociable
   para quien usa la lupa del sistema.
   ============================================================ */

window.Carrusel = (function () {
  "use strict";

  var contador = 0;   /* ids únicos: carrusel-1, carrusel-2… */

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function movimientoReducido() {
    return !!(window.matchMedia &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ---------------------------------------------------------
     Láminas de un ejercicio.

     La PRIMERA es siempre la ficha del gimnasio: es el recorte del
     tablero que entregó el entrenador, así que es exacta por
     definición.

     Las fotos reales solo se añaden si `fotosOk` es true. Cuando la
     verificación encontró que la foto era de otro movimiento (TRX
     sustituido por peso libre, tumbado por sentado…), esas fotos se
     borraron y aquí no hay nada que añadir.
     --------------------------------------------------------- */
  function laminasDe(e) {
    var base = "assets/img/ejercicios/" + e.clave;
    var lista = [{
      src: base + "-ficha.jpg",
      rotulo: "Ficha del gimnasio",
      alt: "Ficha del tablero de Life Gym para " + e.nombre +
           ": dibujo del movimiento con el nombre impreso."
    }];

    if (e.fotosOk) {
      lista.push({
        src: base + "-0.jpg",
        rotulo: "Foto · posición de inicio",
        alt: "Foto real: posición de inicio de " + e.nombre
      });
      lista.push({
        src: base + "-1.jpg",
        rotulo: "Foto · posición final",
        alt: "Foto real: posición final de " + e.nombre
      });
    }
    return lista;
  }

  /* ---------------------------------------------------------
     HTML del carrusel. Devuelve texto para concatenar.

     El estado inicial ya viene pintado (número 1, flecha
     «anterior» deshabilitada, punto 1 con aria-current), así la
     región viva NO anuncia nada al cargar: solo habla cuando de
     verdad cambias de imagen.
     --------------------------------------------------------- */
  function html(laminas, nombre) {
    if (!laminas || !laminas.length) return "";

    var id = "carrusel-" + (++contador);
    var n = laminas.length;
    var unica = (n < 2);
    var s = "";

    s += '<section class="carrusel" id="' + id + '"' +
         (unica ? ' data-unica="si"' : '') +
         ' role="group" aria-roledescription="carrusel"' +
         ' aria-label="Imágenes de ' + esc(nombre) + '">';

    /* role="list" explícito: con list-style:none, Safari y VoiceOver
       le quitan la semántica de lista al <ul>. */
    s += '<ul class="carrusel-pista" id="' + id + '-pista" role="list"' +
         (unica ? '' :
           ' tabindex="0" aria-label="Imágenes de ' + esc(nombre) +
           '. Desliza el dedo o usa las flechas del teclado"') + '>';

    laminas.forEach(function (l, i) {
      var posicion = (i + 1) + " de " + n;
      s += '<li class="carrusel-lamina">' +
             '<figure class="foto-caja" role="group"' +
               ' aria-roledescription="lámina"' +
               ' aria-label="' + esc(posicion + ": " + l.rotulo) + '">' +
               '<img src="' + esc(l.src) + '" alt="' + esc(l.alt) + '"' +
                 ' decoding="async" loading="' + (i === 0 ? "eager" : "lazy") + '">' +
               '<figcaption class="foto-pie">' +
                 esc((i + 1) + " · " + l.rotulo) +
               '</figcaption>' +
             '</figure>' +
           '</li>';
    });

    s += '</ul>';

    if (!unica) {
      s += '<div class="carrusel-barra">' +
             '<button type="button" class="carrusel-flecha" data-paso="-1"' +
               ' aria-controls="' + id + '-pista"' +
               ' aria-label="Imagen anterior" disabled>' +
               '<span aria-hidden="true">←</span><span>Anterior</span>' +
             '</button>' +
             '<p class="carrusel-posicion" aria-live="polite" aria-atomic="true">' +
               'Imagen <span class="carrusel-num">1</span> de ' + n +
             '</p>' +
             '<button type="button" class="carrusel-flecha" data-paso="1"' +
               ' aria-controls="' + id + '-pista"' +
               ' aria-label="Imagen siguiente">' +
               '<span>Siguiente</span><span aria-hidden="true">→</span>' +
             '</button>' +
           '</div>';

      s += '<div class="carrusel-puntos" role="group" aria-label="Ir a una imagen">';
      laminas.forEach(function (l, i) {
        s += '<button type="button" class="carrusel-punto" data-indice="' + i + '"' +
               (i === 0 ? ' aria-current="true"' : '') +
               ' aria-label="' + esc("Ver imagen " + (i + 1) + " de " + n + ": " + l.rotulo) + '">' +
               (i + 1) +
             '</button>';
      });
      s += '</div>';
    }

    s += '</section>';
    return s;
  }

  /* ---------------------------------------------------------
     Engancha el comportamiento de UN carrusel ya pintado.
     --------------------------------------------------------- */
  function conectar(raiz) {
    if (!raiz || raiz.dataset.conectado === "si") return;
    raiz.dataset.conectado = "si";

    var pista = raiz.querySelector(".carrusel-pista");
    var laminas = [].slice.call(raiz.querySelectorAll(".carrusel-lamina"));
    if (!pista || laminas.length < 2) return;    /* una sola imagen: nada que hacer */

    var flechas = [].slice.call(raiz.querySelectorAll(".carrusel-flecha"));
    var puntos = [].slice.call(raiz.querySelectorAll(".carrusel-punto"));
    var numero = raiz.querySelector(".carrusel-num");
    var ultima = laminas.length - 1;
    var actual = 0;

    /* Posición de scroll de la lámina i. Se calcula en el momento,
       no se cachea: así sobrevive a rotaciones y a cambios de letra. */
    function destinoDe(i) {
      return laminas[i].offsetLeft - laminas[0].offsetLeft;
    }

    function pintar(i) {
      if (i === actual) return;      /* no repetir el anuncio del lector */
      actual = i;
      numero.textContent = String(i + 1);
      flechas.forEach(function (b) {
        var destino = actual + Number(b.getAttribute("data-paso"));
        b.disabled = (destino < 0 || destino > ultima);
      });
      puntos.forEach(function (b, k) {
        if (k === actual) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }

    function irA(i, suave) {
      i = Math.max(0, Math.min(ultima, i));
      var x = destinoDe(i);
      if (suave && !movimientoReducido() && pista.scrollTo) {
        /* Safari < 15.4 ignora behavior:smooth; el try/catch cubre
           además navegadores que no aceptan el objeto. */
        try { pista.scrollTo({ left: x, behavior: "smooth" }); }
        catch (err) { pista.scrollLeft = x; }
      } else {
        pista.scrollLeft = x;
      }
      pintar(i);
    }

    /* Qué lámina está más cerca. Más robusto que dividir por el
       ancho: aguanta el `gap` entre láminas. */
    function indiceCercano() {
      var x = pista.scrollLeft, mejor = 0, menor = Infinity;
      laminas.forEach(function (l, i) {
        var d = Math.abs(destinoDe(i) - x);
        if (d < menor) { menor = d; mejor = i; }
      });
      return mejor;
    }

    /* --- Deslizar con el dedo: no lo tocamos, solo lo escuchamos --- */
    var espera = null;
    function alDetenerse() { pintar(indiceCercano()); }

    if ("onscrollend" in pista) {
      pista.addEventListener("scrollend", alDetenerse);
    } else {
      /* iOS todavía no dispara scrollend en todas las versiones:
         rebote de 120 ms. Pasivo para no frenar el gesto. */
      pista.addEventListener("scroll", function () {
        clearTimeout(espera);
        espera = setTimeout(alDetenerse, 120);
      }, { passive: true });
    }

    flechas.forEach(function (b) {
      b.addEventListener("click", function () {
        irA(actual + Number(b.getAttribute("data-paso")), true);
        /* Si el botón que acabas de pulsar queda deshabilitado, el foco
           se iría al <body> y el lector se quedaría mudo. */
        if (b.disabled) pista.focus();
      });
    });

    puntos.forEach(function (b) {
      b.addEventListener("click", function () {
        irA(Number(b.getAttribute("data-indice")), true);
      });
    });

    pista.addEventListener("keydown", function (ev) {
      var destino = null;
      if (ev.key === "ArrowRight") destino = actual + 1;
      else if (ev.key === "ArrowLeft") destino = actual - 1;
      else if (ev.key === "Home") destino = 0;
      else if (ev.key === "End") destino = ultima;
      if (destino === null) return;
      ev.preventDefault();
      irA(destino, true);
    });

    /* --- Girar el teléfono o cambiar el tamaño de letra ---
       WebKit no recalcula bien los anclajes al cambiar el viewport.
       El listener se autoelimina cuando la vista se repinta. */
    var reencuadre = null;
    function alRedimensionar() {
      if (!document.body.contains(pista)) {
        window.removeEventListener("resize", alRedimensionar);
        window.removeEventListener("orientationchange", alRedimensionar);
        clearTimeout(reencuadre);
        return;
      }
      clearTimeout(reencuadre);
      reencuadre = setTimeout(function () { pista.scrollLeft = destinoDe(actual); }, 150);
    }
    window.addEventListener("resize", alRedimensionar);
    window.addEventListener("orientationchange", alRedimensionar);
  }

  function conectarTodos(raiz) {
    [].slice.call((raiz || document).querySelectorAll(".carrusel")).forEach(conectar);
  }

  return {
    laminasDe: laminasDe,
    html: html,
    conectar: conectar,
    conectarTodos: conectarTodos
  };
})();
