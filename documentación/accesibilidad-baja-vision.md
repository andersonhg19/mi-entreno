# Decisiones de accesibilidad para baja visión

El problema original, en palabras del usuario: *«me costó mucho alcanzar a leer
lo que dice ahí, no veo los dibujos, no me quedan claros los entrenos»*.

La hoja del gimnasio falla por cuatro razones a la vez:

1. **Letra diminuta** — 75 tarjetas en una hoja A3.
2. **Pictogramas de 2 cm** con líneas finas y flechas rojas sobre amarillo.
3. **Codificación por color** — si no distingues bien los colores, no sabes
   qué te toca hoy.
4. **Densidad** — todo el mes en una sola vista, sin jerarquía.

La app ataca las cuatro.

---

## 1. Tamaño de letra: **estándar**, no gigante

Esta decisión cambió después de la primera versión, y el motivo importa.

La primera versión salió con tipografía grande por defecto (20 px, botones de
64 px). Anderson lo probó y pidió lo contrario: **tamaños normales**. Sus
palabras: *«para ver letra suelo usar la lupa del iPhone, y haría un poco
engorrosa la experiencia para mi esposa»*.

Es la lección de fondo: una persona con baja visión **ya tiene** sus
herramientas —la lupa del sistema, el zoom del navegador, Dynamic Type— y están
mejor afinadas que cualquier cosa que invente una app. Agrandar todo «por
ayudar» rompe esas herramientas (al ampliar sobre algo ya ampliado cabe media
palabra por pantalla) y además convierte la app en algo incómodo para quien
comparte el teléfono o la mira por encima del hombro.

Lo que quedó:

- Base de **17 px**, el tamaño de sistema de iOS. Al 100 % la app se ve como
  cualquier app normal.
- Todo el texto se calcula desde **una sola variable CSS** (`--escala`).
  Nada usa `px` fijos, así que la lupa, el zoom por pellizco y Dynamic Type
  funcionan **encima** de esto sin pelearse con el diseño.
- Control **A− / A+** en la barra superior, de **90 % a 180 %**, para quien
  prefiera ampliar dentro de la app. La preferencia se guarda.
- El panel de ajustes lo dice explícitamente: *«Al 100 % la letra es del tamaño
  normal del sistema. La lupa del iPhone y el zoom del navegador funcionan
  encima de esto.»*

Lo que **no** se tocó al bajar los tamaños: el contraste, las áreas tocables,
la voz y la jerarquía. Esas siguen siendo accesibilidad de verdad; la letra
gigante era una suposición.

## 2. Contraste

Tres temas, los tres por encima del mínimo AAA de WCAG (7:1 en texto normal):

| Tema | Fondo | Texto | Uso |
|------|-------|-------|-----|
| Oscuro (por defecto) | `#0b0f14` | `#ffffff` | Gimnasios suelen tener luz fuerte de techo; el fondo oscuro reduce el deslumbramiento |
| Claro | `#ffffff` | `#0a0f16` | Para quien vea mejor con polaridad normal |
| **Máximo** | Negro puro | **Amarillo `#ffff00`** | Contraste extremo. Es la combinación que más recomiendan las guías de baja visión: 19,6:1 |

En el tema Máximo los bordes suben a 3 px y las fotos llevan un realce de
contraste del 15 %.

## 3. Nada depende solo del color

Los colores de los días del tablero se conservan como **referencia** contra el
papel, pero **siempre** van acompañados de texto:

- El día dice *«Lunes»* y *«Funcional — cuerpo completo»*, no solo un cuadro naranja.
- Un ejercicio hecho muestra un **✓**, borde verde **y** la palabra *HECHO*.
- La barra de progreso lleva `aria-label` con el porcentaje escrito.

## 4. Áreas de toque

- Ningún elemento tocable baja de **44 px** de alto (el mínimo de Apple);
  el valor por defecto es **48 px**, el estándar de Material.
- Los botones principales son de **ancho completo**, uno por línea: no hay que
  apuntar a un blanco pequeño.
- Excepción medida: los interruptores de ajustes tienen la casilla de 22 px,
  pero van dentro de un `<label>` de 48 px, así que el área que responde al
  toque es la etiqueta entera. La prueba visual comprueba esto explícitamente.

## 5. Voz

- Botón **«Léemelo en voz alta»** en cada ejercicio. Lee nombre, músculo,
  equipo, dónde está la máquina, los pasos numerados y la advertencia.
- Velocidad **0,95** — un poco más lenta que la normal, se entiende mejor.
- Busca voz **es-CO** y si no hay, va bajando: es-MX → es-US → es-419 → es-ES → es.
- Opción de **lectura automática** al abrir cada ejercicio (apagada por defecto,
  para que no moleste a quien no la necesite).
- El temporizador **canta** los últimos segundos: *«Diez segundos… tres… dos… uno»*
  y avisa *«Descanso terminado»*. Así no hay que mirar la pantalla durante el descanso.
- Si el teléfono no tiene síntesis de voz, la app funciona igual: solo no habla.

## 6. Vibración

Al terminar el descanso: patrón `300 – 120 – 300 ms`. Si el gimnasio está
ruidoso y no se oye la voz, se siente en el bolsillo.

## 7. Una cosa a la vez, pero con una vista general disponible

La pantalla de un ejercicio muestra **solo ese ejercicio**: nombre, dos fotos,
pasos numerados, contador de series y el botón de descanso. No hay que buscar
nada en una cuadrícula de 75 casillas.

Aun así, la hoja de papel tenía una ventaja: se veía todo de un vistazo. Por eso
existe la **lista completa** (`Ver la lista completa de ejercicios`), que
muestra los 40 ejercicios de Anderson o los 43 de Sharid agrupados por músculo,
con **filtros por día** arriba. Cada ejercicio dice qué días le tocan, con el
nombre del día escrito y un punto del color de la hoja física al lado.

Así se cubren los dos casos: *«¿qué hago hoy?»* (el flujo por días) y
*«¿qué me asignaron en total y cuándo?»* (la lista con filtro).

## 8. Fotos reales en vez de pictogramas

Se reemplazaron los dibujos de 2 cm por **fotografías de 720 px** de una persona
haciendo el ejercicio, en dos momentos: **posición de inicio** y **posición final**.
Cada foto lleva su rótulo escrito debajo (*«1 · Posición de inicio»*).

Cuando la foto no es exactamente el ejercicio marcado —pasa en 14 de los 55,
sobre todo los de TRX y BOSU— la app lo **dice explícitamente** con un aviso
y remite al video. Nunca se presenta una foto aproximada como si fuera la exacta.

## 9. «Dónde está la máquina»

Cada ejercicio tiene un campo `donde` que describe **cómo reconocer el aparato**:

> *«Máquina grande e inclinada donde te sientas casi acostado y empujas una
> plataforma con los pies. Los discos van a los lados.»*

Eso es lo que no trae ninguna app de gimnasio y es justo lo que falta cuando no
puedes leer los letreros de las máquinas.

## 10. Advertencias personales

El campo `ojo` recoge riesgos y adaptaciones. Varias vienen directo de las
observaciones del entrenador:

- *Sentadilla dinámica* y *Salto cajón*: **«SIN SALTO»** en mayúsculas, con la
  variante segura explicada paso a paso.
- *Tijeras con barra*: *«Este ejercicio exige equilibrio. Si te sientes inestable,
  hazlo sin barra o con mancuernas, cerca de una pared.»*
- *TRX sentadilla profunda*: *«Este es el ejercicio ideal si te cuesta el
  equilibrio: las cintas te sostienen.»*

## 11. Teclado y lectores de pantalla

- HTML semántico: `<header>`, `<main>`, `<h1>`–`<h3>`, `<ol>`, `<button>`.
- Enlace **«Saltar al contenido»** como primer elemento enfocable.
- Foco visible de 4 px en todo lo enfocable.
- `aria-live` en el temporizador y en el contador de series.
- `aria-pressed` en los botones de tema, `aria-expanded` en ajustes.
- Al cambiar de pantalla el foco vuelve a `<main>` — VoiceOver y TalkBack
  anuncian la pantalla nueva desde el principio.
- Toda imagen decorativa lleva `alt=""`; las informativas describen la posición.

## 12. Respeta las preferencias del sistema

- `prefers-reduced-motion`: desactiva transiciones y animaciones.
- `viewport-fit=cover` + `env(safe-area-inset-top)`: no queda nada bajo el notch.
- Sin `maximum-scale`: el pellizco para hacer zoom **siempre** funciona.

---

## Cómo se verifica todo esto

No a ojo. `npm run pwa` mide el contraste real en el navegador, par por par,
en los tres temas:

```
Contraste tema oscuro: el peor par mide 8.7:1
Contraste tema claro:  el peor par mide 7.4:1
Contraste tema maximo: el peor par mide 19.6:1
```

Los tres superan el nivel **AAA** de WCAG (7:1), que es el exigente, no el
mínimo. `npm run visual` comprueba además las áreas tocables, que nada se salga
de la pantalla —incluso con la letra al 180 %— y que ningún elemento tape a otro.

## Lo que queda por probar en persona

- ¿El tema Máximo (amarillo sobre negro) se ve mejor que el Oscuro con la luz
  del gimnasio?
- ¿La voz se oye por encima del ruido, o hay que subir el volumen del sistema?
- ¿17 ejercicios el lunes se leen cómodos en la lista, o conviene partir el día
  en bloques?

Ajustar cualquiera de esas cosas es cambiar un número o un texto; nada exige
rehacer la app.
