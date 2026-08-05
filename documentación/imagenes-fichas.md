# Cómo se producen las fichas de los ejercicios

La imagen principal de cada ejercicio es **la tarjeta del tablero de Life Gym**,
recortada de las fotos que se tomaron el 2026-08-04. Es la única imagen que
corresponde con seguridad al ejercicio, porque es literalmente lo que entregó
el entrenador.

Este documento explica cómo se sacan, por qué cada paso está donde está, y
cuál es el techo real de calidad.

---

## El techo: cuánto detalle hay de verdad

Medido sobre las fotos originales (5712 × 4284 px):

| Tablero | Panel dentro de la foto | Píxeles reales por tarjeta |
|---------|------------------------|----------------------------|
| Gimnasio (Anderson) | 4568 px | **457** |
| Gimnasio (Sharid) | 4352 px | 435 |
| Funcional (Anderson) | 4784 px | **629** |
| Funcional (Sharid) | 4792 px | 631 |

Eso es todo el detalle que existe. Cualquier ampliación por encima de ahí es
reconstrucción, no información nueva. Es importante tenerlo claro: se puede
hacer que se vean **mucho mejor**, pero no se puede leer algo que la foto no
capturó.

**La forma de subir ese techo es volver a fotografiar**, no procesar mejor:
una foto por cuadrante del tablero (4 fotos por cara en vez de 1) daría
aproximadamente el doble de píxeles por tarjeta. Está en `puntos-futuros.md`.

---

## El proceso, paso a paso

Los scripts están en `herramientas/`. Necesitan las fotos originales, que
**no** están en el repositorio (van en `recursos/`, fuera de git).

### 1 · Corregir la perspectiva

Las fotos están tomadas en ángulo: la cuadrícula sale como un trapecio y las
tarjetas de un lado miden distinto que las del otro.

Se detectan las 4 esquinas del panel claro (componentes conexas sobre el
brillo) y se aplica una **homografía** que lo devuelve a un rectángulo
perfecto. A partir de ahí la cuadrícula es regular y se puede medir.

La salida se genera a 4600 px de ancho, que es prácticamente 1:1 con el
original: no se tira resolución ni se inventa.

### 2 · Medir la cuadrícula, no adivinarla

- **Tablero de gimnasio:** la rejilla es uniforme. Ajustando sobre las franjas
  de músculo detectadas en varias filas sale `x = 14 + 457,6 · columna`,
  y las filas en `y = 66 + 301,83 · fila`.
- **Tablero funcional:** los anchos son irregulares (unas tarjetas ocupan el
  doble que otras). Los bordes izquierdos se midieron fila por fila y están
  escritos a mano en el script.

Se recorta **la tarjeta entera**: franja de músculo, título y dibujo. Recortar
desde el final de la franja parecía más limpio pero se comía los títulos.

### 3 · Revelar

Las fotos salen lavadas y amarillentas por la luz del gimnasio. Antes de
ampliar:

1. **Equilibrio de blancos** por canal sobre el papel (percentil 92), para que
   el cartón sea blanco y no crema.
2. **Niveles** sobre la luminancia: la tinta al 8 y el papel al 250, con la
   escala aplicada a los tres canales para no desteñir los colores del dibujo.

Este paso va **antes** de la ampliación a propósito: la red de superresolución
trabaja mucho mejor sobre una imagen con contraste real.

### 4 · Ampliar con superresolución neuronal

Se usa **EDSR ×3** (`cv2.dnn_superres`, modelo de 37 MB). Se probaron cuatro
modelos sobre la misma ficha:

| Modelo | Tiempo | Resultado sobre el título impreso |
|--------|--------|-----------------------------------|
| LANCZOS (sin red) | instantáneo | bordes blandos, gris difuso |
| FSRCNN ×3 | 0,2 s | apenas mejor que LANCZOS |
| ESPCN ×3 | 0,2 s | apenas mejor que LANCZOS |
| **EDSR ×3** | **33 s** | **bordes limpios, sin halos — el mejor** |
| LapSRN ×4 | 3,6 s | bueno, pero con halo alrededor de las letras |

EDSR es 150 veces más lento que los demás, pero son 55 fichas y se generan
una sola vez. Sobre dibujo de línea y tipografía la diferencia se ve.

### 5 · Encajar y guardar

- Se reduce al lienzo final. **Bajar después de ampliar** consolida el detalle
  y quita lo que la red haya podido inventar de más.
- Lienzo **1000 × 750 (4:3) idéntico para todas**, con la tarjeta centrada y
  el resto relleno con el color del papel. Así todas las fichas salen del
  mismo tamaño y ninguna aparece recortada.
- Enfoque suave (radio 1,1 · 55 %), mucho menor que sin red: EDSR ya define
  los bordes y pasarse genera halos.
- JPEG calidad 88 **sin submuestreo de color** (`subsampling=0`). En texto e
  imagen de línea el submuestreo se nota más que la calidad.

Resultado: ~115 KB por ficha, 6,3 MB las 55.

---

## Las dos fichas que vienen del otro tablero

En el tablero de Anderson el flash quemó una zona, y dos tarjetas quedaron
ilegibles: **Sentadilla con mancuernas** y **Pantorrilla sentado**. Se sacan
del tablero de Sharid, donde el reflejo cae en otro sitio. El dibujo y el
título son idénticos en los dos.

## Lo que NO se hace

- **No se borra la columna de casillas.** Se probó: el parche se veía peor que
  las propias marcas y se comía los títulos de dos líneas. La ficha se muestra
  tal cual está en el cartón.
- **No se recorta para "cuadrar".** Antes que cortar contenido, se rellena.

---

## Las fotos que acompañan

Además de la ficha, cada ejercicio lleva **dos fotos reales** de
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio
público). De los 55, en **20 el movimiento es solo parecido** (la ficha es de
TRX y la foto de peso libre, la ficha tumbado y la foto sentado…).

No se ocultan —sirven de referencia— pero el rótulo lo dice: **«⚠ Foto
parecida»**, y bajo el carrusel aparece *«La que manda es la ficha del
gimnasio»*. El campo `fotosOk` del catálogo es lo que decide ese rótulo.

`prueba-completitud.js` comprueba por MD5 que **ninguna imagen esté repetida**
entre dos ejercicios: ese error hacía que «TRX abductor» enseñara la máquina
abductora.
