# -*- coding: utf-8 -*-
"""
Extrae la ficha (dibujo + nombre) de cada ejercicio desde las fotos de los
tableros de Life Gym.

Pasos:
  1. Detectar el panel claro que contiene la cuadricula (4 esquinas).
  2. Corregir la perspectiva -> rectangulo perfecto.
  3. Partir en filas por proyeccion horizontal de brillo.
  4. Partir cada fila en tarjetas por proyeccion vertical.
  5. Guardar cada tarjeta.
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw

SRC = r"C:\Users\ander\Downloads\imagenes para la aplicación de ejercicio"
OUT = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"
os.makedirs(OUT, exist_ok=True)

TABLEROS = {
    "A":  ("IMG_1288.jpeg", "anderson-gimnasio"),
    "AF": ("IMG_1287.jpeg", "anderson-funcional"),
    "S":  ("IMG_1289.jpeg", "sharid-gimnasio"),
    "SF": ("IMG_1291.jpeg", "sharid-funcional"),
}


def mayor_componente(mask):
    """Etiquetado de componentes conexas por barrido (sin scipy)."""
    h, w = mask.shape
    etiquetas = np.zeros((h, w), dtype=np.int32)
    actual = 0
    tam = {}
    pila = []
    for y0 in range(h):
        fila = mask[y0]
        for x0 in range(w):
            if not fila[x0] or etiquetas[y0, x0]:
                continue
            actual += 1
            n = 0
            pila.append((y0, x0))
            etiquetas[y0, x0] = actual
            while pila:
                y, x = pila.pop()
                n += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not etiquetas[ny, nx]:
                        etiquetas[ny, nx] = actual
                        pila.append((ny, nx))
            tam[actual] = n
    if not tam:
        return None
    mejor = max(tam, key=tam.get)
    return etiquetas == mejor


def esquinas_panel(img, escala=8):
    """Devuelve las 4 esquinas del panel claro, en coordenadas de la imagen original."""
    peq = img.convert("L").resize((img.width // escala, img.height // escala))
    a = np.asarray(peq, dtype=np.float32)

    # El panel es claro; el tablero (azul o fucsia) y la mesa son oscuros.
    umbral = (a.max() + a.mean()) / 2.0
    mask = a > umbral

    # Limpieza: quitar puntos sueltos exigiendo vecindad
    from numpy.lib.stride_tricks import sliding_window_view
    pad = np.pad(mask.astype(np.uint8), 1)
    vecinos = sliding_window_view(pad, (3, 3)).sum(axis=(2, 3))
    mask = mask & (vecinos >= 6)

    comp = mayor_componente(mask)
    ys, xs = np.nonzero(comp)
    pts = np.stack([xs, ys], axis=1).astype(np.float32)

    suma, resta = pts[:, 0] + pts[:, 1], pts[:, 0] - pts[:, 1]
    tl = pts[np.argmin(suma)]
    br = pts[np.argmax(suma)]
    tr = pts[np.argmax(resta)]
    bl = pts[np.argmin(resta)]
    return np.array([tl, tr, br, bl], dtype=np.float32) * escala


def coeficientes(destino, origen):
    """Coeficientes para Image.transform(PERSPECTIVE): mapea destino -> origen."""
    A, B = [], []
    for (xd, yd), (xo, yo) in zip(destino, origen):
        A.append([xd, yd, 1, 0, 0, 0, -xo * xd, -xo * yd])
        A.append([0, 0, 0, xd, yd, 1, -yo * xd, -yo * yd])
        B += [xo, yo]
    res = np.linalg.solve(np.array(A, dtype=np.float64), np.array(B, dtype=np.float64))
    return res.tolist()


def rectificar(img, esq, ancho, alto):
    destino = [(0, 0), (ancho, 0), (ancho, alto), (0, alto)]
    c = coeficientes(destino, [tuple(p) for p in esq])
    return img.transform((ancho, alto), Image.PERSPECTIVE, c, Image.BICUBIC)


def rachas(valores, umbral, minimo):
    """Tramos consecutivos donde valores > umbral, de longitud >= minimo."""
    out, ini = [], None
    for i, v in enumerate(valores):
        if v > umbral and ini is None:
            ini = i
        elif v <= umbral and ini is not None:
            if i - ini >= minimo:
                out.append((ini, i))
            ini = None
    if ini is not None and len(valores) - ini >= minimo:
        out.append((ini, len(valores)))
    return out


def procesar(clave, ancho=4600, alto=None):
    archivo, nombre = TABLEROS[clave]
    img = Image.open(os.path.join(SRC, archivo)).convert("RGB")
    esq = esquinas_panel(img)

    # Alto proporcional al panel detectado
    lado_sup = np.linalg.norm(esq[1] - esq[0])
    lado_izq = np.linalg.norm(esq[3] - esq[0])
    if alto is None:
        alto = int(ancho * lado_izq / lado_sup)

    warp = rectificar(img, esq, ancho, alto)
    warp.save(os.path.join(OUT, f"{clave}_warp.jpg"), quality=92)

    g = np.asarray(warp.convert("L"), dtype=np.float32)
    # Ignorar un borde del 1% para que el marco no ensucie las proyecciones
    m = int(min(ancho, alto) * 0.01)
    g = g[m:alto - m, m:ancho - m]

    filas_perfil = g.mean(axis=1)
    umbral_f = (filas_perfil.max() + filas_perfil.min()) / 2.0
    bandas = rachas(filas_perfil, umbral_f, int(alto * 0.04))

    resultado = {"clave": clave, "nombre": nombre, "ancho": ancho, "alto": alto,
                 "esquinas": esq.tolist(), "filas": []}

    debug = warp.copy()
    dib = ImageDraw.Draw(debug)

    for i, (y0, y1) in enumerate(bandas):
        banda = g[y0:y1, :]
        col_perfil = banda.mean(axis=0)
        umbral_c = (col_perfil.max() + col_perfil.min()) / 2.0
        cols = rachas(col_perfil, umbral_c, int(ancho * 0.02))
        fila = []
        for j, (x0, x1) in enumerate(cols):
            caja = (x0 + m, y0 + m, x1 + m, y1 + m)
            fila.append(caja)
            dib.rectangle(caja, outline=(255, 0, 0), width=6)
            dib.text((caja[0] + 10, caja[1] + 10), f"{i}-{j}", fill=(255, 0, 0))
        resultado["filas"].append(fila)

    debug.resize((1400, int(1400 * alto / ancho))).save(os.path.join(OUT, f"{clave}_debug.jpg"), quality=88)
    with open(os.path.join(OUT, f"{clave}_cajas.json"), "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=1)

    print(f"{clave}: panel {ancho}x{alto}  filas={len(bandas)}  tarjetas por fila={[len(f) for f in resultado['filas']]}")
    return resultado


if __name__ == "__main__":
    for k in (sys.argv[1:] or ["A", "AF", "S", "SF"]):
        procesar(k)
