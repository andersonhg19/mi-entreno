# -*- coding: utf-8 -*-
"""
¿Combinar dos capturas de la misma tarjeta recupera detalle de verdad?

El primer intento comparaba «Anderson solo» contra «Anderson + Sharid»
usando como verdad la propia foto de Anderson. Eso no puede salir bien: todo
lo que aporte la otra foto cuenta como error por definicion. La medida decia
que combinar empeora, pero medida asi no dice nada.

Aqui la prueba es limpia: se parte de UNA verdad y se fabrican DOS capturas
degradadas de ella, cada una con su propio desplazamiento de subpixel, su
propio desenfoque y su propio ruido — que es lo que diferencia a dos fotos
del mismo carton. Ninguno de los dos metodos juega en casa.

Si combinar gana aqui, la maquinaria sirve. Si ademas las dos fotos reales
estan bien alineadas, sirve tambien en el caso real.
"""
import os
import numpy as np
import cv2

TMP = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp"
AUMENTO = 2.14
LADO = 320

AF_COLS = [
    [34, 863, 1689, 2510, 2923, 3340, 4177],
    [32, 862, 1278, 1686, 2100, 2922, 3762],
    [34, 488, 1236, 1647, 2413, 3178, 3595, 4222],
    [35, 860, 1276, 1690, 2509, 3343, 4175],
    [36, 845, 1260, 1693, 2107, 2522, 2940, 3359, 3805],
    [37, 448, 1140, 1553, 2093, 2509, 2927, 3607, 4098],
]
AF_TOP, AF_PASO_Y = 20, 380.4

# Desplazamientos de subpixel de cada captura simulada. Deliberadamente NO son
# multiplos del pixel: si las dos capturas cayeran en la misma rejilla,
# combinarlas solo bajaria el ruido y no aportaria resolucion.
DESPLAZAMIENTOS = [(0.0, 0.0), (0.47, 0.31)]
SEMILLA = 20260805


def degradar(gt, dx, dy, sigma, ruido, rng):
    """Fabrica una captura de baja resolucion a partir de la verdad."""
    h, w = gt.shape[:2]
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    movida = cv2.warpAffine(gt, M, (w, h), flags=cv2.INTER_LANCZOS4,
                            borderMode=cv2.BORDER_REFLECT)
    movida = cv2.GaussianBlur(movida, (0, 0), sigma)
    baja = cv2.resize(movida, (int(w / AUMENTO), int(h / AUMENTO)),
                      interpolation=cv2.INTER_AREA)
    baja = np.clip(baja.astype(np.float32) +
                   rng.normal(0, ruido, baja.shape), 0, 255).astype(np.uint8)
    ok, buf = cv2.imencode(".jpg", baja, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return cv2.imdecode(buf, cv2.IMREAD_COLOR)


def alinear(mov, fijo):
    a = cv2.cvtColor(fijo, cv2.COLOR_BGR2GRAY).astype(np.float32)
    b = cv2.cvtColor(mov, cv2.COLOR_BGR2GRAY).astype(np.float32)
    W = np.eye(2, 3, dtype=np.float32)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 500, 1e-8)
    try:
        _, W = cv2.findTransformECC(a, b, W, cv2.MOTION_TRANSLATION, crit, None, 5)
    except cv2.error:
        return None, None
    fuera = cv2.warpAffine(mov, W, (fijo.shape[1], fijo.shape[0]),
                           flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP,
                           borderMode=cv2.BORDER_REFLECT)
    return fuera, float(np.hypot(W[0, 2], W[1, 2]))


def psnr(a, b):
    e = np.mean((a.astype(np.float64) - b.astype(np.float64)) ** 2)
    return 99.0 if e < 1e-9 else 10 * np.log10(255.0 ** 2 / e)


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


def main():
    af = cv2.imread(os.path.join(TMP, "fichas", "AF_warp.jpg"))
    rng = np.random.default_rng(SEMILLA)

    parches = []
    for fila in range(6):
        for col in range(len(AF_COLS[fila])):
            x0 = AF_COLS[fila][col] + 30
            y0 = int(AF_TOP + AF_PASO_Y * fila) + 20
            p = af[y0:y0 + LADO, x0:x0 + LADO]
            if p.shape[:2] == (LADO, LADO):
                parches.append(p)
    print(f"Verdad: {len(parches)} parches de {LADO}x{LADO} del tablero funcional")
    print(f"Dos capturas simuladas por parche, desplazadas {DESPLAZAMIENTOS[1]} px "
          f"entre si, con desenfoque y ruido independientes\n")

    res = {"una sola captura": {"p": [], "s": []},
           "dos capturas combinadas": {"p": [], "s": []},
           "dos capturas, sin alinear": {"p": [], "s": []}}
    desvios = []

    for gt in parches:
        c1 = degradar(gt, *DESPLAZAMIENTOS[0], sigma=0.8, ruido=2.5, rng=rng)
        c2 = degradar(gt, *DESPLAZAMIENTOS[1], sigma=0.9, ruido=2.5, rng=rng)

        h, w = gt.shape[:2]
        s1 = cv2.resize(c1, (w, h), interpolation=cv2.INTER_LANCZOS4)
        s2 = cv2.resize(c2, (w, h), interpolation=cv2.INTER_LANCZOS4)

        al, d = alinear(s2, s1)
        if al is None:
            continue
        desvios.append(d)

        salidas = {
            "una sola captura": s1,
            "dos capturas combinadas": cv2.addWeighted(s1, 0.5, al, 0.5, 0),
            "dos capturas, sin alinear": cv2.addWeighted(s1, 0.5, s2, 0.5, 0),
        }
        for k, v in salidas.items():
            res[k]["p"].append(psnr(luz(gt), luz(v)))
            res[k]["s"].append(ssim(luz(gt), luz(v)))

    print(f"Desplazamiento que encuentra la alineacion: mediana {np.median(desvios):.3f} px "
          f"(el real es {np.hypot(*DESPLAZAMIENTOS[1]):.3f} px)\n")
    print(f"{'metodo':<28} {'PSNR':>8} {'SSIM':>8}")
    print("-" * 46)
    for k in res:
        print(f"{k:<28} {np.mean(res[k]['p']):8.3f} {np.mean(res[k]['s']):8.4f}")

    base_p = np.mean(res["una sola captura"]["p"])
    base_s = np.mean(res["una sola captura"]["s"])
    dp = np.mean(res["dos capturas combinadas"]["p"]) - base_p
    ds = np.mean(res["dos capturas combinadas"]["s"]) - base_s
    print(f"\nCombinar dos capturas frente a usar una: {dp:+.3f} dB PSNR, {ds:+.4f} SSIM")
    print("=> " + ("SI aporta, la maquinaria funciona" if ds > 0.002
                   else "NO aporta lo suficiente"))


if __name__ == "__main__":
    main()
