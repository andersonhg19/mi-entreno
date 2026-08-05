/* ============================================================
   VOZ — lectura en voz alta (Web Speech API)
   Funciona sin internet en iPhone y en Android.
   Si el teléfono no la soporta, la app sigue igual: solo no habla.
   ============================================================ */

window.Voz = (function () {
  var soportada = ("speechSynthesis" in window);
  var vozEs = null;

  function elegirVoz() {
    if (!soportada) return null;
    var voces = window.speechSynthesis.getVoices();
    if (!voces || !voces.length) return null;
    /* Preferir español de Colombia / Latinoamérica, luego cualquier español */
    var orden = ["es-CO", "es-MX", "es-US", "es-419", "es-ES", "es"];
    for (var i = 0; i < orden.length; i++) {
      var v = voces.find(function (x) { return x.lang && x.lang.indexOf(orden[i]) === 0; });
      if (v) return v;
    }
    return null;
  }

  if (soportada) {
    vozEs = elegirVoz();
    window.speechSynthesis.onvoiceschanged = function () { vozEs = elegirVoz(); };
  }

  function decir(texto, opciones) {
    if (!soportada || !texto) return false;
    opciones = opciones || {};
    if (!opciones.encolar) window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-CO";
    if (vozEs) u.voice = vozEs;
    u.rate = opciones.rate || 0.95;   /* un pelín lento, se entiende mejor */
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
    return true;
  }

  return {
    soportada: soportada,
    decir: decir,
    callar: function () { if (soportada) window.speechSynthesis.cancel(); },
    hablando: function () { return soportada && window.speechSynthesis.speaking; },

    /* Lee un ejercicio completo, en orden útil para entrenar */
    leerEjercicio: function (ej) {
      var partes = [];
      partes.push(ej.nombre + ".");
      partes.push("Músculo: " + ej.grupo + ".");
      partes.push("Necesitas: " + ej.equipo + ".");
      if (ej.donde) partes.push("Dónde está: " + ej.donde);
      partes.push("Pasos.");
      ej.pasos.forEach(function (p, i) { partes.push("Paso " + (i + 1) + ". " + p); });
      if (ej.ojo) partes.push("Ojo. " + ej.ojo);
      return decir(partes.join(" "));
    }
  };
})();
