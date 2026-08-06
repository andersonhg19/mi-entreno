# -*- coding: utf-8 -*-
"""
Fichas v8: la mejor de las dos fotos + superresolucion medida, no elegida a ojo.

QUE CAMBIA FRENTE A LA v7
-------------------------
1. EDSR x2 en vez de x3. El aumento que hace falta de verdad es 2,14, asi
   que x3 se pasa y luego hay que bajar un 30 %, tirando lo que la red
   acababa de reconstruir. Medido sobre 47 tarjetas del tablero funcional
   (629 px reales, que sirven de verdad): x2 da SSIM 0,976 y x3 0,972.

2. Enfoque final de radio 1,4 al 55 % en vez de 1,1 al 55 %. El banco
   mostro que TODAS las tuberias devuelven menos energia de borde que el
   carton real; con 1,1 el resultado se quedaba en 0,95 de la nitidez del
   original y con 1,4 llega a 0,99 sin pasarse. Por encima de ahi el SSIM
   se desploma: son halos.

3. Tres tarjetas se toman del tablero de Sharid en vez de dos, y ya no de
   un recorte a mano sino del tablero entero alineado por `2-alinear-sharid`.
   Antes salian de un archivo suelto en una carpeta temporal de otra
   sesion, que podia desaparecer en cualquier momento.

LO QUE SE MIDIO Y NO SE HIZO
----------------------------
- Encadenar modelos (x3 y luego x2, EDSR y luego LapSRN...). Se probaron
  seis cadenas: NINGUNA gana a su propio primer paso. Encadenar amplifica
  lo que el primer modelo se invento. Y poner un modelo flojo delante
  arruina el resultado aunque detras vaya EDSR.

- Combinar las dos fotos de cada tarjeta (superresolucion multi-imagen).
  En una prueba limpia —dos capturas simuladas de una misma verdad, con su
  desplazamiento de subpixel, su desenfoque y su ruido— combinar da +0,0045
  de SSIM y -0,22 dB de PSNR: al borde de lo que se mide. Con las fotos
  reales seria menos todavia, porque los dos tableros son ediciones
  distintas (franjas de otro color, marcas de rotulador en otro sitio) y
  cualquier error de alineacion fantasmea el texto, que se ve mucho peor
  que un texto blando. No compensa.

El techo sigue siendo la foto: 457 px reales por tarjeta en el tablero de
gimnasio, 629 en el funcional. Para subirlo hay que volver a fotografiar
por cuadrantes (ver `documentación/puntos-futuros.md`), no procesar mejor.

Tarda ~5 minutos las 55.
"""
import os, sys, time
import numpy as np
import cv2
from PIL import Image, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
TRABAJO = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"
MODELOS = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\modelos"
DEST = os.path.join(AQUI, "..", "assets", "img", "ejercicios")
MODELO = os.path.join(MODELOS, "edsr_x2.pb")

sys.path.insert(0, AQUI)
from importlib.machinery import SourceFileLoader
MAPA = SourceFileLoader("mapa_fichas", os.path.join(AQUI, "mapa-fichas.py")).load_module().MAPA

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

LIENZO = (1000, 750)
MARGEN = 0.03
ENFOQUE_RADIO, ENFOQUE_PCT = 1.4, 55        # medidos, ver cabecera

# Tarjetas que en el tablero de Anderson el flash dejo sin contraste y que
# en el de Sharid estan sanas. La cifra es el contraste (p98-p2) de cada una:
#   pantorrilla-sentado    71 -> 184      sentadilla-mancuerna  100 -> 173
#   prensa-atletica       183 -> 196
# El resto se queda con el tablero de Anderson, que es la foto mas nitida
# de las dos y donde las marcas son las suyas.
DESDE_SHARID = {"pantorrilla-sentado", "sentadilla-mancuerna", "prensa-atletica"}

sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(MODELO)
sr.setModel("edsr", 2)


def revelar(im):
    """Equilibrio de blancos y niveles. Va ANTES de ampliar: la red trabaja
    mucho mejor sobre una imagen que ya tiene contraste de verdad."""
    a = np.asarray(im).astype(np.float32)
    blanco = np.array([np.percentile(a[:, :, c], 92) for c in range(3)])
    blanco[blanco < 40] = 40
    a = a * (blanco.mean() / blanco)
    lum = a[:, :, 0] * 0.299 + a[:, :, 1] * 0.587 + a[:, :, 2] * 0.114
    negro, papel = np.percentile(lum, 1.5), np.percentile(lum, 95)
    if papel - negro < 25:
        negro, papel = float(lum.min()), float(max(lum.max(), lum.min() + 25))
    a = (a - negro) * ((250.0 - 8.0) / (papel - negro)) + 8.0
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def ampliar(im):
    grande = sr.upsample(cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR))
    return Image.fromarray(cv2.cvtColor(grande, cv2.COLOR_BGR2RGB))


def encajar(im):
    """Al lienzo comun. Se rellena con el color del papel; nunca se recorta:
    antes que cortar contenido, sobra fondo."""
    LW, LH = LIENZO
    e = min(LW * (1 - 2 * MARGEN) / im.width, LH * (1 - 2 * MARGEN) / im.height)
    im = im.resize((max(1, int(im.width * e)), max(1, int(im.height * e))), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=ENFOQUE_RADIO,
                                           percent=ENFOQUE_PCT, threshold=3))
    fondo = tuple(int(np.percentile(np.asarray(im)[:, :, c], 92)) for c in range(3))
    lienzo = Image.new("RGB", LIENZO, fondo)
    lienzo.paste(im, ((LW - im.width) // 2, (LH - im.height) // 2))
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


def main():
    # Los tableros de Sharid ya vienen en el lienzo de Anderson, asi que la
    # misma caja vale para los cuatro.
    lienzos = {}
    for clave, archivo in (("A", "A_warp.jpg"), ("AF", "AF_warp.jpg"),
                           ("S", "S_alineado.jpg"), ("SF", "SF_alineado.jpg")):
        ruta = os.path.join(TRABAJO, archivo)
        if not os.path.exists(ruta):
            raise SystemExit(f"falta {ruta}. Ejecuta antes 1-rectificar.py y 2-alinear-sharid.py")
        lienzos[clave] = Image.open(ruta).convert("RGB")

    os.makedirs(DEST, exist_ok=True)
    total, t0 = len(MAPA), time.time()
    for n, (clave, (tablero, fila, col)) in enumerate(sorted(MAPA.items()), 1):
        origen = tablero
        if clave in DESDE_SHARID:
            origen = "S" if tablero == "A" else "SF"
        recorte = lienzos[origen].crop(caja_de(tablero, fila, col))
        encajar(ampliar(revelar(recorte))).save(
            os.path.join(DEST, f"{clave}-ficha.jpg"), quality=88, subsampling=0)
        marca = "  (del tablero de Sharid)" if clave in DESDE_SHARID else ""
        print(f"[{n}/{total}] {clave}{marca}  ({time.time()-t0:.0f} s)", flush=True)
    print(f"Listo en {(time.time()-t0)/60:.1f} minutos")


if __name__ == "__main__":
    main()
