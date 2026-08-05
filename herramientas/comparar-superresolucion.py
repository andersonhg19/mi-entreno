# -*- coding: utf-8 -*-
"""Descarga modelos de superresolucion y compara resultados sobre una ficha."""
import os, time, urllib.request
import numpy as np
import cv2
from PIL import Image

TMP = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp"
MODELOS = os.path.join(TMP, "modelos")
os.makedirs(MODELOS, exist_ok=True)

FUENTES = {
    "fsrcnn_x3": ("fsrcnn", 3, "https://github.com/Saafke/FSRCNN_Tensorflow/raw/master/models/FSRCNN_x3.pb"),
    "espcn_x3":  ("espcn",  3, "https://github.com/fannymonori/TF-ESPCN/raw/master/export/ESPCN_x3.pb"),
    "edsr_x3":   ("edsr",   3, "https://github.com/Saafke/EDSR_Tensorflow/raw/master/models/EDSR_x3.pb"),
    "lapsrn_x4": ("lapsrn", 4, "https://github.com/fannymonori/TF-LapSRN/raw/master/export/LapSRN_x4.pb"),
}

for nombre, (alg, esc, url) in FUENTES.items():
    destino = os.path.join(MODELOS, nombre + ".pb")
    if os.path.exists(destino):
        print(f"{nombre}: ya estaba ({os.path.getsize(destino)//1024} KB)")
        continue
    try:
        urllib.request.urlretrieve(url, destino)
        print(f"{nombre}: descargado ({os.path.getsize(destino)//1024} KB)")
    except Exception as e:
        print(f"{nombre}: NO se pudo descargar -> {e}")

# --- Recorte de prueba, a resolucion nativa ---
warp = Image.open(os.path.join(TMP, "fichas", "A_warp.jpg")).convert("RGB")
caja = (int(14 + 457.6 * 4), 66 + int(301.83 * 2), int(14 + 457.6 * 4) + 440, 66 + int(301.83 * 2) + 300)
nativo = warp.crop(caja)                      # PECK DECK, ~440x300
nativo.save(os.path.join(TMP, "sr_nativo.png"))
print("recorte nativo:", nativo.size)

bgr = cv2.cvtColor(np.asarray(nativo), cv2.COLOR_RGB2BGR)

resultados = {"lanczos": cv2.resize(bgr, (440 * 3, 300 * 3), interpolation=cv2.INTER_LANCZOS4)}
for nombre, (alg, esc, _) in FUENTES.items():
    ruta = os.path.join(MODELOS, nombre + ".pb")
    if not os.path.exists(ruta):
        continue
    try:
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(ruta)
        sr.setModel(alg, esc)
        t0 = time.time()
        salida = sr.upsample(bgr)
        print(f"{nombre}: {salida.shape[1]}x{salida.shape[0]} en {time.time()-t0:.1f} s")
        resultados[nombre] = salida
    except Exception as e:
        print(f"{nombre}: fallo al aplicar -> {e}")

# --- Mosaico comparativo, recortando la zona del titulo para ver el detalle ---
tiras = []
for nombre, img in resultados.items():
    h, w = img.shape[:2]
    esc = w / 440.0
    trozo = img[int(20 * esc):int(120 * esc), int(120 * esc):int(430 * esc)]
    trozo = cv2.resize(trozo, (930, int(trozo.shape[0] * 930 / trozo.shape[1])), interpolation=cv2.INTER_NEAREST)
    cv2.putText(trozo, nombre, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    tiras.append(trozo)

if tiras:
    alto = sum(t.shape[0] + 6 for t in tiras)
    lienzo = np.full((alto, 930, 3), 30, np.uint8)
    y = 0
    for t in tiras:
        lienzo[y:y + t.shape[0], 0:t.shape[1]] = t
        y += t.shape[0] + 6
    cv2.imwrite(os.path.join(TMP, "sr_comparativa.jpg"), lienzo, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print("comparativa lista")
