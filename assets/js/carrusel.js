/* ============================================================
   MI ENTRENO — Carrusel de láminas del ejercicio

   Sin librerías. El movimiento lo hace el CSS (scroll-snap);
   este archivo solo construye el HTML, pinta los controles,
   añade teclado y reencuadra al girar el teléfono.

   NUNCA captura eventos táctiles: el deslizamiento y el pellizco
   para ampliar son los nativos del navegador. Innegociable para
   quien usa la lupa del sistema.

   ------------------------------------------------------------
   POR QUÉ LAS FLECHAS NUNCA SE DESHABILITAN

   Antes se deshabilitaban en los extremos. Eso rompía el carrusel:
   al pulsar «Siguiente» se lanzaba el desplazamiento suave y, en la
   misma vuelta, se deshabilitaba el botón que TENÍA EL FOCO. El
   navegador mueve el foco fuera del botón deshabilitado, y ese
   cambio de foco CANCELA el desplazamiento en curso. Después el
   listener de scroll leía la posición vieja y devolvía el contador
   a la lámina anterior: el carrusel se quedaba clavado.

   Ahora las flechas siempre están activas; en los extremos
   simplemente no hacen nada y se marcan con `aria-disabled`, que
   informa al lector de pantalla sin tocar el foco.
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
     Láminas de un ejercicio: tres, o una.

     1. La ficha del gimnasio: el recorte del cartón que entregó el
        entrenador, así que es EXACTA por definición. Siempre primero,
        y siempre está.
     2 y 3. Dos fotos reales del movimiento, si las hay.

     El campo `fotos` del catálogo decide, con tres estados:
       "exactas"    las fotos SON este ejercicio
       "parecidas"  mismo movimiento con otro implemento; se muestran,
                    porque sirven de referencia, pero el rótulo lo dice
                    sin rodeos
       "solo-ficha" no hay foto honesta de esto y no se pone ninguna

     Antes esto era un booleano y no sabía decir «no hay foto», así que
     nueve ejercicios de TRX, BOSU y banda acababan ilustrados con algo
     que no era el ejercicio. Rotularlo como «parecido» no arreglaba el
     dato, solo lo documentaba.
     --------------------------------------------------------- */
  function laminasDe(e) {
    var base = "assets/img/ejercicios/" + e.clave;
    var laminas = [{
      src: base + "-ficha.jpg",
      rotulo: "Ficha del gimnasio",
      alt: "Ficha del tablero de Life Gym para " + e.nombre +
           ": dibujo del movimiento con el nombre impreso."
    }];

    /* Nueve ejercicios se quedan SOLO con la ficha. Son los de TRX, BOSU y
       banda: no existen en ninguna base de fotos con licencia libre, y una
       foto que no es el ejercicio engaña más de lo que ayuda. La ficha del
       tablero ya enseña el TRX o el BOSU, así que se pierde poco. */
    if (e.fotos === "solo-ficha") return laminas;

    var parecidas = e.fotos === "parecidas";
    var marca = parecidas ? "⚠ Foto parecida" : "Foto";
    var aviso = parecidas ? " (mismo movimiento con otro implemento: manda la ficha)" : "";

    laminas.push({
      src: base + "-0.jpg",
      rotulo: marca + " · posición de inicio",
      alt: "Foto: posición de inicio de " + e.nombre + aviso
    });
    laminas.push({
      src: base + "-1.jpg",
      rotulo: marca + " · posición final",
      alt: "Foto: posición final de " + e.nombre + aviso
    });
    return laminas;
  }

  /* ---------------------------------------------------------
     HTML del carrusel. Devuelve texto para concatenar.
     El estado inicial ya viene pintado, así la región viva no
     anuncia nada al cargar: solo al cambiar de imagen de verdad.
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
      s += '<li class="carrusel-lamina">' +
             '<figure class="foto-caja" role="group"' +
               ' aria-roledescription="lámina"' +
               ' aria-label="' + esc((i + 1) + " de " + n + ": " + l.rotulo) + '">' +
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
               ' aria-disabled="true" aria-label="Imagen anterior">' +
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
    var numero = raiz.querySelector(".carrusel-num");
    var ultima = laminas.length - 1;
    var actual = 0;

    /* Posición de scroll de la lámina i. Se calcula en el momento, no se
       cachea: así sobrevive a rotaciones y a cambios de tamaño de letra. */
    function destinoDe(i) {
      return laminas[i].offsetLeft - laminas[0].offsetLeft;
    }

    function pintar(i) {
      if (i === actual) return;      /* no repetir el anuncio del lector */
      actual = i;
      numero.textContent = String(i + 1);
      flechas.forEach(function (b) {
        var destino = actual + Number(b.getAttribute("data-paso"));
        /* aria-disabled, NUNCA disabled: deshabilitar el botón enfocado
           mueve el foco y eso cancela el desplazamiento en curso. */
        b.setAttribute("aria-disabled", (destino < 0 || destino > ultima) ? "true" : "false");
      });
    }

    function irA(i) {
      i = Math.max(0, Math.min(ultima, i));
      if (i === actual) return;
      /* Primero el estado (no toca el foco), después el desplazamiento. */
      pintar(i);
      var x = destinoDe(i);
      if (!movimientoReducido() && pista.scrollTo) {
        try { pista.scrollTo({ left: x, behavior: "smooth" }); }
        catch (err) { pista.scrollLeft = x; }
      } else {
        pista.scrollLeft = x;
      }
    }

    /* Qué lámina está más cerca. Más robusto que dividir por el ancho:
       aguanta el `gap` entre láminas. */
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
         rebote de 140 ms. Pasivo para no frenar el gesto. */
      pista.addEventListener("scroll", function () {
        clearTimeout(espera);
        espera = setTimeout(alDetenerse, 140);
      }, { passive: true });
    }

    flechas.forEach(function (b) {
      b.addEventListener("click", function () {
        irA(actual + Number(b.getAttribute("data-paso")));
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
      irA(destino);
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
