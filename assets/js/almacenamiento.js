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

  return {
    hoy: hoy,

    /* -------- preferencias de visualización -------- */
    prefs: function () {
      var d = leerTodo();
      return d.prefs || { escala: 1, tema: "oscuro", vozAuto: false, vibrar: true };
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
