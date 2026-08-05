/* ============================================================
   CRONÓMETRO DE DESCANSO
   Cuenta atrás grande, avisa por voz y vibra al terminar.
   Usa la hora real del reloj, así no se desfasa si la pantalla
   se apaga o el navegador ralentiza los temporizadores.
   ============================================================ */

window.Cronometro = (function () {
  var caja, numero, btnMas, btnParar;
  var finEn = 0, intervalo = null, ultimoAviso = -1;
  var alTerminar = null;

  function init() {
    caja     = document.getElementById("temporizador");
    numero   = document.getElementById("temporizadorNumero");
    btnMas   = document.getElementById("btnMasTiempo");
    btnParar = document.getElementById("btnPararTiempo");

    btnMas.addEventListener("click", function () { finEn += 30000; pintar(); });
    btnParar.addEventListener("click", function () { parar(true); });
  }

  function restante() { return Math.max(0, Math.ceil((finEn - Date.now()) / 1000)); }

  function pintar() {
    var s = restante();
    numero.textContent = s;
    numero.setAttribute("aria-label", s + " segundos restantes");

    /* Avisos hablados en los momentos clave */
    if (s !== ultimoAviso) {
      ultimoAviso = s;
      if (s === 10) Voz.decir("Diez segundos");
      else if (s === 3) Voz.decir("Tres");
      else if (s === 2) Voz.decir("Dos");
      else if (s === 1) Voz.decir("Uno");
    }
    if (s <= 0) terminar();
  }

  function terminar() {
    clearInterval(intervalo); intervalo = null;
    caja.hidden = true;
    Voz.decir("Descanso terminado. Siguiente serie.");
    var prefs = Guardado.prefs();
    if (prefs.vibrar && navigator.vibrate) navigator.vibrate([300, 120, 300]);
    if (alTerminar) { var f = alTerminar; alTerminar = null; f(); }
  }

  function parar(silencioso) {
    clearInterval(intervalo); intervalo = null;
    caja.hidden = true;
    if (silencioso) Voz.callar();
    alTerminar = null;
  }

  function iniciar(segundos, callback) {
    if (!caja) init();
    alTerminar = callback || null;
    finEn = Date.now() + segundos * 1000;
    ultimoAviso = -1;
    caja.hidden = false;
    pintar();
    clearInterval(intervalo);
    intervalo = setInterval(pintar, 250);
    btnParar.focus();
  }

  return { init: init, iniciar: iniciar, parar: parar, activo: function () { return !!intervalo; } };
})();
