# -*- coding: utf-8 -*-
"""
Decide, tarjeta a tarjeta, de que tablero conviene sacarla.

POR QUE HAY QUE VOLVER A DECIDIRLO EN LA v9
-------------------------------------------
La eleccion anterior se hizo midiendo sobre el RECORTE CRUDO, con una
tuberia (EDSR) que emborronaba. Real-ESRGAN no emborrona: al reconstruir el
borde, **deja ver el destrozo del flash** en vez de taparlo. Una tarjeta con
la tinta lavada, que con EDSR salia gris y blanda —fea pero uniforme—, ahora
sale con las letras nitidas por fuera y agujereadas por dentro.

Asi que la decision hay que tomarla sobre la FICHA FINAL, no sobre el
recorte, y con la medida que de verdad delata el reflejo: cuanto negro de
verdad queda en la tinta.

Se miden dos cosas, y cada una en el sitio donde todavia se puede ver:

  CONTRASTE CRUDO — sobre el recorte SIN revelar. Tiene que ser antes,
        porque el revelado estira los niveles hasta 8-250 pase lo que pase:
        despues de el, una tarjeta destrozada y una sana puntuan igual. (Se
        intento medir sobre la ficha final y salio que ninguna necesitaba
        cambiarse, incluidas las dos que estan ilegibles. Ese fue el aviso.)

  TINTA IRREGULAR — sobre la ficha YA RESTAURADA: cuanto varia el negro por
        dentro de la tinta. Una tarjeta sana da negro uniforme. Una lavada
        por el flash sale con las letras nitidas por fuera y agujereadas por
        dentro, que es el defecto nuevo que trae Real-ESRGAN al no
        emborronar.

No se usa «detalle» ni «porcentaje de blanco reventado»: ya se comprobo que
mienten. El borde del propio reflejo cuenta como detalle, y el blanco
reventado a veces es solo papel muy iluminado, con el dibujo intacto.

ESTO NO DECIDE, SOLO ORDENA CANDIDATAS
--------------------------------------
La lista buena de `3-generar-fichas.py` se hizo MIRANDO las 55 una a una con
`cotejar-tableros.py todas`, y no coincide con lo que dice este script. Se le
escapa el caso mas comun: la FRANJA de musculo reventada mientras el resto de
la tarjeta conserva buen contraste. `peck-deck`, `dominadas` y
`jalon-delante-abierto` son exactamente eso, y aqui salen como «anderson».

Con 55 tarjetas, mirarlas cuesta poco y es lo unico que no se equivoca.
Usa esto para saber por donde empezar a mirar, no para decidir.

    python herramientas/elegir-tablero.py
"""
import os, sys
import numpy as np
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
TRABAJO = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"

sys.path.insert(0, AQUI)
from importlib.machinery import SourceFileLoader
MAPA = SourceFileLoader("mapa_fichas", os.path.join(AQUI, "mapa-fichas.py")).load_module().MAPA
import restaurador

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

# Cuanto tiene que mejorar el otro tablero para justificar el cambio. Por
# defecto manda el de Anderson: es la foto mas nitida y sus marcas son las
# suyas. Solo se cambia cuando la diferencia es clara, no por un pelo.
MARGEN_CONTRASTE = 8      # puntos de contraste crudo
MARGEN_TINTA = 4          # puntos de irregularidad de la tinta


def caja_de(tablero, fila, col):
    if tablero == "A":
        x0 = int(A_X0 + A_PASO * col)
        y0 = int(A_TOP + A_PASO_Y * fila)
        return (x0, y0, x0 + A_ANCHO, y0 + A_ALTO)
    cols = AF_COLS[fila]
    x1 = (cols[col + 1] - GAP) if col + 1 < len(cols) else AF_DERECHA
    y0 = int(AF_TOP + AF_PASO_Y * fila)
    return (cols[col], y0, x1, y0 + AF_ALTO)


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


def contraste_crudo(bgr):
    """Sobre el recorte SIN revelar: lo unico que delata el reflejo."""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return float(np.percentile(g, 98) - np.percentile(g, 2))


def tinta_irregular(bgr):
    """
    Sobre la ficha ya restaurada: como de uniforme es el negro de la tinta.

    Se toman los pixeles claramente oscuros y se mira cuanto varian. Tinta
    sana = negro parejo, valor bajo. Tinta lavada por el flash = manchada
    por dentro, valor alto.
    """
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    umbral = np.percentile(g, 2) + 45
    oscuros = g[g < umbral]
    if oscuros.size < 500:
        return float("nan")
    return float(oscuros.std())


def main():
    lienzos = {}
    for clave, archivo in (("A", "A_warp.jpg"), ("AF", "AF_warp.jpg"),
                           ("S", "S_alineado.jpg"), ("SF", "SF_alineado.jpg")):
        lienzos[clave] = cv2.imread(os.path.join(TRABAJO, archivo))

    elegidas, filas = [], []
    for clave, (tablero, fila, col) in sorted(MAPA.items()):
        x0, y0, x1, y1 = caja_de(tablero, fila, col)
        otro = "S" if tablero == "A" else "SF"
        med = {}
        for quien, lienzo in (("anderson", tablero), ("sharid", otro)):
            rec = lienzos[lienzo][y0:y1, x0:x1]
            base = cv2.bilateralFilter(revelar(rec), 5, 40, 40)
            med[quien] = (contraste_crudo(rec),
                          tinta_irregular(restaurador.restaurar(base)))
        ca, ia = med["anderson"]
        cs, isd = med["sharid"]
        # Manda Anderson salvo que el reflejo le haya comido el contraste, o
        # le deje la tinta claramente mas manchada que en el otro tablero.
        gana = "sharid" if (cs - ca) > MARGEN_CONTRASTE or (ia - isd) > MARGEN_TINTA \
               else "anderson"
        if gana == "sharid":
            elegidas.append(clave)
        filas.append((clave, ca, cs, ia, isd, gana))

    print(f"{'ejercicio':<30} {'contra A':>9} {'contra S':>9} {'tinta A':>8} "
          f"{'tinta S':>8}  se usa")
    print("-" * 78)
    for clave, ca, cs, ia, isd, gana in filas:
        marca = "  <--" if gana == "sharid" else ""
        print(f"{clave:<30} {ca:9.1f} {cs:9.1f} {ia:8.1f} {isd:8.1f}  {gana}{marca}")

    print(f"\n{len(elegidas)} de {len(filas)} tarjetas salen mejor del tablero de Sharid:")
    print("DESDE_SHARID = {" + ", ".join(f'"{c}"' for c in sorted(elegidas)) + "}")
    print("\nPegalo en 3-generar-fichas.py DESPUES de mirar las que cambian:")
    print("  python herramientas/cotejar-tableros.py <clave> ...")


if __name__ == "__main__":
    main()
