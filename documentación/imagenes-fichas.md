# Cómo se producen las fichas de los ejercicios

La imagen principal de cada ejercicio es **la tarjeta del tablero de Life Gym**,
recortada de las fotos que se tomaron el 2026-08-04. Es la única imagen que
corresponde con seguridad al ejercicio, porque es literalmente lo que entregó
el entrenador.

Este documento explica cómo se sacan, por qué cada paso está donde está, y
cuál es el techo real de calidad.

---

## Cuánto detalle hay de verdad, y qué se puede hacer con él

Medido sobre las fotos originales (5712 × 4284 px):

| Tablero | Panel dentro de la foto | Píxeles reales por tarjeta |
|---------|------------------------|----------------------------|
| Gimnasio (Anderson) | 4568 px | **457** |
| Gimnasio (Sharid) | 4352 px | 435 |
| Funcional (Anderson) | 4784 px | **629** |
| Funcional (Sharid) | 4792 px | 631 |

> **Corrección importante (v9).** Hasta la v8 este documento decía que eso era
> «el techo» y que la única forma de subirlo era volver a fotografiar. Esa
> conclusión era **más ancha que la medida que la sostenía**: valía para los
> modelos de superresolución *fieles* (EDSR y compañía), que por diseño solo
> estiran lo que hay. Los modelos **generativos** son otra categoría, y no se
> habían probado.
>
> Anderson lo señaló: *«se ven granuladas, de mala calidad; no es solo
> tamaño»*. Tenía razón. El problema no era la cantidad de píxeles, era que
> la señal venía **sucia**.

Medido sobre las fichas de la v8: un grano de σ 6,6 en el papel y **3.381
colores distintos** donde la tarjeta impresa usa unos ocho. Casi todo lo que
se veía encima del dibujo era ruido —grano del sensor, textura del cartón,
artefactos de JPEG— y encima el enfoque final lo amplificaba.

Los 457 px siguen siendo los que son. Pero **457 px limpios se leen mucho
mejor que 457 px sucios**, y eso sí se podía arreglar. Ver «Ampliar» más
abajo.

Volver a fotografiar por cuadrantes sigue siendo la única forma de tener
**más información** (está en `puntos-futuros.md`); lo que ya no es cierto es
que fuera lo único que quedaba por hacer.

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

### 4 · Restaurar y ampliar: **Real-ESRGAN**

Se usa **Real-ESRGAN, variante `anime_6B`**, corriendo en la GPU.

**Por qué se cambió EDSR.** EDSR es un modelo *fiel*: aprende a estirar lo
que hay y no puede inventar nada. Por eso, medido contra una verdad de
referencia, salía bien... y por eso dejaba el grano intacto: el grano
también «es lo que hay» y lo estiraba igual que al dibujo.

Real-ESRGAN es un GAN entrenado con degradaciones reales (ruido de sensor,
JPEG, desenfoque), y esa variante está entrenada con **dibujo**: zonas de
color plano y contorno limpio, que es exactamente una tarjeta impresa. No
solo amplía, **reconstruye**.

Medido sobre 8 tarjetas de gimnasio (457 px reales), llevadas al mismo
tamaño de pantalla:

| Tubería | Grano del papel | Dureza de borde | Fidelidad | Segundos |
|---------|-----------------|-----------------|-----------|----------|
| v8: EDSR ×2 + enfoque | 1,98 | 0,425 | 0,9993 | 31 |
| **suave + Real-ESRGAN anime** | **0,30** | **0,266** | **0,9910** | **0,3** |
| Real-ESRGAN general | 0,58 | 0,286 | 0,9930 | 0,8 |
| aplanado L0 + anime | 0,16 | 0,269 | 0,9492 | 0,9 |

Grano **seis veces y media menor**, borde más definido, y de paso cien veces
más rápido: las 55 fichas pasan de 39 minutos a 28 segundos.

- La variante `general` es peor en las dos cosas.
- Aplanar antes con L0 (minimización de gradiente) deja el papel aún más
  limpio, pero **se lleva estructura por delante**: la fidelidad cae a
  0,949. No se usa.
- El **pase suave previo** (filtro bilateral) es barato y evita que el
  modelo convierta las cuatro motas reales del cartón en puntos negros bien
  definidos. Cuesta 0,0003 de fidelidad.

#### La guardia de fidelidad

Un modelo generativo puede dejar la imagen preciosa y haber cambiado una
mancuerna por una barra. Estas fichas le dicen a alguien con baja visión qué
ejercicio hacer: eso sería peor que el grano.

Por eso cada ficha se compara con su original **por los bordes** —dónde
están las líneas— y no por los tonos. Comparar tonos no vale: cambiar un
papel gris moteado por uno blanco liso es un cambio de tono enorme y de
contenido ninguno, y suspendía justo a las tuberías buenas.

Para que el número signifique algo está **calibrado con un control**: la
misma medida entre dos tarjetas *distintas*. Ese es el suelo de «esto ya no
es la misma imagen».

| | Parecido de bordes |
|---|---|
| Las 55 fichas restauradas frente a su original | **0,992** |
| La más justa (*remo al pecho*) | 0,979 |
| **Control: dos tarjetas distintas** | **0,270** |

`herramientas/comprobar-fichas.py` vuelve a pasar esa guardia cuando se
quiera, y falla si alguna baja de 0,90.

---

### 4b · El banco de superresolución fiel (histórico, v8)

Esto es lo que se midió antes de descubrir la vía generativa. Sigue siendo
válido **dentro de su categoría**, y sostiene una conclusión que no ha
cambiado: encadenar modelos no sirve.

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
- Lienzo **1400 × 1050 (4:3) idéntico para todas**, con la tarjeta centrada y
  el resto relleno con el color del papel. Así todas las fichas salen del
  mismo tamaño y ninguna aparece recortada.

  Era 1000 × 750 hasta la v8. Real-ESRGAN devuelve 1760 px por tarjeta de
  gimnasio, así que guardando 940 se tiraba casi la mitad. A 1400 se conserva
  el detalle que se ve **al ampliar con el pellizco**, que es como mira
  Anderson. Cuesta 2,7 MB más en total, y se descarga una sola vez.

  | Lienzo | KB por ficha | Las 55 |
  |--------|--------------|--------|
  | 1000 × 750 (v8) | 102 | 5,5 MB |
  | 1200 × 900 | 132 | 7,1 MB |
  | **1400 × 1050** | **164** | **8,8 MB** |
  | 1600 × 1200 | 196 | 10,5 MB |

- **Sin enfoque final.** La v8 enfocaba a 1,4 · 55 % porque EDSR dejaba el
  borde blando. Sobre la salida de Real-ESRGAN el enfoque solo devuelve
  grano —de 0,30 a 0,62— sin ganar definición apreciable. Fuera.
- JPEG calidad 88 **sin submuestreo de color** (`subsampling=0`). En texto e
  imagen de línea el submuestreo se nota más que la calidad.

Resultado: ~164 KB por ficha, 8,8 MB las 55.

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

Resultado: **seis** tarjetas se toman del tablero de Sharid.

| Tarjeta | Qué le pasa en el tablero de Anderson |
|---------|--------------------------------------|
| Pantorrilla sentado | título y dibujo ilegibles (contraste 71) |
| Sentadilla con mancuernas | título y dibujo ilegibles (contraste 100) |
| Prensa atlética | franja PIERNA reventada |
| Peck deck | franja PECHO reventada y torso con vetas |
| Dominadas | franja ESPALDA lavada y título gris |
| Jalones delante abierto | franja ESPALDA lavada y título gris |

Las otras 49 se quedan con el tablero de Anderson, que es la foto más nítida
de las dos y donde las marcas son las suyas.

**Esta lista se decidió mirando las 55 una a una** (`cotejar-tableros.py
todas`), no con una métrica. `elegir-tablero.py` ayuda a ordenar candidatas,
pero se le escapa el caso más común: la **franja de músculo** reventada
mientras el resto de la tarjeta conserva buen contraste. *Peck deck*,
*Dominadas* y *Jalones delante abierto* son exactamente eso, y la métrica las
daba por buenas.

Con 55 tarjetas, mirarlas cuesta poco y es lo único que no se equivoca.

Y ahora importa más que antes: **EDSR emborronaba el destrozo y lo
disimulaba; Real-ESRGAN reconstruye el borde y lo deja a la vista.** Una
tarjeta con la tinta lavada sale con las letras nítidas por fuera y
agujereadas por dentro. Al mejorar la tubería hubo que rehacer esta
elección.

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
- **No se encadenan modelos.** Seis cadenas medidas, ninguna gana a su primer
  paso (tabla del apartado 4b).
- **No se enfoca después de Real-ESRGAN.** Solo devuelve el grano.

## Lo que se probó en la v9 y no entró

- **Vectorizar la ficha** (`vtracer`). Sobre dibujo de color plano tiene todo
  el sentido —un vector no se pixela por mucho que se amplíe, que es justo lo
  que le vendría bien a Anderson—, pero el binding de Python se cae con
  Python 3.14 en cuanto se le pasan parámetros de configuración; solo funciona
  con los valores por defecto, que dejan las letras deformadas. Queda como
  mejora futura, no como algo bloqueado por la idea.

- **Buscar el dibujo original en internet** (Google Lens, por sugerencia de
  Anderson). La búsqueda inversa confirma que **la baraja exacta no está
  publicada**: cero coincidencias exactas. Sí circula por redes arte de
  gimnasio con un estilo parecido —muñeco de pantalón amarillo sobre blanco—,
  pero son **dibujos distintos**, de terceros y con licencia incierta.
  Cambiarlos por esos sería repetir el error que ya se cometió con las fotos
  que «se parecían»: la ficha tiene que ser la tarjeta que entregó el
  entrenador.

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
