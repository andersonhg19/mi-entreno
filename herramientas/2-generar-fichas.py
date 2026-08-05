# -*- coding: utf-8 -*-
"""
Fichas v6: revelado + SUPERRESOLUCION NEURONAL (EDSR x3).

El techo de detalle real de la foto es ~457 px por tarjeta. Ampliar con
un remuestreo normal solo estira ese detalle y deja el texto blando.
EDSR es una red entrenada para reconstruir bordes al ampliar, y sobre
dibujo de linea y tipografia es donde mas se nota.

Orden que importa:
  1. Revelado (equilibrio de blancos + niveles) ANTES de ampliar, para
     que la red trabaje sobre una imagen con contraste real.
  2. EDSR x3.
  3. Reduccion al lienzo final: bajar despues de ampliar consolida el
     detalle y quita el ruido que la red pueda haber inventado.
  4. Enfoque suave, mucho menor que sin red (EDSR ya define bordes).

Tarda ~35 s por ficha. Son 55. Se ejecuta una vez.
"""
import os, sys, time
import numpy as np
import cv2
from PIL import Image, ImageFilter

TMP = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp"
OUT = os.path.join(TMP, "fichas")
DEST = r"C:\Users\ander\Documents\Anderson\Personales\entreno\assets\img\ejercicios"
MODELO = os.path.join(TMP, "modelos", "edsr_x3.pb")

sys.path.insert(0, TMP)
from mapear import MAPA                       # clave -> (tablero, fila, columna)

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

# Estas dos salen quemadas en el tablero de Anderson: se usan las de Sharid
DESDE_SHARID = {
    "sentadilla-mancuerna": (2228, 1398, 2600, 1676),
    "pantorrilla-sentado":  (2228, 1652, 2600, 1930),
}
S_LEVEL = (r"C:\Users\ander\AppData\Local\Temp\claude"
           r"\C--Users-ander-Documents-Anderson-Personales-entreno"
           r"\61a67379-6b8a-4fa5-bded-2f1a642e1c36\scratchpad\crops\S_level.jpg")

sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(MODELO)
sr.setModel("edsr", 3)


def revelar(im):
    """Equilibrio de blancos y niveles, antes de ampliar."""
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
    bgr = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
    grande = sr.upsample(bgr)
    return Image.fromarray(cv2.cvtColor(grande, cv2.COLOR_BGR2RGB))


def encajar(im):
    LW, LH = LIENZO
    e = min(LW * (1 - 2 * MARGEN) / im.width, LH * (1 - 2 * MARGEN) / im.height)
    im = im.resize((max(1, int(im.width * e)), max(1, int(im.height * e))), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=3))
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
    x0 = cols[col]
    x1 = (cols[col + 1] - GAP) if col + 1 < len(cols) else AF_DERECHA
    y0 = int(AF_TOP + AF_PASO_Y * fila)
    return (x0, y0, x1, y0 + AF_ALTO)


if __name__ == "__main__":
    warps = {t: Image.open(os.path.join(OUT, f"{t}_warp.jpg")).convert("RGB") for t in ("A", "AF")}
    sharid = Image.open(S_LEVEL).convert("RGB")

    total = len(MAPA)
    t0 = time.time()
    for n, (clave, (tablero, fila, col)) in enumerate(sorted(MAPA.items()), 1):
        if clave in DESDE_SHARID:
            recorte = sharid.crop(DESDE_SHARID[clave])
        else:
            recorte = warps[tablero].crop(caja_de(tablero, fila, col))
        encajar(ampliar(revelar(recorte))).save(
            os.path.join(DEST, f"{clave}-ficha.jpg"), quality=88, subsampling=0)
        print(f"[{n}/{total}] {clave}  ({time.time()-t0:.0f} s)", flush=True)
    print(f"Listo en {(time.time()-t0)/60:.1f} minutos")
