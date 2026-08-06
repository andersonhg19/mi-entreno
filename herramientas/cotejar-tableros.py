# -*- coding: utf-8 -*-
"""
La misma tarjeta restaurada desde los dos tableros, una al lado de la otra.

`elegir-tablero.py` propone cual conviene; esto es para MIRARLO antes de
hacerle caso. En este proyecto las medidas de imagen ya han mentido varias
veces —el reflejo genera bordes falsos, el revelado normaliza el destrozo—,
asi que la regla es: medir, y despues mirar.

    python herramientas/cotejar-tableros.py twist-ruso peck-deck
"""
import os, sys
import numpy as np
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
TRABAJO = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"
SALIDA = os.path.join(TRABAJO, "cotejo")

sys.path.insert(0, AQUI)
from importlib.machinery import SourceFileLoader
MAPA = SourceFileLoader("mapa_fichas", os.path.join(AQUI, "mapa-fichas.py")).load_module().MAPA
_el = SourceFileLoader("elegir", os.path.join(AQUI, "elegir-tablero.py")).load_module()
import restaurador


POR_HOJA = 5


def main():
    claves = sys.argv[1:]
    if not claves:
        print("uso: python herramientas/cotejar-tableros.py <clave> [<clave>...]")
        print("     python herramientas/cotejar-tableros.py todas")
        return
    if claves == ["todas"]:
        claves = sorted(MAPA)
    os.makedirs(SALIDA, exist_ok=True)
    lienzos = {}
    for k, archivo in (("A", "A_warp.jpg"), ("AF", "AF_warp.jpg"),
                       ("S", "S_alineado.jpg"), ("SF", "SF_alineado.jpg")):
        lienzos[k] = cv2.imread(os.path.join(TRABAJO, archivo))

    filas = []
    for clave in claves:
        if clave not in MAPA:
            print(f"  (no esta en el mapa: {clave})")
            continue
        tablero, fila, col = MAPA[clave]
        x0, y0, x1, y1 = _el.caja_de(tablero, fila, col)
        par = []
        for quien, cual in (("ANDERSON", tablero), ("SHARID", "S" if tablero == "A" else "SF")):
            rec = lienzos[cual][y0:y1, x0:x1]
            base = cv2.bilateralFilter(_el.revelar(rec), 5, 40, 40)
            out = restaurador.restaurar(base)
            ancho = 560 if len(claves) > 4 else 760
            out = cv2.resize(out, (ancho, int(ancho * out.shape[0] / out.shape[1])),
                             interpolation=cv2.INTER_AREA)
            barra = np.full((30, out.shape[1], 3), 240, np.uint8)
            cv2.putText(barra, f"{quien}   {clave}", (8, 21),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 20, 20), 1, cv2.LINE_AA)
            par.append(np.vstack([barra, out]))
        alto = min(p.shape[0] for p in par)
        filas.append(np.hstack([p[:alto] for p in par]))
        print(f"  {clave}", flush=True)

    hojas = [filas[i:i + POR_HOJA] for i in range(0, len(filas), POR_HOJA)]
    for n, hoja in enumerate(hojas, 1):
        ancho = min(f.shape[1] for f in hoja)
        ruta = os.path.join(SALIDA, f"cotejo-{n:02d}.png")
        cv2.imwrite(ruta, np.vstack([f[:, :ancho] for f in hoja]))
        print(f"escrito {ruta}")


if __name__ == "__main__":
    main()
