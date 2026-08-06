# -*- coding: utf-8 -*-
"""
Real-ESRGAN en local, sobre la GPU. Es el motor de `3-generar-fichas.py`.

POR QUE ESTE MODELO
-------------------
La v8 usaba EDSR, que es un modelo FIEL: aprende a estirar lo que hay y no
puede inventar nada. Por eso dejaba el grano intacto — el grano tambien «es
lo que hay» y lo estiraba igual que al dibujo.

Real-ESRGAN es un GAN entrenado con degradaciones reales (ruido de sensor,
JPEG, desenfoque). Su variante `anime_6B` esta entrenada con DIBUJO: zonas
de color plano y contorno limpio, que es exactamente una tarjeta impresa.
No solo amplia, reconstruye. Medido: el grano del papel baja de 1,98 a 0,30
y el borde pasa de 0,425 a 0,266.

La variante `general` (x4plus) tambien se probo y es peor en las dos cosas
(0,58 y 0,286), ademas de mas lenta.

QUE HACE FALTA
--------------
    python -m pip install --index-url https://download.pytorch.org/whl/cu126 torch

Los pesos (18 MB) se descargan solos la primera vez a `modelos/`. Sin GPU
funciona igual, en la CPU, solo que tarda bastante mas.

La red se implementa aqui a mano (RRDBNet) en vez de usar el paquete
`realesrgan` de PyPI, que arrastra dependencias fijadas a versiones viejas
de torchvision y no instala con torch 2.13.
"""
import os
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

MODELOS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modelos")

PESOS = {
    "anime": ("RealESRGAN_x4plus_anime_6B.pth", 6,
              "https://github.com/xinntao/Real-ESRGAN/releases/download/"
              "v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth"),
    "general": ("RealESRGAN_x4plus.pth", 23,
                "https://github.com/xinntao/Real-ESRGAN/releases/download/"
                "v0.1.0/RealESRGAN_x4plus.pth"),
}


class BloqueDenso(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        return self.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf, gc=32):
        super().__init__()
        self.rdb1, self.rdb2, self.rdb3 = (BloqueDenso(nf, gc), BloqueDenso(nf, gc),
                                           BloqueDenso(nf, gc))

    def forward(self, x):
        return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x


class RRDBNet(nn.Module):
    def __init__(self, nb=23, nf=64, gc=32):
        super().__init__()
        self.conv_first = nn.Conv2d(3, nf, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_last = nn.Conv2d(nf, 3, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        feat = self.conv_first(x)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


_cache = {}


def cargar(cual="anime"):
    if cual in _cache:
        return _cache[cual]
    archivo, nb, url = PESOS[cual]
    ruta = os.path.join(MODELOS, archivo)
    if not os.path.exists(ruta):
        import urllib.request
        os.makedirs(MODELOS, exist_ok=True)
        print(f"  descargando {archivo} (una sola vez)...", flush=True)
        urllib.request.urlretrieve(url, ruta)
    peso = torch.load(ruta, map_location="cpu", weights_only=True)
    peso = peso.get("params_ema", peso.get("params", peso))
    red = RRDBNet(nb=nb)
    red.load_state_dict(peso, strict=True)
    red.eval()
    disp = "cuda" if torch.cuda.is_available() else "cpu"
    red = red.to(disp)
    if disp == "cuda":
        red = red.half()
    _cache[cual] = (red, disp)
    return _cache[cual]


@torch.no_grad()
def restaurar(bgr, cual="anime"):
    """Restaura y amplia x4 una imagen BGR (uint8). Devuelve BGR uint8."""
    red, disp = cargar(cual)
    x = bgr[:, :, ::-1].astype(np.float32) / 255.0            # BGR -> RGB
    t = torch.from_numpy(np.ascontiguousarray(x)).permute(2, 0, 1).unsqueeze(0).to(disp)
    if disp == "cuda":
        t = t.half()
    y = red(t).squeeze(0).permute(1, 2, 0).float().clamp(0, 1).cpu().numpy()
    return (y[:, :, ::-1] * 255.0).round().astype(np.uint8)
