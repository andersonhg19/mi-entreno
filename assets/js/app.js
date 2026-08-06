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
     Preferencias de visualización
     --------------------------------------------------------- */
  function aplicarPrefs() {
    document.documentElement.style.setProperty("--escala", prefs.escala);
    document.documentElement.setAttribute("data-tema", prefs.tema);
    document.getElementById("valorLetra").textContent = Math.round(prefs.escala * 100) + "%";
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

    p.dias.forEach(function (d) {
      var color = window.COLORES_DIA[d.color];
      var sesion = Guardado.sesion(idPersona, d.n);
      var hechos = Object.keys(sesion.hechos || {}).length;
      var total = d.ejercicios.length;
      var descanso = total === 0;
      var conteo = descanso ? "Sin ejercicios"
        : (hechos > 0 ? hechos + " de " + total + " hechos hoy" : total + " ejercicios");

      html += '<button class="dia" data-ir="#/p/' + idPersona + '/d/' + d.n + '"' +
                (d.n === hoy ? ' data-hoy="si"' : '') +
                (descanso ? ' data-descanso="si"' : '') + '>' +
                '<span class="dia-marca" aria-hidden="true" style="--color-dia:' + color.hex + '">' +
                  esc(d.dia.charAt(0)) + '</span>' +
                '<span class="dia-info">' +
                  '<span class="dia-nombre">' + esc(d.dia) +
                    (d.n === hoy ? '<span class="etiqueta-hoy">HOY</span>' : '') + '</span>' +
                  '<span class="dia-titulo">' + esc(d.titulo) + '</span>' +
                  '<span class="dia-conteo">' + esc(conteo) + '</span>' +
                '</span>' +
                '<span class="dia-flecha" aria-hidden="true">›</span>' +
              '</button>';
    });

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

    d.ejercicios.forEach(function (clave, i) {
      var e = ejercicioDe(clave);
      if (!e) return;
      var hecho = sesion.hechos && sesion.hechos[clave];
      html += '<button class="ejercicio" data-grupo="' + esc(claveGrupo(e.grupo)) + '" ' +
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
    });

    html += '<div class="tarjeta"><h3>Para cerrar</h3><p>' + esc(window.PARAMETROS.cardio) + '.</p></div>';

    contenido.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Piezas comunes del detalle de un ejercicio
     --------------------------------------------------------- */
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
      (e.fotosOk ? '' :
        '<p class="nota-foto">Las dos fotos son de un movimiento <strong>parecido</strong>, ' +
        'no idéntico. La que manda es la ficha del gimnasio.</p>');
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
    if (e.ojo) {
      html += '<div class="aviso"><span class="icono" aria-hidden="true">!</span><span>' +
              '<strong>Ojo con esto</strong>' + esc(e.ojo) + '</span></div>';
    }
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
    var html = cabeceraEjercicio(e) + carruselDe(e) +
               '<button class="btn-grande btn-principal" id="btnLeer">Léemelo en voz alta</button>' +
               instrucciones(e);

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

      /* Lo que hay que hacer, antes que nada */
      '<div class="receta">' +
        '<div class="receta-celda"><span class="receta-valor">3-4</span>' +
          '<span class="receta-etiqueta">Series</span></div>' +
        '<div class="receta-celda"><span class="receta-valor">10-15</span>' +
          '<span class="receta-etiqueta">Repes</span></div>' +
        '<div class="receta-celda"><span class="receta-valor">' + window.PARAMETROS.descanso + ' s</span>' +
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
          'Serie hecha · descansar ' + window.PARAMETROS.descanso + ' s</button>' +
        '<label class="etiqueta-peso">' +
          '<span>Peso que usaste</span>' +
          '<input type="text" id="campoPeso" class="campo-peso" inputmode="decimal" ' +
          'placeholder="por ejemplo: 20 kg" value="' + esc(pesoGuardado) + '">' +
        '</label>' +
        /* El campo viene relleno con lo de la última vez, que es lo cómodo,
           pero visto sin más parece que ya se anotó lo de hoy. Se dice. */
        (pesoGuardado
          ? '<p class="nota-peso">Es lo que pusiste la última vez. Cámbialo si hoy fue otro.</p>'
          : '') +
      '</div>' +

      '<button class="btn-grande btn-secundario" id="btnLeer">Léemelo en voz alta</button>' +

      instrucciones(e) +

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
      Voz.decir("Serie " + seriesHechas + " hecha. Descansa " + window.PARAMETROS.descanso + " segundos.");
      Cronometro.iniciar(window.PARAMETROS.descanso, function () {
        var b = document.getElementById("btnSerieHecha");
        if (b) b.focus();
      }, loQueViene);
    });

    document.getElementById("campoPeso").addEventListener("change", function (ev) {
      Guardado.guardarPeso(idPersona, clave, ev.target.value.trim());
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
       marcado y la recarga se hace en cuanto vuelvas al inicio. */
    var yaRecargado = false;
    var actualizacionLista = false;

    function recargarSiProcede() {
      if (yaRecargado || !actualizacionLista) return;
      var enInicio = !location.hash || location.hash === "#/" || location.hash === "#";
      if (!enInicio) return;
      yaRecargado = true;
      location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", function () {
      actualizacionLista = true;
      recargarSiProcede();
    });
    window.addEventListener("hashchange", recargarSiProcede);
  }
})();
