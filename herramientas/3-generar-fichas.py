# -*- coding: utf-8 -*-
"""
Fichas v9: restauracion generativa. El grano fuera, no solo mas grande.

DE QUE SE QUEJABA ANDERSON, MEDIDO
----------------------------------
«Se ven granuladas, de mala calidad; no es solo tamaño». Tenia razon, y el
numero lo confirma: las fichas de la v8 tenian un grano de sigma 6,6 en el
papel y **3.381 colores distintos** donde la tarjeta impresa usa unos ocho.
Casi todo lo que se veia encima del dibujo era ruido: grano del sensor,
textura del carton y artefactos de JPEG, ademas amplificados por el enfoque
final que llevaba la v8.

POR QUE LA v8 NO PODIA ARREGLARLO
---------------------------------
EDSR es un modelo FIEL: aprende a estirar lo que hay, y no puede inventar
nada. Por eso, medido contra una verdad de referencia, salia bien... y por
eso dejaba el grano intacto: el grano tambien «es lo que hay» y lo estiraba
igual que al dibujo. La conclusion de entonces —«esto es el techo»— era mas
ancha que la medida: valia para los modelos fieles, no para los generativos.

QUE SE USA AHORA
----------------
**Real-ESRGAN, variante `anime_6B`**, en la GPU. Es un GAN entrenado con
degradaciones reales (ruido, JPEG, desenfoque) y esa variante esta entrenada
con DIBUJO: color plano y contorno limpio, que es exactamente esta tarjeta.
No solo amplia: reconstruye.

Medido sobre 8 tarjetas de gimnasio, frente a la v8:

  | tuberia              | grano | borde | fidelidad | seg |
  |----------------------|-------|-------|-----------|-----|
  | v8 (EDSR + enfoque)  | 1,98  | 0,425 | 0,9993    | 31  |
  | **suave + anime**    | **0,30** | **0,266** | **0,9910** | **0,3** |
  | esrgan general       | 0,58  | 0,286 | 0,9930    | 0,8 |
  | L0 + anime           | 0,16  | 0,269 | 0,9492    | 0,9 |

Grano seis veces y media menor, bordes mas definidos, y ademas cien veces
mas rapido. La variante `general` es peor en las dos cosas. Aplanar antes
con L0 deja el papel aun mas limpio pero **se lleva estructura por delante**
(fidelidad 0,949), asi que no se usa.

LA GUARDIA DE FIDELIDAD
-----------------------
Un modelo generativo puede dejar la imagen preciosa y haber cambiado una
mancuerna por una barra. Estas fichas le dicen a alguien con baja vision que
ejercicio hacer, asi que eso seria peor que el grano.

Por eso cada ficha se compara con su original **por los bordes** (donde
estan las lineas), no por los tonos. Para que el numero signifique algo se
calibro con un control: la misma medida entre DOS TARJETAS DISTINTAS da
**0,29**. Real-ESRGAN da **0,991**. Es la misma tarjeta, sin discusion.

`comprobar-fichas.py` vuelve a pasar esa guardia sobre las 55 ya generadas.

LO QUE SE PROBO Y NO SE USA
---------------------------
- **Enfoque final.** La v8 enfocaba a 1,4 · 55 %. Sobre la salida de
  Real-ESRGAN el enfoque solo devuelve grano (de 0,30 a 0,62) sin ganar
  definicion apreciable. Fuera.
- **Encadenar modelos de superresolucion**: seis cadenas medidas, ninguna
  gana a su primer paso (ver `banco/`).
- **Combinar las dos fotos de cada tarjeta**: +0,0045 SSIM, al borde de lo
  medible. Descartado.
- **Vectorizar** con vtracer: el binding se cae con Python 3.14 en cuanto se
  le pasan parametros. Quedaba como mejora futura, no como bloqueo.
- **Buscar el dibujo original en internet** (Google Lens): la baraja exacta
  no esta publicada. Circula arte parecido en redes, pero son DIBUJOS
  DISTINTOS de terceros y con licencia incierta: cambiarlos seria repetir el
  error de las fotos que no correspondian.

Tarda unos 3 minutos las 55, con GPU.
"""
import os, sys, time
import numpy as np
import cv2
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
TRABAJO = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"
DEST = os.path.join(AQUI, "..", "assets", "img", "ejercicios")

sys.path.insert(0, AQUI)
from importlib.machinery import SourceFileLoader
MAPA = SourceFileLoader("mapa_fichas", os.path.join(AQUI, "mapa-fichas.py")).load_module().MAPA
import restaurador                                   # Real-ESRGAN sobre la GPU

# --- geometria de la cuadricula, medida sobre el tablero rectificado ---
A_X0, A_PASO, A_ANCHO = 14, 457.6, 440
A_TOP, A_PASO_Y, A_ALTO = 66, 301.83, 300
AF_COLS = [
    [34, 863, 1689, 2510, 2923, 3340, 4177],
    [32, 862, 1278, 1686, 2100, 2922, 3762],
    [34, 488, 1236, 1647, 2413, 3178, 3595, 4222],
    [35, 860, 1276, 1690, 2509, 3343, 4175],
    [36, 845, 1260, 1693, 2107, 2522, 2940, 3359, 3805],
    [37, 448, 1140, 1553, 2093, 2509, 2927, 3607, 4098],
]
AF_TOP, AF_PASO_Y, AF_ALTO = 20, 380.4, 374
AF_DERECHA, GAP = 4592, 14

# Lienzo mayor que en la v8 (era 1000x750). Real-ESRGAN devuelve 1760 px por
# tarjeta de gimnasio: guardando 940 se tiraba casi la mitad. A 1400 se
# conserva el detalle que se ve al ampliar con el pellizco, que es como mira
# Anderson. Cuesta 2,7 MB mas en total, y se descarga una sola vez.
LIENZO = (1400, 1050)
MARGEN = 0.03
CALIDAD = 88

# Tarjetas que el flash estropeo en el tablero de Anderson y estan sanas en
# el de Sharid. **Esta lista se decidio mirando las 55 una a una**, no con la
# medida: `elegir-tablero.py` ayuda a ordenar candidatas, pero se le escapa
# el caso mas comun, que es la FRANJA de musculo reventada mientras el resto
# de la tarjeta conserva buen contraste (peck-deck, dominadas y
# jalon-delante-abierto son exactamente eso). Con solo 55 tarjetas, mirarlas
# es barato y es lo unico que no se equivoca.
#
# Y ahora importa mas que antes: EDSR emborronaba el destrozo y lo disimulaba;
# Real-ESRGAN reconstruye el borde y lo deja a la vista.
#
#   pantorrilla-sentado    titulo y dibujo ilegibles
#   sentadilla-mancuerna   titulo y dibujo ilegibles
#   prensa-atletica        franja PIERNA reventada
#   peck-deck              franja PECHO reventada y torso con vetas
#   dominadas              franja ESPALDA lavada y titulo gris
#   jalon-delante-abierto  franja ESPALDA lavada y titulo gris
DESDE_SHARID = {"pantorrilla-sentado", "sentadilla-mancuerna", "prensa-atletica",
                "peck-deck", "dominadas", "jalon-delante-abierto"}


def revelar(bgr):
    """Equilibrio de blancos y niveles. Va ANTES del modelo: reconstruye
    mucho mejor sobre una imagen que ya tiene contraste de verdad."""
    a = bgr.astype(np.float32)
    blanco = np.array([np.percentile(a[:, :, c], 92) for c in range(3)])
    blanco[blanco < 40] = 40
    a = a * (blanco.mean() / blanco)
    lum = a[:, :, 2] * 0.299 + a[:, :, 1] * 0.587 + a[:, :, 0] * 0.114
    negro, papel = np.percentile(lum, 1.5), np.percentile(lum, 95)
    if papel - negro < 25:
        negro, papel = float(lum.min()), float(max(lum.max(), lum.min() + 25))
    a = (a - negro) * ((250.0 - 8.0) / (papel - negro)) + 8.0
    return np.clip(a, 0, 255).astype(np.uint8)


def suavizar(bgr):
    """
    Un pase suave que respeta los bordes, ANTES del modelo.

    Sin esto, Real-ESRGAN convierte las cuatro motas reales del carton en
    puntos negros bien definidos: las afila igual que al dibujo. Es barato y
    no cuesta fidelidad (0,9910 frente a 0,9913 sin el).
    """
    return cv2.bilateralFilter(bgr, 5, 40, 40)


def encajar(bgr):
    """Al lienzo comun. Se rellena con el color del papel; nunca se recorta:
    antes que cortar contenido, sobra fondo."""
    LW, LH = LIENZO
    e = min(LW * (1 - 2 * MARGEN) / bgr.shape[1], LH * (1 - 2 * MARGEN) / bgr.shape[0])
    chico = cv2.resize(bgr, (max(1, int(bgr.shape[1] * e)), max(1, int(bgr.shape[0] * e))),
                       interpolation=cv2.INTER_AREA)
    # Nada de enfoque final: Real-ESRGAN ya deja el borde duro y enfocar
    # encima solo devuelve el grano que se acaba de quitar (medido).
    fondo = tuple(int(np.percentile(chico[:, :, c], 92)) for c in range(3))
    lienzo = np.full((LH, LW, 3), fondo, np.uint8)
    oy, ox = (LH - chico.shape[0]) // 2, (LW - chico.shape[1]) // 2
    lienzo[oy:oy + chico.shape[0], ox:ox + chico.shape[1]] = chico
    return lienzo


def caja_de(tablero, fila, col):
    if tablero == "A":
        x0 = int(A_X0 + A_PASO * col)
        y0 = int(A_TOP + A_PASO_Y * fila)
        return (x0, y0, x0 + A_ANCHO, y0 + A_ALTO)
    cols = AF_COLS[fila]
    x1 = (cols[col + 1] - GAP) if col + 1 < len(cols) else AF_DERECHA
    y0 = int(AF_TOP + AF_PASO_Y * fila)
    return (cols[col], y0, x1, y0 + AF_ALTO)


def guardar(bgr, ruta):
    """JPEG sin submuestreo de color: en texto y dibujo de linea el
    submuestreo se nota mas que la calidad."""
    Image.fromarray(bgr[:, :, ::-1]).save(ruta, quality=CALIDAD, subsampling=0)


def main():
    lienzos = {}
    for clave, archivo in (("A", "A_warp.jpg"), ("AF", "AF_warp.jpg"),
                           ("S", "S_alineado.jpg"), ("SF", "SF_alineado.jpg")):
        ruta = os.path.join(TRABAJO, archivo)
        if not os.path.exists(ruta):
            raise SystemExit(f"falta {ruta}. Ejecuta antes 1-rectificar.py y 2-alinear-sharid.py")
        lienzos[clave] = cv2.imread(ruta)

    os.makedirs(DEST, exist_ok=True)
    total, t0 = len(MAPA), time.time()
    for n, (clave, (tablero, fila, col)) in enumerate(sorted(MAPA.items()), 1):
        origen = tablero
        if clave in DESDE_SHARID:
            origen = "S" if tablero == "A" else "SF"
        x0, y0, x1, y1 = caja_de(tablero, fila, col)
        recorte = lienzos[origen][y0:y1, x0:x1]

        base = suavizar(revelar(recorte))
        guardar(encajar(restaurador.restaurar(base)),
                os.path.join(DEST, f"{clave}-ficha.jpg"))

        marca = "  (del tablero de Sharid)" if clave in DESDE_SHARID else ""
        print(f"[{n}/{total}] {clave}{marca}  ({time.time()-t0:.0f} s)", flush=True)
    print(f"Listo en {(time.time()-t0)/60:.1f} minutos")
    print("Ahora: python herramientas/comprobar-fichas.py")


if __name__ == "__main__":
    main()
