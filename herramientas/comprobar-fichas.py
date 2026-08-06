# -*- coding: utf-8 -*-
"""
GUARDIA DE FIDELIDAD: comprueba que la restauracion no se invento nada.

POR QUE HACE FALTA
------------------
`3-generar-fichas.py` usa un modelo GENERATIVO. Eso es justo lo que hacia
falta para quitar el grano, pero tiene un riesgo que EDSR no tenia: puede
dejar la imagen preciosa y haber cambiado una mancuerna por una barra, o
«PRENSA» por algo que se le parezca. Estas fichas le dicen a alguien con
baja vision que ejercicio hacer: eso seria peor que el grano.

COMO SE COMPRUEBA
-----------------
Cada ficha generada se compara con su recorte original **por los bordes**
—donde estan las lineas— y no por los tonos. Comparar tonos no sirve:
cambiar un papel gris moteado por uno blanco liso es un cambio de tono
enorme y de contenido ninguno, y suspendia justo a las tuberias buenas.

Para que el numero signifique algo esta calibrado con un CONTROL: la misma
medida entre dos tarjetas DISTINTAS. Ese es el suelo de «esto ya no es la
misma imagen». Sale ~0,29. Una ficha bien restaurada da ~0,99.

    python herramientas/comprobar-fichas.py
"""
import os, sys
import numpy as np
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
TRABAJO = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"
DEST = os.path.join(AQUI, "..", "assets", "img", "ejercicios")

sys.path.insert(0, AQUI)
from importlib.machinery import SourceFileLoader
_gen = SourceFileLoader("gen", os.path.join(AQUI, "3-generar-fichas.py"))
MAPA = SourceFileLoader("mapa_fichas", os.path.join(AQUI, "mapa-fichas.py")).load_module().MAPA

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
DESDE_SHARID = {"pantorrilla-sentado", "sentadilla-mancuerna", "prensa-atletica",
                "peck-deck", "dominadas", "jalon-delante-abierto"}

MINIMO = 0.90          # el control entre tarjetas distintas da ~0,29


def caja_de(tablero, fila, col):
    if tablero == "A":
        x0 = int(A_X0 + A_PASO * col)
        y0 = int(A_TOP + A_PASO_Y * fila)
        return (x0, y0, x0 + A_ANCHO, y0 + A_ALTO)
    cols = AF_COLS[fila]
    x1 = (cols[col + 1] - GAP) if col + 1 < len(cols) else AF_DERECHA
    y0 = int(AF_TOP + AF_PASO_Y * fila)
    return (cols[col], y0, x1, y0 + AF_ALTO)


def bordes(bgr, ancho=192):
    alto = max(1, int(ancho * bgr.shape[0] / bgr.shape[1]))
    y = cv2.resize(bgr, (ancho, alto), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(y, cv2.COLOR_BGR2GRAY).astype(np.float32)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    m = np.sqrt(gx * gx + gy * gy)
    return m / (m.max() + 1e-6)


def parecido(a, b):
    x, y = bordes(a).ravel(), bordes(b).ravel()
    if x.shape != y.shape:
        return float("nan")
    x, y = x - x.mean(), y - y.mean()
    return float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))


def recortar_como_ficha(recorte, ficha_shape):
    """Encaja el recorte original en el mismo lienzo que la ficha, para que
    los bordes caigan en el mismo sitio y la comparacion sea justa."""
    LH, LW = ficha_shape[:2]
    e = min(LW * 0.94 / recorte.shape[1], LH * 0.94 / recorte.shape[0])
    chico = cv2.resize(recorte, (max(1, int(recorte.shape[1] * e)),
                                 max(1, int(recorte.shape[0] * e))),
                       interpolation=cv2.INTER_AREA)
    fondo = tuple(int(np.percentile(chico[:, :, c], 92)) for c in range(3))
    lienzo = np.full((LH, LW, 3), fondo, np.uint8)
    oy, ox = (LH - chico.shape[0]) // 2, (LW - chico.shape[1]) // 2
    lienzo[oy:oy + chico.shape[0], ox:ox + chico.shape[1]] = chico
    return lienzo


def main():
    lienzos = {}
    for clave, archivo in (("A", "A_warp.jpg"), ("AF", "AF_warp.jpg"),
                           ("S", "S_alineado.jpg"), ("SF", "SF_alineado.jpg")):
        lienzos[clave] = cv2.imread(os.path.join(TRABAJO, archivo))

    resultados, referencias = [], []
    for clave, (tablero, fila, col) in sorted(MAPA.items()):
        origen = tablero
        if clave in DESDE_SHARID:
            origen = "S" if tablero == "A" else "SF"
        x0, y0, x1, y1 = caja_de(tablero, fila, col)
        ficha = cv2.imread(os.path.join(DEST, f"{clave}-ficha.jpg"))
        if ficha is None:
            resultados.append((clave, float("nan")))
            continue
        ref = recortar_como_ficha(lienzos[origen][y0:y1, x0:x1], ficha.shape)
        referencias.append(ref)
        resultados.append((clave, parecido(ficha, ref)))

    # CONTROL: cada referencia contra la siguiente. Contenido distinto.
    control = [parecido(referencias[i], referencias[(i + 1) % len(referencias)])
               for i in range(len(referencias))]

    malas = [(c, v) for c, v in resultados if not (v >= MINIMO)]
    peores = sorted((r for r in resultados if r[1] == r[1]), key=lambda r: r[1])[:5]

    print(f"Fichas comprobadas: {len(resultados)}")
    print(f"Parecido medio con el original: {np.nanmean([v for _, v in resultados]):.4f}")
    print(f"CONTROL (dos tarjetas DISTINTAS): {np.mean(control):.4f}  "
          f"<- esto es «ya no es la misma imagen»")
    print(f"Umbral exigido: {MINIMO}\n")
    print("Las cinco mas justas:")
    for c, v in peores:
        print(f"  {c:<30} {v:.4f}")
    if malas:
        print(f"\nNO PASAN ({len(malas)}):")
        for c, v in malas:
            print(f"  x {c:<30} {v:.4f}")
        sys.exit(1)
    print("\nOK - las 55 fichas siguen siendo la tarjeta que fotografio el entrenador.")


if __name__ == "__main__":
    main()
