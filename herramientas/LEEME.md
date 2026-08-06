# Herramientas de producción de imágenes

Estos scripts **no** forman parte de la app: sirven para regenerar las fichas
de los ejercicios a partir de las fotos de los tableros. Se ejecutan a mano,
una vez, cuando cambian las fotos o el plan.

El proceso completo y el porqué de cada paso están en
**[../documentación/imagenes-fichas.md](../documentación/imagenes-fichas.md)**.

## Qué hace falta

```bash
python -m pip install pillow numpy opencv-contrib-python
```

Y las **fotos originales de los tableros**, que no están en el repositorio
(van en `recursos/`, fuera de git por llevar datos personales).

## Orden

| Script | Qué hace |
|--------|----------|
| `1-rectificar.py` | Detecta las 4 esquinas del panel en las fotos de Anderson y corrige la perspectiva. Deja `A_warp.jpg` y `AF_warp.jpg`, los tableros como rectángulos perfectos. |
| `2-alinear-sharid.py` | Empareja los tableros de Sharid con los de Anderson por SIFT y los deja **en el mismo lienzo**. De ahí salen las tarjetas que en el tablero de Anderson quemó el flash. |
| `mapa-fichas.py` | La tabla `clave del ejercicio → (tablero, fila, columna)`. No se ejecuta solo; lo importan los siguientes. |
| `3-generar-fichas.py` | Recorta cada tarjeta del tablero que mejor la captó, la revela (blancos y niveles), la restaura con **Real-ESRGAN** y la guarda en `assets/img/ejercicios/<clave>-ficha.jpg`. **28 segundos** las 55, con GPU. |
| `restaurador.py` | El modelo (RRDBNet / Real-ESRGAN `anime_6B`). No se ejecuta solo. |
| `comprobar-fichas.py` | **La guardia.** Comprueba que la restauración no se inventó nada, comparando bordes contra el original. Pásalo siempre después de regenerar. |
| `cotejar-tableros.py` | Saca la misma tarjeta restaurada desde los dos tableros para compararlas a ojo. `... todas` hace las 55. |
| `elegir-tablero.py` | Ordena candidatas a cambiar de tablero. **Orienta, no decide** (ver su cabecera). |
| `descargar-fotos.js` | Baja de free-exercise-db las dos fotos reales de cada ejercicio. |
| `comparar-superresolucion.py` | Compara modelos de superresolución fieles sobre una misma ficha (histórico, v8). |

## Lo que hace falta

```bash
python -m pip install pillow numpy opencv-contrib-python
python -m pip install --index-url https://download.pytorch.org/whl/cu126 torch
```

Los pesos de los modelos (18 MB Real-ESRGAN, ~38 MB cada EDSR) se descargan
solos a `modelos/`. No están en el repositorio por tamaño.

Sin GPU funciona igual, en la CPU, solo que tarda bastante más.

**El porqué de cada decisión está medido** en
`../documentación/imagenes-fichas.md`, y los bancos de prueba están en
`banco/`. Son decisiones con número detrás, no preferencias: no las cambies
sin volver a pasar el banco. En particular: **encadenar modelos no sirve** y
**enfocar después de Real-ESRGAN solo devuelve el grano**.

## Después de regenerar

```bash
python herramientas/comprobar-fichas.py   # la restauracion no se invento nada
npm run sw                                # lista del service worker
npm run qa                                # que no falte ni sobre ninguna imagen
```

Y subir `VERSION` en `sw.js` y `VERSION_APP` en `assets/js/datos-planes.js`.
