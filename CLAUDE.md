# Mi Entreno — Guía para trabajar en este proyecto

PWA estática con la rutina de gimnasio de Anderson y Sharid.
**El usuario principal tiene baja visión.** Esa es la restricción que manda
sobre cualquier otra decisión de diseño.

## Reglas que no se negocian

1. **Sin build, sin framework, sin dependencias en ejecución.**
   HTML, CSS y JS puro. `jsdom` y `playwright` solo existen para las pruebas.
   La app tiene que abrirse dentro de tres años sin instalar nada.

2. **Tamaños de texto ESTÁNDAR.** Base 17 px, el tamaño normal de iOS.
   La app no fuerza letra gigante: Anderson usa la lupa del iPhone y su esposa
   necesita que se vea normal. El control A− / A+ existe, pero el 100 % es el
   tamaño de sistema.
   Aun así, **todo el texto escala desde `--escala`**: nunca poner `font-size`
   en `px` fijos. Si algo no escala, está roto.

3. **Nada por debajo de 44 px de alto** en elementos tocables (`--toque` = 48).
   Se exime un `input` pequeño si su `<label>` envolvente ya llega a 44.

4. **Nunca poner `display` en una clase de un elemento que use `hidden`**
   sin la regla global `[hidden] { display: none !important; }`. Ya pasó una
   vez: el temporizador quedó visible tapando toda la app y las pruebas de
   jsdom no lo vieron porque comprueban la propiedad, no el CSS calculado.

5. **Nada depende solo del color.** Un estado siempre lleva además texto o icono.

6. **Los tres temas mantienen contraste ≥ 7:1.** `npm run pwa` lo mide de verdad
   en el navegador; no fiarse del ojo.

7. **Honestidad sobre las imágenes.** La ficha del gimnasio siempre; las fotos
   reales solo si `fotosOk: true`, y eso solo tras mirarlas. Ver la sección
   «Imágenes» más abajo: es la regla que más veces se ha roto.

8. **Todo en español**, incluidos nombres de variables, funciones, comentarios y
   claves de datos. Es el idioma del usuario y de las planillas.

## Estructura

```
index.html · manifest.webmanifest · sw.js · servidor.js
assets/css/estilos.css
assets/js/  datos-catalogo.js  datos-planes.js
            almacenamiento.js  voz.js  carrusel.js  cronometro.js  app.js
assets/img/ejercicios/<clave>-ficha.jpg  (ficha del tablero, SIEMPRE)
                      <clave>-0.jpg      (foto real inicio, solo si fotosOk)
                      <clave>-1.jpg      (foto real final,  solo si fotosOk)
pruebas/  documentación/  seguimiento/  recursos/
```

`app.js` es lo único que toca el DOM de las vistas, con dos excepciones que se
gobiernan solas: `carrusel.js` (el carrusel de imágenes; movimiento con
scroll-snap de CSS, nunca capturando el táctil, para no romper el pellizco
para ampliar) y `tabata.js` (el temporizador por intervalos, que se pinta y se
gestiona entero desde su módulo mediante `Tabata.montar(contenedor)`).

`tabata.js` calcula la secuencia completa de tramos ANTES de empezar y sitúa
la posición mirando el reloj real, no sumando intervalos: así no se desfasa si
la pantalla se apaga. Mantiene la pantalla encendida con Wake Lock mientras
corre y avisa por voz, pitido y vibración, porque en un gimnasio con uno solo
no basta.
`almacenamiento.js` es lo único que toca `localStorage` — si algún día se le
pone backend, solo cambia ese archivo.

## Rutas (hash)

```
#/                              selector de persona
#/p/:persona                    semana
#/p/:persona/lista              lista completa de ejercicios
#/p/:persona/lista/:filtro      lista filtrada ("todos" o 1..7)
#/p/:persona/d/:dia             ejercicios de un día
#/p/:persona/d/:dia/e/:indice   ejercicio en modo ENTRENO (con series y descanso)
#/p/:persona/x/:clave           ejercicio en modo CONSULTA (desde la lista)
#/tabata                        temporizador por intervalos
```

El modo consulta reutiliza `cabeceraEjercicio()`, `carruselDe()` e
`instrucciones()`, pero **no** lleva contador de series: no hay sesión de un
día concreto a la que asociarlas.

**La app SIEMPRE arranca en el selector de persona.** Al cargar el documento,
si viene un `#` con ruta, se sustituye por `#/`. La usan dos personas en dos
teléfonos: abrir directamente en la rutina de uno es la forma más fácil de que
el otro entrene lo que no es. Por eso el manifest tampoco lleva accesos
directos a perfiles.

## Imágenes: la regla más importante del proyecto

Cada ejercicio muestra **la ficha del tablero de Life Gym** (`<clave>-ficha.jpg`).
Esa imagen es el recorte del cartón que entregó el entrenador, así que es
**exacta por definición**. Siempre va primero en el carrusel.

Después van **siempre** dos fotos reales del movimiento
(`<clave>-0.jpg` y `<clave>-1.jpg`, de free-exercise-db). El carrusel tiene
por tanto **3 láminas en todos los ejercicios**, sin excepción.

`fotosOk` NO decide si se muestran, decide **qué dice el rótulo**:
- `true`  -> «Foto · posición de inicio»
- `false` -> «⚠ Foto parecida · posición de inicio», más un aviso escrito bajo
  el carrusel: *«Las dos fotos son de un movimiento parecido, no idéntico.
  La que manda es la ficha del gimnasio.»*

En 20 de los 55 las fotos son solo parecidas (la ficha es de TRX y la foto de
peso libre, la ficha tumbado y la foto sentado…). Se probó a ocultarlas y el
usuario pidió que volvieran: le sirven de referencia. La solución no es
esconderlas, es **etiquetarlas sin rodeos**.

`prueba-completitud.js` comprueba además que ninguna imagen esté repetida entre
dos ejercicios: ese fue el error que hacía que «TRX abductor» enseñara la
máquina abductora.

### De qué tablero sale cada ficha

Los tableros de Anderson y de Sharid son **la misma baraja de tarjetas** en dos
ediciones (franjas azules y granates). Lo importante: el reflejo del flash cae
en sitios distintos, así que la tarjeta quemada en uno está sana en el otro.
`herramientas/2-alinear-sharid.py` los deja en el mismo lienzo y **tres** fichas
se toman del de Sharid (`DESDE_SHARID` en `3-generar-fichas.py`).

**Cómo se decide, si algún día hay que rehacerlo:** por **contraste**
(p98 − p2 de la luminancia), no por porcentaje de blanco reventado ni por
medidas de «detalle». Una tarjeta puede tener un 8 % de píxeles reventados y
verse perfecta —lo quemado es el papel— y el borde de un reflejo cuenta como
detalle, así que una tarjeta ilegible puntúa más alto que la buena. La primera
lista automática señalaba 21 tarjetas dañadas; mirándolas una a una eran 3.
**Después de medir, hay que mirar.**

El modelo (EDSR ×2), el aumento y el enfoque (1,4 · 55 %) están **medidos**
contra una verdad de referencia en `herramientas/banco/`. Encadenar modelos se
probó y **no funciona**: ninguna de las seis cadenas gana a su propio primer
paso. No lo vuelvas a intentar sin pasar el banco antes.

## Al agregar un ejercicio

1. Añadirlo a `datos-catalogo.js` con los 7 campos obligatorios:
   `nombre`, `grupo`, `equipo`, `fotosOk`, `donde`, `pasos`, `buscar`
   (más `ojo` si hay advertencia).
   - `grupo` tiene que ser uno de los 11 que conoce el CSS (los valida
     `validar-datos.js`), o se queda sin color de músculo.
   - `donde` describe **cómo reconocer la máquina**, no qué músculo trabaja.
     Es lo que resuelve el problema real de no poder leer los letreros.
   - `pasos`: mínimo 3, una acción por paso, en imperativo, cada uno con
     sentido por sí solo (nada de «Baja despacio.» a secas) y terminado en punto.
   - `ojo`: advertencia de seguridad o adaptación. Si el entrenador anotó algo
     a mano en la planilla, va aquí y en MAYÚSCULAS.
2. Poner la ficha recortada del tablero en `assets/img/ejercicios/<clave>-ficha.jpg`.
3. Solo si las fotos reales corresponden de verdad, añadirlas y poner `fotosOk: true`.
4. Referenciar la clave desde el día que corresponda en `datos-planes.js`
   **y en la tabla `PLAN_ESPERADO` de `pruebas/prueba-completitud.js`**
   (son dos fuentes a propósito: si solo se toca una, la prueba lo caza).
5. `npm run sw` para regenerar la lista del service worker.
6. `npm run qa`.
7. Subir `VERSION` en `sw.js` **y `VERSION_APP` en `datos-planes.js`**
   (tienen que coincidir; lo comprueba `validar-datos.js`).

## Al cambiar cualquier archivo

**Siempre** subir `VERSION` en `sw.js` y `VERSION_APP` en `datos-planes.js`
(los dos, y con el mismo número). Si no, los teléfonos que ya la tienen
instalada siguen con la versión vieja.

La versión se muestra en Ajustes, abajo del todo: sirve para confirmar de un
vistazo que el teléfono ya se actualizó. Además, cuando el service worker nuevo
toma el control, `app.js` recarga la página una sola vez para que el cambio se
vea sin tener que borrar nada a mano.

## Trampas conocidas de CSS en este proyecto

1. `[hidden]` lo pisa cualquier `display` de una clase → regla global
   `[hidden] { display: none !important; }`.
2. Chrome pinta su propio fondo sobre los controles (sobre todo los
   deshabilitados) y hunde el contraste → `appearance: none` en botones.
3. **Pero `appearance: none` deja las casillas y los radios INVISIBLES**, sin
   cuadro ni marca. Por eso el selector los excluye explícitamente. Ya pasó una
   vez con los interruptores de Voz; `prueba-visual.js` lo comprueba.
4. **Nunca `disabled` en un botón que pueda tener el foco durante un
   desplazamiento.** Al deshabilitarlo el navegador mueve el foco, y ese
   cambio de foco **cancela el scroll suave en curso**. Eso dejó el carrusel
   clavado en la segunda imagen. Se usa `aria-disabled`, que informa al lector
   de pantalla y da el estilo, sin tocar el foco.
5. **Ningún tamaño en `em` puro para cajas grandes.** A escala 1,8 sobre un
   iPhone SE con zoom de pantalla (320 px), un anillo de `11em` mide más que
   la pantalla. Se usa `min(11em, 62vw)`.

## Pruebas

```bash
npm test    # rápido, sin navegador (validar + humo)
npm run qa  # completo: además abre Chromium de verdad
```

| Prueba | Qué cubre |
|--------|-----------|
| `validar-datos.js` | Sin dependencias. Sintaxis, campos obligatorios, grupos válidos, imágenes que faltan **y que sobran**, huérfanas, claves rotas, precarga del service worker (que no falte ni sobre nada), y la guardia del `[hidden]`. |
| `prueba-completitud.js` | **La garantía del plan.** Compara la rutina, ejercicio a ejercicio y en orden, contra una segunda copia escrita a mano desde las planillas. Valida también longitud de pasos, avisos manuscritos del entrenador, tamaño y unicidad de cada imagen (MD5) y que la app arranque en el selector. |
| `prueba-humo.js` | jsdom. Recorre las 145 pantallas y ejercita series, temporizador, marcar hecho, filtros, modo consulta, carrusel, ajustes y rutas inválidas. |
| `prueba-visual.js` | Chromium real. Lo que jsdom **no** ve: qué tapa qué, desbordes, imágenes rotas, áreas tocables, arranque desde 5 direcciones distintas, carrusel (flechas y teclado), temporizador (cuenta, anillo, +30 s, cerrar), filtros, día completo, tres temas, letra al 180 %, y enlaces. Deja capturas en `pruebas/capturas/`. |
| `prueba-regresiones.js` | Chromium real. **Un caso por cada bug que ya se coló alguna vez**, para que no vuelva: `hidden` gana al CSS, las casillas se dibujan, las flechas del carrusel nunca usan `disabled` y el recorrido de ida y vuelta acaba donde debe, ids únicos, lo anotado persiste, el contador no baja de cero, el temporizador se cierra del todo, el botón principal llega a su tamaño, `alt` correcto, el foco se ve, arrancar en cualquier ruta lleva al inicio, y nada se sale a 320 px con la letra al 180 % y el espaciado de la WCAG 1.4.12. |
| `prueba-pwa.js` | Manifest e iconos, **modo sin conexión de verdad**, contraste **por barrido** (todo elemento que pinte texto, 7 pantallas × 3 temas, AAA: 7:1 normal y 4,5:1 grande), accesibilidad, persistencia al recargar, el día HOY, y los 114 ejercicios uno a uno comprobando que **cada imagen es la suya**. |

**Lección aprendida:** jsdom no calcula estilos. Un fallo puramente visual
(el temporizador tapando la app) pasó sus pruebas. Cualquier cambio de CSS
o de maquetación exige `npm run qa`, no `npm test`.

**Segunda lección:** una prueba con una lista escrita a mano solo comprueba lo
que a alguien se le ocurrió listar. Donde se pueda, que **barra** (todo el
texto, todas las rutas) en vez de mirar veinte selectores elegidos.

La primera vez: `npm install && npx playwright install chromium`.

## Probar en el celular

```bash
node servidor.js
```

Nota: Chrome instalado en este equipo **no alcanza `localhost`** (Docker Desktop
captura puertos). Playwright sí, porque trae su propio Chromium. Para mirar con
los ojos, usar la IP de la WiFi que imprime `servidor.js` desde el teléfono.

## Datos personales

**El repositorio es público.** Toda la carpeta `recursos/` está en `.gitignore`:
tiene las fotos originales de las planillas (nombre completo, documento,
teléfono) y `datos-personales.md` (peso, IMC, % de grasa, edad).

Lo que sí se publica: **nombres de pila**, la rutina, y las notas del entrenador
que afectan a cómo entrenar. Nada más. Antes de subir algo nuevo, comprobar que
no arrastre datos identificativos.
