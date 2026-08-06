# -*- coding: utf-8 -*-
"""
Hojas de contacto para revisar A OJO que las fotos correspondan.

POR QUE EXISTE ESTO
-------------------
Es el error que mas veces se ha colado en este proyecto: ilustrar un
ejercicio con una foto «parecida». Ya paso una vez en grande (20 de 55
estaban mal) y Anderson volvio a verlo: *«me ha pasado mucho que no tienen
nada que ver»*.

Ninguna medida automatica sirve aqui. Saber si una foto de un señor haciendo
press de banca corresponde a la tarjeta «PRESS BANCA» es entender la imagen,
no compararla. Asi que esto no puntua nada: solo pone la ficha del gimnasio
—que es la que manda, porque es literalmente el carton del entrenador— al
lado de sus dos fotos, para poder decidir mirando.

    python herramientas/revisar-fotos.py           # las 55
    python herramientas/revisar-fotos.py press-banca curl-barra
"""
import os, sys, re
import numpy as np
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(AQUI, "..", "assets", "img", "ejercicios")
SALIDA = os.path.join(AQUI, "..", "pruebas", "capturas", "revision-fotos")
POR_HOJA = 4
ALTO = 300


def catalogo():
    """Lee nombre, grupo, equipo y fotosOk del catalogo sin ejecutar JS."""
    txt = open(os.path.join(AQUI, "..", "assets", "js", "datos-catalogo.js"),
               encoding="utf-8").read()
    fuera = {}
    for m in re.finditer(r'"([a-z0-9-]+)":\s*\{\s*\n\s*nombre:\s*"([^"]+)",\s*'
                         r'grupo:\s*"([^"]+)",\s*equipo:\s*"([^"]+)",\s*'
                         r'fotosOk:\s*(true|false)', txt):
        fuera[m.group(1)] = {"nombre": m.group(2), "grupo": m.group(3),
                             "equipo": m.group(4), "fotosOk": m.group(5) == "true"}
    return fuera


def encajar(ruta, ancho, alto):
    img = cv2.imread(ruta)
    if img is None:
        lienzo = np.full((alto, ancho, 3), 220, np.uint8)
        cv2.putText(lienzo, "FALTA", (10, alto // 2), cv2.FONT_HERSHEY_SIMPLEX,
                    0.8, (0, 0, 200), 2, cv2.LINE_AA)
        return lienzo
    e = min(ancho / img.shape[1], alto / img.shape[0])
    chico = cv2.resize(img, (max(1, int(img.shape[1] * e)), max(1, int(img.shape[0] * e))),
                       interpolation=cv2.INTER_AREA)
    lienzo = np.full((alto, ancho, 3), 255, np.uint8)
    oy, ox = (alto - chico.shape[0]) // 2, (ancho - chico.shape[1]) // 2
    lienzo[oy:oy + chico.shape[0], ox:ox + chico.shape[1]] = chico
    return lienzo


def main():
    cat = catalogo()
    claves = sys.argv[1:] or sorted(cat)
    os.makedirs(SALIDA, exist_ok=True)
    for f in os.listdir(SALIDA):
        os.remove(os.path.join(SALIDA, f))

    filas = []
    for clave in claves:
        if clave not in cat:
            print(f"  (no esta en el catalogo: {clave})")
            continue
        e = cat[clave]
        anchos = (int(ALTO * 4 / 3), int(ALTO * 4 / 3), int(ALTO * 4 / 3))
        trozos = [encajar(os.path.join(IMG, f"{clave}-ficha.jpg"), anchos[0], ALTO),
                  encajar(os.path.join(IMG, f"{clave}-0.jpg"), anchos[1], ALTO),
                  encajar(os.path.join(IMG, f"{clave}-1.jpg"), anchos[2], ALTO)]
        # separadores para que se vea donde acaba una y empieza otra
        sep = np.full((ALTO, 3, 3), 40, np.uint8)
        cuerpo = np.hstack([trozos[0], sep, trozos[1], sep, trozos[2]])

        barra = np.full((46, cuerpo.shape[1], 3), 238, np.uint8)
        etiqueta = f"{clave}  |  {e['nombre']}  |  {e['grupo']} - {e['equipo']}"
        cv2.putText(barra, etiqueta, (8, 19), cv2.FONT_HERSHEY_SIMPLEX,
                    0.48, (15, 15, 15), 1, cv2.LINE_AA)
        marca = "fotosOk: SI (dice que corresponden)" if e["fotosOk"] \
            else "fotosOk: NO (marcadas como «parecidas» en la app)"
        color = (20, 110, 20) if e["fotosOk"] else (20, 90, 190)
        cv2.putText(barra, marca, (8, 38), cv2.FONT_HERSHEY_SIMPLEX,
                    0.46, color, 1, cv2.LINE_AA)
        cv2.putText(barra, "FICHA DEL GIMNASIO (manda)", (8, 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.32, (90, 90, 90), 1, cv2.LINE_AA)
        cv2.putText(barra, "foto 0", (anchos[0] + 12, 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.32, (90, 90, 90), 1, cv2.LINE_AA)
        cv2.putText(barra, "foto 1", (anchos[0] + anchos[1] + 18, 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.32, (90, 90, 90), 1, cv2.LINE_AA)
        filas.append(np.vstack([barra, cuerpo]))

    hojas = [filas[i:i + POR_HOJA] for i in range(0, len(filas), POR_HOJA)]
    for n, hoja in enumerate(hojas, 1):
        ancho = min(f.shape[1] for f in hoja)
        ruta = os.path.join(SALIDA, f"fotos-{n:02d}.png")
        cv2.imwrite(ruta, np.vstack([f[:, :ancho] for f in hoja]))
    print(f"{len(filas)} ejercicios en {len(hojas)} hojas -> {SALIDA}")


if __name__ == "__main__":
    main()
