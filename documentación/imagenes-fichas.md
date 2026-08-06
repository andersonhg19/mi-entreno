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

Se usa **EDSR ×2**. La primera vez el modelo se eligió a ojo; ahora está
medido, y la medida cambió dos decisiones.

**Cómo se mide.** El tablero funcional tiene 629 px reales por tarjeta y el
de gimnasio 457. Así que las tarjetas del funcional sirven de **verdad**: se
reducen 2,14 veces —el mismo aumento que hace la app al llevar una tarjeta
de gimnasio al lienzo final—, se vuelven a ampliar con cada tubería y se
compara el resultado con la verdad que sí tenemos. Nadie opina: sale un
número.

| Tubería | PSNR | SSIM | Nitidez vs. verdad |
|---------|------|------|--------------------|
| LANCZOS (sin red) | 30,70 | 0,9605 | 0,90 |
| FSRCNN ×3 | 29,45 | 0,9445 | 0,84 |
| ESPCN ×3 | 29,32 | 0,9479 | 0,83 |
| LapSRN ×4 | 29,89 | 0,9483 | 0,83 |
| **EDSR ×2** | 31,56 | **0,9650** | 0,87 |
| EDSR ×3 | **31,97** | 0,9632 | 0,88 |
| EDSR ×2 → EDSR ×2 | 31,25 | 0,9637 | 0,86 |
| EDSR ×3 → EDSR ×2 | 31,79 | 0,9626 | 0,87 |
| EDSR ×2 → LapSRN ×2 | 31,34 | 0,9629 | 0,86 |
| EDSR ×3 → LapSRN ×2 | 31,82 | 0,9620 | 0,87 |
| LapSRN ×2 → EDSR ×2 | 29,81 | 0,9533 | 0,85 |
| ESPCN ×2 → EDSR ×2 | 30,16 | 0,9578 | 0,85 |

Tres conclusiones:

- **Encadenar modelos no funciona.** Era la idea más prometedora sobre el
  papel: pasar un modelo sobre el resultado de otro. Se probaron seis
  cadenas y **ninguna gana a su propio primer paso**. Lo que hace la
  segunda pasada es amplificar lo que la primera se inventó. Y si delante
  va un modelo flojo, el resultado se arruina aunque detrás vaya EDSR
  (0,9533 frente a 0,9650).
- **×2 va mejor que ×3**, medido sobre 47 tarjetas. Tiene sentido: el
  aumento que hace falta es 2,14, así que ×3 se pasa y luego hay que bajar
  un 30 %, tirando lo que la red acababa de reconstruir.
- Ninguna tubería llega a la nitidez del cartón real (todas por debajo de
  1,00). Por eso el enfoque final del paso 5 no es un capricho.

### 5 · Encajar y guardar

- Se reduce al lienzo final. **Bajar después de ampliar** consolida el detalle
  y quita lo que la red haya podido inventar de más.
- Lienzo **1000 × 750 (4:3) idéntico para todas**, con la tarjeta centrada y
  el resto relleno con el color del papel. Así todas las fichas salen del
  mismo tamaño y ninguna aparece recortada.
- Enfoque de **radio 1,4 al 55 %**, también medido contra la verdad y no a
  ojo. Con el 1,1 que se usaba antes el resultado se quedaba en 0,95 de la
  nitidez del cartón real; con 1,4 llega a 0,99 y el SSIM sube de 0,9715 a
  0,9762. Por encima de ahí el SSIM se desploma: son halos.

  | Radio · % | SSIM | Nitidez vs. verdad |
  |-----------|------|--------------------|
  | sin enfoque | 0,9679 | 0,88 |
  | 1,1 · 55 % (antes) | 0,9754 | 0,95 |
  | **1,4 · 55 %** | **0,9762** | **0,99** |
  | 1,4 · 80 % | 0,9739 | 1,04 |
  | 1,8 · 110 % | 0,9568 | 1,15 |
- JPEG calidad 88 **sin submuestreo de color** (`subsampling=0`). En texto e
  imagen de línea el submuestreo se nota más que la calidad.

Resultado: ~115 KB por ficha, 6,3 MB las 55.

---

## Los dos tableros son la misma baraja

Esto resultó ser lo más útil de todo el proceso, y no era evidente: el
tablero de Anderson y el de Sharid llevan **las mismas tarjetas**. Mismos
dibujos, mismos títulos, misma cuadrícula. Lo único que cambia es el color
de las franjas de músculo —azul marino en uno, granate en el otro— y las
marcas de cada quien.

Es decir: de cada tarjeta hay **dos fotos independientes**. Y, sobre todo,
**el reflejo del flash cae en sitios distintos**. La columna que en un
tablero salió quemada, en el otro está impecable.

`herramientas/2-alinear-sharid.py` empareja los dos tableros con SIFT
(~2.200 correspondencias, 2,6 px de error medio sobre un panel de 4.600 px)
y deja el de Sharid **en el mismo lienzo** que el de Anderson, así que la
geometría de recorte ya medida sirve para los dos.

Con los dos tableros alineados se puede comparar tarjeta a tarjeta. La
medida que decide es el **contraste** (p98 − p2 de la luminancia):

- El *porcentaje de píxeles reventados* engaña: *Leg extension* sale
  perfecta con un 8 % de blanco reventado, porque lo que está quemado es el
  papel, no el dibujo.
- La *medida de detalle* engaña más todavía: el borde del propio reflejo
  cuenta como detalle, así que una tarjeta ilegible puntúa **más alto** que
  la buena.
- El contraste separa limpio: las tarjetas destrozadas dan 71 y 100, y
  todas las sanas pasan de 150.

Resultado: **tres** tarjetas se toman del tablero de Sharid.

| Tarjeta | Contraste en Anderson | En Sharid |
|---------|----------------------|-----------|
| Pantorrilla sentado | 71 (ilegible) | 184 |
| Sentadilla con mancuernas | 100 (ilegible) | 173 |
| Prensa atlética | 183 | 196 |

Las otras 52 se quedan con el tablero de Anderson, que es la foto más
nítida de las dos y donde las marcas son las suyas. Y **no** se cambian a
la ligera: cada candidata se miró en pantalla al lado de su pareja antes de
decidir.

### Combinar las dos fotos: probado y descartado

La idea siguiente era obvia: si hay dos fotos de la misma tarjeta,
promediarlas debería recuperar detalle (superresolución multi-imagen).

Se midió con una prueba limpia —dos capturas simuladas de una misma verdad,
cada una con su desplazamiento de subpíxel, su desenfoque y su ruido, para
que ningún método jugara en casa—: combinar da **+0,0045 de SSIM y −0,22 dB
de PSNR**. Está al borde de lo que se puede medir.

Y eso en el caso ideal. Con las fotos reales sería menos, porque los dos
tableros son ediciones distintas y cualquier error de alineación
**fantasmea el texto**, que se ve bastante peor que un texto blando. No
compensa.

(El primer intento de medirlo estaba mal planteado: comparaba
«Anderson solo» contra «Anderson + Sharid» usando como verdad la propia
foto de Anderson, con lo que todo lo que aportara la otra foto contaba como
error por definición. Decía que combinar empeora, pero medido así no decía
nada.)

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
