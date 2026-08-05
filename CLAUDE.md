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

`app.js` es lo único que toca el DOM de las vistas; `carrusel.js` se encarga
solo del carrusel de imágenes (movimiento con scroll-snap de CSS, nunca
capturando el táctil, para no romper el pellizco para ampliar).
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

Las fotos reales (`<clave>-0.jpg` y `<clave>-1.jpg`, de free-exercise-db) solo
existen si `fotosOk: true`, y ese campo solo se pone en true después de
**mirar las tres imágenes y confirmar que son el mismo movimiento y el mismo
equipo**. En la v3 se descartaron 20 de 55 porque no lo eran: la ficha era de
TRX y la foto de peso libre, la ficha tumbado y la foto sentado, etc.

Una foto que no corresponde es **peor que ninguna foto**. Si hay duda, `false`.

`prueba-completitud.js` comprueba además que ninguna imagen esté repetida entre
dos ejercicios: ese fue el error que hacía que «TRX abductor» enseñara la
máquina abductora.

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
7. Subir `VERSION` en `sw.js`.

## Al cambiar cualquier archivo

**Siempre** subir `VERSION` en `sw.js` (`mi-entreno-v1` → `v2` → …).
Si no, los teléfonos que ya la tienen instalada siguen con la versión vieja.

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
| `prueba-visual.js` | Chromium real. Lo que jsdom **no** ve: qué tapa qué, desbordes, imágenes rotas, áreas tocables, arranque desde 5 direcciones distintas, carrusel (flechas, puntos, teclado), temporizador (cuenta, anillo, +30 s, cerrar), filtros, día completo, tres temas, letra al 180 %, y enlaces. Deja capturas en `pruebas/capturas/`. |
| `prueba-pwa.js` | Manifest e iconos, **modo sin conexión de verdad**, contraste medido en 20 pares × 3 temas, accesibilidad, persistencia al recargar, el día HOY, y los 114 ejercicios uno a uno comprobando que **cada imagen es la suya**. |

**Lección aprendida:** jsdom no calcula estilos. Un fallo puramente visual
(el temporizador tapando la app) pasó sus pruebas. Cualquier cambio de CSS
o de maquetación exige `npm run qa`, no `npm test`.

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
