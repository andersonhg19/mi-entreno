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
| `1-rectificar.py` | Detecta las 4 esquinas del panel en cada foto y corrige la perspectiva. Deja `A_warp.jpg` y `AF_warp.jpg`, los tableros como rectángulos perfectos. |
| `mapa-fichas.py` | La tabla `clave del ejercicio → (tablero, fila, columna)`. No se ejecuta solo; lo importa el siguiente. |
| `2-generar-fichas.py` | Recorta cada tarjeta, la revela (blancos y niveles), la amplía con **EDSR ×3** y la guarda en `assets/img/ejercicios/<clave>-ficha.jpg`. **Tarda ~35 minutos** para las 55. |
| `descargar-fotos.js` | Baja de free-exercise-db las dos fotos reales de cada ejercicio. |
| `comparar-superresolucion.py` | Descarga cuatro modelos de superresolución y los compara sobre una misma ficha. Es lo que se usó para elegir EDSR. |

El modelo EDSR (37 MB) lo descarga `comparar-superresolucion.py` a
`modelos/edsr_x3.pb`. No está en el repositorio por tamaño.

## Después de regenerar

```bash
npm run sw    # actualiza la lista del service worker
npm run qa    # comprueba que no falte ni sobre ninguna imagen
```

Y subir `VERSION` en `sw.js` y `VERSION_APP` en `assets/js/datos-planes.js`.
