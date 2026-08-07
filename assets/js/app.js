/* ============================================================
   MI ENTRENO — Aplicación
   Sin librerías. Una sola página con rutas por # (hash).

   Rutas:
     #/                              selector de persona
     #/p/:persona                    semana
     #/p/:persona/lista              lista completa de ejercicios
     #/p/:persona/lista/:filtro      lista filtrada ("todos" o 1..7)
     #/p/:persona/d/:dia             ejercicios de un día
     #/p/:persona/d/:dia/e/:indice   ejercicio, modo ENTRENO
     #/p/:persona/x/:clave           ejercicio, modo CONSULTA
   ============================================================ */

(function () {
  "use strict";

  var contenido   = document.getElementById("contenido");
  var tituloBarra = document.getElementById("tituloBarra");
  var btnVolver   = document.getElementById("btnVolver");
  var btnAjustes  = document.getElementById("btnAjustes");
  var panel       = document.getElementById("panelAjustes");

  var prefs = Guardado.prefs();

  /* ---------------------------------------------------------
     Utilidades
     --------------------------------------------------------- */
  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* "Tríceps" -> "triceps", para el atributo data-grupo del CSS */
  function claveGrupo(g) {
    return String(g || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* "Pecho" -> "PE": la inicial que acompaña al color, nunca sola */
  function inicialGrupo(g) {
    return String(g || "??").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .slice(0, 2).toUpperCase();
  }

  function urlVideo(termino) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(termino);
  }

  /* Día de la semana de hoy: 1 = lunes … 7 = domingo */
  function diaDeHoy() {
    var d = new Date().getDay();
    return d === 0 ? 7 : d;
  }

  function persona(id) { return window.PLANES[id] || null; }

  function diaDe(p, n) {
    return p.dias.filter(function (d) { return d.n === Number(n); })[0] || null;
  }

  function ejercicioDe(clave) {
    var e = window.CATALOGO[clave];
    if (!e) return null;
    var copia = Object.assign({}, e);
    copia.clave = clave;
    copia.ficha = "assets/img/ejercicios/" + clave + "-ficha.jpg";
    return copia;
  }

  function diasDeEjercicio(p, clave) {
    return p.dias.filter(function (d) { return d.ejercicios.indexOf(clave) !== -1; });
  }

  function todosLosEjercicios(p) {
    var vistos = {}, lista = [];
    p.dias.forEach(function (d) {
      d.ejercicios.forEach(function (k) {
        if (vistos[k]) return;
        vistos[k] = true;
        var e = ejercicioDe(k);
        if (e) { e.dias = diasDeEjercicio(p, k); lista.push(e); }
      });
    });
    return lista.sort(function (a, b) {
      if (a.grupo !== b.grupo) return a.grupo.localeCompare(b.grupo, "es");
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }

  function pildoraGrupo(grupo) {
    return '<span class="pildora-grupo" data-grupo="' + esc(claveGrupo(grupo)) + '">' +
             '<span class="inicial" aria-hidden="true">' + esc(inicialGrupo(grupo)) + '</span>' +
             esc(grupo) +
           '</span>';
  }

  function puntosDeDias(dias) {
    if (!dias || !dias.length) return "";
    return '<span class="dias-puntos" aria-hidden="true">' +
      dias.map(function (d) {
        return '<span class="dia-punto" style="background:' + window.COLORES_DIA[d.color].hex + '"></span>';
      }).join("") + '</span>';
  }

  /* ---------------------------------------------------------
     Peso: historial y cuándo toca subir
     --------------------------------------------------------- */
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun",
               "jul", "ago", "sep", "oct", "nov", "dic"];

  function fechaCorta(f) {
    var p = String(f || "").split("-");
    if (p.length !== 3) return "";
    return Number(p[2]) + " " + MESES[Number(p[1]) - 1];
  }

  /* Del texto libre a un número, cuando se puede.

     El campo es libre a propósito: a veces lo que se apunta es «placa 7» o
     «la roja», y eso también es información útil. Si no sale número, se
     enseña el historial igual y no se da consejo. */
  function pesoNumero(texto) {
    var m = String(texto || "").replace(",", ".").match(/\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }

  /* Regla del entrenador, escrita a mano en la planilla:
     «Subir el peso de 10 % a 20 % cuando las 15 repeticiones salgan fáciles».

     La app NO puede saber si te salen fáciles, así que no manda: solo avisa
     de que llevas varias sesiones igual y recuerda la regla. Hacen falta
     tres sesiones con el mismo peso para no dar la lata por dos seguidas. */
  function consejoPeso(historial) {
    var conNumero = historial.filter(function (x) { return pesoNumero(x.v) !== null; });
    if (conNumero.length < 3) return null;
    var ultimos = conNumero.slice(-3);
    var v = pesoNumero(ultimos[0].v);
    for (var i = 1; i < ultimos.length; i++) {
      if (pesoNumero(ultimos[i].v) !== v) return null;
    }
    var redondear = function (n) { return String(Math.round(n * 2) / 2).replace(".", ","); };
    /* La unidad se saca del propio texto («20 kg» -> «kg») para no inventar
       una: si él escribe «placa 7», el consejo dice «placa 7», no «7 kg». */
    var unidad = String(ultimos[ultimos.length - 1].v)
      .replace(/[\d.,]+/g, " ").replace(/\s+/g, " ").trim();
    var con = function (n) { return n + (unidad ? " " + unidad : ""); };
    return {
      sesiones: conNumero.filter(function (x) { return pesoNumero(x.v) === v; }).length,
      actual: ultimos[ultimos.length - 1].v,
      rango: con(redondear(v * 1.1)) + " – " + con(redondear(v * 1.2))
    };
  }

  function bloquePeso(idPersona, clave) {
    return '<div id="panelPeso">' + contenidoPeso(idPersona, clave) + '</div>';
  }

  function contenidoPeso(idPersona, clave) {
    var historial = Guardado.historialPeso(idPersona, clave);
    if (!historial.length) return "";

    var c = consejoPeso(historial);
    var html = "";
    if (c) {
      html += '<p class="nota-peso nota-peso-sube">' +
                '<strong>Llevas ' + c.sesiones + ' sesiones con ' + esc(c.actual) + '.</strong> ' +
                'Si las 15 repeticiones ya te salen fáciles, toca subir a ' +
                esc(c.rango) + '.' +
              '</p>';
    } else {
      html += '<p class="nota-peso">Es lo que pusiste la última vez. ' +
              'Cámbialo si hoy fue otro.</p>';
    }

    /* Las últimas veces, para ver de un vistazo si estás subiendo */
    var previas = historial.slice(-4, -1).reverse();
    if (previas.length) {
      html += '<p class="historial-peso">Antes: ' +
        previas.map(function (x) {
          var f = fechaCorta(x.f);
          return esc(x.v) + (f ? ' <span class="historial-fecha">(' + esc(f) + ')</span>' : '');
        }).join(" · ") + '</p>';
    }
    return html;
  }

  /* ---------------------------------------------------------
     Preferencias de visualización
     --------------------------------------------------------- */
  function aplicarPrefs() {
    document.documentElement.style.setProperty("--escala", prefs.escala);
    document.documentElement.setAttribute("data-tema", prefs.tema);
    document.getElementById("valorLetra").textContent = Math.round(prefs.escala * 100) + "%";
    document.getElementById("valorDescanso").textContent = prefs.descanso + " s";
    document.getElementById("notaDescanso").textContent =
      "Es el tiempo que arranca solo al tocar «Serie hecha». El entrenador puso " +
      window.PARAMETROS.descanso + " s.";
    document.getElementById("chkVozAuto").checked = !!prefs.vozAuto;
    document.getElementById("chkVibrar").checked  = !!prefs.vibrar;
    panel.querySelectorAll("button[data-tema]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.tema === prefs.tema ? "true" : "false");
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", prefs.tema === "claro" ? "#F2F5F9" : "#0A0E14");
  }

  function guardarPrefs() { Guardado.guardarPrefs(prefs); aplicarPrefs(); }

  btnAjustes.addEventListener("click", function () {
    var abierto = panel.hidden;
    panel.hidden = !abierto;
    btnAjustes.setAttribute("aria-expanded", abierto ? "true" : "false");
    if (abierto) pintarResumenDatos();
  });

  document.getElementById("btnLetraMas").addEventListener("click", function () {
    prefs.escala = Math.min(1.8, Math.round((prefs.escala + 0.1) * 100) / 100); guardarPrefs();
  });
  document.getElementById("btnLetraMenos").addEventListener("click", function () {
    prefs.escala = Math.max(0.9, Math.round((prefs.escala - 0.1) * 100) / 100); guardarPrefs();
  });
  /* Descanso: de 15 en 15 s, entre 15 s y 5 minutos. Si estás en una
     pantalla de ejercicio, se vuelve a pintar para que el botón diga el
     tiempo nuevo. */
  function cambiarDescanso(delta) {
    prefs.descanso = Math.max(15, Math.min(300, prefs.descanso + delta));
    guardarPrefs();
    if (/\/e\/\d+$/.test(location.hash)) enrutar();
  }
  document.getElementById("btnDescansoMas").addEventListener("click", function () {
    cambiarDescanso(15);
  });
  document.getElementById("btnDescansoMenos").addEventListener("click", function () {
    cambiarDescanso(-15);
  });

  panel.querySelectorAll("button[data-tema]").forEach(function (b) {
    b.addEventListener("click", function () { prefs.tema = b.dataset.tema; guardarPrefs(); });
  });
  document.getElementById("chkVozAuto").addEventListener("change", function (e) {
    prefs.vozAuto = e.target.checked; guardarPrefs();
  });
  document.getElementById("chkVibrar").addEventListener("change", function (e) {
    prefs.vibrar = e.target.checked; guardarPrefs();
  });

  /* ---------------------------------------------------------
     Tus datos: qué hay guardado, copia de seguridad y borrado
     --------------------------------------------------------- */
  function pintarResumenDatos() {
    var r = Guardado.resumen();
    var kb = Math.max(1, Math.round(r.bytes / 1024));
    document.getElementById("resumenDatos").textContent = r.disponible
      ? "Ahora mismo hay " + r.sesiones + " día(s) de entreno anotados y " +
        r.pesos + " peso(s) recordados. Ocupa " + kb + " KB."
      : "El navegador no deja guardar nada (¿navegación privada?). " +
        "La app funciona, pero no recordará tus series ni tus pesos.";
  }

  document.getElementById("btnExportar").addEventListener("click", function () {
    var texto = Guardado.exportar();
    var url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "mi-entreno-" + Guardado.hoy() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  document.getElementById("btnBorrarDatos").addEventListener("click", function () {
    if (!confirm("¿Borrar todo lo que has anotado (series, pesos y ejercicios hechos)?\n\n" +
                 "La rutina NO se borra: esa viene con la app.")) return;
    Guardado.borrarTodo();
    prefs = Guardado.prefs();
    aplicarPrefs();
    pintarResumenDatos();
    enrutar();
  });

  /* ---------------------------------------------------------
     Vista: selector de persona
     --------------------------------------------------------- */
  function vistaInicio() {
    tituloBarra.textContent = "Mi Entreno";
    btnVolver.hidden = true;

    var html = '<h2 class="titulo-seccion">¿Quién va a entrenar?</h2>' +
               '<p class="subtitulo">Toca tu nombre para ver la rutina.</p>';

    ["anderson", "sharid"].forEach(function (id) {
      var p = window.PLANES[id];
      var n = p.dias.reduce(function (a, d) { return a + d.ejercicios.length; }, 0);
      html += '<button class="persona" data-ir="#/p/' + id + '" data-tema-persona="' + esc(p.tema) + '">' +
                '<span class="persona-inicial" aria-hidden="true">' + esc(p.nombre.charAt(0)) + '</span>' +
                '<span class="persona-texto">' +
                  '<span class="persona-nombre">' + esc(p.nombre) + '</span>' +
                  '<span class="persona-detalle">5 días por semana · ' + n + ' ejercicios</span>' +
                '</span>' +
              '</button>';
    });

    html += '<button class="btn-grande btn-secundario" data-ir="#/tabata" ' +
              'style="margin-top:var(--e4)">⏱ Tabata · temporizador por intervalos</button>';

    html += '<div class="tarjeta">' +
              '<h3>Cómo funciona</h3>' +
              '<p>Elige tu nombre y luego el día. Cada ejercicio trae la ficha del ' +
              'gimnasio, los pasos escritos y un botón para que la app te lo lea en voz alta.</p>' +
              '<p>Al terminar cada serie toca <strong>Serie hecha</strong> y arranca solo el ' +
              'descanso de un minuto, con aviso de voz y vibración.</p>' +
            '</div>' +
            '<p class="pie-nota">Plan de ' + esc(window.PARAMETROS.gimnasio) + '<br>' +
            'Vigente del 4 de agosto al 4 de noviembre de 2026</p>';

    contenido.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Vista: semana
     --------------------------------------------------------- */
  function vistaSemana(idPersona) {
    var p = persona(idPersona);
    if (!p) return irA("#/");
    Guardado.guardarPersona(idPersona);

    tituloBarra.textContent = p.nombre;
    btnVolver.hidden = false;
    btnVolver.dataset.ir = "#/";

    var hoy = diaDeHoy();
    var html = '<h2 class="titulo-seccion">Tu semana</h2>' +
               '<p class="subtitulo">' + esc(window.PARAMETROS.diasPorSemana) + '</p>';

    if (p.notaImportante) {
      html += '<div class="aviso"><span class="icono" aria-hidden="true">!</span><span>' +
              '<strong>Ojo con esto</strong>' + esc(p.notaImportante) + '</span></div>';
    }

    var terminados = Guardado.diasTerminados(idPersona);
    var cerrados = 0;

    p.dias.forEach(function (d) {
      var color = window.COLORES_DIA[d.color];
      var sesion = Guardado.sesion(idPersona, d.n);
      var hechos = Object.keys(sesion.hechos || {}).length;
      var total = d.ejercicios.length;
      var descanso = total === 0;
      var listo = !!terminados[d.n];
      if (listo) cerrados++;

      var conteo = descanso ? "Sin ejercicios"
        : (listo ? "Entrenado esta semana"
                 : (hechos > 0 ? hechos + " de " + total + " hechos hoy"
                               : total + " ejercicios"));

      html += '<button class="dia" data-ir="#/p/' + idPersona + '/d/' + d.n + '"' +
                (d.n === hoy ? ' data-hoy="si"' : '') +
                (descanso ? ' data-descanso="si"' : '') +
                (listo ? ' data-listo="si"' : '') + '>' +
                '<span class="dia-marca" aria-hidden="true" style="--color-dia:' + color.hex + '">' +
                  esc(listo ? "✓" : d.dia.charAt(0)) + '</span>' +
                '<span class="dia-info">' +
                  '<span class="dia-nombre">' + esc(d.dia) +
                    (d.n === hoy ? '<span class="etiqueta-hoy">HOY</span>' : '') +
                    /* El estado no puede depender solo del color ni del icono */
                    (listo ? '<span class="etiqueta-listo">ENTRENADO</span>' : '') + '</span>' +
                  '<span class="dia-titulo">' + esc(d.titulo) + '</span>' +
                  '<span class="dia-conteo">' + esc(conteo) + '</span>' +
                '</span>' +
                '<span class="dia-flecha" aria-hidden="true">›</span>' +
              '</button>';
    });

    var conEjercicios = p.dias.filter(function (d) { return d.ejercicios.length; }).length;
    html += '<p class="resumen-semana">' +
              (cerrados
                ? '<strong>' + cerrados + ' de ' + conEjercicios + '</strong> días entrenados esta semana.'
                : 'Todavía no has cerrado ningún día esta semana.') +
              ' La cuenta vuelve a cero cada lunes.</p>';

    html += '<button class="btn-grande btn-secundario" data-ir="#/p/' + idPersona + '/lista" ' +
              'style="margin-top:var(--e4)">Ver la lista completa de ejercicios</button>' +

            '<div class="tarjeta">' +
              '<h3>Reglas de toda la rutina</h3>' +
              '<p>' + esc(window.PARAMETROS.series) + ' de ' + esc(window.PARAMETROS.repeticiones) + '.</p>' +
              '<p>' + esc(window.PARAMETROS.descansoTexto) + '.</p>' +
              '<p>' + esc(window.PARAMETROS.incrementoPeso) + '.</p>' +
              '<p>Cardio: ' + esc(window.PARAMETROS.cardio) + '.</p>' +
            '</div>' +
            '<div class="tarjeta">' +
              '<h3>Tu objetivo</h3>' +
              '<p>' + esc(p.objetivos.join(". ")) + '.</p>' +
              '<p>Método: ' + esc(p.metodo) + '.</p>' +
            '</div>';

    contenido.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Vista: lista completa con filtro por día
     --------------------------------------------------------- */
  function vistaLista(idPersona, filtro) {
    var p = persona(idPersona);
    if (!p) return irA("#/");

    filtro = filtro || "todos";
    tituloBarra.textContent = "Lista completa";
    btnVolver.hidden = false;
    btnVolver.dataset.ir = "#/p/" + idPersona;

    var todos = todosLosEjercicios(p);
    var visibles = filtro === "todos"
      ? todos
      : todos.filter(function (e) {
          return e.dias.some(function (d) { return String(d.n) === String(filtro); });
        });

    var html = '<h2 class="titulo-seccion">Todos tus ejercicios</h2>' +
               '<p class="subtitulo">' + todos.length + ' en total. Filtra por día para ver ' +
               'qué te asignaron.</p>';

    html += '<div class="filtros" role="group" aria-label="Filtrar por día">' +
              '<button class="filtro" data-filtro="todos" aria-pressed="' +
                (filtro === "todos") + '">Todos (' + todos.length + ')</button>';
    p.dias.filter(function (d) { return d.ejercicios.length; }).forEach(function (d) {
      html += '<button class="filtro" data-filtro="' + d.n + '" aria-pressed="' +
                (String(filtro) === String(d.n)) + '">' +
                '<span class="punto" aria-hidden="true" style="background:' +
                  window.COLORES_DIA[d.color].hex + '"></span>' +
                esc(d.dia) + ' (' + d.ejercicios.length + ')</button>';
    });
    html += '</div>';

    if (filtro !== "todos") {
      var dSel = diaDe(p, filtro);
      if (dSel) {
        html += '<div class="tarjeta">' +
                  '<h3>' + esc(dSel.dia) + ' · ' + esc(dSel.titulo) + '</h3>' +
                  '<p>' + esc(dSel.resumen) + '</p>' +
                  '<p>En tu hoja va marcado en <strong>' +
                  esc(window.COLORES_DIA[dSel.color].etiqueta.toLowerCase()) + '</strong>.</p>' +
                '</div>' +
                '<button class="btn-grande btn-principal" data-ir="#/p/' + idPersona + '/d/' + dSel.n + '">' +
                  'Entrenar este día</button>';
      }
    }

    if (!visibles.length) {
      html += '<div class="tarjeta"><p>No hay ejercicios para ese filtro.</p></div>';
    }

    var grupoActual = null;
    visibles.forEach(function (e) {
      if (e.grupo !== grupoActual) {
        grupoActual = e.grupo;
        html += '<h3 class="grupo-titulo" data-grupo="' + esc(claveGrupo(grupoActual)) + '">' +
                  '<span class="marca" aria-hidden="true"></span>' + esc(grupoActual) +
                '</h3>';
      }
      var etiquetaDias = e.dias.map(function (d) { return d.dia; }).join(" y ");
      html += '<button class="ejercicio" data-grupo="' + esc(claveGrupo(e.grupo)) + '" ' +
                'data-ir="#/p/' + idPersona + '/x/' + e.clave + '">' +
                '<img class="ejercicio-miniatura" src="' + esc(e.ficha) + '" alt="" loading="lazy">' +
                '<span class="ejercicio-texto">' +
                  '<span class="ejercicio-nombre">' + esc(e.nombre) + '</span>' +
                  '<span class="ejercicio-grupo">' + esc(e.equipo) + '</span>' +
                  '<span class="ejercicio-grupo">' + esc(etiquetaDias) + puntosDeDias(e.dias) + '</span>' +
                '</span>' +
                '<span class="ejercicio-flecha" aria-hidden="true">›</span>' +
              '</button>';
    });

    contenido.innerHTML = html;

    contenido.querySelectorAll(".filtro").forEach(function (b) {
      b.addEventListener("click", function () {
        irA("#/p/" + idPersona + "/lista/" + b.dataset.filtro);
      });
    });
  }

  /* ---------------------------------------------------------
     Vista: día
     --------------------------------------------------------- */
  function vistaDia(idPersona, nDia) {
    var p = persona(idPersona);
    if (!p) return irA("#/");
    var d = diaDe(p, nDia);
    if (!d) return irA("#/p/" + idPersona);

    tituloBarra.textContent = d.dia;
    btnVolver.hidden = false;
    btnVolver.dataset.ir = "#/p/" + idPersona;

    var sesion = Guardado.sesion(idPersona, d.n);
    var hechos = Object.keys(sesion.hechos || {}).length;
    var total  = d.ejercicios.length;

    var html = '<h2 class="titulo-seccion">' + esc(d.titulo) + '</h2>' +
               '<p class="subtitulo">' + esc(d.dia) + ' · marcado en ' +
               esc(window.COLORES_DIA[d.color].etiqueta.toLowerCase()) + ' en tu hoja</p>';

    if (total === 0) {
      html += '<div class="tarjeta"><h3>Día de descanso</h3><p>' + esc(d.resumen) + '</p></div>';
      contenido.innerHTML = html;
      return;
    }

    var pct = Math.round(hechos / total * 100);
    html += '<p>' + esc(d.resumen) + '</p>';

    if (hechos === total) {
      html += '<div class="estado-final">' +
                '<span class="icono" aria-hidden="true">✓</span>' +
                '<strong>Día completo</strong>' +
                '<p>Hiciste los ' + total + ' ejercicios. Cierra con ' +
                esc(window.PARAMETROS.cardio) + '.</p>' +
              '</div>';
    } else {
      html += '<p><strong>' + hechos + ' de ' + total + '</strong> ejercicios hechos hoy</p>' +
              '<div class="barra-progreso" role="img" aria-label="Progreso del día: ' + pct + ' por ciento">' +
                '<span style="width:' + pct + '%"></span></div>' +
              '<button class="btn-grande btn-principal" data-ir="#/p/' + idPersona + '/d/' + d.n + '/e/0">' +
                (hechos ? 'Seguir con el entreno' : 'Empezar el entreno') + '</button>';
    }

    /* La lista va partida en dos: lo que falta y lo que ya está.

       Con 17 ejercicios el lunes, buscar los que faltan entre los hechos
       obliga a repasar la lista entera cada vez. Separados, lo pendiente
       está siempre arriba y no hay que buscar nada. */
    function botonEjercicio(clave, i, hecho) {
      var e = ejercicioDe(clave);
      if (!e) return "";
      return '<button class="ejercicio" data-grupo="' + esc(claveGrupo(e.grupo)) + '" ' +
               'data-ir="#/p/' + idPersona + '/d/' + d.n + '/e/' + i + '"' +
               (hecho ? ' data-hecho="si"' : '') + '>' +
               '<span class="ejercicio-numero" aria-hidden="true">' + (hecho ? '✓' : (i + 1)) + '</span>' +
               '<img class="ejercicio-miniatura" src="' + esc(e.ficha) + '" alt="" loading="lazy">' +
               '<span class="ejercicio-texto">' +
                 '<span class="ejercicio-nombre">' + esc(e.nombre) + '</span>' +
                 '<span class="ejercicio-grupo">' + esc(e.grupo) + ' · ' + esc(e.equipo) +
                 (hecho ? ' · HECHO' : '') + '</span>' +
               '</span>' +
             '</button>';
    }

    var pendientes = [], realizados = [];
    d.ejercicios.forEach(function (clave, i) {
      var hecho = !!(sesion.hechos && sesion.hechos[clave]);
      (hecho ? realizados : pendientes).push(botonEjercicio(clave, i, hecho));
    });

    if (pendientes.length) {
      html += '<h3 class="titulo-grupo-lista">Te faltan ' + pendientes.length +
              (pendientes.length === 1 ? ' ejercicio' : ' ejercicios') + '</h3>' +
              pendientes.join("");
    }
    if (realizados.length) {
      html += '<h3 class="titulo-grupo-lista titulo-hechos">Ya hiciste ' + realizados.length +
              (realizados.length === 1 ? ' ejercicio' : ' ejercicios') + '</h3>' +
              realizados.join("");
    }

    html += '<div class="tarjeta"><h3>Para cerrar</h3><p>' + esc(window.PARAMETROS.cardio) + '.</p></div>';

    /* Cerrar el día aunque falten ejercicios: en el gimnasio pasa
       constantemente que una máquina está ocupada o se acaba el tiempo. */
    var listo = !!Guardado.diasTerminados(idPersona)[d.n];
    html += '<button class="btn-grande ' + (listo ? 'btn-secundario' : 'btn-principal') +
              '" id="btnDiaListo">' +
              (listo ? 'Quitar «entrenado» de este día'
                     : '✓ Dar por terminado el ' + esc(d.dia)) +
            '</button>' +
            '<p class="nota-dia-listo">' +
              (listo
                ? 'Este día cuenta como entrenado esta semana.'
                : 'Puedes cerrarlo aunque falten ejercicios. Se reinicia solo cada lunes.') +
            '</p>';

    contenido.innerHTML = html;

    document.getElementById("btnDiaListo").addEventListener("click", function () {
      Guardado.marcarDia(idPersona, d.n, !listo);
      if (!listo) Voz.decir(d.dia + " terminado. Buen trabajo.");
      vistaDia(idPersona, nDia);
    });
  }

  /* ---------------------------------------------------------
     Piezas comunes del detalle de un ejercicio
     --------------------------------------------------------- */
  /* La advertencia del entrenador va ANTES del carrusel.

     Motivo: hay dos ejercicios donde la ficha —y la foto— enseñan un SALTO,
     y el entrenador escribió a mano «SIN SALTO» en la planilla de cada uno.
     La foto no está mal (el ejercicio es ese), pero si el aviso aparece
     después de las imágenes se lee tarde. Lo que manda para ellos es la
     adaptación, así que se lee primero. */
  function avisoDe(e) {
    if (!e.ojo) return "";
    return '<div class="aviso"><span class="icono" aria-hidden="true">!</span><span>' +
           '<strong>Ojo con esto</strong>' + esc(e.ojo) + '</span></div>';
  }

  /* «Si la máquina está ocupada»: otros ejercicios que trabajan lo mismo.

     `yaEnElDia` son las claves que esa persona hace ese mismo día. Se
     esconden: ofrecerte como recambio algo que vas a hacer igual dentro de
     un rato no resuelve nada. En modo consulta no hay día, así que salen
     todas. */
  /* Las alternativas que quedan tras quitar las que ya haces ese día. */
  function alternativasVisibles(e, yaEnElDia) {
    var alt = (window.ALTERNATIVAS || {})[e.clave];
    if (!alt) return { directas: [], otras: [], total: 0 };
    var fuera = {};
    (yaEnElDia || []).forEach(function (k) { fuera[k] = true; });
    var filtrar = function (lista) {
      return (lista || []).filter(function (k) { return !fuera[k] && window.CATALOGO[k]; });
    };
    var directas = filtrar(alt.directas);
    var otras = filtrar(alt.mismoMusculo);
    return { directas: directas, otras: otras, total: directas.length + otras.length };
  }

  /* Atajo arriba del todo.

     El bloque de alternativas va al final, después de los pasos, que es
     donde tiene sentido leerlo. El problema es que ahí no se encuentra: hay
     que bajar toda la pantalla y Anderson estuvo buscándolo sin dar con él.
     Esto es un botón pequeño junto al nombre que salta directo. */
  function atajoAlternativas(e, yaEnElDia) {
    var v = alternativasVisibles(e, yaEnElDia);
    if (!v.total) return "";
    return '<button class="atajo-alternativas" id="btnIrAlternativas">' +
             '¿Ocupada la máquina? Ver ' + v.total +
             (v.total === 1 ? ' alternativa' : ' alternativas') +
             '<span class="atajo-flecha" aria-hidden="true">↓</span>' +
           '</button>';
  }

  function alternativasDe(e, idPersona, yaEnElDia) {
    var v = alternativasVisibles(e, yaEnElDia);
    var directas = v.directas, otras = v.otras;
    if (!v.total) return "";

    function fila(k) {
      var a = ejercicioDe(k);
      return '<button class="ejercicio ejercicio-alterno" ' +
               'data-grupo="' + esc(claveGrupo(a.grupo)) + '" ' +
               'data-ir="#/p/' + idPersona + '/x/' + k + '">' +
               '<img class="ejercicio-miniatura" src="' + esc(a.ficha) + '" alt="" loading="lazy">' +
               '<span class="ejercicio-texto">' +
                 '<span class="ejercicio-nombre">' + esc(a.nombre) + '</span>' +
                 '<span class="ejercicio-grupo">' + esc(a.equipo) + '</span>' +
               '</span>' +
               '<span class="dia-flecha" aria-hidden="true">›</span>' +
             '</button>';
    }

    return '<div class="tarjeta alternativas" id="alternativas">' +
      '<h3>¿Ocupada la máquina?</h3>' +
      (directas.length
        ? '<p class="alternativas-nota"><strong>Cambio directo:</strong> hacen lo mismo ' +
          'que este ejercicio, con otro aparato.</p>' + directas.map(fila).join("")
        : '') +
      (otras.length
        ? '<p class="alternativas-nota alternativas-nota-2">' +
          (directas.length ? 'Y si tampoco puedes, estos ' : 'Estos ') +
          '<strong>trabajan el mismo músculo</strong>, aunque el movimiento no ' +
          'sea el mismo.</p>' + otras.map(fila).join("")
        : '') +
    '</div>';
  }

  function cabeceraEjercicio(e) {
    return '<div class="detalle-cabecera">' +
             '<h2 class="detalle-nombre">' + esc(e.nombre) + '</h2>' +
             '<p class="detalle-meta">' + pildoraGrupo(e.grupo) +
               '<span class="detalle-equipo">' + esc(e.equipo) + '</span></p>' +
           '</div>';
  }

  /* El carrusel y, justo debajo, el enlace al video: son la misma cosa
     (ver cómo se hace), así que van juntos y a un dedo de distancia. */
  function carruselDe(e) {
    return Carrusel.html(Carrusel.laminasDe(e), e.nombre) +
      '<a class="enlace-video" href="' + esc(urlVideo(e.buscar)) + '" target="_blank" rel="noopener">' +
        '▶ Ver video de este ejercicio' +
        '<span class="enlace-nota">necesita internet</span>' +
      '</a>' +
      (e.fotos === "parecidas"
        ? '<p class="nota-foto">Las dos fotos son del <strong>mismo movimiento con otro ' +
          'implemento</strong>, no exactamente esto. La que manda es la ficha del gimnasio.</p>'
        : e.fotos === "solo-ficha"
        ? '<p class="nota-foto">Solo está la ficha del gimnasio, y es la buena: ' +
          'de este ejercicio no hay ninguna foto libre que sea de verdad este ' +
          'movimiento, y poner una que no lo es confunde más que ayuda.</p>'
        : '');
  }

  function instrucciones(e) {
    var html =
      '<div class="tarjeta">' +
        '<h3>Cómo se hace</h3>' +
        '<ol class="pasos">' +
          e.pasos.map(function (t) { return '<li><span>' + esc(t) + '</span></li>'; }).join("") +
        '</ol>' +
      '</div>' +
      '<div class="tarjeta">' +
        '<h3>Dónde está / qué necesitas</h3>' +
        '<p>' + esc(e.donde) + '</p>' +
      '</div>';
    /* El aviso ya se pintó arriba, antes del carrusel: aquí no se repite. */
    return html;
  }

  function conectarBotonLeer(e) {
    var b = document.getElementById("btnLeer");
    if (!b) return;
    b.addEventListener("click", function () {
      if (Voz.hablando()) { Voz.callar(); return; }
      if (!Voz.leerEjercicio(e)) {
        alert("Este teléfono no tiene lectura por voz disponible.");
      }
    });
    if (prefs.vozAuto) Voz.leerEjercicio(e);
  }

  /* ---------------------------------------------------------
     Vista: ejercicio en modo CONSULTA (desde la lista completa)
     --------------------------------------------------------- */
  function vistaConsulta(idPersona, clave) {
    var p = persona(idPersona);
    if (!p) return irA("#/");
    var e = ejercicioDe(clave);
    if (!e) return irA("#/p/" + idPersona + "/lista");

    tituloBarra.textContent = e.grupo;
    btnVolver.hidden = false;
    btnVolver.dataset.ir = "#/p/" + idPersona + "/lista";

    var dias = diasDeEjercicio(p, clave);
    var html = cabeceraEjercicio(e) + atajoAlternativas(e, null) + avisoDe(e) + carruselDe(e) +
               '<button class="btn-grande btn-principal" id="btnLeer">Léemelo en voz alta</button>' +
               instrucciones(e) +
               /* En consulta no hay un día concreto, así que no se filtra nada */
               alternativasDe(e, idPersona, null);

    if (dias.length) {
      html += '<div class="tarjeta"><h3>Cuándo te toca</h3><p>' +
                esc(dias.map(function (d) { return d.dia; }).join(" y ")) + '.</p></div>';
      dias.forEach(function (d) {
        html += '<button class="btn-grande btn-secundario" data-ir="#/p/' + idPersona + '/d/' + d.n + '">' +
                  'Ir al entreno de ' + esc(d.dia) + '</button>';
      });
    } else {
      html += '<div class="tarjeta"><p>Este ejercicio no está en tu rutina actual.</p></div>';
    }

    contenido.innerHTML = html;
    Carrusel.conectarTodos(contenido);
    conectarBotonLeer(e);
  }

  /* ---------------------------------------------------------
     Vista: ejercicio en modo ENTRENO (dentro de un día)
     --------------------------------------------------------- */
  function vistaEjercicio(idPersona, nDia, indice) {
    var p = persona(idPersona);
    if (!p) return irA("#/");
    var d = diaDe(p, nDia);
    if (!d) return irA("#/p/" + idPersona);

    indice = Number(indice);
    var clave = d.ejercicios[indice];
    var e = clave && ejercicioDe(clave);
    if (!e) return irA("#/p/" + idPersona + "/d/" + nDia);

    tituloBarra.textContent = (indice + 1) + " de " + d.ejercicios.length;
    btnVolver.hidden = false;
    btnVolver.dataset.ir = "#/p/" + idPersona + "/d/" + nDia;

    var sesion = Guardado.sesion(idPersona, nDia);
    var seriesHechas = (sesion.series && sesion.series[clave]) || 0;
    var pesoGuardado = Guardado.peso(idPersona, clave);

    var html = cabeceraEjercicio(e) +

      /* Atajo a las alternativas: el bloque va al final, pero desde aquí
         se llega de un toque cuando encuentras la máquina ocupada. */
      atajoAlternativas(e, d.ejercicios) +

      /* La advertencia del entrenador, antes que las imágenes */
      avisoDe(e) +

      /* Lo que hay que hacer, antes que nada */
      '<div class="receta">' +
        '<div class="receta-celda"><span class="receta-valor">3-4</span>' +
          '<span class="receta-etiqueta">Series</span></div>' +
        '<div class="receta-celda"><span class="receta-valor">10-15</span>' +
          '<span class="receta-etiqueta">Repes</span></div>' +
        '<div class="receta-celda"><span class="receta-valor">' + prefs.descanso + ' s</span>' +
          '<span class="receta-etiqueta">Descanso</span></div>' +
      '</div>' +

      carruselDe(e) +

      '<div class="tarjeta series-caja">' +
        '<h3>Series de hoy</h3>' +
        '<p class="series-numero" id="numSeries" aria-live="polite">' + seriesHechas + '</p>' +
        '<p class="series-etiqueta">series hechas</p>' +
        '<div class="series-controles">' +
          '<button class="btn-grande btn-secundario" id="btnMenosSerie" aria-label="Quitar una serie">−</button>' +
          '<button class="btn-grande btn-secundario" id="btnMasSerie" aria-label="Sumar una serie">+</button>' +
        '</div>' +
        '<button class="btn-grande btn-principal" id="btnSerieHecha" style="margin-top:var(--e3)">' +
          'Serie hecha · descansar ' + prefs.descanso + ' s</button>' +
        '<label class="etiqueta-peso">' +
          '<span>Peso que usaste</span>' +
          '<input type="text" id="campoPeso" class="campo-peso" inputmode="decimal" ' +
          'placeholder="por ejemplo: 20 kg" value="' + esc(pesoGuardado) + '">' +
        '</label>' +
        /* El campo viene relleno con lo de la última vez, que es lo cómodo,
           pero visto sin más parece que ya se anotó lo de hoy. Se dice.
           Y debajo, lo que pusiste las veces anteriores y, si llevas
           varias sesiones con el mismo peso, el recordatorio del entrenador. */
        bloquePeso(idPersona, clave) +
      '</div>' +

      '<button class="btn-grande btn-secundario" id="btnLeer">Léemelo en voz alta</button>' +

      instrucciones(e) +

      /* Aquí sí se filtran: no se ofrece como recambio algo que ya está
         en la rutina de hoy. */
      alternativasDe(e, idPersona, d.ejercicios) +

      '<button class="btn-grande" id="btnHecho">' +
        (sesion.hechos && sesion.hechos[clave] ? 'Marcar como NO hecho' : '✓ Terminé este ejercicio') +
      '</button>' +

      '<div class="fila-doble">' +
        '<button class="btn-grande btn-secundario" id="btnAnterior"' +
          (indice === 0 ? ' disabled' : '') + '>← Anterior</button>' +
        '<button class="btn-grande btn-secundario" id="btnSiguiente"' +
          (indice >= d.ejercicios.length - 1 ? ' disabled' : '') + '>Siguiente →</button>' +
      '</div>';

    contenido.innerHTML = html;
    Carrusel.conectarTodos(contenido);
    conectarBotonLeer(e);

    function refrescarSeries() {
      document.getElementById("numSeries").textContent = seriesHechas;
      sesion.series = sesion.series || {};
      sesion.series[clave] = seriesHechas;
      Guardado.guardarSesion(idPersona, nDia, sesion);
    }

    document.getElementById("btnMasSerie").addEventListener("click", function () {
      seriesHechas++; refrescarSeries();
    });
    document.getElementById("btnMenosSerie").addEventListener("click", function () {
      seriesHechas = Math.max(0, seriesHechas - 1); refrescarSeries();
    });

    /* Lo que toca después de este ejercicio, para poder ir mirando la
       máquina mientras se descansa. */
    var claveSig = d.ejercicios[indice + 1];
    var eSig = claveSig && ejercicioDe(claveSig);
    var loQueViene = eSig ? "Luego: " + eSig.nombre : "Este es el último del día.";

    document.getElementById("btnSerieHecha").addEventListener("click", function () {
      seriesHechas++; refrescarSeries();
      Voz.decir("Serie " + seriesHechas + " hecha. Descansa " + prefs.descanso + " segundos.");
      Cronometro.iniciar(prefs.descanso, function () {
        var b = document.getElementById("btnSerieHecha");
        if (b) b.focus();
      }, loQueViene);
    });

    document.getElementById("campoPeso").addEventListener("change", function (ev) {
      Guardado.guardarPeso(idPersona, clave, ev.target.value.trim());
      /* Solo se repinta este panel. Repintar la vista entera perdería el
         foco y te devolvería al principio de la pantalla justo cuando
         acabas de anotar el peso a mitad de la serie. */
      var panel = document.getElementById("panelPeso");
      if (panel) panel.innerHTML = contenidoPeso(idPersona, clave);
    });

    document.getElementById("btnHecho").addEventListener("click", function () {
      sesion.hechos = sesion.hechos || {};
      if (sesion.hechos[clave]) { delete sesion.hechos[clave]; }
      else {
        sesion.hechos[clave] = true;
        Voz.decir("Listo. " + e.nombre + " terminado.");
      }
      Guardado.guardarSesion(idPersona, nDia, sesion);
      if (sesion.hechos[clave] && indice < d.ejercicios.length - 1) {
        irA("#/p/" + idPersona + "/d/" + nDia + "/e/" + (indice + 1));
      } else {
        vistaEjercicio(idPersona, nDia, indice);
      }
    });

    document.getElementById("btnAnterior").addEventListener("click", function () {
      irA("#/p/" + idPersona + "/d/" + nDia + "/e/" + (indice - 1));
    });
    document.getElementById("btnSiguiente").addEventListener("click", function () {
      irA("#/p/" + idPersona + "/d/" + nDia + "/e/" + (indice + 1));
    });
  }

  /* ---------------------------------------------------------
     Enrutado
     --------------------------------------------------------- */
  function irA(ruta) {
    if (location.hash === ruta) enrutar();
    else location.hash = ruta;
  }

  /* ---------------------------------------------------------
     Vista: Tabata (la pinta y la gobierna su propio módulo)
     --------------------------------------------------------- */
  function vistaTabata() {
    tituloBarra.textContent = "Tabata";
    btnVolver.hidden = false;
    btnVolver.dataset.ir = "#/";
    Tabata.montar(contenido);
  }

  function enrutar() {
    Voz.callar();
    Cronometro.parar(true);
    Tabata.desmontar();
    panel.hidden = true;
    btnAjustes.setAttribute("aria-expanded", "false");

    var t = (location.hash || "#/").replace(/^#\/?/, "").split("/").filter(Boolean);

    /* La barra de arriba toma el color de la persona mientras estás dentro
       de su rutina. Idea de Samy: desde dentro no había forma de saber de
       quién era sin volver atrás. En el selector no lleva ninguno. */
    var pBarra = (t[0] === "p" && t[1]) ? persona(t[1]) : null;
    var barra = document.querySelector(".barra-superior");
    if (pBarra) barra.setAttribute("data-persona", pBarra.tema);
    else barra.removeAttribute("data-persona");

    if (t[0] === "tabata")                       vistaTabata();
    else if (t[0] !== "p")                       vistaInicio();
    else if (t.length === 2)                     vistaSemana(t[1]);
    else if (t.length === 3 && t[2] === "lista") vistaLista(t[1], "todos");
    else if (t.length === 4 && t[2] === "lista") vistaLista(t[1], t[3]);
    else if (t.length === 4 && t[2] === "d")     vistaDia(t[1], t[3]);
    else if (t.length === 4 && t[2] === "x")     vistaConsulta(t[1], t[3]);
    else if (t.length === 6 && t[4] === "e")     vistaEjercicio(t[1], t[3], t[5]);
    else                                         vistaInicio();

    window.scrollTo(0, 0);
    contenido.focus();
  }

  /* Atajo a las alternativas. Delegado, para que valga igual en la vista de
     entreno y en la de consulta sin repetir el enganche en cada una. */
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest("#btnIrAlternativas")) return;
    var caja = document.getElementById("alternativas");
    if (!caja) return;
    caja.scrollIntoView({ behavior: "smooth", block: "start" });
    /* El foco va también, no solo la vista: si solo se desplaza, con teclado
       o con lector de pantalla te quedas donde estabas. */
    caja.setAttribute("tabindex", "-1");
    caja.focus({ preventScroll: true });
  });

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-ir]");
    if (el && !el.hasAttribute("disabled")) { irA(el.dataset.ir); }
  });

  window.addEventListener("hashchange", enrutar);

  /* ---------------------------------------------------------
     Arranque
     --------------------------------------------------------- */
  aplicarPrefs();
  Cronometro.init();

  /* La app SIEMPRE abre en el selector de persona, pase lo que pase.
     Antes saltaba sola a la última persona usada, y al recargar te dejaba
     dentro de la rutina del otro sin que te dieras cuenta. Como la usan dos
     personas en dos teléfonos, empezar preguntando quién entrena es lo único
     que no se presta a confusión. */
  if (location.hash && location.hash !== "#/" && location.hash !== "#") {
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + "#/");
    else location.hash = "#/";
  }
  enrutar();

  document.getElementById("versionApp").textContent = "Mi Entreno · versión " + window.VERSION_APP;
  pintarResumenDatos();

  if (navigator.serviceWorker && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      try {
        navigator.serviceWorker.register("sw.js").catch(function () { /* sin conexión, da igual */ });
      } catch (e) { /* navegación privada en iOS: la app sigue funcionando online */ }
    });

    /* Cuando el service worker nuevo toma el control, la página que estás
       viendo sigue siendo la vieja. Se recarga para que la actualización se
       vea sin tener que borrar nada a mano.

       Pero SOLO si estás en el selector de persona. Si estás a mitad de un
       ejercicio, recargar te sacaría de ahí sin avisar; en ese caso se deja
       marcado y la recarga se hace en cuanto vuelvas al inicio.

       PROBLEMA QUE ESTO TENÍA, Y QUE COSTÓ UNA FUNCIÓN ENTERA
       -------------------------------------------------------
       Si la actualización terminaba estando tú dentro de la rutina, se
       quedaba esperando **en silencio**. Y si no volvías al selector, no
       se aplicaba nunca: la app seguía funcionando con la versión vieja
       sin decir nada. Anderson estuvo buscando los ejercicios alternativos
       en una versión que todavía no los tenía.

       Ahora, además de esperar, se AVISA con un botón. Y se comprueba si
       hay versión nueva cada vez que vuelves a la app, porque en un móvil
       la app casi nunca se cierra del todo: se queda en segundo plano. */
    var yaRecargado = false;
    var actualizacionLista = false;
    var avisoNueva = document.getElementById("avisoNueva");

    function enInicio() {
      return !location.hash || location.hash === "#/" || location.hash === "#";
    }

    function recargarSiProcede() {
      if (yaRecargado || !actualizacionLista) return;
      if (!enInicio()) { avisoNueva.hidden = false; return; }
      yaRecargado = true;
      location.reload();
    }

    document.getElementById("btnActualizar").addEventListener("click", function () {
      yaRecargado = true;
      location.reload();
    });

    navigator.serviceWorker.addEventListener("controllerchange", function () {
      actualizacionLista = true;
      recargarSiProcede();
    });
    window.addEventListener("hashchange", recargarSiProcede);

    /* Al volver a la app desde segundo plano, preguntar si hay versión
       nueva. Sin esto, una app instalada puede pasar días sin enterarse. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      recargarSiProcede();
      navigator.serviceWorker.getRegistration().then(function (r) {
        if (r) r.update();
      }).catch(function () { /* sin conexión: se mira la próxima vez */ });
    });
  }
})();
