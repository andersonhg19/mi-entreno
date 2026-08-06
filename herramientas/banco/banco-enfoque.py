# -*- coding: utf-8 -*-
"""
Ajusta el ENFOQUE FINAL contra la verdad, en vez de a ojo.

El banco de superresolucion dejo un dato util: todas las tuberias devuelven
menos energia de borde que el original (NITID entre 0,83 y 0,90). Es decir,
todas dejan la ficha mas blanda de lo que es el carton de verdad. El enfoque
que se aplica al final (radio 1,1 / 55 %) se eligio a ojo; aqui se busca el
que mas acerca el resultado a la verdad.

Se prueban tambien EDSR x2 y x3, porque el aumento que hace falta de verdad
es 2,14 y no estaba claro cual conviene.
"""
import os, time
import numpy as np
import cv2
from PIL import Image, ImageFilter

TMP = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp"
MOD = os.path.join(TMP, "modelos")
AUMENTO, LADO = 2.14, 320

AF_COLS = [
    [34, 863, 1689, 2510, 2923, 3340, 4177],
    [32, 862, 1278, 1686, 2100, 2922, 3762],
    [34, 488, 1236, 1647, 2413, 3178, 3595, 4222],
    [35, 860, 1276, 1690, 2509, 3343, 4175],
    [36, 845, 1260, 1693, 2107, 2522, 2940, 3359, 3805],
    [37, 448, 1140, 1553, 2093, 2509, 2927, 3607, 4098],
]
AF_TOP, AF_PASO_Y = 20, 380.4

RADIOS = [0.0, 0.8, 1.1, 1.4, 1.8]
PORCENTAJES = [0, 35, 55, 80, 110, 150]


def revelar(bgr):
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


def ssim(a, b):
    a, b = a.astype(np.float64), b.astype(np.float64)
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    k = (11, 11)
    ma, mb = cv2.GaussianBlur(a, k, 1.5), cv2.GaussianBlur(b, k, 1.5)
    va = cv2.GaussianBlur(a * a, k, 1.5) - ma * ma
    vb = cv2.GaussianBlur(b * b, k, 1.5) - mb * mb
    vab = cv2.GaussianBlur(a * b, k, 1.5) - ma * mb
    return float((((2 * ma * mb + C1) * (2 * vab + C2)) /
                  ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))).mean())


def luz(x):
    return cv2.cvtColor(x, cv2.COLOR_BGR2GRAY).astype(np.float64)


def borde(g):
    gx = cv2.Sobel(g, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_64F, 0, 1, ksize=3)
    return float(np.sqrt(gx * gx + gy * gy).mean())


def enfocar(bgr, radio, pct):
    if pct == 0 or radio == 0:
        return bgr
    im = Image.fromarray(bgr[:, :, ::-1])
    im = im.filter(ImageFilter.UnsharpMask(radius=radio, percent=pct, threshold=3))
    return np.asarray(im)[:, :, ::-1].copy()


def main():
    af = cv2.imread(os.path.join(TMP, "fichas", "AF_warp.jpg"))
    verdades = []
    for fila in range(6):
        for col in range(len(AF_COLS[fila])):
            x0 = AF_COLS[fila][col] + 30
            y0 = int(AF_TOP + AF_PASO_Y * fila) + 20
            p = af[y0:y0 + LADO, x0:x0 + LADO]
            if p.shape[:2] == (LADO, LADO):
                verdades.append(revelar(p))
    chico = int(round(LADO / AUMENTO))
    entradas = [cv2.resize(v, (chico, chico), interpolation=cv2.INTER_AREA)
                for v in verdades]
    print(f"{len(verdades)} parches. Entrada {chico}x{chico} -> verdad {LADO}x{LADO}\n")

    for escala in (2, 3):
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(os.path.join(MOD, f"edsr_x{escala}.pb"))
        sr.setModel("edsr", escala)
        t0 = time.time()
        ampliadas = [cv2.resize(sr.upsample(e), (LADO, LADO),
                                interpolation=cv2.INTER_LANCZOS4) for e in entradas]
        print(f"=== EDSR x{escala}  ({time.time()-t0:.0f} s los {len(entradas)}) ===")
        print(f"{'radio':>6} {'porcentaje':>11} {'SSIM':>8} {'nitidez vs verdad':>19}")
        mejor = None
        for r in RADIOS:
            for p in PORCENTAJES:
                if (r == 0) != (p == 0):
                    continue
                ss, ni = [], []
                for amp, ver in zip(ampliadas, verdades):
                    out = enfocar(amp, r, p)
                    ss.append(ssim(luz(ver), luz(out)))
                    ni.append(borde(luz(out)) / max(borde(luz(ver)), 1e-6))
                m, n = float(np.mean(ss)), float(np.mean(ni))
                marca = ""
                if mejor is None or m > mejor[0]:
                    mejor, marca = (m, r, p, n), "  <-- mejor"
                print(f"{r:6.1f} {p:11d} {m:8.4f} {n:19.3f}{marca}")
        print(f"  Mejor para x{escala}: radio {mejor[1]}, {mejor[2]} %  "
              f"-> SSIM {mejor[0]:.4f}, nitidez {mejor[3]:.3f}\n")


if __name__ == "__main__":
    main()
