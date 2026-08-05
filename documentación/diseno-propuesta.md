# Propuesta de rediseño visual — Mi Entreno

> Documento de especificación. No toca código todavía: define **qué** poner y
> **con qué valores exactos**. Todo lo de aquí es CSS puro, sin librerías, sin
> fuentes externas, sin build, y respeta las once restricciones de
> [`accesibilidad-baja-vision.md`](accesibilidad-baja-vision.md).
>
> Regla que gobierna todo el documento: **ningún par texto/fondo baja de 7:1**
> en ninguno de los tres temas. Cada color de aquí abajo trae su ratio medido
> con la fórmula de luminancia relativa de WCAG 2.2 (§1.4.6). Los que no
> llegaban se corrigieron hasta que llegaron.

---

## Índice

1. [Qué está mal hoy, pantalla por pantalla](#1-qué-está-mal-hoy-pantalla-por-pantalla)
2. [Defectos de contraste medidos en el CSS actual](#2-defectos-de-contraste-medidos-en-el-css-actual)
3. [Lo que hacen las apps de referencia](#3-lo-que-hacen-las-apps-de-referencia)
4. [Fundamentos: tokens de color](#4-fundamentos-tokens-de-color)
5. [Fundamentos: tipografía](#5-fundamentos-tipografía)
6. [Fundamentos: espaciado, radios, elevación, movimiento](#6-fundamentos-espaciado-radios-elevación-movimiento)
7. [Color por grupo muscular](#7-color-por-grupo-muscular)
8. [Especificación de componentes](#8-especificación-de-componentes)
9. [Cinco ideas de «wow» con CSS puro](#9-cinco-ideas-de-wow-con-css-puro)
10. [Plan de aplicación por fases](#10-plan-de-aplicación-por-fases)
11. [Cómo se verifica](#11-cómo-se-verifica)

---

## 1. Qué está mal hoy, pantalla por pantalla

El diagnóstico general en una frase: **la app tiene un solo nivel de énfasis**.
Casi todo en pantalla es «una caja de fondo `--fondo-2`, borde 1 px del mismo
gris, radio 12 px». Un aviso de seguridad, un día de descanso, el botón de
empezar el entreno y un párrafo informativo pesan lo mismo. Cuando todo grita
igual, nada grita. Eso es exactamente la sensación de «plano y genérico».

Los cinco problemas transversales:

| # | Problema | Dónde se ve |
|---|----------|-------------|
| T1 | **Una sola superficie.** `--fondo-2` (#151d27) está a 1,13:1 de `--fondo`. En tema claro, 1,09:1. Las tarjetas no se despegan del fondo. | Todas |
| T2 | **Un solo radio y un solo borde.** `--radio: 12px` para todo, de un chip de 44 px a una tarjeta de 400 px. Sin escala de radios no hay sensación de jerarquía física. | Todas |
| T3 | **Cero movimiento.** No hay una sola `transition` en las 372 líneas de CSS. Los `:active` cambian el fondo de golpe. Se siente como una página, no como una app. | Todas |
| T4 | **El color solo se usa para rellenar botones.** El acento cian solo aparece como fondo sólido de botones grandes; nunca como acento fino, borde, marca de sección o dato. Resultado: bloques cian enormes que compiten entre sí. | 04, 06, 07 |
| T5 | **Ritmo vertical arbitrario.** Conviven `.5rem`, `.6rem`, `.7rem`, `.8rem`, `.9rem`, `1.1rem`, `1.6rem` sin progresión. El ojo no encuentra el patrón. | Todas |

### 1.1 · `01-inicio.png` — selector de persona

- Las dos tarjetas de persona son **idénticas salvo el color del borde**
  (cian / fucsia). No hay inicial, ni avatar, ni forma que las distinga. Es el
  único sitio de la app donde el color hace trabajo real de identificación, y
  justo ahí es donde el usuario con baja visión menos lo aprovecha.
- `5 días por semana · 59 ejercicios` es texto gris de 0,88 em: un dato
  interesante presentado como pie de página.
- La tarjeta «Cómo funciona» tiene **exactamente el mismo peso visual** que los
  dos botones que son la razón de existir de la pantalla.
- Debajo quedan ~400 px de negro vacío. La pantalla se lee como incompleta.
- La barra superior queda descompensada: sin botón «volver», el título arranca
  pegado al borde izquierdo y el botón `Aa` flota solo a la derecha.

### 1.2 · `02-semana-anderson.png` — la semana

- **Siete filas visualmente iguales.** El aviso amarillo, los cinco días de
  entreno, los dos de descanso, el botón de la lista y las dos tarjetas finales
  comparten fondo, borde y radio. La pantalla es una columna de rectángulos.
- **El día de HOY casi no destaca**: borde cian de 2 px y una píldora pequeña.
  Rodeado de seis cajas del mismo tamaño, se pierde. Es *el* dato de la
  pantalla y debería ser imposible no verlo.
- **Sábado y Domingo (descanso) ocupan igual que un lunes de 17 ejercicios.**
  Dos filas de 68 px que no llevan a ninguna parte y que además son tocables.
- La **barra de color del día** (10 px, pegada al borde izquierdo) es puro
  adorno: no aporta nada que el texto no diga y no se ve con baja visión.
- Tres líneas de texto por fila (`Lunes` 1,05 em / `Funcional — cuerpo completo`
  0,9 em / `17 ejercicios` 0,85 em) con tamaños casi iguales: no hay jerarquía
  interna, hay ruido.
- **El progreso del día existe en los datos pero no se ve.** `Guardado.sesion()`
  ya sabe cuántos ejercicios llevas; la fila solo lo dice en texto («3 de 8
  hechos hoy») cuando ya empezaste.
- El chevron `›` es un carácter de texto de ~10 px del color del texto: es el
  elemento más pequeño de la pantalla y es el que indica «esto se toca».
- El emoji `📋` metido dentro de un `.btn-grande` se ve desalineado respecto a
  la línea base del texto.
- «Reglas de toda la rutina» y «Tu objetivo» son cuatro y dos párrafos sueltos:
  información tabular (series, descanso, incremento, cardio) presentada como
  prosa.

### 1.3 · `03-lista-todos.png` / `04-lista-filtro-martes.png` — lista completa

Es la pantalla que más sufre: **7 958 px de alto** en una sola tirada.

- Los **encabezados de grupo** («Abdomen», «Bíceps», «Espalda»…) son un `h3` de
  1 em, del mismo color y peso que el nombre de un ejercicio, sin fondo, sin
  regla y **sin `position: sticky`**. Después de tres scrolls no sabes en qué
  grupo estás.
- Las **miniaturas llevan `background: #fff`**. En tema oscuro salen 40
  rectángulos blancos brillantes de 64 × 50: exactamente el deslumbramiento que
  el tema oscuro venía a evitar. Además muchas fotos tienen barras blancas a los
  lados por el `object-fit: cover` sobre imágenes de proporción distinta.
- **Tres líneas de texto por fila** de tamaños 0,98 / 0,82 / 0,82 em. La tercera
  («Martes y Jueves» + dos puntos de color) repite en color lo que ya dijo en
  texto.
- Los **puntos de día** son círculos de 10 px con `border: 1px solid
  rgba(255,255,255,.35)`. A 10 px y con baja visión no se distinguen entre sí;
  son decoración que ocupa una línea entera.
- Los **chips de filtro** se envuelven en tres filas y el activo es un bloque
  cian sólido que pesa más que cualquier contenido de la pantalla.
- La tarjeta de resumen del día filtrado y el botón «Entrenar este día» empujan
  la lista 300 px hacia abajo cada vez que filtras.

### 1.4 · `06-dia-martes.png` — el día

- La **barra de progreso al 0 %** es una raya gris de 10 px sin etiqueta
  visible. Al 0 % parece un separador roto.
- El número de ejercicio va en un círculo de 34 px con `font-size: .9em`: es más
  pequeño que el texto que lo rodea y compite con la miniatura de 64 px que
  tiene al lado. Dos «anclas» visuales seguidas, ninguna dominante.
- Cuando un ejercicio está hecho, **el número se sustituye por `✓`**: se pierde
  la posición en la lista justo cuando más la necesitas.
- No se ve el **peso de la última vez**, que ya está guardado
  (`Guardado.peso()`). Es el dato número uno de cualquier app de gimnasio.
- «Para cerrar» (el cardio) es una tarjeta idéntica a todo lo demás al final de
  ocho filas idénticas.

### 1.5 · `07-ejercicio-entreno.png` — el ejercicio (la pantalla crítica)

Aquí el problema no es estético, es **de orden**.

1. **Lo primero que ves es «Léemelo en voz alta»**, pintado con el acento más
   fuerte de la app (`btn-principal`, relleno cian, ancho completo). Es una
   ayuda, no la acción principal.
2. **Lo último, después de tres pantallas de scroll, es el bloque de series** —
   que es lo único que tocas entre serie y serie, con las manos ocupadas y el
   teléfono apoyado en la máquina.
3. El **nombre del ejercicio** (1,3 em, texto normal) pesa **menos** que el
   botón cian que tiene debajo.
4. **Seis contenedores seguidos con el mismo fondo, borde y radio**: fotos →
   video → «Dónde está» → «Cómo se hace» → «Ojo con esto» → series. Una escalera
   de cajas indistinguibles.
5. Las **dos fotos van sobre `#ffffff`** en columnas de ~215 px: dos rectángulos
   blancos que dominan la pantalla oscura y encima quedan pequeñas.
6. El contador dice `3 a 4 series de 10 a 15 repeticiones` en un `h3`, luego un
   `0` de 2,2 em, luego `series hechas` en gris. **Tres niveles para un dato.**
7. Los botones `−` y `+` son dos rectángulos de ~200 × 48 px con un guion
   diminuto en el centro: máxima área, mínima información.
8. `Peso que usaste` es un `input` de texto libre sin unidad, sin sugerencia y
   sin memoria visible de la vez anterior.
9. La barra superior dice `1 de 8` en texto, pero **no hay barra de progreso del
   día** en ningún sitio de esta pantalla.
10. El grupo muscular aparece una sola vez, en gris de 0,88 em
    (`Pecho · Máquina contractora`), sin ninguna marca visual.

### 1.6 · `10-temporizador.png` — el descanso

- **No es pantalla completa**: es un modal centrado sobre un fondo
  `rgba(0,0,0,.92)` que deja ver el contenido detrás en gris apagado. Ruido
  visual innecesario justo en el momento en que el usuario mira de reojo.
- **El tiempo restante solo existe como número.** No hay anillo, ni barra, ni
  nada que se pueda leer de un vistazo desde dos metros. Con baja visión,
  «60 → 59 → 58» sin forma es lo peor posible.
- El botón más llamativo del modal es **«Terminar»** en rojo salmón. La acción
  esperada durante el descanso es *no hacer nada*; el rojo pide que lo toques.
- El `60` es blanco a 3,4 em; se puede llevar mucho más lejos sin romper nada
  porque es un número aislado, no texto de lectura.

### 1.7 · `13-tema-claro.png` — tema claro

- Las superficies están a **1,09:1** unas de otras. Las tarjetas no existen: se
  intuyen por un borde `#9aabbe` que está a **2,35:1** del blanco, o sea gris
  lavado.
- El acento `#04486b` es azul marino casi negro. La misma app que en oscuro es
  cian eléctrico aquí parece un formulario de banco. **Los dos temas no se
  sienten la misma app.**
- «Ojo con esto» en `#7a4c00` sobre `--fondo-3` **no llega a AAA** (5,95:1).
  Ver §2.

### 1.8 · `13-tema-maximo.png` — tema máximo

- Como los tres niveles de superficie son `#000000` y **todos** los bordes son
  amarillos de 2 px, la pantalla se convierte en **una reja**. No hay jerarquía
  posible porque no hay ni superficies ni pesos distintos.
- «Ojo con esto» (`--alerta`) y el texto normal son **el mismo amarillo**: la
  advertencia deja de ser advertencia.
- «Léemelo en voz alta» y «Serie hecha» son **dos bloques amarillos macizos**
  del mismo tamaño compitiendo en la misma pantalla.
- El botón deshabilitado usa `opacity: .4` → amarillo al 40 % sobre negro
  = `#666600` = **3,47:1**. Rompe AAA y también AA. Ver §2.

---

## 2. Defectos de contraste medidos en el CSS actual

Estos son bugs reales, no opiniones. Se calcularon con la fórmula de WCAG 2.2
sobre los hex de `estilos.css`. La prueba automática actual no los detecta
porque `prueba-pwa.js` falla solo por debajo de **4,5:1**, no de 7:1.

| Par | Tema | Dónde ocurre | Ratio | Veredicto |
|-----|------|--------------|-------|-----------|
| `#666600` sobre `#000000` (efecto de `opacity:.4` sobre `--texto`) | Máximo | `.btn-grande[disabled]` — «← Anterior» | **3,47:1** | ❌ falla AA y AAA |
| `#4e5257` sobre `#0b0f14` (mismo `opacity:.4`) | Oscuro | `.btn-grande[disabled]` | **2,44:1** | ❌ falla AA y AAA |
| `--alerta #7a4c00` sobre `--fondo-3 #e2e8f0` | Claro | `.aviso strong` → «Ojo con esto» | **5,95:1** | ❌ falla AAA |
| `--ok #0f6b2a` sobre `--fondo-3 #e2e8f0` | Claro | texto de estado sobre superficie 3 | **5,40:1** | ❌ falla AAA |
| `--texto-suave #44576d` sobre `--fondo-3 #e2e8f0` | Claro | `.nota-ajuste`, `.foto-pie` dentro de zonas elevadas | **6,02:1** | ❌ falla AAA |
| `--peligro #ff7b72` sobre `--fondo-2 #151d27` | Oscuro | texto de peligro en tarjeta | **6,73:1** | ❌ falla AAA |
| `--borde #9aabbe` sobre `#ffffff` | Claro | borde de todas las tarjetas | **2,35:1** | ⚠ borde no perceptible |
| `placeholder` por defecto del navegador sobre `--fondo-3` | Los tres | `.campo-peso` → «por ejemplo: 20 kg» | ≈ **3,4:1** | ❌ no se declara ningún color |

**Correcciones directas** (independientes del rediseño, se pueden aplicar hoy):

```css
/* 1. Nunca usar opacity para deshabilitar. Usar tokens dedicados. */
.btn-grande[disabled] {
  opacity: 1;
  background: var(--superficie-2);
  color: var(--texto-inactivo);      /* token nuevo, ≥7:1 garantizado */
  border-color: var(--borde);
  cursor: not-allowed;
}

/* 2. El placeholder necesita color propio en los tres temas. */
.campo-peso::placeholder { color: var(--texto-suave); opacity: 1; }

/* 3. Subir el umbral de la prueba automática de 4.5 a 7. */
/*    pruebas/prueba-pwa.js línea 202 */
```

Y en `pruebas/prueba-pwa.js`:

```js
if (r < 7) fallo(`contraste tema ${tema}: "${p.etiqueta}" = ${r.toFixed(1)}:1 (minimo 7 — AAA)`);
```

---

## 3. Lo que hacen las apps de referencia

Resumen de lo que se encontró revisando Hevy, Strong, Fitbod, Nike Training
Club, Apple Fitness+, Peloton, Caliber y la literatura de UI/UX de 2025-2026.
Solo se recoge lo que es **aplicable** a esta app: sin cuenta de usuario, sin
gráficas, sin red social, y con la restricción de baja visión encima.

### 3.1 · La pantalla de ejercicio: tres arquetipos

No hay un solo patrón, hay tres, y elegir uno es la primera decisión de diseño.

**A · «Hoja de cálculo»** (Hevy, Strong, Boostcamp, JEFIT). Manda el registro.
El orden exacto de Hevy: barra con duración y botón *Finish* → hilo de progreso
de 2-3 px pegado bajo la barra → miniatura circular de ~40 pt + nombre del
ejercicio en azul → nota → temporizador → **cabeceras de columna** → filas de
serie. La instrucción no está: vive detrás de un toque.

**B · «Video con HUD»** (Peloton, Ladder, Nike TC, Apple Fitness+). El video es
la pantalla y el registro es un panel superpuesto. Peloton pone el nombre del
movimiento en blanco a ~28 px y, en la base de la misma tarjeta, **dos métricas
grandes en extremos opuestos**: `10 / Reps` y `15 / Weight`.

**C · «Línea de tiempo vertical»** (Fitbod). Cada serie es un nodo hexagonal;
pendiente en gris, activo en blanco, **completado en menta con ✓**. Y el detalle
más interesante: **el descanso es un nodo más de la línea** (`⏱ 2:00 REST`
intercalado entre series), no una capa aparte.

Lo que las tres comparten y esta app no tiene:

| Zona | Qué va ahí |
|---|---|
| Arriba, compacto | Nombre + músculo, una o dos líneas |
| Inmediatamente debajo | **El registro.** Visible sin scroll |
| Abajo, en la zona del pulgar | La acción de completar |
| Detrás de un toque o colapsado | Instrucciones, video, historial |

La regla de fondo: **la instrucción es consulta, no flujo**. Fitbod y NTC ponen
la demostración arriba porque te *enseñan* el ejercicio; Hevy y Strong la
esconden porque asumen que ya lo sabes. Esta app tiene que hacer las dos cosas
—Anderson necesita las fotos y los pasos escritos— pero **el registro no puede
estar a tres pantallas de scroll**. Solución adoptada: todo en la misma página,
el bloque de series en segundo lugar (§8.7).

Dos datos que refuerzan la decisión y que además obligan a un cambio más:

- **Zona del pulgar.** El 75 % de las interacciones móviles se hacen con el
  pulgar y la zona cómoda es el **tercio inferior** de la pantalla. Durante el
  entreno, todo lo accionable debería estar abajo; arriba solo información.
- **Dedos sudados.** El sudor **agranda y desplaza el centroide del toque** en
  las pantallas capacitivas. Por eso las apps de gimnasio usan botones primarios
  de **56-64 pt de alto**, no de 44-48. Ver el token nuevo `--toque-primario`
  en §4.5.

### 3.2 · Series, repeticiones y peso

- **«La vez pasada» es *el* patrón.** Cuatro maneras de resolverlo, de menos a
  más ligera:
  1. **Columna dedicada** (Hevy, Strong): `45 kg × 9` en gris claro, y **un
     guion `–` cuando no hay dato**. En Hevy **se toca para copiar el valor** a
     la serie actual.
  2. **Pista bajo cada campo** (Caliber): `🕐 Last: 270 lbs` en gris azulado a
     ~11 pt, alineado a la derecha del campo. Es la mejor solución cuando no
     cabe una columna. **Es la que se adopta aquí** (§8.9).
  3. **Doble línea** con el objetivo debajo (Boostcamp).
  4. **Prellenado fantasma**: el valor del plan aparece en gris dentro del
     campo y se vuelve sólido al escribir (JEFIT, Fitbod).
- **La serie completada se marca con DOS señales.** Hevy pinta el ✓ en verde
  **y tiñe la fila entera** de lima; Strong hace lo mismo pero tan pálido que
  pierde la mitad del efecto. Fitbod usa hexágono menta con ✓ negro. Nunca solo
  un cambio de color de texto — es literalmente WCAG 1.4.1.
- **Números tabulares en todo.** El problema exacto que resuelven: *«cuando un
  número pasa de 11:11 a 12:23, toda la cadena se desplaza horizontalmente»*.
  No hace falta monospace: `font-variant-numeric: tabular-nums` iguala solo las
  cifras y deja las letras proporcionales. Soporte >96 %.
- **Patrón Apple para las unidades**, el más elegante que apareció: número
  grande + **unidad en versalitas pequeñas del mismo color que el dato**, y la
  etiqueta descriptiva en el color de texto normal. `665/750 CAL` con `CAL` en
  el rosa del anillo. Resuelve tres niveles de jerarquía con **dos tamaños**.
- **Steppers grandes, no ruedas ni teclado.** Con las manos sudadas, teclear un
  decimal es hostil; un ± de incremento fijo es un toque.
- **Objetivo siempre visible en versalita** («3 × 10-15») encima del bloque, en
  gris, como rótulo.
- **Escala tipográfica observada**: nombre del ejercicio 17-22 pt semibold ·
  cifras de serie 16-28 pt bold · cabeceras de columna 11-12 pt en versalita al
  60 % de opacidad · cronómetro de descanso **48-64 pt bold tabular**.

Traducción a esta app: como aquí las series no se registran una a una (el plan
es «3 a 4 series de 10 a 15» para todo), la tabla se reduce a **cuatro puntos de
serie** + una cifra grande + el peso con memoria (§8.9). La memoria de «la vez
pasada» ya existe en `Guardado.peso()` y hoy no se muestra.

### 3.3 · Agrupación por músculo

**El hallazgo más útil de toda la investigación: ninguna de las diez apps
agrupa la sesión activa por grupo muscular.** La sesión se agrupa por bloque de
programación (`Bloque 1`, `Calentamiento`, o simplemente numerada). El color por
músculo y el mapa corporal viven **solo en las pantallas de biblioteca y de
estadísticas**.

Eso valida exactamente el reparto que ya tiene esta app y que hay que mantener:

- **La lista completa (§8.6) es la biblioteca** → ahí sí se agrupa por músculo,
  con encabezados sticky, y ahí sí tiene sentido el color por grupo.
- **La vista del día es la sesión** → ahí los ejercicios van **numerados en el
  orden del plan**, sin agrupar. Que es lo que hace hoy. No se toca.

El resto de patrones de lista:

- **Encabezados sticky con el conteo a la derecha** («Pecho · 7») en cifra
  tabular gris. Es lo único que hace navegable una lista de 40 elementos.
- **En modo oscuro, el encabezado sticky debe subir un nivel de superficie al
  hacer scroll**, porque las sombras no se leen sobre fondo oscuro. Por eso
  §8.6 usa `--fondo` con `backdrop-filter` en vez de una sombra.
- **Chips de filtro: el estado activo en contorno de acento, no en relleno.**
  Ladder y Nike TC lo hacen así y en oscuro se lee mucho mejor que un bloque
  sólido — que es justo el problema de `04-lista-filtro-martes.png`. Y **el
  contador va dentro del chip**: `Barbell (30)`, `Todos (40)`.
- Nike TC además muestra **el número de resultados en vivo** mientras filtras.
- **Los mapas corporales** (Fitbod, Caliber, JEFIT) siempre acompañan el color
  con el nombre escrito y una leyenda. Ninguna app codifica el músculo *solo*
  por color.

### 3.4 · Uso del color

Consenso rotundo: **un solo acento**. Hevy azul, Strong azul, Fitbod rosa,
Ladder lima, Boostcamp amarillo, Apple Fitness lima. **Nike Training Club no
usa ninguno**: negro, blanco y gris, y el único color de la pantalla está dentro
de las fotografías. El acento se usa en tres sitios:

1. el botón primario de la pantalla (uno solo),
2. el estado activo de un control,
3. datos de progreso (barras, anillos),

y **en ningún otro**. La proporción de referencia es **60-30-10**: 60 % fondos,
30 % superficies y elementos secundarios, **10 % acento**. Los colores
semánticos (verde de «hecho», ámbar de aviso) van **fuera** de ese 10 %.

**El anti-patrón documentado es exactamente el problema de esta app**: dos
acentos que compiten. A Caliber se lo critican por poner una pestaña con texto
azul y subrayado rojo, y al rediseño de Strong le respondieron literalmente
*«el azul y el rojo quedan raros, parecen dos apps distintas»*. Es la misma
sensación que producen hoy el cian eléctrico del tema oscuro y el azul marino
apagado del tema claro (§1.7): el acento debe **sentirse el mismo color** en los
tres temas, solo con la luminancia invertida.

Lo que hace que se vean «premium» sin usar más color es la **elevación tonal en
modo oscuro**: 4-6 niveles de superficie separados por muy poco (Material 3 y
Radix documentan justo esto), en vez del único `--fondo-2` que usa esta app hoy.
El truco matemático es que la constante `+0.05` de la fórmula de contraste
domina en el extremo oscuro: se pueden apilar seis superficies distinguibles
antes de perder el 7:1 con texto claro. **El cuello de botella nunca es el texto
principal; es el secundario.** Por eso este documento fija los cuatro niveles y
comprueba `--texto-suave` contra los cuatro (§4.2).

Tres detalles más que se copian directamente:

- **Nunca `#000000` puro como fondo base si necesitas capas.** Sobre negro la
  elevación es indistinguible, y además produce *halation*: los bordes del texto
  blanco se ven borrosos o demasiado luminosos, peor todavía con astigmatismo.
  Por eso `--fondo` es `#0A0E14` y no negro — y por eso el tema Máximo, que sí
  es negro puro, **renuncia a las superficies y usa grosor de borde** (§4.4).
- **Tintar las superficies elevadas con el acento al 6-8 %** en vez de usar
  grises neutros. Apple usa `#101801` (un verde casi negro) para las tarjetas de
  entreno; Fitbod usa `#191923`, que no es gris sino **negro azulado**. Da
  cohesión cromática sin añadir un segundo color. Las cuatro superficies de §4.2
  están construidas así: todas llevan el mismo tinte azul.
- **Material publica una escalera de opacidad de texto en oscuro** (87 % / 60 %
  / 38 %). Aquí eso se traduce a **tres tokens sólidos** —`--texto`,
  `--texto-suave`, `--texto-inactivo`— porque `opacity` sobre texto rompe el
  contraste de forma invisible (§6.5, regla 1).

Y sobre degradados: **casi ninguna app los usa en producto**. Hevy, Strong,
Fitbod, Nike TC, Boostcamp y JEFIT tienen cero. Peloton usa solo un **halo
radial ambiental** detrás del título, y Apple Fitness+ los reserva a las
tarjetas de plan. Eso es exactamente la dosis del degradado por grupo muscular
de §9.2: radial, al 14-16 %, y nunca detrás de texto crítico.

### 3.5 · Temporizador de descanso

Cinco patrones, uno por arquetipo:

1. **Barra inferior persistente** (Hevy). No tapa la tabla, vive en la zona del
   pulgar, línea de progreso lineal en su borde superior, número a **~48 pt bold
   tabular** y solo tres controles: `−15`, `+15` y `Skip`.
2. **Píldora en línea que se expande** (Strong). Reposo → una línea fina con
   `2:00` entre las filas; corriendo → esa línea se convierte en píldora de
   acento a ancho completo.
3. **Anillo grande fijo** (JEFIT). Anillo de ~170 px con **cabo redondeado y un
   pomo en la punta**, la duración objetivo en gris pequeño arriba y el tiempo
   restante enorme debajo (~44 pt) — una relación de **2,7×** respecto al nombre
   del ejercicio. Cuatro botones circulares alrededor.
4. **Un nodo más de la línea de tiempo** (Fitbod). El descanso no tiene UI
   propia.
5. **Superpuesto sobre el video** (Ladder). Número gigante en condensada pesada
   con un **arco de marcas tipo velocímetro**: las consumidas brillantes, las
   restantes atenuadas.

Para baja visión gana la escuela de pantalla completa con anillo: nada con lo
que competir, el número al mayor tamaño posible, y **el anillo da la información
sin leer**. La app ya está en esa escuela pero a medias —modal pequeño, sin
anillo, fondo semitransparente que deja ver el contenido detrás—. Se lleva al
final (§8.10 + §9.1), tomando prestado:

- de **JEFIT**, la relación de tamaños y el pomo en la punta del arco;
- de **Hevy**, los tres controles y solo tres (`+30 s`, `Terminar` y nada más);
- de **Apple Fitness+ y Peloton**, decir **qué viene después** durante el
  descanso. Es la única información que el usuario quiere en ese minuto.

Justificación formal: un descanso de 60-180 s está muy por encima del umbral de
atención de 10 s, y por encima de ese umbral la recomendación clásica es
**indicador de porcentaje o anillo, nunca un indicador indeterminado**. Y el
toque de «serie hecha» debe pintar el estado en **menos de 100 ms** — aquí es
gratis, porque todo es `localStorage`.

### 3.6 · Estados vacíos, cierres y microinteracciones

**Estados vacíos.** La estructura es siempre la misma y tiene tres partes:
**encabezado que describe qué habrá ahí cuando esté lleno + explicación +
llamada a la acción**. Strong: *«Historial del ejercicio — aquí aparecerán tus
marcas anteriores, ¡vuelve más tarde!»*. Nike TC, en cambio, se limita a «No se
encontraron resultados», y se lo señalan como oportunidad perdida por no
sugerir alternativas. El dato que lo justifica: *«los estados vacíos son las
pantallas más vistas de tu app — todo usuario nuevo las ve el primer día»*.
Esta app tiene hoy un «No hay ejercicios para ese filtro» sin salida (§9.4b).

**Cierre de sesión.** Todas terminan con un resumen: tres o cuatro cifras
grandes (ejercicios, series, tiempo o volumen) y una animación breve. Fitbod
lanza confeti; Hevy escribe frases como *«levantaste 13 264 kg en total — como
levantar un camión»*.

**Y la regla que evita pasarse**, que es la más importante de todas:

> *«Una herramienta de gestión celebraba cada tarea completada con una animación
> de confeti a pantalla completa. La primera vez fue divertido; la quincuagésima
> el usuario quería tirar el portátil por la ventana.»* El diagnóstico: **la
> intención correcta con la amplitud equivocada.**

De ahí el mapeo que se adopta (§9.4): un pulso de 700 ms para el día terminado,
y nada más. Con el reparto de intensidad por evento:

| Evento | Visual | Vibración (`navigator.vibrate`) |
|---|---|---|
| Serie hecha | tinte de fila + ✓, <300 ms | `[12]` — un golpe corto |
| Fin del descanso | anillo completo + pulso | `[300,120,300]` (ya existe) |
| Día terminado | tarjeta de cierre, 700 ms | `[60,60,60,60,200]` |
| Ajustar ± serie | la cifra cambia | nada |

**Microinteracciones que sí valen aquí**: la animación del ✓ al completar
(<300 ms), y **tocar el valor de «la vez pasada» para copiarlo** al campo de
peso — dos líneas de JS y quita el único momento de teclear que queda en la app.

### 3.7 · Los diez patrones que vale la pena copiar

1. **El registro antes que las instrucciones.** El bloque de series sube al
   segundo lugar de la pantalla de ejercicio (§8.7). Es el cambio de mayor
   impacto de todo el documento.
2. **«La vez pasada» como pista bajo el campo** (modelo Caliber), no como
   columna: `la vez pasada · 17,5 kg`. El dato ya está guardado y hoy no se ve.
3. **Doble señal para lo completado**: ✓ **y** cambio de la fila entera. Nunca
   solo color de texto (§8.5).
4. **Números tabulares** en todo lo que cambia, y **unidad en versalitas del
   color del dato** (modelo Apple): tres niveles de jerarquía con dos tamaños.
5. **Barra segmentada de progreso**, un segmento por serie o por ejercicio. Se
   aplica dos veces: los cuatro puntos de serie (§8.9) y el hilo de progreso del
   día bajo la barra superior (§8.1).
6. **Encabezados de grupo sticky** con conteo a la derecha, subiendo un nivel de
   superficie al hacer scroll (§8.6).
7. **Chips de filtro en contorno de acento, no en relleno**, con el contador
   dentro y en una sola fila con scroll horizontal (§8.4).
8. **Un solo acento y un solo botón primario por pantalla**, con proporción
   60-30-10.
9. **Elevación tonal tintada** en oscuro: cuatro superficies, todas con el mismo
   tinte azul, ninguna en negro puro (§4.2).
10. **Temporizador a pantalla completa con anillo**, cabo redondeado, tres
    controles como mucho, y **«después viene: …»** (§8.10).

Y tres que **no** se copian, a propósito:

- **Barra de navegación inferior.** Añade cinco destinos permanentes y aquí el
  flujo es lineal (persona → día → ejercicio). Sumaría ruido y 60 px de alto.
- **Gráficas y mapas corporales.** Requieren leer ejes y siluetas finas; están
  fuera del alcance de una app pensada para baja visión.
- **Confeti y celebraciones repetidas.** Un solo pulso de 700 ms al terminar el
  día, y nada más (§9.4). La amplitud importa más que la intención.

Fuentes:
[Hevy — Previous Workout Values](https://www.hevyapp.com/features/track-exercises/) ·
[Hevy — Rest Timer](https://www.hevyapp.com/features/workout-rest-timer/) ·
[Strong — Set Tags](https://help.strongapp.io/article/166-set-tags) ·
[Fitbod — Muscle Recovery](https://fitbod.zendesk.com/hc/en-us/articles/360006269014-Muscle-Recovery) ·
[Apple HIG — Activity Rings](https://developer.apple.com/design/human-interface-guidelines/activity-rings) ·
[Apple HIG — Workouts](https://developer.apple.com/design/human-interface-guidelines/workouts) ·
[Material 3 — Applying Elevation](https://m3.material.io/styles/elevation/applying-elevation) ·
[Material 3 — Tone-based Surfaces](https://m3.material.io/blog/tone-based-surface-color-m3) ·
[Radix Colors — Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) ·
[Smashing — Inclusive Dark Mode](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/) ·
[Smashing — The Thumb Zone](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/) ·
[NN/g — Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) ·
[Pencil&Paper — Mobile Filter UX](https://www.pencilandpaper.io/articles/ux-pattern-analysis-mobile-filters) ·
[Stormotion — Fitness App UX](https://stormotion.io/blog/fitness-app-ux/) ·
[Fireart — Fitness App UI/UX 2026](https://fireart.studio/blog/user-interface-design-for-a-fitness-app/)

---

## 4. Fundamentos: tokens de color

### 4.1 · Cómo está pensado el sistema

Tres decisiones estructurales, en orden de importancia:

1. **Cuatro niveles de superficie, no tres.** `--fondo` (la página) →
   `--superficie-1` (tarjeta) → `--superficie-2` (hueco: input, chip, celda) →
   `--superficie-3` (relleno de énfasis, estado presionado). El salto entre
   niveles consecutivos es de **1,10–1,19:1**, que es lo que usan Material 3 y
   Radix: suficiente para percibirse, insuficiente para robar contraste al
   texto.
2. **En tema claro las tarjetas son más claras que la página, no más oscuras.**
   Es el patrón de iOS: página `#F2F5F9`, tarjeta `#FFFFFF`. Resuelve de golpe
   el problema de que el texto secundario pierda AAA al apilar superficies,
   porque la superficie más luminosa (la tarjeta, donde vive el 90 % del texto)
   es la mejor de todas.
3. **En tema máximo no hay superficies de color, hay superficies de borde.**
   Todo sigue siendo `#000000`; lo que cambia entre niveles es el **grosor y el
   estilo del borde** y el uso de `--sombra-maximo` (un anillo amarillo tenue
   hecho con `box-shadow`, que no es texto y por tanto no está sujeto a 7:1).
   Ver §4.5.

Además se añaden tokens que hoy no existen y que la app necesita:
`--texto-inactivo`, `--borde-fuerte`, `--acento-suave` (relleno tenue para
fondos de énfasis), `--foco`, y la familia `--grupo-*` de §7.

### 4.2 · Tema Oscuro (por defecto)

```css
:root,
[data-tema="oscuro"] {
  /* superficies */
  --fondo:            #0A0E14;
  --superficie-1:     #121A24;
  --superficie-2:     #1B2634;
  --superficie-3:     #26333F;

  /* texto */
  --texto:            #F2F7FC;
  --texto-suave:      #BFCCDA;
  --texto-inactivo:   #8FA0B4;   /* solo para elementos deshabilitados */

  /* líneas */
  --borde:            #2E3B4C;   /* estructural, separa superficies */
  --borde-fuerte:     #54687F;   /* contorno de control, ≥3:1 con el fondo */

  /* acento y semánticos */
  --acento:           #5CD5F5;
  --acento-texto:     #04121A;   /* texto sobre relleno de acento */
  --acento-suave:     #103444;   /* relleno tenue de énfasis */
  --ok:               #6EE7A0;
  --ok-texto:         #04220C;
  --alerta:           #FFC85C;
  --alerta-texto:     #1A0E00;
  --peligro:          #FFB4A8;
  --peligro-texto:    #2A0400;

  --foco:             #FFC85C;   /* ámbar: se ve sobre acento y sobre fondo */
  --sombra-1: 0 1px 2px rgba(0,0,0,.55);
  --sombra-2: 0 4px 14px rgba(0,0,0,.55);
}
```

**Ratios medidos** (fórmula WCAG 2.2, luminancia relativa):

| Color | sobre `--fondo` | s-1 | s-2 | s-3 | mínimo |
|---|---|---|---|---|---|
| `--texto` `#F2F7FC` | 17,95 | 16,25 | 14,19 | 11,97 | **11,97** ✅ |
| `--texto-suave` `#BFCCDA` | 11,85 | 10,73 | 9,37 | 7,90 | **7,90** ✅ |
| `--texto-inactivo` `#8FA0B4` | 7,23 | 6,55 | 5,72 | 4,83 | ⚠ ver nota |
| `--acento` `#5CD5F5` | 11,32 | 10,25 | 8,95 | 7,55 | **7,55** ✅ |
| `--ok` `#6EE7A0` | 12,53 | 11,34 | 9,90 | 8,36 | **8,36** ✅ |
| `--alerta` `#FFC85C` | 12,59 | 11,40 | 9,95 | 8,40 | **8,40** ✅ |
| `--peligro` `#FFB4A8` | 11,37 | 10,29 | 8,98 | 7,58 | **7,58** ✅ |

Texto sobre relleno de color:

| Par | Ratio |
|---|---|
| `--acento-texto` `#04121A` sobre `--acento` `#5CD5F5` | **11,11** ✅ |
| `--ok-texto` `#04220C` sobre `--ok` `#6EE7A0` | **12,29** ✅ |
| `--alerta-texto` `#1A0E00` sobre `--alerta` `#FFC85C` | **12,35** ✅ |
| `--peligro-texto` `#2A0400` sobre `--peligro` `#FFB4A8` | **11,06** ✅ |
| `--texto` sobre `--acento-suave` `#103444` | **12,20** ✅ |

Separación entre superficies (no es texto, no aplica 7:1):

`--fondo`→s-1 **1,10** · s-1→s-2 **1,15** · s-2→s-3 **1,19** · `--fondo`→s-3 **1,50**

Bordes (WCAG 1.4.11 pide 3:1 solo cuando el borde es el *único* indicador):

`--borde` sobre `--fondo` **1,70** (estructural, acompaña un cambio de relleno) ·
`--borde-fuerte` sobre `--fondo` **3,37** ✅ · sobre `--superficie-1` **3,06** ✅

> **Nota sobre `--texto-inactivo`.** 4,83:1 en el peor caso no llega a AAA. Es
> deliberado y es la única excepción del sistema: WCAG 1.4.3 y 1.4.6 **excluyen
> explícitamente los componentes inactivos** del requisito de contraste. Aun
> así queda por encima de AA en las cuatro superficies, y es **casi el doble**
> que el `opacity:.4` actual (2,44:1). **Y nunca va solo**: un botón
> deshabilitado lleva además `aria-disabled="true"` y su texto explica por qué
> («← Anterior · es el primero»).

### 4.3 · Tema Claro

```css
[data-tema="claro"] {
  --fondo:            #F2F5F9;   /* la página, ligeramente teñida */
  --superficie-1:     #FFFFFF;   /* la tarjeta: MÁS clara que la página */
  --superficie-2:     #E7EDF5;   /* hueco: input, chip, celda */
  --superficie-3:     #D8E1EC;   /* relleno de énfasis / presionado */

  --texto:            #0B1220;
  --texto-suave:      #334354;
  --texto-inactivo:   #4F5E6E;

  --borde:            #C2CFDE;
  --borde-fuerte:     #70849C;

  --acento:           #04486B;
  --acento-texto:     #FFFFFF;
  --acento-suave:     #D6E6F2;
  --ok:               #095021;
  --ok-texto:         #FFFFFF;
  --alerta:           #5F3A00;
  --alerta-texto:     #FFFFFF;
  --peligro:          #8C0F1A;
  --peligro-texto:    #FFFFFF;

  --foco:             #8C0F1A;
  --sombra-1: 0 1px 2px rgba(11,18,32,.10);
  --sombra-2: 0 4px 14px rgba(11,18,32,.14);
}
```

| Color | sobre `--fondo` | s-1 (tarjeta) | s-2 | s-3 | mínimo |
|---|---|---|---|---|---|
| `--texto` `#0B1220` | 17,12 | 18,72 | 15,90 | 14,18 | **14,18** ✅ |
| `--texto-suave` `#334354` | 9,27 | 10,14 | 8,61 | 7,68 | **7,68** ✅ |
| `--texto-inactivo` `#4F5E6E` | 6,08 | 6,65 | 5,64 | 5,03 | ⚠ excepción (§4.2) |
| `--acento` `#04486B` | 8,96 | 9,79 | 8,31 | 7,42 | **7,42** ✅ |
| `--ok` `#095021` | 8,81 | 9,63 | 8,17 | 7,29 | **7,29** ✅ |
| `--alerta` `#5F3A00` | 9,18 | 10,04 | 8,52 | 7,60 | **7,60** ✅ |
| `--peligro` `#8C0F1A` | 8,74 | 9,55 | 8,11 | 7,23 | **7,23** ✅ |

Texto sobre relleno:

`#FFFFFF` sobre `--acento` **9,79** ✅ · sobre `--ok` **9,63** ✅ ·
sobre `--alerta` **10,04** ✅ · sobre `--peligro` **9,55** ✅ ·
`--texto` sobre `--acento-suave` `#D6E6F2` **14,68** ✅

Superficies: `--fondo`→s-1 **1,09** · `--fondo`→s-2 **1,08** · s-2→s-3 **1,12** ·
s-1→s-3 **1,32**.
Bordes: `--borde` sobre s-1 **1,58** · `--borde-fuerte` sobre s-1 **3,84** ✅.

> Lo que cambia respecto a hoy: `--fondo` deja de ser blanco puro. Eso hace que
> **la tarjeta blanca por fin exista** y sube el contraste del texto principal
> (18,72 sobre tarjeta contra 18,7 antes, pero ahora con relieve real). El
> acento se mantiene `#04486B` porque ya era correcto; lo que cambia es
> **dónde** se usa (§8).

### 4.4 · Tema Máximo

```css
[data-tema="maximo"] {
  --fondo:            #000000;
  --superficie-1:     #000000;
  --superficie-2:     #000000;
  --superficie-3:     #000000;

  --texto:            #FFFF00;
  --texto-suave:      #FFFF00;
  --texto-inactivo:   #C8C800;

  --borde:            #FFFF00;
  --borde-fuerte:     #FFFF00;

  --acento:           #FFFF00;
  --acento-texto:     #000000;
  --acento-suave:     #000000;
  --ok:               #5CFF9A;
  --ok-texto:         #000000;
  --alerta:           #FFFF00;
  --alerta-texto:     #000000;
  --peligro:          #FF8A80;
  --peligro-texto:    #000000;

  --foco:             #FFFFFF;   /* el único blanco del tema: se distingue del amarillo */
  --sombra-1: none;
  --sombra-2: none;

  /* jerarquía por BORDE, no por relleno */
  --grosor-1: 1px;   /* separadores internos */
  --grosor-2: 2px;   /* tarjeta */
  --grosor-3: 4px;   /* elemento activo / de hoy / advertencia */
}
```

| Color | sobre `#000000` | Ratio |
|---|---|---|
| `--texto` / `--acento` / `--alerta` `#FFFF00` | negro | **19,56** ✅ |
| `--ok` `#5CFF9A` | negro | **16,23** ✅ |
| `--peligro` `#FF8A80` | negro | **9,20** ✅ |
| `--texto-inactivo` `#C8C800` | negro | **11,72** ✅ (aquí sí supera AAA) |
| `--acento-texto` `#000000` sobre `#FFFF00` | amarillo | **19,56** ✅ |
| `--foco` `#FFFFFF` sobre `#000000` | negro | **21,00** ✅ |

**Cómo se consigue jerarquía sin superficies.** Cuatro recursos, ninguno basado
en relleno:

```css
/* 1 · grosor de borde escalonado */
[data-tema="maximo"] .tarjeta          { border-width: var(--grosor-2); }
[data-tema="maximo"] .dia[data-hoy]    { border-width: var(--grosor-3); }

/* 2 · borde discontinuo para lo secundario (día de descanso, nota) */
[data-tema="maximo"] .dia--descanso    { border-style: dashed; }

/* 3 · halo exterior en lugar de sombra */
[data-tema="maximo"] .destacado {
  box-shadow: 0 0 0 2px #000, 0 0 0 4px var(--acento);
}

/* 4 · inversión para el énfasis máximo: amarillo relleno, negro encima.
       Se reserva para UN elemento por pantalla. */
[data-tema="maximo"] .btn-principal {
  background: var(--acento); color: var(--acento-texto);
  border: var(--grosor-2) solid var(--acento);
}
[data-tema="maximo"] .btn-secundario,
[data-tema="maximo"] .btn-grande {
  background: #000; color: var(--texto);
  border: var(--grosor-2) solid var(--borde);
}
```

Y la regla de oro del tema Máximo: **un solo bloque amarillo relleno por
pantalla**. Hoy hay dos o tres compitiendo (§1.8). En la pantalla de ejercicio,
el relleno se lo queda «Serie hecha»; «Léemelo en voz alta» pasa a borde.

### 4.5 · Tokens auxiliares comunes

```css
:root {
  --escala: 1;
  --base: calc(17px * var(--escala));
  --toque: 48px;            /* mínimo de cualquier cosa tocable */
  --toque-primario: 58px;   /* botones que se tocan con las manos sudadas */

  /* radios: cuatro escalones, no uno */
  --radio-1: 8px;    /* miniaturas, puntos, celdas pequeñas */
  --radio-2: 14px;   /* tarjetas, botones */
  --radio-3: 20px;   /* contenedores grandes, hoja del temporizador */
  --radio-full: 999px;

  /* espaciado: progresión única de 4 px */
  --e0: 2px;  --e1: 4px;  --e2: 8px;  --e3: 12px;
  --e4: 16px; --e5: 24px; --e6: 32px; --e7: 48px;

  /* movimiento */
  --t-rapida: 120ms;
  --t-media:  200ms;
  --curva: cubic-bezier(.2,.7,.3,1);
}

@media (prefers-reduced-motion: reduce) {
  :root { --t-rapida: 0ms; --t-media: 0ms; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Fundamentos: tipografía

### 5.1 · La familia

Nada cambia en la elección de familia (no hay internet garantizado, no hay
`@import`). Lo que sí cambia es que se declaran **tres pilas** en vez de una:

```css
:root {
  --fuente: system-ui, -apple-system, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;

  /* números tabulares para contadores, pesos, tiempos y series */
  --fuente-num: ui-rounded, "SF Pro Rounded", system-ui, -apple-system,
                "Segoe UI", Roboto, sans-serif;

  /* datos alineados en columna (peso de la vez pasada, reps) */
  --fuente-mono: ui-monospace, "SF Mono", "Cascadia Mono", "Segoe UI Mono",
                 Menlo, Consolas, monospace;
}

body { font-family: var(--fuente); font-size: var(--base); }

/* Todos los números que se comparan o cambian, con ancho fijo:
   evita el «baile» del contador al pasar de 9 a 10. */
.num, .series-numero, .temporizador-numero, .dato-valor, .ejercicio-numero {
  font-family: var(--fuente-num);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  letter-spacing: -.01em;
}
```

`ui-rounded` es real en iOS/Safari (mapea a SF Pro Rounded) y degrada
silenciosamente a `system-ui` en Android y Windows. Coste: cero bytes.

### 5.2 · La escala

Ocho escalones, razón ≈ 1,125 (segunda mayor) en los tamaños de texto y un salto
grande deliberado para los dos «displays». **Todo en `em`, relativo a `--base`
(17 px × `--escala`).** Nada en `px`.

| Token | `em` | px @ escala 1 | Peso | `line-height` | `letter-spacing` | Uso |
|---|---|---|---|---|---|---|
| `--t-display` | `3.6em` | 61 | 800 | 1.0 | −.03em | número del temporizador |
| `--t-cifra` | `2.4em` | 41 | 800 | 1.05 | −.02em | contador de series, peso |
| `--t-titulo` | `1.45em` | 25 | 700 | 1.2 | −.015em | nombre del ejercicio, `h2` de pantalla |
| `--t-seccion` | `1.15em` | 20 | 700 | 1.3 | −.01em | `h3` de tarjeta, nombre del día |
| `--t-cuerpo-fuerte` | `1em` | 17 | 600 | 1.5 | 0 | nombre de ejercicio en lista, botones |
| `--t-cuerpo` | `1em` | 17 | 400 | 1.55 | 0 | párrafos, pasos |
| `--t-menor` | `.875em` | 15 | 500 | 1.45 | 0 | metadatos, subtítulos |
| `--t-etiqueta` | `.75em` | 13 | 700 | 1.3 | .08em | rótulos en versalita, píldoras |

```css
:root {
  --t-display:        3.6em;
  --t-cifra:          2.4em;
  --t-titulo:         1.45em;
  --t-seccion:        1.15em;
  --t-cuerpo-fuerte:  1em;
  --t-cuerpo:         1em;
  --t-menor:          .875em;
  --t-etiqueta:       .75em;
}
```

Tres reglas de uso, que son las que producen la jerarquía que hoy falta:

1. **Un solo `--t-titulo` por pantalla.** El que responde «¿dónde estoy?».
2. **El peso hace el trabajo que hoy hace el tamaño.** Entre
   `--t-cuerpo-fuerte` (600) y `--t-cuerpo` (400) hay diferencia clara sin tocar
   el tamaño — importante porque no se puede agrandar.
3. **`--t-etiqueta` siempre va en versalita** (`text-transform: uppercase` +
   `letter-spacing: .08em`) y **siempre en `--texto-suave`**. Es la voz de «esto
   es un rótulo, no contenido». Hoy solo lo usa el panel de ajustes; debe usarlo
   toda la app.

### 5.3 · Ancho de línea y viudas

```css
.contenido { max-width: 34rem; }              /* ≈ 66 caracteres a escala 1 */
h1, h2, h3, .detalle-nombre { text-wrap: balance; }   /* Safari 17.5+ */
p, li { text-wrap: pretty; }                          /* Safari 26.0+ */
```

Ambos degradan a `normal` en navegadores viejos sin efecto secundario.
`balance` ya está en la mayoría de iPhones; `pretty` es muy reciente (Safari
26.0) y por eso se usa solo como mejora opcional, nunca como algo de lo que
dependa la maquetación.
`max-width: 34rem` en lugar de `720px` hace que el ancho de la columna
**escale con `--escala`**: al 180 % la línea sigue teniendo ~66 caracteres en
lugar de partirse a la mitad.

---

## 6. Fundamentos: espaciado, radios, elevación, movimiento

### 6.1 · Espaciado

Una sola progresión de 4 px (`--e0` … `--e7`, §4.5). Reglas de aplicación:

| Situación | Token |
|---|---|
| Dentro de una píldora / chip | `--e2` (8) horizontal |
| Padding interno de tarjeta | `--e4` (16) |
| Entre elementos hermanos de una lista | `--e2` (8) |
| Entre bloques distintos | `--e4` (16) |
| Antes de un encabezado de sección | `--e6` (32) |
| Después de un encabezado de sección | `--e3` (12) |
| Margen lateral de la página | `--e4` (16) |
| Espacio de respiro al final de la pantalla | `--e7` (48) + safe-area |

**Ritmo asimétrico**: un encabezado siempre tiene más aire **encima** que
debajo (32 arriba / 12 abajo). Es lo que hace que la lista de 40 ejercicios se
lea por grupos y no como una tirada.

```css
.contenido > * + * { margin-top: var(--e2); }
.contenido > h2 + *, .contenido > h3 + * { margin-top: var(--e3); }
.contenido > * + h2, .contenido > * + h3 { margin-top: var(--e6); }
```

### 6.2 · Radios

| Token | Valor | Se aplica a |
|---|---|---|
| `--radio-1` | 8 px | miniatura, celda de dato, punto |
| `--radio-2` | 14 px | tarjeta, botón, fila de lista |
| `--radio-3` | 20 px | hoja del temporizador, tarjeta de persona |
| `--radio-full` | 999 px | chip de filtro, píldora «HOY», anillo |

Regla: **radio interior = radio exterior − padding**. Una miniatura de 8 px
dentro de una fila de 14 px con 6 px de padding queda ópticamente concéntrica.

### 6.3 · Elevación

Tres niveles, y **la elevación se expresa con superficie + borde, no solo con
sombra** (en tema Máximo no hay sombras).

```css
.nivel-0 { background: var(--fondo); }
.nivel-1 { background: var(--superficie-1); border: 1px solid var(--borde);
           box-shadow: var(--sombra-1); }
.nivel-2 { background: var(--superficie-1); border: 1px solid var(--borde-fuerte);
           box-shadow: var(--sombra-2); }
.hueco   { background: var(--superficie-2); border: 1px solid var(--borde);
           box-shadow: inset 0 1px 0 rgba(0,0,0,.25); }
```

### 6.4 · Movimiento

Presupuesto total: **tres transiciones**. Ni una más.

```css
/* 1 · realimentación al tocar (la más importante en una app de gimnasio,
       porque confirma el toque cuando tienes las manos sudadas) */
button, a.btn-grande, .filtro, .ejercicio, .dia, .persona {
  transition: transform var(--t-rapida) var(--curva),
              background-color var(--t-rapida) linear,
              border-color var(--t-rapida) linear;
}
button:active, .ejercicio:active, .dia:active, .persona:active { transform: scale(.985); }

/* 2 · entrada de pantalla (ver §9.5) */
/* 3 · barra y anillo de progreso */
.barra-progreso span, .anillo-progreso circle { transition: all var(--t-media) var(--curva); }
```

`prefers-reduced-motion` ya está cubierto por el bloque de §4.5, que pone las
variables de duración a 0 **y** neutraliza cualquier animación futura.

### 6.5 · Seis reglas duras del sistema

Son las que impiden que el rediseño rompa la accesibilidad por accidente.

1. **`opacity` nunca se usa sobre texto.** Ni para deshabilitar, ni para
   atenuar, ni para animar la entrada de algo que ya está visible. Un texto al
   40 % pierde contraste de forma invisible para el que escribe el CSS. Para
   atenuar existe `--texto-suave`; para deshabilitar, `--texto-inactivo`.
2. **`color-mix()` nunca genera colores de texto.** Solo fondos, bordes
   decorativos y degradados. `color-mix` no sabe nada de contraste y puede
   tirar un acento de 10:1 a 4:1 sin avisar. Todos los `color-mix` de este
   documento están en `background`.
3. **En tema Máximo se anulan todos los `color-mix`, degradados, sombras y
   filtros.** Cualquier mezcla sobre `#FFFF00` destruye los 19,56:1 que son la
   razón de existir del tema. Cada regla que use `color-mix` lleva su
   contrapartida `[data-tema="maximo"]`.
4. **Ningún gráfico informativo depende de un `background`.** Los anillos,
   barras y marcas se dibujan con `stroke` o `border` (SVG/CSS), que sobreviven
   a `forced-colors: active`; los `gradient` se descartan en ese modo y el
   gráfico desaparecería.
5. **Ningún tamaño de texto en `px`.** Todo en `em` sobre `--base`. Las únicas
   medidas en `px` del sistema son `--toque` (48), los radios y la escala de
   espaciado — es decir, cosas que **no** deben crecer con la letra, para que al
   180 % la app no se convierta en botones de 100 px de alto.
6. **Área tocable ≥ 44 px también a `--escala: 0.9`.** Por eso `--toque` es un
   `px` fijo y no un `em`.

---

## 7. Color por grupo muscular

### 7.1 · Reglas del sistema

1. **El color nunca informa solo.** Cada uso lleva siempre el nombre del grupo
   escrito («Pecho») y, en las píldoras, también una **inicial en un cuadro**
   (`PE`, `ES`, `HO`…) para que se distinga incluso en escala de grises.
2. **En tema Máximo todos los grupos son amarillo.** No se inventa color donde
   el tema dice que no hay color. La diferenciación en Máximo es 100 % textual
   (nombre + inicial), que es exactamente lo que el usuario necesita.
3. **Dos tokens por grupo, uno por polaridad.** El valor lo resuelve el bloque
   de tema; el componente solo consume `--grupo`.
4. **Se usa en cuatro sitios y en ninguno más**: barra lateral de 4 px del
   encabezado de grupo, píldora del detalle del ejercicio, degradado sutil del
   encabezado del ejercicio (§9.2), y el anillo de la miniatura si está hecho.

### 7.2 · Valores

Los tintes oscuros están calculados para dar **≥7,0:1 sobre `--superficie-3`**
(el peor fondo del tema), y los tonos claros **≥7,0:1 sobre `--superficie-2`**
(el peor fondo del tema claro). Es decir: funcionan sobre *cualquier* superficie
de su tema.

Columnas: **s-3** = peor caso del tema oscuro, **s-1** = tarjeta oscura,
**s-2** = peor caso del tema claro, **tarjeta** = blanco.

| Grupo | Inicial | Oscuro | s-3 | s-1 | Claro | s-2 | tarjeta |
|---|---|---|---|---|---|---|---|
| Pecho | PE | `#FFAAA3` | 7,08 | 9,62 | `#961D15` | 7,18 | 8,46 |
| Espalda | ES | `#A0C0FF` | 7,05 | 9,57 | `#204B97` | 7,09 | 8,35 |
| Hombros | HO | `#67D9EC` | 7,81 | 10,60 | `#0E5563` | 7,14 | 8,41 |
| Bíceps | BI | `#7BE3A4` | 8,21 | 11,15 | `#115932` | 7,14 | 8,40 |
| Tríceps | TR | `#CCB4FF` | 7,09 | 9,63 | `#57379F` | 7,27 | 8,56 |
| Pierna | PI | `#FFC46B` | 8,21 | 11,14 | `#704400` | 7,09 | 8,35 |
| Glúteos | GL | `#FFA4D5` | 7,08 | 9,61 | `#8C2164` | 7,08 | 8,34 |
| Abdomen | AB | `#DDE26E` | 9,32 | 12,66 | `#525000` | 7,11 | 8,38 |
| Pantorrilla | PA | `#5EDCC6` | 7,70 | 10,45 | `#0B584E` | 7,08 | 8,33 |
| Lumbar | LU | `#FFB88C` | 7,67 | 10,41 | `#833711` | 7,08 | 8,33 |
| Antebrazos | AN | `#B8C6D8` | 7,44 | 10,10 | `#3B4B60` | 7,55 | 8,89 |

En tema oscuro, texto negro (`#08121A`) sobre cualquiera de los tintes da
**≥10,3:1**; en tema claro, blanco sobre cualquiera de los tonos da **≥8,3:1**.
Es decir: las píldoras rellenas también cumplen AAA en los dos sentidos.

Las once tonalidades están repartidas por el círculo cromático y evitan pares
confundibles en las tres formas de daltonismo más comunes; aun así, **nada de
esto importa para la accesibilidad**, porque el nombre siempre está escrito. El
color aquí es memoria y ritmo visual, no información.

### 7.3 · CSS

```css
/* --- tema oscuro (valores por defecto) --- */
:root,
[data-tema="oscuro"] {
  --g-pecho:       #FFAAA3;  --g-espalda:     #A0C0FF;
  --g-hombros:     #67D9EC;  --g-biceps:      #7BE3A4;
  --g-triceps:     #CCB4FF;  --g-pierna:      #FFC46B;
  --g-gluteos:     #FFA4D5;  --g-abdomen:     #DDE26E;
  --g-pantorrilla: #5EDCC6;  --g-lumbar:      #FFB88C;
  --g-antebrazos:  #B8C6D8;
  --g-contra:      #08121A;          /* texto sobre relleno de grupo */
  --g-tinte:       12%;              /* mezcla para fondos tenues */
}

[data-tema="claro"] {
  --g-pecho:       #961D15;  --g-espalda:     #204B97;
  --g-hombros:     #0E5563;  --g-biceps:      #115932;
  --g-triceps:     #57379F;  --g-pierna:      #704400;
  --g-gluteos:     #8C2164;  --g-abdomen:     #525000;
  --g-pantorrilla: #0B584E;  --g-lumbar:      #833711;
  --g-antebrazos:  #3B4B60;
  --g-contra:      #FFFFFF;
  --g-tinte:       10%;
}

[data-tema="maximo"] {
  --g-pecho: #FFFF00; --g-espalda: #FFFF00; --g-hombros: #FFFF00;
  --g-biceps: #FFFF00; --g-triceps: #FFFF00; --g-pierna: #FFFF00;
  --g-gluteos: #FFFF00; --g-abdomen: #FFFF00; --g-pantorrilla: #FFFF00;
  --g-lumbar: #FFFF00; --g-antebrazos: #FFFF00;
  --g-contra: #000000;
  --g-tinte: 0%;
}

/* Resolución: el componente solo lee --grupo */
[data-grupo]              { --grupo: var(--texto-suave); }
[data-grupo="pecho"]      { --grupo: var(--g-pecho); }
[data-grupo="espalda"]    { --grupo: var(--g-espalda); }
[data-grupo="hombros"]    { --grupo: var(--g-hombros); }
[data-grupo="biceps"]     { --grupo: var(--g-biceps); }
[data-grupo="triceps"]    { --grupo: var(--g-triceps); }
[data-grupo="pierna"]     { --grupo: var(--g-pierna); }
[data-grupo="gluteos"]    { --grupo: var(--g-gluteos); }
[data-grupo="abdomen"]    { --grupo: var(--g-abdomen); }
[data-grupo="pantorrilla"]{ --grupo: var(--g-pantorrilla); }
[data-grupo="lumbar"]     { --grupo: var(--g-lumbar); }
[data-grupo="antebrazos"] { --grupo: var(--g-antebrazos); }
```

`data-grupo` se genera normalizando `e.grupo` (minúsculas, sin tildes). Es un
cambio de una línea en `app.js`:

```js
function claveGrupo(g) {
  return String(g).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
}
```

### 7.4 · La píldora de grupo (el componente que lo usa)

```css
.pildora-grupo {
  display: inline-flex; align-items: center; gap: var(--e2);
  min-height: 28px; padding: 0 var(--e3) 0 var(--e1);
  border-radius: var(--radio-full);
  background: var(--superficie-2);
  border: 1px solid var(--grupo);
  color: var(--texto);
  font-size: var(--t-menor); font-weight: 600;
}
.pildora-grupo .inicial {
  display: grid; place-items: center;
  width: 22px; height: 22px; border-radius: var(--radio-full);
  background: var(--grupo); color: var(--g-contra);
  font-size: var(--t-etiqueta); font-weight: 800; letter-spacing: 0;
}
```

HTML:

```html
<span class="pildora-grupo" data-grupo="pecho">
  <span class="inicial" aria-hidden="true">PE</span>Pecho
</span>
```

El nombre escrito («Pecho») es el que leen VoiceOver y el usuario; la inicial y
el color son redundancia deliberada.

---

## 8. Especificación de componentes

Convención: todo lo que aparece aquí es **CSS puro** y usa solo los tokens de
§4–§6. Cada componente indica qué cambia respecto a hoy y por qué.

### 8.1 · Barra superior

**Qué cambia.** Deja de ser una franja plana. Gana (a) una rejilla de tres
columnas fijas para que el título siempre esté centrado ópticamente aunque no
haya botón «volver», (b) un **hilo de progreso de 3 px pegado al borde
inferior** cuando estás dentro de un día, que sustituye a la barra de progreso
suelta de `06-dia`, y (c) fondo translúcido con `backdrop-filter` (con
degradado de reserva para quien no lo soporte).

```css
.barra-superior {
  position: sticky; top: 0; z-index: 30;
  display: grid;
  grid-template-columns: var(--toque) 1fr var(--toque);
  align-items: center; gap: var(--e2);
  padding: var(--e2) var(--e3);
  padding-top: max(var(--e2), env(safe-area-inset-top));
  background: var(--superficie-1);
  border-bottom: 1px solid var(--borde);
  box-shadow: var(--sombra-1);
}
@supports (backdrop-filter: blur(12px)) {
  .barra-superior {
    background: color-mix(in srgb, var(--superficie-1) 82%, transparent);
    backdrop-filter: saturate(1.4) blur(14px);
  }
}
[data-tema="maximo"] .barra-superior {
  background: #000; backdrop-filter: none;
  border-bottom: var(--grosor-2) solid var(--borde);
}

.titulo-barra {
  grid-column: 2; margin: 0; text-align: center;
  font-size: var(--t-cuerpo-fuerte); font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* el subtítulo de contexto: "Martes · Pecho y tríceps" */
.subtitulo-barra {
  grid-column: 2; grid-row: 2; margin: 0; text-align: center;
  font-size: var(--t-etiqueta); font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--texto-suave);
}

.btn-icono {
  grid-row: 1;
  display: grid; place-items: center;
  width: var(--toque); height: var(--toque);
  font-size: var(--t-cuerpo-fuerte); font-weight: 700; font-family: inherit;
  background: var(--superficie-2); color: var(--texto);
  border: 1px solid var(--borde); border-radius: var(--radio-2);
  cursor: pointer;
}
.btn-icono:nth-of-type(1) { grid-column: 1; }
.btn-icono:nth-of-type(2) { grid-column: 3; }
.btn-icono:active { background: var(--superficie-3); }

/* hilo de progreso del día, pegado al borde inferior de la barra */
.barra-superior::after {
  content: ""; position: absolute; left: 0; bottom: -1px; height: 3px;
  width: calc(var(--progreso, 0) * 1%);
  background: var(--ok);
  transition: width var(--t-media) var(--curva);
}
[data-tema="maximo"] .barra-superior::after { height: 5px; }
```

`--progreso` lo pone `app.js` con una línea:
`document.documentElement.style.setProperty("--progreso", pct)`.

> **Accesibilidad**: el hilo es decorativo (`::after`, no llega al árbol de
> accesibilidad). El porcentaje sigue estando escrito en la pantalla del día
> («3 de 8 ejercicios hechos») y en el `aria-label` de la barra grande.

### 8.2 · Tarjeta de persona

**Qué cambia.** Gana un **monograma** (la inicial en un círculo grande), datos
en formato de dato y no de pie de página, y el color de persona deja de ser el
único distintivo.

```css
.persona {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center; gap: var(--e4);
  width: 100%; padding: var(--e4);
  background: var(--superficie-1);
  border: 1px solid var(--borde);
  border-left: 5px solid var(--persona-color, var(--acento));
  border-radius: var(--radio-3);
  box-shadow: var(--sombra-1);
  color: var(--texto); font-family: inherit; text-align: left; cursor: pointer;
}
.persona-monograma {
  display: grid; place-items: center;
  width: 56px; height: 56px; border-radius: var(--radio-full);
  background: var(--superficie-2);
  border: 2px solid var(--persona-color, var(--acento));
  color: var(--texto);
  font-size: var(--t-seccion); font-weight: 800;
}
.persona-nombre  { display: block; font-size: var(--t-titulo); font-weight: 700; line-height: 1.15; }
.persona-datos   { display: flex; gap: var(--e3); margin-top: var(--e1); flex-wrap: wrap; }
.persona-dato    { font-size: var(--t-menor); color: var(--texto-suave); }
.persona-dato b  { font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
                   color: var(--texto); font-weight: 700; }

.persona[data-tema-persona="azul"]   { --persona-color: var(--acento); }
.persona[data-tema-persona="fucsia"] { --persona-color: var(--g-gluteos); }
[data-tema="maximo"] .persona { --persona-color: var(--borde); border-left-width: var(--grosor-3); }
```

```html
<button class="persona" data-tema-persona="azul">
  <span class="persona-monograma" aria-hidden="true">A</span>
  <span>
    <span class="persona-nombre">Anderson</span>
    <span class="persona-datos">
      <span class="persona-dato"><b>5</b> días por semana</span>
      <span class="persona-dato"><b>59</b> ejercicios</span>
    </span>
  </span>
  <span class="chevron" aria-hidden="true"></span>
</button>
```

### 8.3 · Fila de día

**Qué cambia.** Cuatro cosas: (1) el día de HOY pasa a ser una tarjeta
claramente distinta, no una caja con borde de otro color; (2) los días de
descanso se **colapsan** a una fila baja y discreta; (3) aparece un **anillo de
progreso** con el conteo dentro (§9.1); (4) el chevron se convierte en una forma
CSS de 12 px, no un carácter de texto.

```css
.dia {
  display: grid;
  grid-template-columns: 44px 1fr 12px;
  align-items: center; gap: var(--e3);
  width: 100%; min-height: 72px; padding: var(--e3);
  background: var(--superficie-1);
  border: 1px solid var(--borde);
  border-left: 4px solid var(--grupo, var(--borde));
  border-radius: var(--radio-2);
  box-shadow: var(--sombra-1);
  color: var(--texto); font-family: inherit; text-align: left; cursor: pointer;
}
.dia-nombre  { display: flex; align-items: center; gap: var(--e2);
               font-size: var(--t-seccion); font-weight: 700; line-height: 1.2; }
.dia-titulo  { display: block; font-size: var(--t-menor); color: var(--texto-suave); }
.dia-conteo  { display: block; margin-top: var(--e0);
               font-size: var(--t-menor); font-weight: 600; color: var(--texto); }

/* --- HOY: el único elemento con nivel 2 de toda la pantalla --- */
.dia[data-hoy="si"] {
  background: var(--superficie-1);
  border: 2px solid var(--acento);
  box-shadow: var(--sombra-2), 0 0 0 4px var(--acento-suave);
}
.etiqueta-hoy {
  display: inline-flex; align-items: center;
  background: var(--acento); color: var(--acento-texto);
  font-size: var(--t-etiqueta); font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em;
  padding: 2px var(--e2); border-radius: var(--radio-full);
}

/* --- DESCANSO: fila colapsada, no compite --- */
.dia--descanso {
  min-height: var(--toque);
  grid-template-columns: 44px 1fr;
  background: transparent;
  border-style: dashed; border-left-width: 1px;
  box-shadow: none;
  color: var(--texto-suave);
  cursor: default;
}
.dia--descanso .dia-nombre { font-size: var(--t-cuerpo-fuerte); font-weight: 600; }

/* --- chevron como forma, no como carácter --- */
.chevron {
  width: 10px; height: 10px;
  border-right: 2.5px solid var(--texto-suave);
  border-bottom: 2.5px solid var(--texto-suave);
  transform: rotate(-45deg);
}
[data-tema="maximo"] .chevron { border-width: 3.5px; }
```

Los dos días de descanso, colapsados, ahorran ~90 px y —más importante— dejan de
parecer que llevan a algún sitio.

### 8.4 · Chip de filtro

**Qué cambia.** El chip activo deja de ser un bloque de acento sólido y pasa a
ser **acento tenue + borde de acento + una marca ✓**. Así se distingue por tres
señales (relleno, borde, glifo) sin gritar. Además la fila de chips pasa a
**scroll horizontal con `scroll-snap`** en vez de envolverse en tres líneas.

```css
.filtros {
  display: flex; gap: var(--e2);
  margin: 0 calc(-1 * var(--e4)) var(--e4);
  padding: var(--e1) var(--e4) var(--e3);
  overflow-x: auto; scroll-snap-type: x proximity;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.filtros::-webkit-scrollbar { display: none; }

.filtro {
  display: inline-flex; align-items: center; gap: var(--e2);
  flex: none; scroll-snap-align: start;
  min-height: 44px; padding: 0 var(--e4);
  font-size: var(--t-menor); font-weight: 600; font-family: inherit;
  background: var(--superficie-1); color: var(--texto);
  border: 1px solid var(--borde); border-radius: var(--radio-full);
  cursor: pointer; white-space: nowrap;
}
.filtro .conteo {
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  color: var(--texto-suave); font-weight: 700;
}
.filtro[aria-pressed="true"] {
  background: var(--acento-suave);
  border: 2px solid var(--acento);
  padding: 0 calc(var(--e4) - 1px);
  color: var(--texto); font-weight: 700;
}
.filtro[aria-pressed="true"]::before {
  content: "✓"; font-weight: 900; color: var(--acento);
}
.filtro[aria-pressed="true"] .conteo { color: var(--texto); }
[data-tema="maximo"] .filtro[aria-pressed="true"] {
  background: var(--acento); color: var(--acento-texto); border-color: var(--acento);
}
[data-tema="maximo"] .filtro[aria-pressed="true"]::before { color: var(--acento-texto); }
[data-tema="maximo"] .filtro[aria-pressed="true"] .conteo { color: var(--acento-texto); }
```

**Se eliminan los puntos de color de día** dentro del chip: el nombre del día ya
está escrito y el punto de 10 px no era legible. El color del día se mantiene
únicamente en la fila de día (§8.3), donde tiene 4 px de alto completo.

Ratio del chip activo en oscuro: `--texto` `#F2F7FC` sobre `--acento-suave`
`#103444` = **12,20:1** ✅. En claro: `#0B1220` sobre `#D6E6F2` = **14,68:1** ✅.

### 8.5 · Fila de ejercicio de la lista

**Qué cambia.** (1) La miniatura pierde el fondo blanco y gana una máscara
oscura suave, (2) baja de tres líneas de texto a dos, (3) el número deja de
desaparecer cuando el ejercicio está hecho: convive con el ✓, (4) aparece el
**peso de la última vez** alineado a la derecha en cifra tabular.

```css
.ejercicio {
  display: grid;
  grid-template-columns: 32px 72px 1fr auto;
  align-items: center; gap: var(--e3);
  width: 100%; min-height: 76px; padding: var(--e2) var(--e3);
  background: var(--superficie-1);
  border: 1px solid var(--borde); border-radius: var(--radio-2);
  color: var(--texto); font-family: inherit; text-align: left; cursor: pointer;
}

.ejercicio-numero {
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-menor); font-weight: 700; color: var(--texto-suave);
  text-align: center;
}

.ejercicio-miniatura {
  width: 72px; height: 56px; object-fit: cover;
  border-radius: var(--radio-1);
  border: 1px solid var(--borde);
  background: var(--superficie-2);          /* ← ya no #fff */
  filter: saturate(.9) contrast(1.05);
}
[data-tema="oscuro"] .ejercicio-miniatura { filter: saturate(.85) brightness(.92) contrast(1.08); }
[data-tema="maximo"] .ejercicio-miniatura { filter: grayscale(1) contrast(1.5) brightness(.85);
                                            border-width: var(--grosor-2); }

.ejercicio-nombre { display: block;
                    font-size: var(--t-cuerpo-fuerte); font-weight: 600; line-height: 1.3; }
.ejercicio-meta   { display: flex; align-items: center; gap: var(--e2); margin-top: var(--e1);
                    font-size: var(--t-menor); color: var(--texto-suave); }
/* el marcador de grupo: 3 px de color + nombre escrito */
.ejercicio-meta .marca-grupo {
  width: 3px; height: 1em; border-radius: 2px; background: var(--grupo); flex: none;
}

.ejercicio-peso {
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-menor); font-weight: 700; color: var(--texto-suave);
  text-align: right; white-space: nowrap;
}
.ejercicio-peso b { display: block; font-size: var(--t-cuerpo-fuerte); color: var(--texto); }

/* --- hecho: tres señales (borde, marca, palabra) --- */
.ejercicio[data-hecho="si"] {
  border-color: var(--ok); border-width: 2px; padding: calc(var(--e2) - 1px) calc(var(--e3) - 1px);
  background: var(--superficie-1);
}
.ejercicio[data-hecho="si"] .ejercicio-numero::after {
  content: "\A✓"; white-space: pre; color: var(--ok); font-weight: 900;
}
.ejercicio[data-hecho="si"] .ejercicio-nombre::after {
  content: " · HECHO"; color: var(--ok);
  font-size: var(--t-etiqueta); font-weight: 800; letter-spacing: .08em;
}
```

```html
<button class="ejercicio" data-grupo="pecho">
  <span class="ejercicio-numero" aria-hidden="true">3</span>
  <img class="ejercicio-miniatura" src="…" alt="" loading="lazy" decoding="async">
  <span>
    <span class="ejercicio-nombre">Press inclinado con barra</span>
    <span class="ejercicio-meta">
      <span class="marca-grupo" aria-hidden="true"></span>Pecho · Banco inclinado
    </span>
  </span>
  <span class="ejercicio-peso">última vez<b>20 kg</b></span>
</button>
```

### 8.6 · Encabezado de grupo (sticky) en la lista

El componente que arregla los 7 958 px de `03-lista-todos.png`.

```css
.grupo-encabezado {
  position: sticky; top: calc(var(--toque) + env(safe-area-inset-top) + 8px);
  z-index: 10;
  display: flex; align-items: center; gap: var(--e3);
  margin: var(--e6) calc(-1 * var(--e4)) var(--e3);
  padding: var(--e2) var(--e4);
  background: var(--fondo);
  border-top: 1px solid var(--borde);
  border-left: 4px solid var(--grupo);
  font-size: var(--t-seccion); font-weight: 800;
  letter-spacing: -.01em;
}
@supports (backdrop-filter: blur(10px)) {
  .grupo-encabezado {
    background: color-mix(in srgb, var(--fondo) 85%, transparent);
    backdrop-filter: blur(10px);
  }
}
[data-tema="maximo"] .grupo-encabezado {
  background: #000; backdrop-filter: none;
  border-top-width: var(--grosor-2); border-left-width: var(--grosor-3);
}
.grupo-encabezado .conteo {
  margin-left: auto;
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-menor); font-weight: 700; color: var(--texto-suave);
}
```

`top` se calcula sobre la barra superior para que el encabezado se pegue justo
debajo. Con `--escala` al 180 % sigue funcionando porque `--toque` es fijo y el
resto es `env()`.

### 8.7 · Encabezado del detalle del ejercicio

**Qué cambia.** Es el cambio más importante de todo el rediseño. El encabezado
pasa a ser un **bloque compacto con degradado tenue del color del grupo**, y
—crítico— **el bloque de series sube justo debajo de las fotos**, antes de las
instrucciones. Orden nuevo de la pantalla:

```
1. Encabezado (nombre + píldora de grupo + equipo + posición «3 de 8»)
2. Bloque de series          ← lo que tocas entre serie y serie
3. Las dos fotos
4. Ojo con esto (si existe)
5. Cómo se hace (pasos)
6. Dónde está la máquina
7. Voz + video
8. Anterior / Siguiente
```

Justificación: durante el entreno el 90 % de las interacciones son «+1 serie» y
«descansar». Las instrucciones se leen **la primera vez**, y a partir de ahí son
consulta. Como todo sigue en la misma página, no se pierde nada: solo se
reordena. La lectura por voz sigue leyendo en el orden pedagógico (nombre →
músculo → equipo → dónde → pasos → advertencia), que no tiene por qué coincidir
con el orden visual.

```css
.detalle-encabezado {
  position: relative; overflow: hidden;
  margin: calc(-1 * var(--e4)) calc(-1 * var(--e4)) var(--e4);
  padding: var(--e5) var(--e4) var(--e4);
  border-bottom: 1px solid var(--borde);
}
/* degradado del color del grupo, muy tenue: es fondo, no información */
.detalle-encabezado::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background:
    radial-gradient(120% 100% at 0% 0%,
      color-mix(in srgb, var(--grupo) 16%, transparent) 0%,
      transparent 70%),
    var(--fondo);
}
[data-tema="maximo"] .detalle-encabezado::before { background: #000; }
[data-tema="maximo"] .detalle-encabezado { border-bottom-width: var(--grosor-2); }

.detalle-posicion {
  font-size: var(--t-etiqueta); font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em; color: var(--texto-suave);
}
.detalle-nombre {
  margin: var(--e1) 0 var(--e3);
  font-size: var(--t-titulo); font-weight: 800; line-height: 1.15;
  letter-spacing: -.015em; text-wrap: balance;
}
.detalle-meta { display: flex; align-items: center; gap: var(--e2); flex-wrap: wrap; margin: 0; }
.detalle-equipo { font-size: var(--t-menor); color: var(--texto-suave); }
```

```html
<header class="detalle-encabezado" data-grupo="pecho">
  <p class="detalle-posicion">Ejercicio 3 de 8 · Martes</p>
  <h2 class="detalle-nombre">Press inclinado con barra</h2>
  <p class="detalle-meta">
    <span class="pildora-grupo" data-grupo="pecho">
      <span class="inicial" aria-hidden="true">PE</span>Pecho
    </span>
    <span class="detalle-equipo">Banco inclinado y barra</span>
  </p>
</header>
```

`color-mix(in srgb, …)` está soportado en Safari 16.2+ / iOS 16.2+. Reserva para
navegadores viejos: el `radial-gradient` se ignora entero y queda `var(--fondo)`,
que es exactamente el aspecto actual. Degradación limpia.

### 8.8 · Lista de pasos numerados

**Qué cambia.** El número deja de ser un círculo relleno de acento (que compite
con los botones) y pasa a ser **una cifra grande y tenue en su propia columna**,
con una línea guía vertical que conecta los pasos. Se lee como una receta.

```css
.pasos { margin: 0; padding: 0; list-style: none; counter-reset: paso; }
.pasos li {
  counter-increment: paso;
  position: relative;
  display: grid; grid-template-columns: 30px 1fr; gap: var(--e3);
  padding: var(--e3) 0 var(--e3) 0;
}
.pasos li + li { border-top: 1px solid var(--borde); }

.pasos li::before {
  content: counter(paso);
  grid-column: 1;
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-seccion); font-weight: 800; line-height: 1.35;
  color: var(--acento);
  text-align: right;
}
/* línea guía que une los pasos */
.pasos li::after {
  content: ""; position: absolute; left: 14px; top: 2.4em; bottom: 0;
  width: 2px; background: var(--borde);
}
.pasos li:last-child::after { display: none; }

[data-tema="maximo"] .pasos li::after { width: 3px; background: var(--borde); }
```

Ventaja secundaria: al no haber un círculo de 26 px, la cifra escala con
`--escala` sin deformarse. Hoy el círculo es de tamaño fijo y al 180 % el número
se sale.

### 8.9 · Bloque de series (el corazón de la pantalla)

**Qué cambia.** Pasa de «un `h3` + un número + dos botones grandes vacíos» a un
panel con tres zonas: **objetivo** (versalita), **estado** (puntos de serie +
cifra), **acción** (un botón primario que ocupa el ancho, con − y + secundarios
a los lados). Y aparece el peso con memoria.

```css
.series-panel {
  background: var(--superficie-1);
  border: 2px solid var(--borde-fuerte);
  border-radius: var(--radio-3);
  box-shadow: var(--sombra-2);
  padding: var(--e4);
}

.series-objetivo {
  margin: 0 0 var(--e3);
  font-size: var(--t-etiqueta); font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em; color: var(--texto-suave);
}

/* --- puntos de serie: 4 casillas, no un número suelto --- */
.series-puntos { display: flex; gap: var(--e2); margin-bottom: var(--e3); }
.series-punto {
  flex: 1; height: 12px; border-radius: var(--radio-full);
  background: var(--superficie-2);
  border: 1px solid var(--borde);
}
.series-punto[data-hecha="si"] { background: var(--ok); border-color: var(--ok); }

/* --- cifra + etiqueta en una sola línea legible --- */
.series-estado {
  display: flex; align-items: baseline; gap: var(--e2); margin-bottom: var(--e4);
}
.series-numero {
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-cifra); font-weight: 800; line-height: 1;
  letter-spacing: -.02em; margin: 0;
}
.series-etiqueta { margin: 0; font-size: var(--t-menor); color: var(--texto-suave); }

/* --- acción: primario ancho, ajustes a los lados --- */
.series-acciones { display: grid; grid-template-columns: var(--toque) 1fr var(--toque); gap: var(--e2); }
.series-ajuste {
  display: grid; place-items: center;
  min-height: var(--toque); font-size: var(--t-seccion); font-weight: 800; font-family: inherit;
  background: var(--superficie-2); color: var(--texto);
  border: 1px solid var(--borde-fuerte); border-radius: var(--radio-2);
  cursor: pointer;
}

/* --- peso con memoria --- */
.peso-fila {
  display: grid; grid-template-columns: 1fr auto; align-items: end; gap: var(--e3);
  margin-top: var(--e4); padding-top: var(--e4); border-top: 1px solid var(--borde);
}
.campo-peso {
  width: 100%; min-height: var(--toque);
  font-size: var(--t-cuerpo-fuerte); font-family: var(--fuente-num);
  font-variant-numeric: tabular-nums;
  padding: var(--e2) var(--e3);
  background: var(--superficie-2); color: var(--texto);
  border: 1px solid var(--borde-fuerte); border-radius: var(--radio-2);
}
.campo-peso::placeholder { color: var(--texto-suave); opacity: 1; }
/* «la vez pasada» es un BOTÓN: se toca y copia el valor al campo (§3.7-2) */
.peso-anterior {
  min-height: var(--toque); padding: 0 var(--e2);
  font-size: var(--t-menor); color: var(--texto-suave);
  text-align: right; white-space: nowrap;
  background: transparent; border: 1px dashed var(--borde-fuerte);
  border-radius: var(--radio-2); font-family: inherit; cursor: pointer;
}
.peso-anterior b {
  display: block; font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-seccion); font-weight: 800; color: var(--texto);
}
/* unidad en versalitas del color del dato — patrón Apple (§3.2) */
.peso-anterior b u {
  font-size: var(--t-etiqueta); font-weight: 700; text-decoration: none;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--texto-suave); margin-left: 2px;
}
```

```html
<section class="series-panel" aria-labelledby="obj">
  <p class="series-objetivo" id="obj">Objetivo · 3 a 4 series de 10 a 15 reps</p>

  <div class="series-puntos" role="img" aria-label="2 de 4 series hechas">
    <span class="series-punto" data-hecha="si"></span>
    <span class="series-punto" data-hecha="si"></span>
    <span class="series-punto"></span>
    <span class="series-punto"></span>
  </div>

  <p class="series-estado">
    <span class="series-numero" id="numSeries" aria-live="polite">2</span>
    <span class="series-etiqueta">series hechas</span>
  </p>

  <div class="series-acciones">
    <button class="series-ajuste" aria-label="Quitar una serie">−</button>
    <button class="btn-grande btn-principal">✓ Serie hecha · descansar 60 s</button>
    <button class="series-ajuste" aria-label="Sumar una serie">+</button>
  </div>

  <div class="peso-fila">
    <label>
      <span class="etiqueta">Peso que estás usando</span>
      <input class="campo-peso" inputmode="decimal" placeholder="20 kg">
    </label>
    <button class="peso-anterior" id="btnPesoAnterior"
            aria-label="Usar el peso de la vez pasada: 17,5 kilos">
      la vez pasada<b>17,5<u>kg</u></b>
    </button>
  </div>
</section>
```

Tocar «la vez pasada» rellena el campo. Son tres líneas:

```js
document.getElementById("btnPesoAnterior").addEventListener("click", function () {
  var campo = document.getElementById("campoPeso");
  campo.value = pesoGuardado;
  Guardado.guardarPeso(idPersona, clave, pesoGuardado);
});
```

> Los puntos de serie son **redundantes**: el `role="img"` con `aria-label`
> escrito («2 de 4 series hechas») y la cifra grande dicen lo mismo. Nadie
> depende del color de los puntos.

### 8.10 · Temporizador a pantalla completa

**Qué cambia.** Pasa a ser opaco y a pantalla completa (nada de contenido
fantasma detrás), gana **anillo de progreso SVG** (§9.1), la cifra sube a
`--t-display` y el botón peligroso deja de ser el más llamativo: «Terminar» pasa
a contorno y «+30 s» a relleno secundario. Aparece además el nombre del
ejercicio que viene, que es la información que el usuario quiere durante el
descanso.

```css
.temporizador {
  position: fixed; inset: 0; z-index: 50;
  display: grid; grid-template-rows: 1fr auto;
  align-items: center; justify-items: center;
  padding: var(--e5) var(--e4) calc(var(--e5) + env(safe-area-inset-bottom));
  background: var(--fondo);                 /* opaco, no rgba */
}
[data-tema="oscuro"] .temporizador {
  background:
    radial-gradient(80% 60% at 50% 30%, var(--superficie-1) 0%, var(--fondo) 100%);
}
[data-tema="maximo"] .temporizador { background: #000; }

.temporizador-centro { display: grid; justify-items: center; gap: var(--e3); }
.temporizador-etiqueta {
  margin: 0; font-size: var(--t-etiqueta); font-weight: 800;
  text-transform: uppercase; letter-spacing: .12em; color: var(--texto-suave);
}
.temporizador-anillo { position: relative; width: min(66vw, 15em); aspect-ratio: 1; }
.temporizador-numero {
  position: absolute; inset: 0; display: grid; place-items: center; margin: 0;
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-display); font-weight: 800; line-height: 1; letter-spacing: -.03em;
}
.temporizador-siguiente {
  max-width: 22ch; text-align: center;
  font-size: var(--t-menor); color: var(--texto-suave);
}
.temporizador-siguiente b { display: block; font-size: var(--t-cuerpo-fuerte);
                            font-weight: 700; color: var(--texto); }

.temporizador-acciones { display: grid; grid-template-columns: 1fr 1fr; gap: var(--e3);
                         width: 100%; max-width: 26rem; }
.temporizador-acciones .btn-grande { justify-content: center; margin: 0; }
.btn-contorno {
  background: transparent; color: var(--texto);
  border: 2px solid var(--borde-fuerte);
}
```

```html
<div class="temporizador" role="timer" aria-live="assertive">
  <div class="temporizador-centro">
    <p class="temporizador-etiqueta">Descanso</p>
    <div class="temporizador-anillo"><!-- SVG de §9.1 -->
      <p class="temporizador-numero" id="temporizadorNumero">42</p>
    </div>
    <p class="temporizador-siguiente">Después viene<b>Fondos de pecho</b></p>
  </div>
  <div class="temporizador-acciones">
    <button class="btn-grande btn-secundario" id="btnMasTiempo">+30 s</button>
    <button class="btn-grande btn-contorno"  id="btnPararTiempo">Terminar</button>
  </div>
</div>
```

### 8.11 · Avisos

**Qué cambia.** Hoy hay un solo aviso (`.aviso`, franja ámbar). Se convierte en
una familia de tres con **icono dibujado en CSS**, título en versalita y color
semántico que **nunca es lo único** que los distingue.

```css
.aviso {
  display: grid; grid-template-columns: 28px 1fr; gap: var(--e3);
  padding: var(--e4);
  background: var(--superficie-1);
  border: 1px solid var(--borde);
  border-left: 5px solid var(--aviso-color, var(--alerta));
  border-radius: var(--radio-2);
  font-size: var(--t-cuerpo);
}
.aviso::before {
  content: var(--aviso-glifo, "!");
  display: grid; place-items: center;
  width: 28px; height: 28px; border-radius: var(--radio-full);
  background: var(--aviso-color, var(--alerta));
  color: var(--aviso-contra, var(--alerta-texto));
  font-size: var(--t-menor); font-weight: 900; line-height: 1;
}
.aviso h3, .aviso strong:first-child {
  display: block; margin: 0 0 var(--e1);
  font-size: var(--t-etiqueta); font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--aviso-color, var(--alerta));
}
.aviso p { margin: 0; }
.aviso p + p { margin-top: var(--e2); }

.aviso--cuidado  { --aviso-color: var(--alerta);  --aviso-contra: var(--alerta-texto);  --aviso-glifo: "!"; }
.aviso--peligro  { --aviso-color: var(--peligro); --aviso-contra: var(--peligro-texto); --aviso-glifo: "✕"; }
.aviso--consejo  { --aviso-color: var(--acento);  --aviso-contra: var(--acento-texto);  --aviso-glifo: "i"; }
.aviso--logro    { --aviso-color: var(--ok);      --aviso-contra: var(--ok-texto);      --aviso-glifo: "✓"; }

[data-tema="maximo"] .aviso { border-width: var(--grosor-2); border-left-width: var(--grosor-3); }
```

**Esto arregla el bug de §2**: el título del aviso ya no vive sobre
`--superficie-3` sino sobre `--superficie-1`, donde `--alerta` da **10,04:1** en
claro y **11,40:1** en oscuro. Y en tema Máximo el aviso se distingue del texto
normal por el grosor del borde izquierdo (4 px) y el glifo, no por el color —
que allí es el mismo amarillo para todo.

Uso en la app:

| Contenido actual | Clase |
|---|---|
| `p.notaImportante` de la persona | `.aviso--cuidado` |
| campo `ojo` con «SIN SALTO» | `.aviso--peligro` |
| campo `ojo` normal | `.aviso--cuidado` |
| «Las fotos son de un movimiento parecido» | `.aviso--consejo` |
| «Día terminado» (nuevo, §9.4) | `.aviso--logro` |

### 8.12 · Botones — jerarquía en tres niveles

Hoy `btn-principal` (relleno de acento) se usa para «Léemelo en voz alta»,
«Empezar el entreno», «Entrenar este día» y «Serie hecha». Cuatro cosas
distintas con el mismo peso. Se define:

| Nivel | Clase | Aspecto | Regla |
|---|---|---|---|
| 1 | `.btn-principal` | relleno de acento | **uno por pantalla**, la acción que la pantalla existe para hacer |
| 2 | `.btn-secundario` | `--superficie-2` + `--borde-fuerte` | acciones frecuentes |
| 3 | `.btn-contorno` | transparente + borde | acciones reversibles o de salida |
| — | `.btn-texto` | sin caja, subrayado | enlaces (video) |

```css
.btn-grande {
  display: flex; align-items: center; justify-content: flex-start; gap: var(--e3);
  width: 100%; min-height: var(--toque);
  padding: var(--e3) var(--e4);
  font-size: var(--t-cuerpo-fuerte); font-weight: 600; font-family: inherit;
  text-align: left; text-decoration: none;
  background: var(--superficie-1); color: var(--texto);
  border: 1px solid var(--borde); border-radius: var(--radio-2);
  cursor: pointer;
}
.btn-principal {
  min-height: var(--toque-primario);        /* 58 px: dedos sudados (§3.1) */
  background: var(--acento); color: var(--acento-texto);
  border: 2px solid var(--acento); font-weight: 800;
  box-shadow: var(--sombra-2);
  justify-content: center;
}
.btn-secundario { background: var(--superficie-2); border-color: var(--borde-fuerte); }
.btn-contorno   { background: transparent; border: 2px solid var(--borde-fuerte); }
.btn-grande[disabled], .btn-grande[aria-disabled="true"] {
  opacity: 1;                                   /* ← el bug de §2 */
  background: var(--superficie-2);
  color: var(--texto-inactivo);
  border-color: var(--borde);
  cursor: not-allowed;
}
```

En la pantalla del ejercicio: `.btn-principal` = «Serie hecha».
«Léemelo en voz alta» baja a `.btn-secundario` con icono, y sube arriba del
todo en una fila junto a «Ver video» (dos acciones de ayuda, una fila).

### 8.13 · Foco

```css
:focus-visible {
  outline: 3px solid var(--foco);
  outline-offset: 3px;
  border-radius: var(--radio-1);
}
```

`--foco` es **ámbar en oscuro**, **granate en claro** y **blanco en máximo** —
deliberadamente distinto del acento, para que el anillo de foco se vea también
cuando cae sobre un botón relleno de acento. Hoy `outline: 3px solid
var(--acento)` sobre un `.btn-principal` es invisible.

Ratios del anillo (contraste con lo que tiene alrededor, WCAG 1.4.11 pide 3:1):
ámbar `#FFC85C` sobre `--fondo` **12,59** ✅ y sobre `--acento` `#5CD5F5`
**1,11** ⚠ — por eso el `outline-offset: 3px`, que separa el anillo del relleno
y lo deja sobre el fondo.

---

## 9. Cinco ideas de «wow» con CSS puro

Criterio de selección: cada una tiene que (a) hacerse con CSS/SVG sin librerías,
(b) mejorar la comprensión, no solo el aspecto, y (c) degradar sin romper nada.
Ninguna depende de una función CSS posterior a **Safari 16.4** (junio 2023),
salvo la nº 5 que es mejora pura.

### 9.1 · Anillo de progreso en SVG inline

Se usa en tres sitios: el **temporizador de descanso**, el **conteo del día** en
cada fila de día, y el **resumen semanal**. Es SVG y no `conic-gradient` por
cuatro razones concretas: `stroke-linecap: round` (imposible en conic), el
antialiasing del arranque del ángulo se ve dentado en Safari, `stroke-dashoffset`
se anima nativamente sin `@property`, y —la decisiva— **un `conic-gradient`
desaparece por completo en `forced-colors: active`**, mientras que un `stroke`
respeta `CanvasText`. Para un usuario de alto contraste, el anillo tiene que
sobrevivir.

```html
<div class="anillo" style="--p:65" role="img" aria-label="Quedan 39 de 60 segundos">
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle class="anillo-pista"     cx="50" cy="50" r="44"></circle>
    <circle class="anillo-progreso"  cx="50" cy="50" r="44"></circle>
  </svg>
  <span class="anillo-centro">39</span>
</div>
```

```css
.anillo { position: relative; display: grid; place-items: center; }
.anillo svg {
  width: 100%; height: 100%;
  transform: rotate(-90deg);          /* empieza arriba */
}
.anillo circle {
  fill: none;
  stroke-width: 8;                    /* en unidades del viewBox: escala solo */
  vector-effect: non-scaling-stroke;
}
.anillo-pista    { stroke: var(--superficie-3); }
.anillo-progreso {
  stroke: var(--acento);
  stroke-linecap: round;
  /* circunferencia = 2 × π × 44 = 276.46 */
  stroke-dasharray: 276.46;
  stroke-dashoffset: calc(276.46 * (1 - var(--p) / 100));
  transition: stroke-dashoffset var(--t-media) linear;
}
.anillo-centro {
  position: absolute;
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-weight: 800; line-height: 1;
}

/* --- cambia de color en la recta final: tres estados, con voz y vibración
       que ya existen como refuerzo no visual --- */
.anillo[data-fase="final"] .anillo-progreso { stroke: var(--alerta); }
.anillo[data-fase="ya"]    .anillo-progreso { stroke: var(--ok); }

/* --- tema máximo: pista discontinua para que se vea sin depender del color --- */
[data-tema="maximo"] .anillo-pista {
  stroke: var(--borde); stroke-opacity: 1;
  stroke-dasharray: 4 8;
}
[data-tema="maximo"] .anillo circle { stroke-width: 10; }

/* --- colores forzados del sistema --- */
@media (forced-colors: active) {
  .anillo-pista    { stroke: CanvasText; stroke-opacity: .35; }
  .anillo-progreso { stroke: Highlight; }
}
@media (prefers-reduced-motion: reduce) {
  .anillo-progreso { transition: none; }
}
```

Y en `cronometro.js`, dos líneas dentro de `pintar()`:

```js
var pct = Math.round(restante() / totalSegundos * 100);
caja.querySelector(".anillo").style.setProperty("--p", pct);
caja.querySelector(".anillo").dataset.fase = s <= 3 ? "ya" : (s <= 10 ? "final" : "normal");
```

**Contraste del anillo** (WCAG 1.4.11 pide 3:1 para gráficos informativos):
`--acento` `#5CD5F5` sobre `--superficie-3` `#26333F` = **7,55:1** ✅ y sobre
`--fondo` = **11,32:1** ✅. La pista sobre el fondo es 1,50:1, pero la pista no
es informativa (informa el arco lleno) y además **el número siempre está
escrito en el centro**, que es la fuente real del dato.

**Variante compacta para la fila de día** (36 px, con el conteo dentro):

```html
<span class="anillo anillo--mini" style="--p:37"
      role="img" aria-label="3 de 8 ejercicios hechos">
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle class="anillo-pista" cx="50" cy="50" r="42"></circle>
    <circle class="anillo-progreso" cx="50" cy="50" r="42"></circle>
  </svg>
  <span class="anillo-centro">3<small>/8</small></span>
</span>
```

```css
.anillo--mini { width: 44px; height: 44px; }
.anillo--mini circle { stroke-width: 12; }
.anillo--mini .anillo-progreso { stroke: var(--ok); stroke-dasharray: 263.89; }
.anillo--mini .anillo-centro { font-size: var(--t-menor); }
.anillo--mini .anillo-centro small { font-size: .75em; color: var(--texto-suave); }
```

Esto sustituye a la barra de progreso suelta de `06-dia` y al texto «17
ejercicios» de `02-semana`: **la fila de día pasa a decir de un vistazo cuánto
llevas hecho**, que es lo que hoy no dice.

### 9.2 · Encabezado con degradado del grupo muscular

Ya especificado en §8.7. Lo que lo hace «wow» sin romper nada:

- El degradado es **radial y muy tenue (16 %)**: nunca es fondo de texto crítico,
  porque el texto vive sobre la parte que ya es `--fondo` puro. Aun en la esquina
  más teñida, `--texto` sobre la mezcla más fuerte da **≥15:1**.
- Se calcula con `color-mix()`, así que **un solo bloque CSS sirve para los tres
  temas** — y en máximo se anula a negro.
- Es la única señal ambiental de la app: al pasar de un ejercicio de pecho a uno
  de tríceps, el color de la cabecera cambia. Nadie tiene que leerlo, pero el
  cerebro lo registra.

Extensión: la misma idea, aplicada a toda la página en la vista del día, como un
**velo de 180 px pegado arriba**:

```css
.contenido[data-grupo]::before {
  content: ""; position: fixed; inset: 0 0 auto; height: 180px; z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--grupo) 14%, transparent),
    transparent);
}
[data-tema="maximo"] .contenido[data-grupo]::before { display: none; }
@supports not (color: color-mix(in srgb, red, blue)) {
  .contenido[data-grupo]::before { display: none; }
}
```

### 9.3 · Miniaturas con máscara: se acabaron los rectángulos blancos

El defecto más visible de `03-lista-todos.png`. Las fotos son de gimnasio, con
fondos claros y ruidosos; sobre un tema oscuro cada una es una lámpara. La
solución no es cambiar las fotos: es enmarcarlas.

```css
.marco-foto {
  position: relative; overflow: hidden;
  border-radius: var(--radio-1);
  background: var(--superficie-2);
  border: 1px solid var(--borde);
  isolation: isolate;
}
.marco-foto img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* viñeta que funde el borde de la foto con la superficie */
.marco-foto::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--texto) 8%, transparent),
              inset 0 -18px 24px -18px var(--fondo);
}

[data-tema="oscuro"] .marco-foto img { filter: brightness(.9) saturate(.85) contrast(1.08); }
[data-tema="claro"]  .marco-foto img { filter: saturate(.95) contrast(1.03); }
[data-tema="maximo"] .marco-foto img { filter: grayscale(1) contrast(1.6) brightness(.8); }
[data-tema="maximo"] .marco-foto      { border-width: var(--grosor-2); }
[data-tema="maximo"] .marco-foto::after { box-shadow: none; }
```

Y para las dos fotos grandes del detalle, un pie **superpuesto** en vez de una
franja aparte, que ahorra 30 px por foto y las hace verse más grandes:

```css
.fotos { display: grid; grid-template-columns: 1fr 1fr; gap: var(--e2); }
.foto-caja { aspect-ratio: 4 / 3; }
.foto-pie {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: var(--e3) var(--e2) var(--e2);
  background: linear-gradient(to top, var(--fondo) 20%, transparent);
  color: var(--texto);
  font-size: var(--t-etiqueta); font-weight: 800;
  text-transform: uppercase; letter-spacing: .06em; text-align: center;
}
[data-tema="maximo"] .foto-pie {
  position: static; background: #000; color: var(--texto);
  border-top: var(--grosor-2) solid var(--borde);
}
```

En tema máximo el pie vuelve a ser una franja opaca: sobre un degradado no se
puede garantizar 19,56:1.

### 9.4 · Estados finales con carácter (y el estado vacío)

Hoy no existe ningún estado final. Cuando terminas los 8 ejercicios del martes,
la pantalla se queda exactamente igual. Y cuando filtras un día sin resultados,
sale una tarjeta con «No hay ejercicios para ese filtro».

**a) Día completado** — reemplaza la lista por una tarjeta de cierre:

```css
.cierre {
  display: grid; place-items: center; gap: var(--e4);
  padding: var(--e6) var(--e4);
  text-align: center;
  background: var(--superficie-1);
  border: 2px solid var(--ok);
  border-radius: var(--radio-3);
}
.cierre-marca {
  display: grid; place-items: center;
  width: 4.2em; height: 4.2em; border-radius: var(--radio-full);
  background: var(--ok); color: var(--ok-texto);
  font-size: var(--t-seccion); font-weight: 900;
}
.cierre h2 { margin: 0; font-size: var(--t-titulo); }
.cierre p  { margin: 0; color: var(--texto-suave); }
.cierre-datos {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--e3);
  width: 100%; margin-top: var(--e2);
}
.cierre-dato {
  padding: var(--e3) var(--e2);
  background: var(--superficie-2); border-radius: var(--radio-2);
}
.cierre-dato b {
  display: block;
  font-family: var(--fuente-num); font-variant-numeric: tabular-nums;
  font-size: var(--t-cifra); font-weight: 800; line-height: 1;
}
.cierre-dato span { font-size: var(--t-etiqueta); text-transform: uppercase;
                    letter-spacing: .08em; color: var(--texto-suave); }

/* Un solo pulso, 700 ms, y se acabó. Nada de confeti infinito. */
@keyframes cierre-entra {
  from { transform: scale(.86); opacity: 0; }
  60%  { transform: scale(1.04); }
  to   { transform: scale(1); opacity: 1; }
}
.cierre-marca { animation: cierre-entra 700ms var(--curva) both; }
```

```html
<section class="cierre">
  <span class="cierre-marca" aria-hidden="true">✓</span>
  <h2>Martes terminado</h2>
  <p>Pecho y tríceps, completo. Toca cardio y a casa.</p>
  <div class="cierre-datos">
    <p class="cierre-dato"><b>8</b><span>ejercicios</span></p>
    <p class="cierre-dato"><b>26</b><span>series</span></p>
    <p class="cierre-dato"><b>48</b><span>minutos</span></p>
  </div>
</section>
```

El texto «Martes terminado» es lo que anuncia VoiceOver; la animación y el verde
son adorno puro. Bajo `prefers-reduced-motion` la animación desaparece y no se
pierde nada.

**b) Estado vacío del filtro** — con carácter, no con una caja gris:

```css
.vacio {
  display: grid; place-items: center; gap: var(--e3);
  padding: var(--e7) var(--e4); text-align: center;
  border: 2px dashed var(--borde-fuerte);
  border-radius: var(--radio-3);
  color: var(--texto-suave);
}
.vacio-glifo { font-size: var(--t-cifra); line-height: 1; opacity: 1; }
.vacio h3 { margin: 0; color: var(--texto); font-size: var(--t-seccion); }
```

```html
<div class="vacio">
  <span class="vacio-glifo" aria-hidden="true">🗓</span>
  <h3>El domingo descansas</h3>
  <p>No hay nada asignado. Nos vemos el lunes con funcional de cuerpo completo.</p>
  <button class="btn-secundario btn-grande">Ver el lunes</button>
</div>
```

Regla: **todo estado vacío ofrece una salida**. Hoy son callejones sin salida.

### 9.5 · Transición de pantalla

La app cambia de vista reescribiendo `contenido.innerHTML` y saltando al scroll
0. Es instantáneo y desorientador, sobre todo con la lupa activa (ves un 20 % de
la pantalla y de repente todo es otra cosa). Dos capas, la segunda opcional:

**Capa 1 — animación de entrada (funciona en todo, desde siempre):**

```css
@keyframes entra-vista {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
.contenido > * {
  animation: entra-vista var(--t-media) var(--curva) both;
}
/* escalonado suave: solo los 6 primeros, para no retrasar nada */
.contenido > *:nth-child(1) { animation-delay: 0ms; }
.contenido > *:nth-child(2) { animation-delay: 25ms; }
.contenido > *:nth-child(3) { animation-delay: 50ms; }
.contenido > *:nth-child(4) { animation-delay: 75ms; }
.contenido > *:nth-child(5) { animation-delay: 100ms; }
.contenido > *:nth-child(n+6) { animation-delay: 120ms; }
```

**Capa 2 — View Transitions (Safari 18.0+, mejora pura):**

```js
/* en app.js, dentro de enrutar() */
function pintar(fn) {
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(fn);
  } else { fn(); }
}
```

```css
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: 220ms;
  animation-timing-function: var(--curva);
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
  .contenido > * { animation: none !important; }
}
```

Duración deliberadamente corta (**220 ms**): las transiciones largas marean y,
con zoom de pantalla, desorientan. Se comprueba `prefers-reduced-motion` **dos
veces** (en CSS y en JS) porque `startViewTransition` congela la pantalla durante
la captura y eso ya es movimiento aunque la animación esté a 0.

### 9.6 · Extra: el tema Máximo se activa solo

Una línea que no cuesta nada y que resuelve el «¿cómo sabe él que existe el
tema máximo?»:

```css
@media (prefers-contrast: more) {
  :root:not([data-tema]) {
    /* mismos valores que [data-tema="maximo"] */
  }
}
```

Mejor aún, en `app.js`, al arrancar y solo si el usuario nunca eligió tema:

```js
if (!prefs.temaElegidoPorUsuario &&
    window.matchMedia("(prefers-contrast: more)").matches) {
  prefs.tema = "maximo";
}
```

iOS expone `prefers-contrast: more` cuando el usuario activa **Ajustes →
Accesibilidad → Pantalla y tamaño de texto → Aumentar contraste**. Si Anderson
ya lo tiene activado en el sistema, la app se pone en Máximo la primera vez que
la abre, sin que nadie tenga que explicarle nada.

---

## 10. Plan de aplicación por fases

Ordenado por **relación beneficio/riesgo**. Cada fase deja la app funcionando y
las pruebas en verde.

### Fase 0 — Bugs de contraste (30 min, cero rediseño)

1. Sustituir `opacity: .4` de `.btn-grande[disabled]` por `--texto-inactivo`.
2. Declarar `::placeholder`.
3. Subir el umbral de `prueba-pwa.js` de 4,5 a 7.
4. Mover `.aviso strong` fuera de `--fondo-3`.

Se puede hacer hoy, es independiente de todo lo demás y arregla cuatro fallos
AAA reales.

### Fase 1 — Tokens (2 h)

Reemplazar el bloque `:root` y los dos bloques de tema por los de §4.5, §4.2,
§4.3, §4.4. Añadir `--radio-1..3`, `--e0..e7`, la escala tipográfica y las
variables de movimiento. **No tocar ni un componente todavía**: solo cambiar los
nombres viejos por los nuevos con un buscar-y-reemplazar
(`--fondo-2` → `--superficie-1`, `--fondo-3` → `--superficie-2`,
`--radio` → `--radio-2`). La app cambiará de aspecto sin cambiar de estructura,
y ya se verá mucho mejor.

### Fase 2 — Los cuatro componentes que más pesan (medio día)

En este orden:

1. **Bloque de series** (§8.9) + **reorden de la pantalla de ejercicio** (§8.7).
   Es el cambio de mayor impacto de todo el documento.
2. **Fila de día** (§8.3) con anillo mini (§9.1) y descansos colapsados.
3. **Encabezado de grupo sticky** (§8.6) + **fila de ejercicio** (§8.5).
4. **Temporizador** (§8.10) con anillo (§9.1).

### Fase 3 — El resto (medio día)

Barra superior (§8.1), chips (§8.4), avisos (§8.11), pasos (§8.8), tarjeta de
persona (§8.2), botones (§8.12), foco (§8.13).

### Fase 4 — Wow (2 h)

Degradado de grupo (§9.2), marcos de foto (§9.3), estados finales (§9.4),
transiciones (§9.5), `prefers-contrast` (§9.6).

### Cambios necesarios en JS (todos pequeños)

| Archivo | Cambio | Líneas |
|---|---|---|
| `app.js` | `claveGrupo()` + `data-grupo` en filas, encabezados y detalle | ~6 |
| `app.js` | `--progreso` en `:root` al entrar en una vista de día | 1 |
| `app.js` | anillo mini en la fila de día (`--p`) | 2 |
| `app.js` | reordenar `bloqueEjercicio()` / `vistaEjercicio()` | mover bloques |
| `app.js` | puntos de serie (`.series-punto`) | ~5 |
| `app.js` | «la vez pasada» leyendo `Guardado.peso()`, y tocarla para copiarla | ~6 |
| `app.js` | vibración corta `[12]` al marcar serie y `[60,60,60,60,200]` al cerrar el día | ~3 |
| `app.js` | `pintar()` con `startViewTransition` | ~5 |
| `app.js` | detectar `prefers-contrast: more` | ~4 |
| `cronometro.js` | `--p` y `data-fase` en `pintar()`; total en `iniciar()` | ~4 |
| `index.html` | estructura del temporizador con el SVG del anillo | ~10 |

Nada de esto cambia los datos, ni el enrutado, ni la lógica de guardado.

---

## 11. Cómo se verifica

### 11.1 · Ampliar `prueba-pwa.js`

```js
/* 1. Umbral AAA de verdad */
if (r < 7) fallo(`contraste tema ${tema}: "${p.etiqueta}" = ${r.toFixed(1)}:1 (minimo 7)`);

/* 2. Comprobar TODOS los tokens contra TODAS las superficies,
      no solo los pares que aparecen en pantalla */
const TEXTOS = ["--texto", "--texto-suave", "--acento", "--ok", "--alerta", "--peligro"];
const FONDOS = ["--fondo", "--superficie-1", "--superficie-2", "--superficie-3"];
/* 6 × 4 = 24 pares por tema, 72 en total. Todos deben dar ≥ 7. */

/* 3. Los 11 colores de grupo contra las 4 superficies: 44 pares por tema. */

/* 4. Bordes fuertes ≥ 3:1 (WCAG 1.4.11) */

/* 5. Ningún elemento con opacity < 1 que contenga texto */
const opacos = await page.$$eval("*", els => els
  .filter(e => e.textContent.trim() && +getComputedStyle(e).opacity < 1)
  .map(e => e.className));
```

### 11.2 · Añadir a `prueba-visual.js`

- **Text Spacing (WCAG 1.4.12)**: inyectar `line-height:1.5 !important;
  letter-spacing:.12em !important; word-spacing:.16em !important;
  p{margin-bottom:2em !important}` y comprobar que nada se solapa ni se corta.
- **Reflow (WCAG 1.4.10)**: viewport de 320 px con `--escala: 1.8` → cero scroll
  horizontal.
- **Áreas tocables**: ya existe; añadir que se cumplan también a `--escala: .9`.
- **`prefers-reduced-motion`**: emularlo y comprobar que
  `getComputedStyle(el).transitionDuration` es `0s` en todo.
- **`forced-colors: active`**: emularlo y comprobar que el anillo de progreso
  sigue teniendo trazo visible.
- **Capturas nuevas**: día completado, estado vacío, temporizador con anillo,
  y las tres pantallas clave en los tres temas (9 capturas).

### 11.3 · La verificación que no es automática

Una sola pregunta, en el gimnasio, con el teléfono en la mano y la luz de techo
encendida:

> «Sin leer nada: ¿qué te toca hacer ahora?»

Si la respuesta tarda más de dos segundos en la pantalla del ejercicio, el
rediseño no ha terminado.

---

## Apéndice · Resumen de tokens en un solo bloque

```css
/* ============================================================
   SISTEMA DE DISEÑO — MI ENTRENO
   Todos los pares texto/fondo ≥ 7:1 (WCAG 2.2 AAA) en los tres temas.
   ============================================================ */
:root {
  /* --- escala y medidas --- */
  --escala: 1;
  --base: calc(17px * var(--escala));
  --toque: 48px;  --toque-primario: 58px;

  --radio-1: 8px;  --radio-2: 14px;  --radio-3: 20px;  --radio-full: 999px;
  --e0: 2px; --e1: 4px; --e2: 8px;  --e3: 12px;
  --e4: 16px; --e5: 24px; --e6: 32px; --e7: 48px;

  /* --- tipografía --- */
  --fuente:      system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --fuente-num:  ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --fuente-mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;

  --t-display: 3.6em;  --t-cifra: 2.4em;      --t-titulo: 1.45em;
  --t-seccion: 1.15em; --t-cuerpo-fuerte: 1em; --t-cuerpo: 1em;
  --t-menor: .875em;   --t-etiqueta: .75em;

  /* --- movimiento --- */
  --t-rapida: 120ms; --t-media: 200ms;
  --curva: cubic-bezier(.2,.7,.3,1);
}

/* ---------------- TEMA OSCURO (por defecto) ---------------- */
:root, [data-tema="oscuro"] {
  --fondo: #0A0E14; --superficie-1: #121A24;
  --superficie-2: #1B2634; --superficie-3: #26333F;
  --texto: #F2F7FC; --texto-suave: #BFCCDA; --texto-inactivo: #8FA0B4;
  --borde: #2E3B4C; --borde-fuerte: #54687F;
  --acento: #5CD5F5; --acento-texto: #04121A; --acento-suave: #103444;
  --ok: #6EE7A0; --ok-texto: #04220C;
  --alerta: #FFC85C; --alerta-texto: #1A0E00;
  --peligro: #FFB4A8; --peligro-texto: #2A0400;
  --foco: #FFC85C;
  --sombra-1: 0 1px 2px rgba(0,0,0,.55);
  --sombra-2: 0 4px 14px rgba(0,0,0,.55);

  --g-pecho:#FFAAA3; --g-espalda:#A0C0FF; --g-hombros:#67D9EC; --g-biceps:#7BE3A4;
  --g-triceps:#CCB4FF; --g-pierna:#FFC46B; --g-gluteos:#FFA4D5; --g-abdomen:#DDE26E;
  --g-pantorrilla:#5EDCC6; --g-lumbar:#FFB88C; --g-antebrazos:#B8C6D8;
  --g-contra: #08121A;
}

/* ---------------- TEMA CLARO ---------------- */
[data-tema="claro"] {
  --fondo: #F2F5F9; --superficie-1: #FFFFFF;
  --superficie-2: #E7EDF5; --superficie-3: #D8E1EC;
  --texto: #0B1220; --texto-suave: #334354; --texto-inactivo: #4F5E6E;
  --borde: #C2CFDE; --borde-fuerte: #70849C;
  --acento: #04486B; --acento-texto: #FFFFFF; --acento-suave: #D6E6F2;
  --ok: #095021; --ok-texto: #FFFFFF;
  --alerta: #5F3A00; --alerta-texto: #FFFFFF;
  --peligro: #8C0F1A; --peligro-texto: #FFFFFF;
  --foco: #8C0F1A;
  --sombra-1: 0 1px 2px rgba(11,18,32,.10);
  --sombra-2: 0 4px 14px rgba(11,18,32,.14);

  --g-pecho:#961D15; --g-espalda:#204B97; --g-hombros:#0E5563; --g-biceps:#115932;
  --g-triceps:#57379F; --g-pierna:#704400; --g-gluteos:#8C2164; --g-abdomen:#525000;
  --g-pantorrilla:#0B584E; --g-lumbar:#833711; --g-antebrazos:#3B4B60;
  --g-contra: #FFFFFF;
}

/* ---------------- TEMA MÁXIMO ---------------- */
[data-tema="maximo"] {
  --fondo: #000; --superficie-1: #000; --superficie-2: #000; --superficie-3: #000;
  --texto: #FFFF00; --texto-suave: #FFFF00; --texto-inactivo: #C8C800;
  --borde: #FFFF00; --borde-fuerte: #FFFF00;
  --acento: #FFFF00; --acento-texto: #000; --acento-suave: #000;
  --ok: #5CFF9A; --ok-texto: #000;
  --alerta: #FFFF00; --alerta-texto: #000;
  --peligro: #FF8A80; --peligro-texto: #000;
  --foco: #FFFFFF;
  --sombra-1: none; --sombra-2: none;
  --grosor-1: 1px; --grosor-2: 2px; --grosor-3: 4px;

  --g-pecho:#FFFF00; --g-espalda:#FFFF00; --g-hombros:#FFFF00; --g-biceps:#FFFF00;
  --g-triceps:#FFFF00; --g-pierna:#FFFF00; --g-gluteos:#FFFF00; --g-abdomen:#FFFF00;
  --g-pantorrilla:#FFFF00; --g-lumbar:#FFFF00; --g-antebrazos:#FFFF00;
  --g-contra: #000000;
}

@media (prefers-reduced-motion: reduce) {
  :root { --t-rapida: 0ms; --t-media: 0ms; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
```


