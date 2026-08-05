# -*- coding: utf-8 -*-
"""Copia cada ficha recortada al proyecto con el nombre de su ejercicio."""
import os, json
from PIL import Image

CARDS = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas\tarjetas"
DEST = r"C:\Users\ander\Documents\Anderson\Personales\entreno\assets\img\ejercicios"

# clave del catalogo -> (tablero, fila, columna)
MAPA = {
    # ---- Tablero de gimnasio ----
    "sentadilla-mancuerna":      ("A", 0, 3),
    "prensa-atletica":           ("A", 0, 4),
    "leg-extension":             ("A", 0, 5),
    "leg-curl":                  ("A", 0, 6),
    "tijeras-barra":             ("A", 0, 7),
    "abductor":                  ("A", 0, 9),
    "elevacion-talones-hack":    ("A", 1, 1),
    "pantorrilla-sentado":       ("A", 1, 3),
    "jalon-delante-abierto":     ("A", 1, 4),
    "jalon-delante-cerrado":     ("A", 1, 6),
    "remo-sentado-polea":        ("A", 1, 7),
    "remo-al-pecho":             ("A", 2, 0),
    "dominadas":                 ("A", 2, 2),
    "peck-deck":                 ("A", 2, 4),
    "press-banca":               ("A", 2, 6),
    "press-inclinado":           ("A", 2, 7),
    "press-mancuerna":           ("A", 3, 2),
    "press-inclinado-mancuerna": ("A", 3, 3),
    "fondo-de-pecho":            ("A", 3, 6),
    "triceps-copa":              ("A", 3, 7),
    "push-down":                 ("A", 3, 8),
    "extension-mancuerna":       ("A", 4, 1),
    "press-frances":             ("A", 4, 5),
    "hiperextensiones":          ("A", 4, 6),
    "press-militar-maquina":     ("A", 4, 7),
    "laterales":                 ("A", 4, 9),
    "frontales":                 ("A", 5, 0),
    "press-militar-mancuerna":   ("A", 5, 2),
    "elevacion-tronco-maquina":  ("A", 5, 7),
    "levantamiento-pierna-piso": ("A", 6, 0),
    "curl-barra":                ("A", 6, 5),
    "curl-polea":                ("A", 6, 6),
    "curl-mancuerna-alternado":  ("A", 6, 8),
    "predicador-maquina":        ("A", 7, 1),
    "levantamiento-atras-polea": ("A", 7, 2),
    "gluteo-polea":              ("A", 7, 4),
    # ---- Tablero funcional ----
    "trx-sentadilla-profunda":   ("AF", 0, 2),
    "trx-abductor":              ("AF", 0, 3),
    "sentadilla-iso":            ("AF", 0, 6),
    "elevacion-rodilla":         ("AF", 1, 0),
    "aductor-banda":             ("AF", 1, 2),
    "peso-muerto-saco":          ("AF", 1, 3),
    "sentadilla-dinamica":       ("AF", 1, 4),
    "salto-cajon":               ("AF", 1, 6),
    "trx-espalda":               ("AF", 2, 0),
    "apertura-trx":              ("AF", 2, 1),
    "banco-triceps":             ("AF", 3, 2),
    "vuelo-trx":                 ("AF", 3, 3),
    "lazo-hombro":               ("AF", 3, 5),
    "plancha-bosu":              ("AF", 4, 4),
    "twist-ruso":                ("AF", 4, 5),
    "abdominales-suelo":         ("AF", 4, 7),
    "biceps-trx":                ("AF", 5, 1),
    "gluteo-pesa-rusa":          ("AF", 5, 6),
    "sentadilla-patada-lateral": ("AF", 5, 7),
}

ANCHO = 1000

if __name__ == "__main__":
    faltan = []
    for clave, (t, f, c) in MAPA.items():
        src = os.path.join(CARDS, f"{t}_{f}_{c}.jpg")
        if not os.path.exists(src):
            faltan.append(f"{clave} -> {t}_{f}_{c}")
            continue
        im = Image.open(src)
        if im.width > ANCHO:
            im = im.resize((ANCHO, int(im.height * ANCHO / im.width)), Image.LANCZOS)
        im.save(os.path.join(DEST, f"{clave}-ficha.jpg"), quality=86, subsampling=0)
    print(f"Fichas copiadas: {len(MAPA) - len(faltan)} de {len(MAPA)}")
    if faltan:
        print("FALTAN:", faltan)
    with open(os.path.join(os.path.dirname(CARDS), "mapa.json"), "w", encoding="utf-8") as fh:
        json.dump(MAPA, fh, ensure_ascii=False, indent=1)
