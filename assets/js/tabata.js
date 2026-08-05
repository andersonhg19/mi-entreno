/* ============================================================
   MI ENTRENO — Tabata / temporizador por intervalos

   Un temporizador de intervalos, sin más. Preparación, trabajo,
   descanso, rondas y ciclos. Nada de estadísticas ni historial.

   Decisiones que importan:
   · El tiempo se mide con el reloj real (Date.now), no sumando
     intervalos: así no se desfasa si la pantalla se apaga o el
     navegador ralentiza los temporizadores.
   · La secuencia completa se calcula ANTES de empezar, como una
     lista de tramos. Saber en qué tramo estás es mirar el reloj,
     no llevar la cuenta a mano.
   · Avisa por voz, por pitido y por vibración. En un gimnasio
     ruidoso y sin mirar el teléfono, con uno solo no basta.
   · Mantiene la pantalla encendida mientras corre (Wake Lock).
   · Cada fase lleva su NOMBRE ESCRITO, no solo un color.
   ============================================================ */

window.Tabata = (function () {
  "use strict";

  var POR_DEFECTO = {
    preparacion: 10,
    trabajo: 20,
    descanso: 10,
    rondas: 8,
    ciclos: 1,
    descansoCiclo: 60
  };

  var LIMITES = {
    preparacion:   { min: 0,  max: 60,  paso: 5,  etiqueta: "Preparación" },
    trabajo:       { min: 5,  max: 600, paso: 5,  etiqueta: "Trabajo" },
    descanso:      { min: 0,  max: 600, paso: 5,  etiqueta: "Descanso" },
    rondas:        { min: 1,  max: 50,  paso: 1,  etiqueta: "Rondas" },
    ciclos:        { min: 1,  max: 20,  paso: 1,  etiqueta: "Ciclos" },
    descansoCiclo: { min: 0,  max: 600, paso: 15, etiqueta: "Descanso entre ciclos" }
  };

  var PRESETS = [
    { nombre: "Tabata clásico", detalle: "20 s / 10 s · 8 rondas",
      cfg: { preparacion: 10, trabajo: 20, descanso: 10, rondas: 8, ciclos: 1, descansoCiclo: 60 } },
    { nombre: "Suave", detalle: "30 s / 30 s · 6 rondas",
      cfg: { preparacion: 15, trabajo: 30, descanso: 30, rondas: 6, ciclos: 1, descansoCiclo: 60 } },
    { nombre: "Fuerza", detalle: "40 s / 20 s · 10 rondas",
      cfg: { preparacion: 10, trabajo: 40, descanso: 20, rondas: 10, ciclos: 1, descansoCiclo: 60 } },
    { nombre: "Doble ciclo", detalle: "20 s / 10 s · 8 rondas × 2",
      cfg: { preparacion: 10, trabajo: 20, descanso: 10, rondas: 8, ciclos: 2, descansoCiclo: 60 } }
  ];

  var FASES = {
    preparacion:   { texto: "Prepárate",        corto: "PREPARA",  voz: "Prepárate" },
    trabajo:       { texto: "¡Trabaja!",        corto: "TRABAJA",  voz: "Vamos" },
    descanso:      { texto: "Descansa",         corto: "DESCANSA", voz: "Descansa" },
    descansoCiclo: { texto: "Descanso largo",   corto: "DESCANSO", voz: "Descanso largo" },
    fin:           { texto: "Terminado",        corto: "FIN",      voz: "Terminado. Buen trabajo." }
  };

  var cfg = null;          /* configuración actual */
  var tramos = [];         /* secuencia completa, calculada al empezar */
  var inicioEn = 0;        /* marca de tiempo del arranque */
  var pausadoEn = 0;       /* si está en pausa, cuándo se pausó */
  var reloj = null;
  var faseAnterior = null;
  var restanteAnterior = null;
  var bloqueo = null;      /* Wake Lock */
  var caja = null;         /* contenedor donde se pinta */
  var audio = null;

  /* ---------------- utilidades ---------------- */

  function leerCfg() {
    var g = Guardado.tabata ? Guardado.tabata() : null;
    var c = {};
    Object.keys(POR_DEFECTO).forEach(function (k) {
      var v = g && typeof g[k] === "number" ? g[k] : POR_DEFECTO[k];
      c[k] = Math.max(LIMITES[k].min, Math.min(LIMITES[k].max, v));
    });
    return c;
  }

  function mmss(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  /* Construye la lista de tramos de toda la sesión */
  function construir(c) {
    var lista = [];
    if (c.preparacion > 0) {
      lista.push({ fase: "preparacion", seg: c.preparacion, ronda: 0, ciclo: 1 });
    }
    for (var ci = 1; ci <= c.ciclos; ci++) {
      for (var r = 1; r <= c.rondas; r++) {
        lista.push({ fase: "trabajo", seg: c.trabajo, ronda: r, ciclo: ci });
        var ultimaRonda = (r === c.rondas);
        var ultimoCiclo = (ci === c.ciclos);
        if (ultimaRonda && ultimoCiclo) continue;            /* no se descansa al final */
        if (ultimaRonda) {
          if (c.descansoCiclo > 0) lista.push({ fase: "descansoCiclo", seg: c.descansoCiclo, ronda: r, ciclo: ci });
        } else if (c.descanso > 0) {
          lista.push({ fase: "descanso", seg: c.descanso, ronda: r, ciclo: ci });
        }
      }
    }
    return lista;
  }

  function totalSegundos(lista) {
    return lista.reduce(function (a, t) { return a + t.seg; }, 0);
  }

  /* En qué tramo estamos según los segundos transcurridos */
  function situar(transcurrido) {
    var acumulado = 0;
    for (var i = 0; i < tramos.length; i++) {
      if (transcurrido < acumulado + tramos[i].seg) {
        return {
          indice: i, tramo: tramos[i],
          restante: acumulado + tramos[i].seg - transcurrido,
          transcurridoTramo: transcurrido - acumulado
        };
      }
      acumulado += tramos[i].seg;
    }
    return null;   /* terminado */
  }

  /* ---------------- avisos ---------------- */

  function pitar(agudo) {
    try {
      if (!audio) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio = new AC();
      }
      if (audio.state === "suspended") audio.resume();
      var o = audio.createOscillator();
      var g = audio.createGain();
      o.type = "sine";
      o.frequency.value = agudo ? 880 : 440;
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.22);
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + 0.25);
    } catch (e) { /* sin audio: quedan la voz y la vibración */ }
  }

  function vibrar(patron) {
    var p = Guardado.prefs();
    if (p.vibrar && navigator.vibrate) { try { navigator.vibrate(patron); } catch (e) {} }
  }

  /* ---------------- pantalla encendida ---------------- */

  function pedirBloqueo() {
    if (!navigator.wakeLock) return;
    navigator.wakeLock.request("screen")
      .then(function (b) { bloqueo = b; })
      .catch(function () { /* el navegador no lo permite: se apagará la pantalla */ });
  }

  function soltarBloqueo() {
    if (bloqueo) { try { bloqueo.release(); } catch (e) {} bloqueo = null; }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && reloj && !pausadoEn) pedirBloqueo();
  });

  /* ---------------- pintado ---------------- */

  function pintarConfig() {
    var h = '<h2 class="titulo-seccion">Tabata</h2>' +
            '<p class="subtitulo">Temporizador por intervalos. Elige un preajuste o pon tus tiempos.</p>';

    h += '<div class="tabata-presets">';
    PRESETS.forEach(function (p, i) {
      h += '<button class="btn-grande btn-secundario tabata-preset" data-preset="' + i + '">' +
             '<span><strong>' + p.nombre + '</strong><br>' +
             '<span class="tabata-preset-detalle">' + p.detalle + '</span></span>' +
           '</button>';
    });
    h += '</div>';

    Object.keys(LIMITES).forEach(function (k) {
      var L = LIMITES[k];
      var unidad = (k === "rondas" || k === "ciclos") ? "" : " s";
      h += '<div class="tabata-fila">' +
             '<span class="tabata-etiqueta">' + L.etiqueta + '</span>' +
             '<div class="tabata-control">' +
               '<button class="tabata-mas-menos" data-campo="' + k + '" data-delta="-1"' +
                 ' aria-label="Bajar ' + L.etiqueta + '">−</button>' +
               '<output class="tabata-valor" id="tv-' + k + '" aria-live="polite">' +
                 cfg[k] + unidad + '</output>' +
               '<button class="tabata-mas-menos" data-campo="' + k + '" data-delta="1"' +
                 ' aria-label="Subir ' + L.etiqueta + '">+</button>' +
             '</div>' +
           '</div>';
    });

    var lista = construir(cfg);
    h += '<div class="tarjeta">' +
           '<h3>Resumen</h3>' +
           '<p id="tabataResumen">' + resumenTexto(cfg, lista) + '</p>' +
         '</div>' +
         '<button class="btn-grande btn-principal" id="btnTabataEmpezar">▶ Empezar</button>';
    caja.innerHTML = h;
    conectarConfig();
  }

  function resumenTexto(c, lista) {
    return c.ciclos + " ciclo(s) de " + c.rondas + " ronda(s): " +
           c.trabajo + " s de trabajo y " + c.descanso + " s de descanso. " +
           "Duración total: " + mmss(totalSegundos(lista)) + ".";
  }

  function conectarConfig() {
    caja.querySelectorAll(".tabata-preset").forEach(function (b) {
      b.addEventListener("click", function () {
        cfg = Object.assign({}, PRESETS[Number(b.dataset.preset)].cfg);
        if (Guardado.guardarTabata) Guardado.guardarTabata(cfg);
        pintarConfig();
      });
    });
    caja.querySelectorAll(".tabata-mas-menos").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.campo, L = LIMITES[k];
        cfg[k] = Math.max(L.min, Math.min(L.max, cfg[k] + L.paso * Number(b.dataset.delta)));
        var unidad = (k === "rondas" || k === "ciclos") ? "" : " s";
        document.getElementById("tv-" + k).textContent = cfg[k] + unidad;
        document.getElementById("tabataResumen").textContent = resumenTexto(cfg, construir(cfg));
        if (Guardado.guardarTabata) Guardado.guardarTabata(cfg);
      });
    });
    var b = document.getElementById("btnTabataEmpezar");
    if (b) b.addEventListener("click", empezar);
  }

  function pintarMarcha() {
    var total = totalSegundos(tramos);
    caja.innerHTML =
      '<div class="tabata-pantalla" id="tabataPantalla" data-fase="preparacion">' +
        '<p class="tabata-fase" id="tabataFase" aria-live="assertive">Prepárate</p>' +
        '<div class="temporizador-reloj tabata-reloj">' +
          '<svg class="anillo" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
            '<circle class="anillo-fondo" cx="50" cy="50" r="45"></circle>' +
            '<circle class="anillo-progreso" id="tabataAnillo" cx="50" cy="50" r="45"' +
              ' stroke-dasharray="282.7" stroke-dashoffset="0"></circle>' +
          '</svg>' +
          '<p class="temporizador-numero" id="tabataSegundos">0</p>' +
        '</div>' +
        '<p class="tabata-ronda" id="tabataRonda"></p>' +
        '<p class="tabata-total" id="tabataTotal">Quedan ' + mmss(total) + ' de ' + mmss(total) + '</p>' +
      '</div>' +
      '<div class="fila-doble">' +
        '<button class="btn-grande btn-secundario" id="btnTabataPausa">⏸ Pausar</button>' +
        '<button class="btn-grande btn-peligro" id="btnTabataParar">■ Terminar</button>' +
      '</div>';

    document.getElementById("btnTabataPausa").addEventListener("click", alternarPausa);
    document.getElementById("btnTabataParar").addEventListener("click", function () {
      parar(); pintarConfig();
    });
  }

  /* ---------------- motor ---------------- */

  function empezar() {
    tramos = construir(cfg);
    if (!tramos.length) return;
    inicioEn = Date.now();
    pausadoEn = 0;
    faseAnterior = null;
    restanteAnterior = null;
    pintarMarcha();
    pedirBloqueo();
    pitar(true);
    Voz.decir(FASES[tramos[0].fase].voz);
    clearInterval(reloj);
    reloj = setInterval(tic, 100);
    tic();
  }

  function alternarPausa() {
    var b = document.getElementById("btnTabataPausa");
    if (pausadoEn) {
      inicioEn += Date.now() - pausadoEn;
      pausadoEn = 0;
      b.textContent = "⏸ Pausar";
      pedirBloqueo();
    } else {
      pausadoEn = Date.now();
      b.textContent = "▶ Reanudar";
      soltarBloqueo();
    }
    tic();
  }

  function parar() {
    clearInterval(reloj);
    reloj = null;
    pausadoEn = 0;
    soltarBloqueo();
    Voz.callar();
  }

  function tic() {
    var ahora = pausadoEn || Date.now();
    var transcurrido = (ahora - inicioEn) / 1000;
    var pos = situar(transcurrido);

    var pantalla = document.getElementById("tabataPantalla");
    if (!pantalla) { parar(); return; }

    if (!pos) {                       /* terminado */
      pantalla.setAttribute("data-fase", "fin");
      document.getElementById("tabataFase").textContent = FASES.fin.texto;
      document.getElementById("tabataSegundos").textContent = "0";
      document.getElementById("tabataRonda").textContent = "Sesión completa";
      document.getElementById("tabataTotal").textContent = "";
      document.getElementById("tabataAnillo").setAttribute("stroke-dashoffset", "282.7");
      if (faseAnterior !== "fin") {
        faseAnterior = "fin";
        pitar(false); setTimeout(function () { pitar(false); }, 300);
        vibrar([400, 150, 400, 150, 400]);
        Voz.decir(FASES.fin.voz);
      }
      parar();
      return;
    }

    var seg = Math.ceil(pos.restante);
    var f = pos.tramo.fase;

    /* Cambio de fase: avisar por los tres canales */
    if (f !== faseAnterior) {
      faseAnterior = f;
      pantalla.setAttribute("data-fase", f);
      document.getElementById("tabataFase").textContent = FASES[f].texto;
      if (transcurrido > 0.4) {          /* no repetir el aviso del arranque */
        pitar(f === "trabajo");
        vibrar(f === "trabajo" ? [300, 100, 300] : [200]);
        Voz.decir(FASES[f].voz + (f === "trabajo" ? ". Ronda " + pos.tramo.ronda : ""));
      }
    }

    document.getElementById("tabataSegundos").textContent = seg;
    document.getElementById("tabataRonda").textContent =
      pos.tramo.ronda ? ("Ronda " + pos.tramo.ronda + " de " + cfg.rondas +
        (cfg.ciclos > 1 ? " · ciclo " + pos.tramo.ciclo + " de " + cfg.ciclos : "")) : "";

    var total = totalSegundos(tramos);
    document.getElementById("tabataTotal").textContent =
      "Quedan " + mmss(total - transcurrido) + " de " + mmss(total);

    var fraccion = Math.max(0, Math.min(1, pos.restante / pos.tramo.seg));
    document.getElementById("tabataAnillo")
      .setAttribute("stroke-dashoffset", (282.7 * (1 - fraccion)).toFixed(1));

    /* Cuenta atrás hablada de los últimos 3 segundos de cada tramo */
    if (seg !== restanteAnterior) {
      restanteAnterior = seg;
      if (seg <= 3 && seg >= 1 && !pausadoEn) { pitar(false); Voz.decir(String(seg)); }
    }
  }

  /* ---------------- API ---------------- */

  function montar(contenedor) {
    caja = contenedor;
    cfg = leerCfg();
    parar();
    pintarConfig();
  }

  function desmontar() { parar(); caja = null; }

  return {
    montar: montar,
    desmontar: desmontar,
    enMarcha: function () { return !!reloj; },
    /* expuesto para las pruebas */
    _construir: construir,
    _total: totalSegundos,
    _presets: PRESETS
  };
})();
