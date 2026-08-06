/* ============================================================
   ALMACENAMIENTO LOCAL
   Todo se guarda en el propio teléfono (localStorage).
   No hay servidor, no se sube nada a ninguna parte.
   ============================================================ */

window.Guardado = (function () {
  var CLAVE = "mi-entreno-v1";

  function leerTodo() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; }
    catch (e) { return {}; }
  }

  function escribirTodo(datos) {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); }
    catch (e) { /* modo privado o sin espacio: la app sigue funcionando */ }
  }

  function hoy() {
    var d = new Date();
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  /* Clave de una sesión concreta: persona + día de la rutina + fecha real */
  function claveSesion(persona, nDia) {
    return persona + "|" + nDia + "|" + hoy();
  }

  /* Lunes de la semana en curso, en formato AAAA-MM-DD.

     Los días marcados como terminados se guardan con esta clave, así que
     se renuevan solos: el domingo sigue siendo la misma semana y el lunes
     ya es otra. Sin borrados programados ni tareas de fondo — que en una
     app sin servidor no existen— y sin depender de que la abras ese día. */
  function semana(fecha) {
    var d = fecha ? new Date(fecha) : new Date();
    var dia = d.getDay();                     /* 0 domingo … 6 sábado */
    var haceLunes = (dia === 0) ? 6 : dia - 1;
    d.setDate(d.getDate() - haceLunes);
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  return {
    hoy: hoy,
    semana: semana,

    /* -------- preferencias de visualización -------- */
    prefs: function () {
      var d = leerTodo();
      var p = d.prefs || {};
      return {
        escala: p.escala || 1,
        tema: p.tema || "oscuro",
        vozAuto: !!p.vozAuto,
        vibrar: p.vibrar !== false,
        /* El descanso entre series lo fija el entrenador en 60 s, pero en la
           práctica depende del ejercicio y del día. Se puede cambiar. */
        descanso: p.descanso || (window.PARAMETROS && window.PARAMETROS.descanso) || 60
      };
    },
    guardarPrefs: function (p) {
      var d = leerTodo(); d.prefs = p; escribirTodo(d);
    },

    /* -------- última persona usada -------- */
    ultimaPersona: function () { return leerTodo().ultimaPersona || null; },
    guardarPersona: function (id) {
      var d = leerTodo(); d.ultimaPersona = id; escribirTodo(d);
    },

    /* -------- avance del día de hoy -------- */
    sesion: function (persona, nDia) {
      var d = leerTodo();
      return (d.sesiones || {})[claveSesion(persona, nDia)] || { hechos: {}, series: {} };
    },
    guardarSesion: function (persona, nDia, sesion) {
      var d = leerTodo();
      d.sesiones = d.sesiones || {};
      d.sesiones[claveSesion(persona, nDia)] = sesion;
      /* limpieza: conservar solo los últimos 60 registros */
      var claves = Object.keys(d.sesiones);
      if (claves.length > 60) {
        claves.sort();
        claves.slice(0, claves.length - 60).forEach(function (k) { delete d.sesiones[k]; });
      }
      escribirTodo(d);
    },

    /* -------- días dados por terminados, semana a semana --------
       Se puede cerrar un día sin haber hecho todos los ejercicios: a veces
       la máquina está ocupada, a veces se acaba el tiempo. Lo que importa
       es saber si ya fuiste. */
    diasTerminados: function (persona) {
      var d = leerTodo();
      return (d.semanas || {})[persona + "|" + semana()] || {};
    },
    marcarDia: function (persona, nDia, terminado) {
      var d = leerTodo();
      d.semanas = d.semanas || {};
      var k = persona + "|" + semana();
      d.semanas[k] = d.semanas[k] || {};
      if (terminado) d.semanas[k][nDia] = true;
      else delete d.semanas[k][nDia];
      /* Solo se conservan las 8 semanas más recientes */
      var claves = Object.keys(d.semanas);
      if (claves.length > 16) {
        claves.sort();
        claves.slice(0, claves.length - 16).forEach(function (x) { delete d.semanas[x]; });
      }
      escribirTodo(d);
    },

    /* -------- peso usado por ejercicio (se recuerda entre semanas) -------- */
    peso: function (persona, ejercicio) {
      var d = leerTodo();
      return ((d.pesos || {})[persona] || {})[ejercicio] || "";
    },
    guardarPeso: function (persona, ejercicio, valor) {
      var d = leerTodo();
      d.pesos = d.pesos || {};
      d.pesos[persona] = d.pesos[persona] || {};
      d.pesos[persona][ejercicio] = valor;
      escribirTodo(d);
    },

    /* -------- ajustes del temporizador Tabata -------- */
    tabata: function () { return leerTodo().tabata || null; },
    guardarTabata: function (c) {
      var d = leerTodo(); d.tabata = c; escribirTodo(d);
    },

    /* -------- transparencia: qué hay guardado y dónde -------- */
    resumen: function () {
      var d = leerTodo();
      var sesiones = Object.keys(d.sesiones || {});
      var pesos = 0;
      Object.values(d.pesos || {}).forEach(function (p) { pesos += Object.keys(p).length; });
      var bytes = 0;
      try { bytes = (localStorage.getItem(CLAVE) || "").length; } catch (e) {}
      return {
        sesiones: sesiones.length,
        pesos: pesos,
        bytes: bytes,
        disponible: (function () {
          try { localStorage.setItem("__p", "1"); localStorage.removeItem("__p"); return true; }
          catch (e) { return false; }
        })()
      };
    },

    /* Copia de todo lo guardado, para descargarla */
    exportar: function () {
      return JSON.stringify({
        app: "Mi Entreno",
        exportado: new Date().toISOString(),
        datos: leerTodo()
      }, null, 2);
    },

    borrarTodo: function () { try { localStorage.removeItem(CLAVE); } catch (e) {} }
  };
})();
