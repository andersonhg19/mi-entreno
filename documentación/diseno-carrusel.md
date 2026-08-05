# Pantalla de detalle de un ejercicio: carrusel de imágenes y jerarquía

Documento de diseño. **No modifica código**: propone el reemplazo del bloque
`.fotos` (dos imágenes a media pantalla) por un carrusel accesible, y un orden
nuevo para la pantalla completa.

Contexto: PWA sin librerías, HTML + CSS + JS puro, funciona sin internet.
Usuario principal con **baja visión**. Reglas que no se negocian: contraste
≥ 7:1, base 17 px (no agrandar), áreas tocables ≥ 44 px (el proyecto usa 48),
nada que dependa solo del color, `prefers-reduced-motion` respetado.

---

## 1. Qué hacen las apps de referencia

### 1.1 Lo que pude confirmar

| App | Qué muestra arriba del todo | Dónde van series y descanso | Orden del resto |
|---|---|---|---|
| **Fitbod** | Vídeo de demostración **al principio** de la ficha del ejercicio | El icono de temporizador de descanso está **junto al número de series, justo debajo del título** | vídeo → series/reps/peso recomendados → instrucciones escritas → músculos → historial |
| **Hevy** | Animación de demostración | En el entreno, la tabla de series manda; el detalle del ejercicio es otra pantalla | animación → instrucciones (montaje y ejecución) → músculos → historial de ese ejercicio → récords (1RM estimado, mejor serie, volumen) |
| **Strong** | Nada de media durante el entreno: nombre + tabla de series | Tabla de series con la marca de «hecha» a la derecha de cada fila | la demostración y las notas están a un toque, fuera de la vista de entreno |
| **JEFIT** | Pantalla de ejercicio rediseñada, «layout más limpio» | **Descanso configurable serie a serie**; el temporizador vive en la pantalla del ejercicio | acciones secundarias (cambiar ejercicio, notas, superserie) escondidas en el menú «···» de la esquina |
| **Nike Training Club** | Vídeo dirigido por un entrenador, a pantalla completa | No hay contador manual: el vídeo marca el ritmo | media → nada más; es «sigue al entrenador» |
| **Apple Fitness+** | Vídeo a pantalla completa con métricas superpuestas y rótulos/subtítulos siempre visibles | Superpuestos sobre el vídeo | media → todo lo demás encima, nunca en una pantalla aparte |
| **Caliber** | Ficha del ejercicio con vídeo corto y texto de técnica | Registro de series bajo la demostración | vídeo → cómo se hace → registro |

### 1.2 Los cinco patrones que se repiten

1. **La media va primero y ocupa el ancho completo.** Ninguna app pone dos
   imágenes pequeñas lado a lado. Fitbod arranca con el vídeo, Hevy con la
   animación, NTC y Fitness+ son vídeo puro. La imagen es lo que identifica la
   máquina cuando llegas al gimnasio; es la parte más cara de encoger.
2. **La prescripción (series × reps × descanso) va pegada al nombre**, no
   enterrada. Fitbod la pone literalmente debajo del título, con el
   temporizador al lado.
3. **Separan «aprender» de «hacer».** Hevy y Strong tienen dos pantallas
   distintas para el mismo ejercicio: la biblioteca (educativa: animación →
   instrucciones → músculos → historial) y la fila dentro del entreno
   (operativa: solo el registro de series). Nuestra app ya tiene esa división:
   `vistaConsulta` y `vistaEjercicio`. **Hay que explotarla, no unificarla.**
4. **Lo secundario se esconde** (JEFIT lo mete todo en un «···»). Nada de
   ofrecer diez botones del mismo tamaño.
5. **Los rótulos de la media están siempre visibles**, no al pasar el ratón
   (Fitness+ mantiene las indicaciones del entrenador en pantalla). En móvil el
   *hover* no existe: cualquier cosa que dependa de él es texto perdido.

### 1.3 Qué ven ellos sin hacer scroll

En un iPhone típico, el primer pantallazo de Fitbod/Hevy contiene: nombre del
ejercicio, media a ancho completo, y la primera fila del registro de series.
Las instrucciones escritas **siempre** quedan bajo el pliegue. Eso es una
decisión, no un descuido: durante el entreno lees las instrucciones una vez y
tocas el contador seis veces.

---

## 2. El carrusel

### 2.1 Veredicto: `scroll-snap` de CSS + una capa fina de JS

**Se usa `scroll-snap-type: x mandatory` para el movimiento, y JS solo para los
controles** (botones, puntos, contador «2 de 3», teclado, resincronizar al
girar el teléfono).

**Por qué no un carrusel JS manual** (`transform: translateX` + `touchstart` /
`touchmove` / `touchend`):

- Hay que capturar los eventos táctiles y eso obliga a tocar `touch-action`.
  En cuanto interfieres con el gesto, **rompes el pellizco para ampliar**. Para
  alguien con baja visión que usa la lupa y el zoom del navegador encima de la
  app, eso es inaceptable. Es el argumento que cierra la discusión.
- Hay que reimplementar la física de la inercia. Siempre queda peor que la
  nativa y en un iPhone se nota inmediatamente.
- Si el JS falla o tarda, te quedas con una pila de imágenes rota. Con
  `scroll-snap`, sin JS sigues teniendo un carrusel usable a dedo (solo pierdes
  los botones y el contador).
- Es más código, y este proyecto no tiene dependencias a propósito.

**Por qué tampoco los carruseles «de CSS puro» de última generación**
(`::scroll-marker()`, `::scroll-button()`, `scroll-state()` container queries,
`interactivity: inert`): son de Chrome 135+ (marzo 2025). **Safari no los
implementa**, y el usuario principal está en iPhone. Sirven como confirmación
de que el enfoque `scroll-snap` es el que la plataforma bendice, pero no se
pueden usar hoy. Los controles hay que dibujarlos a mano.

### 2.2 Problemas conocidos de `scroll-snap` en Safari iOS y cómo los evitamos

| Problema documentado | ¿Nos afecta? | Mitigación aplicada |
|---|---|---|
| **Un solo gesto rápido («flick») recorre la lista entera** hasta el final. WebKit calcula la inercia distinto que Blink. | Sí | `scroll-snap-stop: always` en cada lámina: obliga a parar en cada una. Además con 1–3 láminas el recorrido máximo es de dos posiciones. |
| **WebKit cachea los puntos de anclaje en el primer *layout***; si el tamaño de los hijos cambia después (imágenes que decodifican tarde), los puntos quedan mal. | Sí, es el riesgo real | Cada lámina mide `flex: 0 0 100%` + `min-width: 100%` (**medida explícita, no implícita**) y cada imagen lleva `aspect-ratio: 4 / 3` con `object-fit: contain`. El hueco está reservado **antes** de que la imagen cargue: los puntos nunca se mueven. |
| **`scroll-behavior: smooth` y `scrollTo({behavior:'smooth'})` no existían antes de Safari 15.4**; y en algunas versiones `scroll-behavior: smooth` bloquea la asignación directa de `scrollLeft`. | Poco (iOS moderno) | El JS usa `scrollTo({...})` dentro de `try/catch` y cae a `pista.scrollLeft = x`. El `scroll-behavior: smooth` del CSS solo se aplica dentro de `@media (prefers-reduced-motion: no-preference)`. |
| **Los puntos de anclaje no se recalculan al girar el teléfono / cambiar el viewport.** | Sí | Listener de `resize` con rebote que hace `irA(actual, false)`: reencuadra la lámina actual. |
| **`scroll-snap` sobre `<body>` rompe todo el scroll de la página** (bug histórico de iOS). | No | El anclaje va en un contenedor propio (`.carrusel-pista`), nunca en `body` ni en `html`. |
| **Encadenamiento del scroll**: arrastrar en horizontal arrastra la página. | Sí | `overscroll-behavior-x: contain`. |
| `scroll-snap-type: mandatory` puede atrapar al usuario en listas largas (problema de accesibilidad conocido). | No | Con 3 elementos como máximo no hay dónde atraparse; y hay botones y puntos como alternativa al gesto (WCAG 2.5.7, «arrastrar no puede ser la única forma»). |

### 2.3 Decisiones de accesibilidad, una por una

- **Contenedor**: `role="group"` + `aria-roledescription="carrusel"` +
  `aria-label`. Se usa `group` y no `region` porque un `region` crea un *punto
  de referencia* (landmark) y esta pantalla ya tiene varios; meter un landmark
  por cada ejercicio ensucia el rotor de VoiceOver.
- **Pista = `<ul role="list">`**. El `role="list"` explícito es obligatorio:
  al poner `list-style: none`, **Safari/VoiceOver le quitan la semántica de
  lista**. Con el rol puesto, VoiceOver anuncia «lista, 3 elementos», que es
  justo el dato que hace falta («¿cuántas fotos hay?»).
- **Cada lámina**: el `<li>` conserva su `listitem` y el `role="group"` +
  `aria-roledescription="lámina"` va en el `<figure>` de dentro. Así no se
  pisan las dos semánticas. El `aria-label` de cada figura ya dice «1 de 3:
  ficha del gimnasio»: si un lector de pantalla ignora
  `aria-roledescription` (varios lo hacen), la posición sigue estando dicha.
- **La pista lleva `tabindex="0"`.** Un contenedor con scroll y sin nada
  enfocable dentro es inalcanzable por teclado (regla de axe *«scrollable
  region must have keyboard access»*). Con el `tabindex` puesto, además,
  ganamos las flechas ← → para pasar de lámina.
- **Dentro de las láminas no hay nada enfocable.** Es deliberado: así no hay
  elementos con foco fuera de pantalla y **no necesitamos** los trucos de
  `interactivity: inert` / `container-type: scroll-state` (que además son solo
  de Chrome). Si algún día se añade un botón «ampliar» por lámina, habrá que
  resolver ese problema; hoy no existe.
- **Indicador de posición escrito**: «Imagen **2** de 3», con
  `aria-live="polite"` y `aria-atomic="true"`. Es texto, no un color. El
  `aria-atomic` hace que se lea la frase entera y no solo el número suelto.
- **Puntos numerados, no puntos de colores.** Cada botón lleva el número
  **escrito dentro** (1, 2, 3), mide 44×44 px y el activo se marca con
  `aria-current="true"` + relleno de acento + anillo interior. Tres señales
  redundantes: texto, forma y color.
- **Nunca se anuncia de más.** El estado inicial ya viene pintado en el HTML
  (número 1, flecha «anterior» deshabilitada, punto 1 con `aria-current`), y
  `pintar()` sale temprano si el índice no cambió. La región viva solo habla
  cuando de verdad cambias de imagen.
- **El foco no se pierde.** Si pulsas «Siguiente» y el botón queda
  deshabilitado al llegar al final, el foco se iría al `<body>` y el lector se
  callaría; el JS lo mueve a la pista.
- **Movimiento reducido**: el desplazamiento suave vive dentro de
  `@media (prefers-reduced-motion: no-preference)` y el JS consulta
  `matchMedia` antes de pedir `behavior: "smooth"`. Ojo: el
  `* { transition: none; animation: none }` global del proyecto **no** cubre
  `scroll-behavior`; hay que tratarlo aparte.
- **Con una sola imagen no se rompe**: el `<section>` lleva `data-unica="si"`,
  no se dibujan ni barra ni puntos, la pista no lleva `tabindex` (un punto de
  tabulación que no hace nada es ruido) y `conectar()` sale sin enganchar nada.
  Queda una figura normal con su rótulo.
- **El rótulo va debajo de cada imagen, siempre visible**, dentro del
  `<figcaption>`, con `min-height` para que no baile entre láminas.
- **La advertencia «movimiento parecido» va en el rótulo de la imagen concreta**
  a la que aplica, no como nota global al pie. La ficha oficial del gimnasio
  siempre es exacta; las fotos reales pueden no serlo. Marcarlas por separado
  es más preciso y evita que el aviso se lea como si dudara de todo.

### 2.4 Datos: de 1 a 3 láminas

Forma propuesta para el catálogo (opcional; si no está, se usa el esquema
actual `clave-0.jpg` / `clave-1.jpg` y nada se rompe):

```js
"peck-deck": {
  nombre: "Peck deck (contractora)",
  /* ... */
  laminas: [
    { archivo: "peck-deck-ficha.jpg",
      rotulo:  "Ficha del gimnasio",
      alt:     "Dibujo de la ficha oficial: persona sentada en la máquina contractora juntando los brazos al frente." },
    { archivo: "peck-deck-real-0.jpg",
      rotulo:  "Foto real · inicio",
      alt:     "Foto en el gimnasio: brazos abiertos, antebrazos apoyados en las almohadillas." },
    { archivo: "peck-deck-real-1.jpg",
      rotulo:  "Foto real · final",
      alt:     "Foto en el gimnasio: brazos juntos al frente, casi tocándose." }
  ]
}
```

Reglas:

- La **ficha oficial del gimnasio va siempre primera**: es el dibujo que está
  pegado en la máquina, y sirve para *encontrar* el aparato. Las fotos reales
  sirven para *ejecutar* el movimiento, que es el paso siguiente.
- `alt` describe **lo que se ve**; el `rotulo` es la etiqueta corta. Nunca
  deben ser el mismo texto (se leería dos veces).
- Si falta `laminas`, el constructor cae al par actual inicio/final.

---

## 3. Código listo para pegar

### 3.1 HTML resultante (lo que genera el JS)

No hay que escribirlo a mano; se incluye como referencia de lo que debe salir
en el DOM para tres láminas.

```html
<section class="carrusel" id="carrusel-1"
         role="group"
         aria-roledescription="carrusel"
         aria-label="Imágenes de Peck deck (contractora)">

  <ul class="carrusel-pista" id="carrusel-1-pista" role="list" tabindex="0"
      aria-label="Imágenes de Peck deck (contractora). Desliza el dedo o usa las flechas del teclado">

    <li class="carrusel-lamina">
      <figure class="foto-caja" role="group" aria-roledescription="lámina"
              aria-label="1 de 3: Ficha del gimnasio">
        <img src="assets/img/ejercicios/peck-deck-ficha.jpg"
             alt="Dibujo de la ficha oficial: persona sentada en la máquina contractora juntando los brazos al frente."
             decoding="async" loading="eager">
        <figcaption class="foto-pie">1 · Ficha del gimnasio</figcaption>
      </figure>
    </li>

    <li class="carrusel-lamina">
      <figure class="foto-caja" role="group" aria-roledescription="lámina"
              aria-label="2 de 3: Foto real · inicio">
        <img src="assets/img/ejercicios/peck-deck-real-0.jpg"
             alt="Foto en el gimnasio: brazos abiertos, antebrazos apoyados en las almohadillas."
             decoding="async" loading="lazy">
        <figcaption class="foto-pie">2 · Foto real · inicio</figcaption>
      </figure>
    </li>

    <li class="carrusel-lamina">
      <figure class="foto-caja" role="group" aria-roledescription="lámina"
              aria-label="3 de 3: Foto real · final">
        <img src="assets/img/ejercicios/peck-deck-real-1.jpg"
             alt="Foto en el gimnasio: brazos juntos al frente, casi tocándose."
             decoding="async" loading="lazy">
        <figcaption class="foto-pie">3 · Foto real · final</figcaption>
      </figure>
    </li>
  </ul>

  <div class="carrusel-barra">
    <button type="button" class="carrusel-flecha" data-paso="-1"
            aria-controls="carrusel-1-pista" aria-label="Imagen anterior" disabled>
      <span aria-hidden="true">←</span><span>Anterior</span>
    </button>

    <p class="carrusel-posicion" aria-live="polite" aria-atomic="true">
      Imagen <span class="carrusel-num">1</span> de 3
    </p>

    <button type="button" class="carrusel-flecha" data-paso="1"
            aria-controls="carrusel-1-pista" aria-label="Imagen siguiente">
      <span>Siguiente</span><span aria-hidden="true">→</span>
    </button>
  </div>

  <div class="carrusel-puntos" role="group" aria-label="Ir a una imagen">
    <button type="button" class="carrusel-punto" data-indice="0"
            aria-current="true" aria-label="Ver imagen 1 de 3: Ficha del gimnasio">1</button>
    <button type="button" class="carrusel-punto" data-indice="1"
            aria-label="Ver imagen 2 de 3: Foto real · inicio">2</button>
    <button type="button" class="carrusel-punto" data-indice="2"
            aria-label="Ver imagen 3 de 3: Foto real · final">3</button>
  </div>
</section>
```

### 3.2 CSS — añadir a `assets/css/estilos.css`

Va justo después del bloque `/* ---- DETALLE DEL EJERCICIO ---- */`.
El bloque `.fotos` actual puede quedarse (por si algo lo sigue usando) o
borrarse; el carrusel **reutiliza** `.foto-caja` y `.foto-pie`, que ya existen.

```css
/* ------------------- CARRUSEL DE LÁMINAS -------------------
   Movimiento: 100 % CSS (scroll-snap). El JS solo pinta los
   controles. Nunca capturamos eventos táctiles: así el pellizco
   para ampliar sigue funcionando, que es imprescindible para
   quien usa la lupa del sistema.
   ----------------------------------------------------------- */
.carrusel { margin: 0 0 .9rem; }

.carrusel-pista {
  display: flex;
  gap: .5rem;
  margin: 0; padding: 0;
  list-style: none;                 /* ojo: por esto el <ul> necesita role="list" */
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;   /* que el gesto no arrastre la página */
  border-radius: var(--radio);
  scrollbar-width: none;            /* Firefox */
  -ms-overflow-style: none;
}
/* La barra de scroll nativa horizontal estorba y es finísima:
   la posición se comunica con texto («Imagen 2 de 3»), no con ella. */
.carrusel-pista::-webkit-scrollbar { display: none; width: 0; height: 0; }

/* El `*{animation:none}` global del proyecto NO cubre scroll-behavior,
   así que el desplazamiento suave se declara aparte y solo si se permite. */
@media (prefers-reduced-motion: no-preference) {
  .carrusel-pista { scroll-behavior: smooth; }
}

.carrusel-lamina {
  /* Medida EXPLÍCITA: WebKit cachea mal los puntos de anclaje
     cuando el ancho de los hijos es implícito. */
  flex: 0 0 100%;
  min-width: 100%;
  scroll-snap-align: center;
  scroll-snap-stop: always;         /* impide que un gesto rápido salte varias */
}

/* La caja blanca y el pie ya existen en el proyecto; aquí solo se ajustan. */
.carrusel .foto-caja { margin: 0; height: 100%; display: flex; flex-direction: column; }

.carrusel .foto-caja img {
  display: block;
  width: 100%; height: auto;
  /* Reserva el hueco ANTES de que la imagen cargue: sin esto los puntos
     de anclaje de iOS se calculan sobre una altura que luego cambia. */
  aspect-ratio: 4 / 3;
  object-fit: contain;              /* nada de recortes: no cortamos brazos ni piernas */
  background: #ffffff;
}

/* Rótulo: SIEMPRE visible, nunca al pasar el ratón (en móvil no hay ratón).
   .9em en vez de los .78em de .foto-pie: es contenido, no decoración. */
.carrusel .foto-pie {
  font-size: .9em;
  min-height: 2.4em;                /* misma altura en todas: no salta al deslizar */
  display: flex; align-items: center; justify-content: center;
  padding: .35rem .5rem;
  border-top: 1px solid var(--borde);
}

/* --- Barra de control: anterior · «Imagen 2 de 3» · siguiente --- */
.carrusel-barra {
  display: flex; align-items: center; gap: .5rem;
  margin-top: .5rem;
}
.carrusel-flecha {
  flex: 0 0 auto;
  display: inline-flex; align-items: center; justify-content: center; gap: .3rem;
  min-height: var(--toque);         /* 48 px */
  min-width: 96px;
  padding: 0 .7rem;
  font-family: inherit; font-size: .92em; font-weight: 700;
  background: var(--fondo-3); color: var(--texto);
  border: 1px solid var(--borde); border-radius: var(--radio);
  cursor: pointer;
}
.carrusel-flecha:active { background: var(--acento); color: var(--acento-texto); }
.carrusel-flecha[disabled] { opacity: .4; cursor: not-allowed; }

.carrusel-posicion {
  flex: 1; margin: 0; text-align: center;
  font-size: .92em; font-weight: 600;
  font-variant-numeric: tabular-nums;   /* el número no cambia de ancho */
}
.carrusel-num { font-size: 1.2em; font-weight: 700; }

/* --- Puntos: llevan el NÚMERO escrito, no son bolitas de color --- */
.carrusel-puntos {
  display: flex; justify-content: center; gap: .4rem; flex-wrap: wrap;
  margin-top: .4rem;
}
.carrusel-punto {
  min-width: 44px; min-height: 44px;
  padding: 0;
  font-family: inherit; font-size: .95em; font-weight: 700;
  background: var(--fondo-2); color: var(--texto);
  border: 1px solid var(--borde); border-radius: 999px;
  cursor: pointer;
}
/* El activo se marca por TRES vías: color, grosor de borde y anillo interior.
   Nunca solo por color. */
.carrusel-punto[aria-current="true"] {
  background: var(--acento); color: var(--acento-texto);
  border-color: var(--acento); border-width: 3px;
  box-shadow: inset 0 0 0 2px var(--acento-texto);
}

/* Con una sola lámina no se dibujan controles; esta regla es un seguro. */
.carrusel[data-unica="si"] .carrusel-barra,
.carrusel[data-unica="si"] .carrusel-puntos { display: none; }
```

### 3.3 JS — archivo nuevo `assets/js/carrusel.js`

Se carga en `index.html` **antes** de `app.js`:

```html
<script src="assets/js/carrusel.js"></script>
<script src="assets/js/app.js"></script>
```

```js
/* ============================================================
   MI ENTRENO — Carrusel de láminas del ejercicio

   Sin librerías. El movimiento lo hace el CSS (scroll-snap);
   este archivo solo:
     · construye el HTML,
     · pinta los controles (flechas, puntos, «Imagen 2 de 3»),
     · añade teclado (← → Inicio Fin),
     · reencuadra al girar el teléfono.

   NUNCA captura eventos táctiles: el deslizamiento y el pellizco
   para ampliar son los nativos del navegador.

   Uso desde app.js:
     var laminas = Carrusel.laminasDe(e);
     html += Carrusel.html(laminas, e.nombre);   // devuelve texto
     ...
     contenido.innerHTML = html;
     Carrusel.conectarTodos();                   // después de pintar
   ============================================================ */
window.Carrusel = (function () {
  "use strict";

  var contador = 0;   /* para generar ids únicos: carrusel-1, carrusel-2… */

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
     De 1 a 3 láminas a partir de un ejercicio del catálogo.

     Si el ejercicio trae `laminas`, se usan tal cual.
     Si no, se cae al esquema actual (clave-0.jpg / clave-1.jpg),
     así que esto funciona HOY sin tocar el catálogo.
     --------------------------------------------------------- */
  function laminasDe(e) {
    var lista = [];

    if (e.laminas && e.laminas.length) {
      e.laminas.forEach(function (l) {
        lista.push({
          src:    "assets/img/ejercicios/" + l.archivo,
          rotulo: l.rotulo,
          alt:    l.alt || (l.rotulo + " de " + e.nombre)
        });
      });
    } else if (e.fotos && e.fotos.length) {
      /* Aviso de «movimiento parecido» pegado a la imagen concreta,
         no como nota suelta al final del bloque. */
      var coletilla = e.exacta ? "" : " · parecido, no idéntico";
      lista.push({
        src: e.fotos[0],
        rotulo: "Posición de inicio" + coletilla,
        alt: "Posición de inicio de " + e.nombre
      });
      if (e.fotos[1]) {
        lista.push({
          src: e.fotos[1],
          rotulo: "Posición final" + coletilla,
          alt: "Posición final de " + e.nombre
        });
      }
    }
    return lista;
  }

  /* ---------------------------------------------------------
     HTML del carrusel. Devuelve texto para concatenar.

     El estado inicial ya viene pintado (número 1, flecha
     «anterior» deshabilitada, punto 1 con aria-current). Así la
     región viva NO anuncia nada al cargar la pantalla: solo
     hablará cuando de verdad cambies de imagen.
     --------------------------------------------------------- */
  function html(laminas, nombre) {
    if (!laminas || !laminas.length) return "";

    var id    = "carrusel-" + (++contador);
    var n     = laminas.length;
    var unica = (n < 2);
    var s     = "";

    s += '<section class="carrusel" id="' + id + '"' +
         (unica ? ' data-unica="si"' : '') +
         ' role="group" aria-roledescription="carrusel"' +
         ' aria-label="Imágenes de ' + esc(nombre) + '">';

    /* role="list" explícito: con list-style:none, Safari/VoiceOver
       le quitan la semántica de lista al <ul>. */
    s += '<ul class="carrusel-pista" id="' + id + '-pista" role="list"' +
         (unica ? '' :
           ' tabindex="0" aria-label="Imágenes de ' + esc(nombre) +
           '. Desliza el dedo o usa las flechas del teclado"') +
         '>';

    laminas.forEach(function (l, i) {
      var posicion = (i + 1) + " de " + n;
      s += '<li class="carrusel-lamina">' +
             /* El <li> conserva su rol de elemento de lista; la semántica
                de «lámina» va en la figura de dentro, para no pisarla. */
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

    /* Con una sola imagen no hay controles que dibujar. */
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

    var pista   = raiz.querySelector(".carrusel-pista");
    var laminas = [].slice.call(raiz.querySelectorAll(".carrusel-lamina"));
    if (!pista || laminas.length < 2) return;    /* una sola imagen: nada que hacer */

    var flechas = [].slice.call(raiz.querySelectorAll(".carrusel-flecha"));
    var puntos  = [].slice.call(raiz.querySelectorAll(".carrusel-punto"));
    var numero  = raiz.querySelector(".carrusel-num");
    var ultima  = laminas.length - 1;
    var actual  = 0;

    /* Posición de scroll de la lámina i, medida contra la primera.
       Se calcula en el momento (no se cachea) para sobrevivir a
       rotaciones y cambios de tamaño de letra. */
    function destinoDe(i) {
      return laminas[i].offsetLeft - laminas[0].offsetLeft;
    }

    function pintar(i) {
      if (i === actual) return;         /* no repetir el anuncio del lector */
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

      /* Safari < 15.4 ignora `behavior: smooth`; el try/catch cubre
         además navegadores viejos que no aceptan el objeto. */
      if (suave && !movimientoReducido() && pista.scrollTo) {
        try { pista.scrollTo({ left: x, behavior: "smooth" }); }
        catch (err) { pista.scrollLeft = x; }
      } else {
        /* Con movimiento reducido el CSS no pone scroll-behavior:smooth,
           así que esta asignación es instantánea, como debe ser. */
        pista.scrollLeft = x;
      }
      pintar(i);
    }

    /* Qué lámina está más cerca de la posición actual del scroll.
       Más robusto que dividir por el ancho: aguanta el `gap`. */
    function indiceCercano() {
      var x = pista.scrollLeft, mejor = 0, menor = Infinity;
      laminas.forEach(function (l, i) {
        var d = Math.abs(destinoDe(i) - x);
        if (d < menor) { menor = d; mejor = i; }
      });
      return mejor;
    }

    /* --- Deslizamiento con el dedo: no lo tocamos, solo lo escuchamos --- */
    var espera = null;
    function alDetenerse() { pintar(indiceCercano()); }

    if ("onscrollend" in pista) {
      pista.addEventListener("scrollend", alDetenerse);
    } else {
      /* iOS todavía no dispara `scrollend` en todas las versiones:
         rebote de 120 ms sobre `scroll`. Pasivo para no frenar el gesto. */
      pista.addEventListener("scroll", function () {
        clearTimeout(espera);
        espera = setTimeout(alDetenerse, 120);
      }, { passive: true });
    }

    /* --- Botones anterior / siguiente --- */
    flechas.forEach(function (b) {
      b.addEventListener("click", function () {
        irA(actual + Number(b.getAttribute("data-paso")), true);
        /* Si el botón que acabas de pulsar queda deshabilitado, el foco
           se iría al <body> y el lector de pantalla se quedaría mudo.
           Lo pasamos a la pista, que sigue siendo enfocable. */
        if (b.disabled) pista.focus();
      });
    });

    /* --- Puntos numerados --- */
    puntos.forEach(function (b) {
      b.addEventListener("click", function () {
        irA(Number(b.getAttribute("data-indice")), true);
      });
    });

    /* --- Teclado sobre la pista --- */
    pista.addEventListener("keydown", function (ev) {
      var destino = null;
      if      (ev.key === "ArrowRight") destino = actual + 1;
      else if (ev.key === "ArrowLeft")  destino = actual - 1;
      else if (ev.key === "Home")       destino = 0;
      else if (ev.key === "End")        destino = ultima;
      if (destino === null) return;
      ev.preventDefault();               /* si no, el scroll nativo avanza a pasitos */
      irA(destino, true);
    });

    /* --- Girar el teléfono / cambiar el tamaño de letra ---
       WebKit no recalcula bien los puntos de anclaje al cambiar el
       viewport: reencuadramos a mano la lámina actual.
       El listener se autoelimina cuando la vista se vuelve a pintar
       (app.js reemplaza innerHTML), para no acumular basura. */
    var reencuadre = null;
    function alRedimensionar() {
      if (!document.body.contains(pista)) {
        window.removeEventListener("resize", alRedimensionar);
        window.removeEventListener("orientationchange", alRedimensionar);
        clearTimeout(reencuadre);
        return;
      }
      clearTimeout(reencuadre);
      reencuadre = setTimeout(function () {
        var x = destinoDe(actual);
        pista.scrollLeft = x;
      }, 150);
    }
    window.addEventListener("resize", alRedimensionar);
    window.addEventListener("orientationchange", alRedimensionar);
  }

  /* Engancha todos los carruseles que haya en pantalla. */
  function conectarTodos(raiz) {
    var contenedor = raiz || document;
    [].slice.call(contenedor.querySelectorAll(".carrusel")).forEach(conectar);
  }

  return {
    laminasDe:     laminasDe,
    html:          html,
    conectar:      conectar,
    conectarTodos: conectarTodos
  };
})();
```

### 3.4 Cómo se integra en `app.js` (propuesta, no aplicada)

En `bloqueEjercicio(e)`, sustituir el bloque `<div class="fotos">…</div>` y la
`<p class="nota-foto">` por:

```js
Carrusel.html(Carrusel.laminasDe(e), e.nombre) +
```

Y en `conectarBotonLeer(e)` (o justo después de cada `contenido.innerHTML =`),
añadir una línea:

```js
Carrusel.conectarTodos();
```

No hace falta nada más. `vistaConsulta` y `vistaEjercicio` ya llaman a
`conectarBotonLeer`.

Añadir también `assets/js/carrusel.js` a la lista de archivos que precachea
`sw.js`, o el carrusel no existirá sin internet.

---

## 4. Orden y jerarquía de la pantalla

### 4.1 El problema de la pantalla actual

Mirando la captura `pruebas/capturas/07-ejercicio-entreno.png`:

1. **Las dos imágenes ocupan media pantalla cada una** (~165 px de ancho en un
   iPhone). Para alguien con baja visión eso es lo peor que se puede hacer con
   el contenido más importante. Una sola imagen a ancho completo es **el doble
   de grande** sin cambiar ni un tamaño de letra. Es la mejora más barata de
   todo el documento.
2. **El contador de series está al final**, después de cinco pasos y un aviso.
   Es el control que se toca cada 60–90 segundos durante el entreno. Fitbod
   pone el temporizador **debajo del título**.
3. **La prescripción («3 a 4 series de 10 a 15 repeticiones») está escondida**
   como encabezado de una tarjeta, casi al final. Es el dato que respondes a la
   pregunta «¿cuánto me falta?».
4. **«Léemelo en voz alta» separa el nombre de la imagen.** Es un botón grande
   de acento que interrumpe la secuencia «esto se llama X → tiene esta pinta».
5. El aviso de «fotos parecidas» está como nota global aunque solo afecte a las
   fotos, no a la ficha oficial.

### 4.2 Orden propuesto — modo ENTRENO (`vistaEjercicio`)

| # | Bloque | Por qué ahí |
|---|---|---|
| 1 | **Barra superior fija**: «Ejercicio 3 de 8» + barra de progreso del día | Ya existe. Responde «¿dónde estoy?» sin gastar espacio del contenido. Añadir la barra de progreso: hoy solo está en la lista del día. |
| 2 | **Nombre** (`h2`, 1.3em) + **meta** (grupo · equipo) | Identificación. Igual en todas las apps. |
| 3 | **Prescripción en una línea destacada**: «3–4 series × 10–15 reps · 60 s de descanso» | Fitbod la pone justo bajo el título con el temporizador al lado. Hoy está enterrada. Que se lea sin scroll. |
| 4 | **Carrusel a ancho completo**, con rótulo bajo cada imagen | La media manda y va arriba en Fitbod, Hevy, Caliber, NTC y Fitness+. A ancho completo, que es el punto. |
| 5 | **Contador de series + botones − / + + campo de peso** | El registro es lo segundo más tocado. Strong y Hevy lo tienen en primer plano durante el entreno. |
| 6 | **«Léemelo en voz alta»** | Baja del puesto 3 al 6: es un atajo, no el contenido. Pasa a estar justo encima de lo que lee (los pasos), que es donde tiene sentido. |
| 7 | **Cómo se hace** (pasos numerados) | La instrucción se lee una vez; el contador se toca seis veces. Hevy y Fitbod también las dejan bajo el pliegue. |
| 8 | **Dónde está / qué necesitas** | Solo importa antes de la primera serie; después es ruido. Además hoy va antes que los pasos, que es al revés de la lógica «primero cómo, luego dónde» — aunque para alguien que aún no encontró la máquina, «dónde» va primero. **Recomendación: mantener «Dónde está» ANTES de «Cómo se hace» solo la primera vez** (series = 0) e intercambiarlos después. Si eso complica demasiado, dejar «Dónde está» primero: encontrar la máquina es el bloqueo real. |
| 9 | **Ojo con esto** (aviso de seguridad) | Justo tras la técnica, que es a lo que corrige. Borde grueso + palabra «Ojo», nunca solo el color ámbar. |
| 10 | **Ver video del ejercicio** | Sale de la app y **necesita internet**. Debe decirlo en el propio botón: «▶ Ver video en YouTube · necesita internet». Va abajo por eso. |
| 11 | **Terminé este ejercicio** | Cierre. |
| 12 | **← Anterior / Siguiente →** | Navegación, siempre lo último. Ya está bien así. |
| **fija** | **Barra inferior pegada: «✓ Serie hecha · descansar 60 s» con «Serie 2 de 4» escrito dentro** | La aportación grande. Es lo que hacen Hevy y Strong con su barra de entreno persistente. Resuelve la tensión «la imagen quiere estar arriba / el contador también»: el botón que se pulsa cada minuto **está siempre bajo el pulgar, en el mismo sitio, sin buscarlo**. Para baja visión eso es memoria motora en lugar de búsqueda visual. Respetar `env(safe-area-inset-bottom)` y añadir `padding-bottom` al `body` para que no tape el último botón. |

### 4.3 Orden propuesto — modo CONSULTA (`vistaConsulta`)

Aquí no se está entrenando, se está **aprendiendo**. Es la «biblioteca» de Hevy.
Sin contador, sin barra fija, sin prescripción destacada:

1. Nombre + meta
2. **Carrusel**
3. Léemelo en voz alta
4. Dónde está / qué necesitas
5. Cómo se hace
6. Ojo con esto
7. Cuándo te toca (+ «Ir al entreno de …»)
8. Ver video (necesita internet)

Mantener las dos vistas separadas es exactamente lo que hacen Hevy y Strong, y
la app ya tiene la separación hecha: solo hay que dejar de compartir
`bloqueEjercicio` al 100 % y parametrizarlo.

### 4.4 Qué se ve sin scroll (presupuesto real)

iPhone SE / 8 (viewport 375 × 667 px), `.contenido` con `padding: .9rem` →
ancho útil 346 px, escala al 100 %:

| Elemento | Alto aprox. |
|---|---|
| Barra superior (con `safe-area`) | 56 px |
| Nombre + meta | 54 px |
| Prescripción destacada | 42 px |
| Imagen del carrusel (346 px × 4/3) | 260 px |
| Rótulo (`.foto-pie`) | 38 px |
| Barra de control del carrusel | 48 px |
| Puntos numerados | 48 px |
| Barra fija inferior | 62 px |
| **Total** | **~608 px** |

Quedan ~60 px: se asoma el borde superior de la tarjeta de series, que es la
señal de «hay más abajo». **Cabe justo**, y esa es la prueba de que no entra
nada más arriba.

Notas del presupuesto:

- Si se necesita margen, la relación de la imagen puede pasar a **3/2** (231 px,
  −29 px) o **16/9** (195 px, −65 px). No bajar de 3/2: por debajo, las fichas
  del gimnasio (que son verticales-ish) quedan con demasiada banda blanca.
- A escala 180 % (el máximo del control A+) todo esto se desborda, y está bien:
  el orden es lo que garantiza que lo primero que ves siga siendo lo primero
  que importa.
- La barra de control y los puntos se pueden fundir en una sola fila
  (`[←] [1][2][3] [→]`) para ahorrar 48 px, pero se rompe a 320 px de ancho o
  con la escala alta. **Dos filas es la opción que aguanta.** Con solo una
  imagen desaparecen las dos y se ganan 96 px.

---

## 5. Lista de comprobación antes de dar el carrusel por bueno

- [ ] Con **una** lámina: no aparecen ni flechas ni puntos, la pista no es un
      punto de tabulación, el rótulo se ve.
- [ ] Con **dos** y con **tres**: el contador dice «Imagen 1 de 2» / «1 de 3»
      correctamente desde el inicio.
- [ ] Deslizar rápido con el dedo en iPhone **no salta dos láminas**
      (`scroll-snap-stop: always`).
- [ ] **Pellizcar para ampliar sigue funcionando** encima del carrusel.
- [ ] Tabulador: pista → Anterior → Siguiente → 1 → 2 → 3. El foco se ve
      siempre (contorno de 3 px del proyecto).
- [ ] Flechas ← → sobre la pista cambian de lámina completa, no de 40 px.
- [ ] Llegar al final con el botón «Siguiente»: **el foco no se pierde**.
- [ ] VoiceOver: anuncia «carrusel», «lista, 3 elementos», «1 de 3: Ficha del
      gimnasio», y al cambiar dice «Imagen 2 de 3» **una sola vez**.
- [ ] Con «Reducir movimiento» activado en iOS: los saltos son instantáneos.
- [ ] Tema «máximo» (amarillo sobre negro): los tres puntos se distinguen por
      el número y el anillo, no solo por el relleno.
- [ ] Girar el teléfono: la lámina visible sigue siendo la misma y queda
      encuadrada.
- [ ] Modo avión: todas las imágenes cargan (precache del `sw.js`).
- [ ] Volver atrás y entrar a otro ejercicio veinte veces: no se acumulan
      listeners de `resize` (el autoborrado los limpia).

---

## Fuentes

- [Fitbod — How to Navigate the Exercise Details Screen](https://help.fitbod.me/hc/en-us/articles/30721437384215-How-to-Navigate-the-Exercise-Details-Screen)
- [Fitbod — Rest Timer](https://fitbod.zendesk.com/hc/en-us/articles/360006340194-Rest-Timer)
- [Hevy — Exercise library / detalle de ejercicio](https://www.hevyapp.com/features/exercise-library/)
- [JEFIT — Revamped workout tab and improved exercise screens](https://www.jefit.com/wp/jefit-news-product-updates/upcoming-enhancements-revamped-workout-tab-and-improved-exercise-screens/)
- [Chrome for Developers — Make accessible carousels](https://developer.chrome.com/blog/accessible-carousel)
- [Chrome for Developers — Carousels with CSS](https://developer.chrome.com/blog/carousels-with-css)
- [Smashing Magazine — A Step-By-Step Guide To Building Accessible Carousels](https://www.smashingmagazine.com/2023/02/guide-building-accessible-carousels/)
- [W3C — WCAG 2.2 (2.5.7 Dragging Movements, 2.5.8 Target Size, 2.4.11 Focus Not Obscured)](https://www.w3.org/TR/WCAG22/)
- [WebKit Bugzilla 173887 — [css-scroll-snap] Triggering a layout during scroll causes jittery scrolling on iOS](https://bugs.webkit.org/show_bug.cgi?id=173887)
- [react-window #290 — One flick scrolls forever on Safari/iOS with scroll snap](https://github.com/bvaughn/react-window/issues/290)
- [Fixing CSS Scroll Snap Visual Glitches on iOS](https://www.xjavascript.com/blog/css-scroll-snap-visual-glitches-on-ios-when-programmatically-setting-style-on-children/)
- [Apple Developer Forums — iOS Safari scroll-snap on body breaks body scrolling](https://developer.apple.com/forums/thread/24954)
- [mdn/browser-compat-data #22889 — scrollTo smooth soportado desde Safari 15.4](https://github.com/mdn/browser-compat-data/issues/22889)
- [Deque University — Carousel (based on a tabpanel)](https://dequeuniversity.com/library/aria/carousel)
