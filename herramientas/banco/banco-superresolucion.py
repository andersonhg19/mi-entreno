# -*- coding: utf-8 -*-
"""
BANCO DE PRUEBAS DE SUPERRESOLUCION — con verdad de referencia.

La pregunta era: ¿encadenar varios modelos (uno sobre el resultado del otro)
mejora la nitidez, o solo inventa? Hasta ahora se habia elegido EDSR x3 «a
ojo». Aqui se mide.

COMO SE MIDE
------------
El tablero funcional tiene 629 px reales por tarjeta; el de gimnasio, 457.
Se usan tarjetas del funcional como VERDAD. Se reducen 2,14 veces (el mismo
aumento que hace la app al llevar una tarjeta de gimnasio al lienzo final),
se vuelven a ampliar con cada tuberia candidata y se compara el resultado
con la verdad que si tenemos.

Asi la comparacion no depende de la opinion de nadie:
  PSNR  — cuanto se aleja del original (mas alto, mejor).
  SSIM  — parecido estructural, que es lo que ve el ojo (mas alto, mejor).
  NITID — energia de bordes respecto a la verdad. 1,00 es clavarlo;
          por encima de 1,15 el modelo esta AFILANDO DE MAS (halos), que
          es justo el riesgo de encadenar modelos.
"""
import os, sys, time
import numpy as np
import cv2
from PIL import Image

TMP = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp"
MOD = os.path.join(TMP, "modelos")
OUT = os.path.join(TMP, "banco-sr")
os.makedirs(OUT, exist_ok=True)

AUMENTO = 2.14          # el que aplica de verdad la app a una tarjeta de gimnasio
LADO = 320             # lado del parche de verdad

AF_COLS = [
    [34, 863, 1689, 2510, 2923, 3340, 4177],
    [32, 862, 1278, 1686, 2100, 2922, 3762],
    [34, 488, 1236, 1647, 2413, 3178, 3595, 4222],
    [35, 860, 1276, 1690, 2509, 3343, 4175],
    [36, 845, 1260, 1693, 2107, 2522, 2940, 3359, 3805],
    [37, 448, 1140, 1553, 2093, 2509, 2927, 3607, 4098],
]
AF_TOP, AF_PASO_Y = 20, 380.4

# Parches (fila, columna) elegidos por tener titulo impreso Y dibujo de linea,
# que es donde se juega la legibilidad.
PARCHES = [(0, 1), (0, 4), (1, 2), (2, 3), (3, 1), (3, 4), (4, 2), (5, 5)]


def revelar(im):
    """Mismo revelado que produccion: va ANTES de ampliar."""
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


# --------------------------------------------------------------- modelos
_cache = {}


def red(nombre, escala):
    clave = (nombre, escala)
    if clave not in _cache:
        ruta = os.path.join(MOD, f"{nombre}_x{escala}.pb")
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(ruta)
        sr.setModel(nombre, escala)
        _cache[clave] = sr
    return _cache[clave]


def ampliar(bgr, nombre, escala):
    return red(nombre, escala).upsample(bgr)


def lanczos(bgr, w, h):
    return cv2.resize(bgr, (w, h), interpolation=cv2.INTER_LANCZOS4)


# --------------------------------------------------------------- tuberias
# Cada tuberia recibe el recorte pequeño en BGR y devuelve algo del tamaño
# que sea; el banco lo lleva luego al tamaño de la verdad.
TUBERIAS = {
    "lanczos (sin red)":      lambda b: b,
    "fsrcnn x3":              lambda b: ampliar(b, "fsrcnn", 3),
    "espcn x3":               lambda b: ampliar(b, "espcn", 3),
    "lapsrn x4":              lambda b: ampliar(b, "lapsrn", 4),
    "edsr x2":                lambda b: ampliar(b, "edsr", 2),
    "edsr x3  (produccion)":  lambda b: ampliar(b, "edsr", 3),
    "edsr x2 -> edsr x2":     lambda b: ampliar(ampliar(b, "edsr", 2), "edsr", 2),
    "edsr x3 -> edsr x2":     lambda b: ampliar(ampliar(b, "edsr", 3), "edsr", 2),
    "edsr x2 -> lapsrn x2":   lambda b: ampliar(ampliar(b, "edsr", 2), "lapsrn", 2),
    "edsr x3 -> lapsrn x2":   lambda b: ampliar(ampliar(b, "edsr", 3), "lapsrn", 2),
    "lapsrn x2 -> edsr x2":   lambda b: ampliar(ampliar(b, "lapsrn", 2), "edsr", 2),
    "espcn x2 -> edsr x2":    lambda b: ampliar(ampliar(b, "espcn", 2), "edsr", 2),
}


# --------------------------------------------------------------- metricas
def luminancia(bgr):
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)


def psnr(a, b):
    err = np.mean((a - b) ** 2)
    return 99.0 if err < 1e-9 else 10 * np.log10(255.0 ** 2 / err)


def ssim(a, b):
    """SSIM clasico con ventana gaussiana 11x11, sigma 1,5."""
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    k = (11, 11)
    mu_a = cv2.GaussianBlur(a, k, 1.5)
    mu_b = cv2.GaussianBlur(b, k, 1.5)
    aa = cv2.GaussianBlur(a * a, k, 1.5) - mu_a * mu_a
    bb = cv2.GaussianBlur(b * b, k, 1.5) - mu_b * mu_b
    ab = cv2.GaussianBlur(a * b, k, 1.5) - mu_a * mu_b
    s = ((2 * mu_a * mu_b + C1) * (2 * ab + C2)) / \
        ((mu_a ** 2 + mu_b ** 2 + C1) * (aa + bb + C2))
    return float(s.mean())


def energia_borde(g):
    gx = cv2.Sobel(g, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_64F, 0, 1, ksize=3)
    return float(np.sqrt(gx * gx + gy * gy).mean())


# --------------------------------------------------------------- ejecucion
def main():
    warp = Image.open(os.path.join(TMP, "fichas", "AF_warp.jpg")).convert("RGB")
    verdades = []
    for n, (fila, col) in enumerate(PARCHES):
        x0 = AF_COLS[fila][col] + 30
        y0 = int(AF_TOP + AF_PASO_Y * fila) + 20
        recorte = warp.crop((x0, y0, x0 + LADO, y0 + LADO))
        verdades.append(np.asarray(revelar(recorte))[:, :, ::-1].copy())  # BGR

    chico = int(round(LADO / AUMENTO))
    entradas = [cv2.resize(v, (chico, chico), interpolation=cv2.INTER_AREA)
                for v in verdades]

    print(f"Verdad: {len(verdades)} parches de {LADO}x{LADO} px del tablero funcional")
    print(f"Entrada simulada: {chico}x{chico} px  (aumento x{AUMENTO})\n")
    print(f"{'tuberia':<24} {'PSNR':>7} {'SSIM':>7} {'NITID':>7} {'seg/parche':>11}")
    print("-" * 60)

    filas = []
    for nombre, fn in TUBERIAS.items():
        ps, ss, ni = [], [], []
        t0 = time.time()
        for i, (ent, ver) in enumerate(zip(entradas, verdades)):
            try:
                res = fn(ent)
            except Exception as e:
                print(f"{nombre:<24} FALLO: {e}")
                res = None
                break
            res = lanczos(res, LADO, LADO)
            gv, gr = luminancia(ver), luminancia(res)
            ps.append(psnr(gv, gr))
            ss.append(ssim(gv, gr))
            ni.append(energia_borde(gr) / max(energia_borde(gv), 1e-6))
            if i == 0:
                Image.fromarray(res[:, :, ::-1]).save(
                    os.path.join(OUT, nombre.replace(" ", "_").replace(">", "-") + ".png"))
        if res is None:
            continue
        dt = (time.time() - t0) / len(entradas)
        filas.append((np.mean(ss), nombre, np.mean(ps), np.mean(ni), dt))
        print(f"{nombre:<24} {np.mean(ps):7.3f} {np.mean(ss):7.4f} "
              f"{np.mean(ni):7.3f} {dt:11.2f}")

    Image.fromarray(verdades[0][:, :, ::-1]).save(os.path.join(OUT, "0-VERDAD.png"))
    Image.fromarray(cv2.resize(entradas[0], (LADO, LADO),
                    interpolation=cv2.INTER_NEAREST)[:, :, ::-1]).save(
        os.path.join(OUT, "0-ENTRADA.png"))

    filas.sort(reverse=True)
    print("\nRanking por SSIM (parecido estructural, que es lo que ve el ojo):")
    for i, (s, nombre, p, n, dt) in enumerate(filas, 1):
        aviso = "  <-- afila de mas" if n > 1.15 else ""
        print(f"  {i}. {nombre:<24} SSIM {s:.4f}{aviso}")


if __name__ == "__main__":
    main()
