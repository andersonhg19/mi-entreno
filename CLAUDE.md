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

7. **Honestidad sobre las fotos.** Si una foto no es exactamente el ejercicio,
   `exacta: false` y la app lo advierte en pantalla. Nunca al revés.

8. **Todo en español**, incluidos nombres de variables, funciones, comentarios y
   claves de datos. Es el idioma del usuario y de las planillas.

## Estructura

```
index.html · manifest.webmanifest · sw.js · servidor.js
assets/css/estilos.css
assets/js/  datos-catalogo.js  datos-planes.js
            almacenamiento.js  voz.js  cronometro.js  app.js
assets/img/ejercicios/<clave>-0.jpg  (inicio)
                      <clave>-1.jpg  (final)
pruebas/  documentación/  seguimiento/  recursos/
```

`app.js` es lo único que toca el DOM de las vistas.
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

El modo consulta reutiliza `bloqueEjercicio()` pero **no** lleva contador de
series: no hay sesión de un día concreto a la que asociarlas.

## Al agregar un ejercicio

1. Añadirlo a `datos-catalogo.js` con los 8 campos:
   `nombre`, `grupo`, `equipo`, `exacta`, `donde`, `pasos`, `ojo`, `buscar`.
   - `donde` describe **cómo reconocer la máquina**, no qué músculo trabaja.
     Es lo que resuelve el problema real de no poder leer los letreros.
   - `pasos`: mínimo 3, una sola acción por paso, en imperativo, frases cortas.
   - `ojo`: advertencia de seguridad o adaptación. Si el entrenador anotó algo
     a mano en la planilla, va aquí en mayúsculas.
2. Poner las dos fotos en `assets/img/ejercicios/`.
3. Añadir las dos rutas de imagen a `ARCHIVOS` en `sw.js`.
4. Referenciar la clave desde el día que corresponda en `datos-planes.js`.
5. `npm test`.
6. Subir `VERSION` en `sw.js`.

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
| `validar-datos.js` | Sin dependencias. Sintaxis, campos obligatorios, imágenes que faltan, claves rotas entre planes y catálogo, precarga del service worker, referencias de `index.html`, `getElementById` sin destino, y la guardia del `[hidden]`. |
| `prueba-humo.js` | jsdom. Recorre las 145 pantallas y ejercita series, temporizador, marcar hecho, filtros de la lista, modo consulta, ajustes y rutas inválidas. |
| `prueba-visual.js` | Chromium real. Lo que jsdom **no** ve: qué tapa qué, desbordes a lo ancho, fotos rotas, áreas tocables, los tres temas y la letra al máximo. Deja capturas en `pruebas/capturas/`. |
| `prueba-pwa.js` | Manifest e iconos, **modo sin conexión de verdad**, contraste medido, accesibilidad, persistencia al recargar, el día HOY, y un recorrido por los 114 ejercicios en navegador real. |

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
