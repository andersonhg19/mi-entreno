# Mi Entreno — Bitácora de Desarrollo

## Estado Actual: v2 publicada en GitHub Pages
## Última actualización: 2026-08-04

---

## Registro de Actividades

### 2026-08-04 — Análisis de las planillas físicas

**Actividad:** Extracción de las dos rutinas a partir de 13 fotos de las hojas
que entregó Life Gym.

**Problema encontrado:** las fotos están tomadas en ángulo. A resolución normal
es imposible saber en cuál de las tres casillas de cada tarjeta está la marca,
y varias marcas están corridas y manchan la casilla contigua.

**Método usado:**
1. Descartar `image.png` (captura de Postman de otro proyecto, no venía al caso).
2. Agrupar las 12 fotos restantes: son 4 tableros fotografiados 3 veces cada uno.
3. Quedarse con las `IMG_*.jpeg` (5712 × 4284 px) y descartar las de WhatsApp
   para la lectura fina.
4. Nivelar cada foto por rotación (0,8° / 1,6° / 2,2° / 3,15°).
5. Recortar fila por fila a resolución nativa, en dos mitades — 26 recortes.
6. Zoom extra sobre las tarjetas dudosas.

**Hallazgo crítico:** Anderson y Sharid usan **los mismos cinco colores asignados
a días distintos**. Anderson: naranja=lunes, rojo=martes, celeste=miércoles,
rosado=jueves, verde=viernes. Sharid: naranja=lunes, verde=martes, rosado=miércoles,
celeste=jueves, rojo=viernes. Leer un tablero con el código del otro da la
rutina equivocada. Quedó documentado en `extraccion-planillas.md`.

**Segundo hallazgo:** en la hoja de gimnasio de Anderson no hay **ninguna** marca
naranja y solo dos verdes. Su lunes y casi todo su viernes están en la hoja de
funcionales. Es coherente con la observación manuscrita del entrenador:
«Deficiencia visual · Mal equilibrio» — le cargó el trabajo a TRX, banda y BOSU,
que dan apoyo.

**Tercer hallazgo:** dos anotaciones manuscritas de **«Sin salto»** — en
*Sentadilla dinámica* (Anderson) y en *Salto cajón* (Sharid). Se recogieron como
advertencia destacada en la app, con la variante segura explicada paso a paso.

**Resultado:** 55 ejercicios distintos, 59 asignaciones/semana para Anderson y
55 para Sharid.

---

### 2026-08-04 — Investigación de la solución técnica

**Actividad:** Decidir cómo llevar esto a un iPhone y un Android sin pagar
licencias y sin servidor.

**Consultado:**
- Estado de las PWA en iOS en 2026 → instalables desde Safari, service worker
  funcional, quota de almacenamiento más ajustada que en Android.
- Hosting estático gratuito con HTTPS.
- Bases de datos de ejercicios con licencia libre.
- Guías WCAG de contraste y de accesibilidad móvil.

**Decisiones tomadas:**

1. **PWA estática, no app nativa.** Evita 99 USD/año de Apple y la cuenta de
   Google Play. iOS 16.4+ la instala desde Safari sin tienda.
2. **GitHub Pages** como hosting. Gratis, HTTPS (necesario para el service
   worker), estático.
3. **No microservicio de Oh Churus, por ahora.** Los planes gratuitos de
   backend duermen el contenedor y tardan 30–50 s en despertar. Inservible
   parado frente a una máquina. El camino para integrarlo quedó escrito en
   `puntos-futuros.md`.
4. **free-exercise-db** para las fotos: 873 ejercicios, dominio público, dos
   fotos por ejercicio (inicio y fin). Se descartó wger porque su licencia
   CC-BY-SA obliga a compartir igual y a atribuir, y aquí no aporta lo suficiente.
5. **Sin framework ni build.** HTML, CSS y JS puro, como pidió el usuario y
   como están los otros proyectos personales. Cero dependencias en ejecución.

---

### 2026-08-04 — Decisión sobre el material visual

**Actividad:** Definir qué imagen ve el usuario en cada ejercicio.

**Se evaluó recortar cada tarjeta del tablero original** y usarla como imagen de
referencia. Se descartó: los pictogramas miden 2 cm, son de línea fina y son
justamente lo que el usuario no alcanza a ver. Ampliarlos no los hace legibles,
solo los hace borrosos.

**Decisión:** para cada ejercicio se muestran **dos fotografías reales** (posición
de inicio y posición final) de 720 px, con rótulo escrito debajo, más los pasos
en texto, la descripción de cómo reconocer la máquina y un enlace a video.

**Honestidad sobre las fotos:** 14 de los 55 ejercicios —casi todos de TRX, BOSU
y banda— no existen en la base de dominio público. Para esos se usa la foto de
un movimiento parecido y **la app lo dice en pantalla**: *«Las fotos son de un
movimiento muy parecido, no idéntico. Lee los pasos y mira el video para verlo
exacto.»* Nunca se presenta una aproximación como si fuera exacta.

Los 4 tableros nivelados quedan íntegros en `recursos/planillas/` como respaldo,
excluidos de git porque llevan documento y teléfono.

---

### 2026-08-04 — Construcción de la app

**Actividad:** Desarrollo de la PWA.

**Archivos creados:**

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Estructura, barra, panel de ajustes, temporizador |
| `assets/css/estilos.css` | 3 temas de contraste, escala única, componentes de 64 px |
| `assets/js/datos-catalogo.js` | 55 ejercicios con nombre, grupo, equipo, dónde está, pasos, advertencia |
| `assets/js/datos-planes.js` | Las 2 rutinas × 7 días + parámetros del gimnasio |
| `assets/js/almacenamiento.js` | localStorage: preferencias, sesión del día, pesos |
| `assets/js/voz.js` | Web Speech API con selección de voz en español |
| `assets/js/cronometro.js` | Descanso de 60 s con cuenta hablada y vibración |
| `assets/js/app.js` | Rutas por hash y 4 vistas |
| `sw.js` | Service worker, precarga de 124 archivos |
| `manifest.webmanifest` | Instalación como app |
| `servidor.js` | Servidor local para probar desde el celular |

**Decisiones de accesibilidad** (detalladas en `accesibilidad-baja-vision.md`):
tipografía base de 20 px escalable al 200 %, tema de máximo contraste en amarillo
sobre negro (19,6:1), 64 px mínimo de área táctil, lectura en voz alta de cada
ejercicio, y nada que dependa solo del color.

---

### 2026-08-04 — Pruebas

**Actividad:** Verificar que la app funciona.

**Problema:** Chrome en este equipo no alcanza `localhost` ni `127.0.0.1` — se
intentó en tres puertos distintos y con dos formas de arrancar el servidor.
Docker Desktop está capturando puertos y `file://` está bloqueado para la
automatización. Se descartó seguir por ahí y se verificó por código.

**Pruebas escritas:**

1. `pruebas/validar-datos.js` (sin dependencias) — sintaxis de los 7 archivos JS,
   los 8 campos obligatorios en los 55 ejercicios, existencia de las 110 fotos,
   que ningún día apunte a un ejercicio inexistente, que el service worker
   precargue todo lo que la app usa, que `index.html` no referencie archivos
   inexistentes y que todo `getElementById` tenga su elemento en el HTML.

2. `pruebas/prueba-humo.js` (jsdom) — carga la app en un DOM simulado y recorre
   las 131 pantallas de ambas rutinas (inicio, 2 de semana, 14 de día y 114 de
   ejercicio), verificando nombre, las 2 fotos, el número de pasos, los botones,
   el enlace de video y el aviso de foto aproximada. Después ejercita el contador
   de series, el temporizador, marcar como hecho, los ajustes de letra y
   contraste, y cuatro rutas inválidas.

**Fallos encontrados y corregidos:**

1. El registro del service worker usaba `"serviceWorker" in navigator`, que da
   verdadero aunque la propiedad valga `undefined` — como pasa en navegación
   privada de iOS. Se cambió por una comprobación del valor y se envolvió en
   `try/catch`.
2. Los dos archivos de prueba se habían copiado con PowerShell y quedaron con
   los acentos corrompidos (Windows PowerShell 5.1 lee como ANSI por defecto).
   Se reescribieron en UTF-8 sin BOM. **Regla para el futuro:** no copiar
   archivos con acentos usando `Get-Content | Set-Content`.

**Resultado:** `npm test` en verde.

```
Ejercicios en catalogo : 55
Ejercicios usados      : 55
Con foto aproximada    : 14 (avisan en pantalla)
  Anderson   59 ejercicios/semana  ->  Lun:17  Mar:8  Mié:9  Jue:9  Vie:16
  Sharid     55 ejercicios/semana  ->  Lun:13  Mar:11  Mié:12  Jue:10  Vie:9

OK - Datos correctos: sin errores.
OK - Prueba de humo superada: 131 pantallas renderizan y responden.
```

---

### 2026-08-04 — Documentación

Se escribieron los cinco documentos de `documentación/` y los dos de
`seguimiento/`, siguiendo la estructura de Oh Churus.

**Estado:** la app está lista y verificada en local.

**Próximo paso:** publicar en GitHub Pages e instalarla en los dos teléfonos.
El paso a paso está en `documentación/despliegue-gratuito.md`. **No se publicó
nada todavía** — crear un repositorio es una acción de cara al exterior y queda
a decisión del usuario.

**Pendiente de prueba real:** el tamaño de letra por defecto, si el tema Máximo
funciona mejor que el Oscuro con la luz del gimnasio, si la voz se oye por
encima del ruido, y las zonas de las fotos donde el flash tapó parte de la hoja
de Anderson (`extraccion-planillas.md`, sección 7).

---

### 2026-08-04 (tarde) - v2: correcciones tras la primera prueba real

**Actividad:** Iteracion completa despues de que Anderson probara la v1.

#### Fallo grave encontrado POR EL USUARIO, no por las pruebas

Al abrir la app solo se veia **el temporizador de descanso** con sus dos
botones, tapando toda la pantalla. Nada del plan de entreno.

**Causa:** `.temporizador { display: grid }` pisa al atributo `hidden` del HTML.
El `hidden` solo vale como regla del navegador (`display: none` en la hoja de
estilos del agente de usuario), y cualquier `display` declarado por nosotros
tiene mas prioridad. El temporizador estaba, literalmente, siempre visible.

**Por que las pruebas no lo vieron:** jsdom no calcula estilos. La prueba de
humo comprobaba `elemento.hidden === true`, que era correcto. El elemento
estaba marcado como oculto y aun asi se pintaba encima de todo.

**Arreglo:**
1. Regla global `[hidden] { display: none !important; }` en el CSS.
2. Guardia en `validar-datos.js` que falla si esa regla desaparece.
3. **Dos suites nuevas con navegador real** (ver abajo). Esta es la correccion
   de fondo: sin renderizado real no hay forma de ver un fallo visual.

#### Cambio de criterio: tamanos de texto ESTANDAR

Anderson pidio letra normal, no grande. Su razon: usa la lupa del iPhone para
leer, y agrandar sobre algo ya agrandado deja media palabra por pantalla.
Ademas su esposa comparte la app y para ella era incomodo.

- Base de 20 px -> **17 px** (el tamano de sistema de iOS).
- Areas tocables de 64 px -> **48 px** (estandar de Material, minimo 44 de Apple).
- Rango del control A-/A+ de 85-200 % -> **90-180 %**, con nota en pantalla
  explicando que el 100 % es el tamano normal.
- Titulares, numeros y espaciados reducidos en proporcion.

Lo que NO se toco: contraste, voz, jerarquia y avisos. Eso es accesibilidad de
verdad; la letra gigante era una suposicion mia.

#### Funcion nueva: lista completa con filtro por dias

Pedida por el usuario. La hoja de papel tenia una ventaja que se habia perdido:
verlo todo de un vistazo.

- Ruta `#/p/:persona/lista` y `#/p/:persona/lista/:filtro`.
- Los 40 ejercicios de Anderson (43 de Sharid) agrupados por musculo.
- Filtros: Todos + los 5 dias de entreno, con el conteo de cada uno.
- Cada ejercicio dice que dias le tocan, escrito y con un punto del color de la
  hoja fisica.
- Al filtrar por un dia aparece el resumen de ese dia y un boton para entrenarlo.
- Ruta `#/p/:persona/x/:clave`: modo **consulta**, sin contador de series,
  con botones para saltar al entreno del dia que corresponda.

#### Zona dudosa de las fotos: RESUELTA

Quedaba pendiente confirmar cuatro tarjetas de Anderson que el flash habia
reventado. Se ampliaron 4x desde las otras dos tomas (las de WhatsApp, con
distinta exposicion) y se ve con claridad: *Sentadilla Smith*, *Sentadilla
mancuerna*, *Elevacion de talones prensa* y *Pantorrilla sentado* tienen las
tres casillas **vacias**. Era el reflejo de la lamina, no marcas borradas.
La lectura original era correcta.

#### Privacidad: el repositorio es publico

GitHub Pages gratis exige repositorio publico. Se sacaron del codigo publicado:

- Apellidos y edad de los dos.
- Peso, IMC y % de grasa de los dos.

Todo eso vive ahora en `recursos/datos-personales.md`, y la carpeta `recursos/`
entera esta en `.gitignore` (ya contenia las fotos con documento y telefono).
Se publican solo los nombres de pila, la rutina, y las notas del entrenador que
afectan a como entrenar.

#### QA nuevo: dos suites con navegador real (Playwright + Chromium)

`pruebas/prueba-visual.js` — abre la app con el CSS aplicado y comprueba:
que el temporizador NO tapa la pantalla, que hay contenido visible, que nada se
sale a lo ancho (con los culpables identificados), que las fotos cargan, que las
areas tocables llegan a 44 px, los tres temas y la letra al maximo. En iPhone 14,
iPhone SE y Android. Deja capturas en `pruebas/capturas/`.

`pruebas/prueba-pwa.js` — comprueba:
manifest e iconos (leyendo las dimensiones reales del PNG), registro del service
worker, **modo sin conexion de verdad** (`setOffline(true)` y verificar que la
app abre y las fotos se ven desde el cache), contraste medido par por par en los
tres temas, accesibilidad, persistencia al recargar, que el dia HOY sea el real,
recorrido por los 114 ejercicios en navegador real, y que los datos coincidan
con la tabla de `extraccion-planillas.md`.

**Hallazgos de estas suites nuevas:**
- Los botones de filtro median 40 px, por debajo del minimo de 44. Corregido.
- La comprobacion de areas tocables marcaba las casillas de 22 px de los
  interruptores; se afino para eximirlas cuando su `<label>` ya mide 44 px.
- Texto redundante: «Cardio: 15 a 20 minutos de cardio». Corregido.

**Resultado final:**

```
OK - Datos correctos: sin errores.
OK - Prueba de humo superada: 145 pantallas renderizan y responden.
OK - Prueba visual superada.
  - Manifest e iconos: 4 iconos correctos
  - Service worker: 124 archivos en cache
  - Sin internet: la app abre, lista los ejercicios y muestra las fotos
  - Contraste tema oscuro: el peor par mide 8.7:1
  - Contraste tema claro: el peor par mide 7.4:1
  - Contraste tema maximo: el peor par mide 19.6:1
  - Accesibilidad: idioma, alt, nombres de botones, aria-live y zoom correctos
  - Persistencia: series, peso y ejercicios hechos sobreviven a recargar
  - Recorrido completo: 114 pantallas de ejercicio, todas correctas
  - Datos: coinciden con la tabla de extraccion de las planillas
OK - PWA, accesibilidad, contraste, offline y datos: todo correcto.
```

Los tres temas superan el nivel **AAA** de WCAG (7:1), no solo el AA (4.5:1).

---

### 2026-08-05 - v3: fichas reales del gimnasio, carrusel y rediseno

**Actividad:** Tercera iteracion, disparada por dos avisos del usuario:
las imagenes no correspondian con el ejercicio, y el diseno se veia soso.

#### El problema de fondo: fotos que no eran el ejercicio

Su ejemplo: «TRX sentadilla profunda» mostraba una sentadilla normal, sin TRX.
Tenia razon, y era peor de lo que parecia.

Su propuesta era la correcta: usar la ficha del propio tablero, que es exacta
por definicion porque es lo que entrego el entrenador.

#### Extraer las 55 fichas del tablero

No es un recorte trivial: las fotos estan en angulo. El proceso fue:

1. **Correccion de perspectiva** (homografia con Pillow) a partir de las
   4 esquinas del panel, detectadas por componentes conexas sobre el brillo.
   Resultado: los tableros quedan como rectangulos perfectos.
2. **Geometria medida, no adivinada.** El tablero de gimnasio tiene rejilla
   uniforme: se ajusto `x = 14 + 457,6 · columna` sobre las franjas de musculo
   detectadas en varias filas. El de funcionales tiene anchos irregulares: se
   midieron los bordes fila por fila.
3. **Recorte desde el final de la franja** para que el titulo salga entero, y
   borrado de la columna de casillas (que llevaba las marcas de color de una
   sola de las dos personas) rellenando con el color del papel.

Dos fichas de Anderson quedaron ilegibles por el reflejo del flash
(*Sentadilla mancuerna* y *Pantorrilla sentado*): se sacaron del tablero de
Sharid, donde el reflejo cae en otro sitio.

#### Verificacion con 4 agentes en paralelo

Se lanzaron 4 revisiones en paralelo, cada una con ~14 ejercicios, mirando las
3 imagenes de cada uno y respondiendo: que dice el titulo de la ficha, si
coincide con el nombre esperado, y si las fotos son el MISMO movimiento y el
MISMO equipo.

**Resultado: 20 de 55 ejercicios tenian fotos que no correspondian.** Casos
tipicos: la ficha es de TRX y la foto de peso libre; la ficha tumbado y la foto
sentado (`leg-curl`); la ficha en el piso y la foto sobre banco
(`levantamiento-pierna-piso`); la ficha con BOSU y la foto sin el.

Ademas encontraron **imagenes duplicadas byte a byte** entre ejercicios
distintos: `trx-abductor` tenia las fotos de la maquina `abductor`, y
`trx-sentadilla-profunda` las de `sentadilla-iso`. La busqueda en la base
externa habia caido en el mismo resultado generico.

**Decision:** esas 40 fotos se borraron. Una imagen que no corresponde es peor
que ninguna imagen. Esos 20 ejercicios muestran solo la ficha, que es correcta.
El campo `exacta` se renombro a `fotosOk` para que signifique exactamente eso.

#### Carrusel de imagenes

Investigado aparte: **scroll-snap de CSS con una capa fina de JS**, nunca JS
manual, porque capturar el tactil rompe el pellizco para ampliar — y eso es
justo lo que usa alguien con baja vision. Con rotulo escrito bajo cada lamina,
contador «Imagen 2 de 3», puntos numerados, teclado, y sin controles cuando
solo hay una imagen.

#### Rediseno visual

Sistema de tokens nuevo: 3 niveles de superficie, escala tipografica y de
espaciado, color por grupo muscular (11 musculos) que **siempre** va con el
nombre escrito y una inicial, prescripcion destacada (series/repes/descanso),
anillo de progreso en el temporizador, y estado de dia completo.

#### Otros arreglos pedidos por el usuario

- **Al recargar se iba al perfil.** Ahora la app SIEMPRE abre en el selector de
  persona: al cargar el documento, cualquier ruta en el `#` se sustituye por
  `#/`. Tambien se quitaron los accesos directos a perfiles del manifest.
  Son dos personas en dos telefonos: abrir en la rutina de uno es la forma mas
  facil de que el otro entrene lo que no es.

#### Fallos encontrados por las pruebas nuevas

1. Con la letra al 180 %, los botones del carrusel **se salian de la pantalla**.
   La barra ahora envuelve y los botones son flexibles.
2. Los chips de filtro median 40 px, por debajo del minimo de 44.
3. **Chrome pintaba su propio gris sobre los botones**, sobre todo los
   deshabilitados: el contraste medido caia de 9:1 a 5,7:1 sin que se viera en
   el CSS. Se arreglo con `appearance: none` y declarando el estado
   deshabilitado entero (fondo incluido) mas borde punteado como senal no
   cromatica.
4. Cuatro pasos eran demasiado escuetos («Baja despacio.»).
5. Mi propia prueba de contraste medía a mitad de la transicion de color y daba
   valores falsos: ahora espera a que termine.

#### Pruebas nuevas

- `prueba-completitud.js`: compara la rutina **ejercicio a ejercicio y en
  orden** contra una segunda copia escrita a mano desde las planillas; valida
  avisos manuscritos, longitud de pasos, tamano y **unicidad (MD5)** de cada
  imagen, y que la app arranque en el selector.
- `prueba-visual.js` ampliada: arranque desde 5 direcciones, carrusel completo
  (flechas, puntos, teclado), temporizador (cuenta, anillo, +30 s, cerrar,
  y que no quede abierto al cambiar de pantalla), filtros de los 5 dias, dia
  completo, y revision de todos los enlaces.
- `prueba-pwa.js` ampliada: 20 pares de contraste por tema, y en cada uno de
  los 114 ejercicios comprueba que **la imagen es la suya** por nombre de archivo.
- `generar-sw.js`: regenera la lista del service worker desde el disco.

**Resultado:** `npm run qa` en verde. Contraste peor caso 7,68:1 (AAA es 7:1).

---

### 2026-08-05 (tarde) - v5: recortes bien hechos, fotos de vuelta y transparencia de datos

**Actividad:** Cinco correcciones pedidas por el usuario tras probar la v4.

#### 1. «No vi los slider en ninguna parte»

Causa real: 20 de los 55 ejercicios tenian una sola imagen, y con una sola
lamina el carrusel no dibuja controles. Y esos 20 son casi todo el lunes y el
viernes de Anderson (dias funcionales), asi que en su rutina el carrusel no
aparecia practicamente nunca. Al devolver las fotos (punto 3) ahora TODOS los
ejercicios tienen 3 laminas y el carrusel esta siempre.

Ademas, para que las actualizaciones se vean sin trucos: cuando el service
worker nuevo toma el control, la pagina se recarga sola una vez, y la version
se muestra en Ajustes para poder confirmarlo de un vistazo.

#### 2. Recortes mal hechos, con contenido cortado

Se recortaba desde el final de la franja de musculo, y eso se comia titulos.
Ahora se recorta **la tarjeta entera** (franja + titulo + dibujo) y todas las
fichas se encajan en un **lienzo 4:3 identico**, centradas y rellenando con el
tono del papel. Todas salen del mismo tamano y ninguna se recorta.

Se probo a borrar la columna de casillas (llevan las marcas de color de una
sola de las dos personas). Se descarto: el parche se veia peor que las propias
marcas y se comia los titulos de dos lineas. La ficha se muestra tal cual esta
en el carton, que es lo mas honesto y lo mas legible.

#### 3. «Quitaste las fotos y eso no esta bien, porque si validan»

Tenia razon. La decision de borrarlas era demasiado tajante: aunque el
movimiento no sea identico, la foto sirve de referencia. Se restauran las 40.

La solucion no es esconderlas, es **etiquetarlas sin rodeos**: el rotulo de la
lamina dice «⚠ Foto parecida» y bajo el carrusel aparece *«Las dos fotos son de
un movimiento parecido, no identico. La que manda es la ficha del gimnasio.»*
El campo `fotosOk` deja de decidir si se muestran y pasa a decidir que dice el
rotulo.

Al restaurarlas se cambiaron dos mapeos para no repetir imagenes entre
ejercicios: `trx-sentadilla-profunda` -> Suspended_Split_Squat y
`trx-abductor` -> Lunge_Pass_Through.

#### 4. El video, debajo de las imagenes

Estaba al final de todo, despues de los pasos y las advertencias. Ahora va
justo bajo el carrusel: es la misma pregunta («como se hace esto») y esta a un
dedo de distancia. La prueba de humo comprueba el orden en el DOM.

#### 5. «¿Tu donde guardas esa info?»

Pregunta justa: la app pide datos y no decia donde iban. Nuevo bloque en
Ajustes, **Tus datos: donde se guardan**:

- Explicacion en una frase: se guardan solo en ese telefono, en el almacen del
  navegador; no se envian a ningun servidor y funcionan sin internet.
- Cuanto hay ahora mismo: dias anotados, pesos recordados y KB ocupados.
- Boton para **descargar una copia** en JSON.
- Boton para **borrar lo guardado**, con confirmacion, aclarando que la rutina
  no se borra.
- Aviso de que si se desinstala la app o se borran los datos del navegador,
  eso se pierde.

Si el navegador no deja guardar (navegacion privada), lo dice en vez de fallar
en silencio.

#### Bug encontrado por la captura de la propia prueba

El `appearance: none` global que se puso en la v3 para que Chrome no pintara su
gris sobre los botones dejaba **las casillas de Voz completamente invisibles**:
sin cuadro y sin marca. El selector ahora excluye `checkbox` y `radio`, y
`prueba-visual.js` comprueba que las casillas midan al menos 16 px y que su
`appearance` no sea `none`.

**Resultado:** `npm run qa` en verde. 165 imagenes (55 fichas + 110 fotos),
ninguna repetida, 180 archivos en el service worker.
