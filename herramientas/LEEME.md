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
| `mapa-fichas.py` | La tabla `clave del ejercicio → (tablero, fila, columna)`. No se ejecuta solo; lo importa el siguiente. |
| `3-generar-fichas.py` | Recorta cada tarjeta del tablero que mejor la captó, la revela (blancos y niveles), la amplía con **EDSR ×2**, la enfoca y la guarda en `assets/img/ejercicios/<clave>-ficha.jpg`. **Tarda ~10 minutos** para las 55. |
| `descargar-fotos.js` | Baja de free-exercise-db las dos fotos reales de cada ejercicio. |
| `comparar-superresolucion.py` | Descarga los modelos de superresolución y los compara sobre una misma ficha. |

Los modelos EDSR (~38 MB cada uno) los descarga `comparar-superresolucion.py`
a `modelos/`. No están en el repositorio por tamaño.

**El porqué de EDSR ×2, del enfoque 1,4 · 55 % y de por qué encadenar modelos
no sirve está medido** en `../documentación/imagenes-fichas.md`. Son
decisiones con número detrás, no preferencias: no las cambies sin volver a
pasar el banco.

## Después de regenerar

```bash
npm run sw    # actualiza la lista del service worker
npm run qa    # comprueba que no falte ni sobre ninguna imagen
```

Y subir `VERSION` en `sw.js` y `VERSION_APP` en `assets/js/datos-planes.js`.
