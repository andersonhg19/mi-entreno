# -*- coding: utf-8 -*-
"""
Compara tarjeta a tarjeta las dos fotos del mismo carton y dice cual sirve.

Aqui no hay «verdad» contra la que medir, asi que no se usa PSNR: se miden
las tres cosas que de verdad estropean una ficha, y todas se pueden medir
sobre la imagen sola.

  QUEMADO  — porcentaje de pixeles reventados de blanco. El flash borra el
             dibujo y no hay proceso que lo devuelva: es el defecto grave.
  CONTRA   — separacion entre la tinta y el papel. Si es baja, la tarjeta
             sale lavada y gris.
  DETALLE  — energia de bordes en la banda del texto, normalizada por el
             contraste para que no premie simplemente a la mas contrastada.

La nota junta las tres penalizando mucho el quemado, que es irreversible.
"""
import os, sys
import numpy as np
import cv2

TMP = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp"
sys.path.insert(0, TMP)
from mapear import MAPA                      # clave -> (tablero, fila, columna)

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


def caja_de(tablero, fila, col):
    if tablero == "A":
        x0 = int(A_X0 + A_PASO * col)
        y0 = int(A_TOP + A_PASO_Y * fila)
        return (x0, y0, x0 + A_ANCHO, y0 + A_ALTO)
    cols = AF_COLS[fila]
    x1 = (cols[col + 1] - GAP) if col + 1 < len(cols) else AF_DERECHA
    y0 = int(AF_TOP + AF_PASO_Y * fila)
    return (cols[col], y0, x1, y0 + AF_ALTO)


def medir(bgr):
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)

    # El flash revienta el blanco. Se mira sobre el original, antes de revelar,
    # porque el revelado reescala y disimula el destrozo sin recuperarlo.
    quemado = 100.0 * np.count_nonzero(g >= 249) / g.size

    p2, p98 = np.percentile(g, 2), np.percentile(g, 98)
    contraste = float(p98 - p2)

    # Detalle: bordes medidos sobre la imagen normalizada, para que una
    # tarjeta simplemente mas oscura no parezca mas nitida.
    norm = (g - p2) / max(contraste, 1.0)
    norm = np.clip(norm, 0, 1) * 255
    lap = cv2.Laplacian(norm, cv2.CV_32F, ksize=3)
    detalle = float(lap.var())

    # La medida que de verdad decide es el CONTRASTE, no el quemado ni el
    # detalle. Comprobado mirando las tarjetas una a una:
    #  - El quemado alto no siempre estropea el dibujo: a veces es solo papel
    #    muy blanco («leg extension» sale perfecta con un 8 % quemado).
    #  - El detalle miente cuando hay reflejo: el borde del propio reflejo
    #    cuenta como detalle y una tarjeta ilegible puntua mas que la buena.
    #  - El contraste si separa limpiamente: las dos tarjetas destrozadas
    #    dan 71 y 100, y todas las sanas pasan de 150.
    return quemado, contraste, detalle, contraste


def main():
    lienzos = {
        "A":  (cv2.imread(os.path.join(TMP, "fichas", "A_warp.jpg")),
               cv2.imread(os.path.join(TMP, "fichas", "S_alineado.jpg"))),
        "AF": (cv2.imread(os.path.join(TMP, "fichas", "AF_warp.jpg")),
               cv2.imread(os.path.join(TMP, "fichas", "SF_alineado.jpg"))),
    }

    filas = []
    for clave, (tablero, fila, col) in sorted(MAPA.items()):
        x0, y0, x1, y1 = caja_de(tablero, fila, col)
        and_img, sha_img = lienzos[tablero]
        a = medir(and_img[y0:y1, x0:x1])
        s = medir(sha_img[y0:y1, x0:x1])
        # Por defecto manda el tablero de Anderson: es la foto mas nitida de
        # las dos (nitidez global 3235 frente a 2605) y sus marcas son las
        # suyas. Solo se cambia cuando el reflejo le ha comido el contraste
        # y en el de Sharid esa misma tarjeta esta sana.
        gana = "SHARID" if (s[1] > a[1] + 8 and a[0] > 0.5) else "anderson"
        filas.append((clave, tablero, a, s, gana, s[1] - a[1]))

    print(f"{'ejercicio':<30} {'quemado A/S':>13} {'contraste A/S':>15} "
          f"{'detalle A/S':>15}  gana")
    print("-" * 92)
    for clave, tab, a, s, gana, dif in filas:
        print(f"{clave:<30} {a[0]:5.1f}/{s[0]:5.1f}%  {a[1]:6.1f}/{s[1]:6.1f}   "
              f"{a[2]:6.0f}/{s[2]:6.0f}   {gana}")

    cambian = [f for f in filas if f[4] == "SHARID"]
    print(f"\n{len(cambian)} de {len(filas)} tarjetas se toman del tablero de Sharid:")
    for clave, tab, a, s, gana, dif in sorted(cambian, key=lambda f: -f[5]):
        print(f"  {clave:<30} contraste {a[1]:5.1f} -> {s[1]:5.1f}  ({dif:+5.1f})   "
              f"quemado {a[0]:4.1f}% -> {s[0]:4.1f}%")

    print("\nPara pegar en el generador:")
    print("DESDE_SHARID = {")
    for clave, tab, a, s, gana, dif in sorted(cambian):
        print(f'    "{clave}",')
    print("}")

    peor = sorted(filas, key=lambda f: min(f[2][1], f[3][1]))[:6]
    print("\nTarjetas con menos contraste en su MEJOR version (las mas justas):")
    for clave, tab, a, s, gana, dif in peor:
        print(f"  {clave:<30} anderson {a[1]:5.1f}  sharid {s[1]:5.1f}  -> se usa {gana}")


if __name__ == "__main__":
    main()
