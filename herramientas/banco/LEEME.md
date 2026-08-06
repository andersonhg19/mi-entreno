# Banco de pruebas de imagen

Aquí están las medidas que sostienen las decisiones de
[`../../documentación/imagenes-fichas.md`](../../documentación/imagenes-fichas.md).

No hacen falta para generar las fichas. Están para que dentro de tres meses
—o cuando aparezca un modelo nuevo— se pueda **volver a medir** en vez de
volver a opinar.

## La idea

El tablero funcional tiene 629 px reales por tarjeta; el de gimnasio, 457.
Así que las tarjetas del funcional sirven de **verdad**: se reducen 2,14
veces (el mismo aumento que hace la app), se reconstruyen con cada método y
se compara con la verdad que sí tenemos.

| Script | Pregunta que responde | Respuesta que dio |
|--------|----------------------|-------------------|
| `banco-superresolucion.py` | ¿Qué modelo amplía mejor? ¿Encadenar varios mejora? | EDSR ×2. **Encadenar no: ninguna de las seis cadenas gana a su primer paso.** |
| `banco-enfoque.py` | ¿Cuánto enfoque final? ¿×2 o ×3? | Radio 1,4 al 55 %, y ×2 mejor que ×3. |
| `banco-multiframe-limpio.py` | ¿Combinar las dos fotos de cada tarjeta recupera detalle? | +0,0045 SSIM y −0,22 dB PSNR: al borde de lo medible. Descartado. |
| `calidad-por-tarjeta.py` | ¿Qué tablero captó mejor cada tarjeta? | Tres del de Sharid, 52 del de Anderson. |

## Cómo se ejecutan

Necesitan los tableros ya rectificados y alineados en la carpeta de trabajo
(`1-rectificar.py` y `2-alinear-sharid.py`), y los modelos en `../modelos/`.

```bash
python banco-superresolucion.py     # ~3,5 h: las cadenas son muy lentas
python banco-enfoque.py             # ~8 min
python banco-multiframe-limpio.py   # ~1 min
python calidad-por-tarjeta.py       # segundos
```

## Dos avisos, que costaron tiempo

**No midas contra una foto que sea una de las dos que comparas.** El primer
intento de evaluar la combinación usaba como verdad la propia foto de
Anderson, así que todo lo que aportara la de Sharid contaba como error por
definición. Salía que combinar empeora, y esa medida no valía nada.

**No decidas por «detalle» donde hay reflejos.** El borde del propio reflejo
cuenta como detalle, así que una tarjeta ilegible puntúa más alto que la
buena. Para eso sirve el contraste, no la energía de bordes.
