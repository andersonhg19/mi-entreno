# -*- coding: utf-8 -*-
"""
Lleva los tableros de Sharid al MISMO lienzo que los de Anderson.

POR QUE
-------
Los dos tableros son la misma baraja de tarjetas: mismos dibujos, mismos
titulos, misma cuadricula. Solo cambian el color de las franjas de musculo
—azul marino en el de Anderson, granate en el de Sharid— y las marcas de
cada quien.

Eso da DOS fotos independientes de cada tarjeta. Y, sobre todo, el reflejo
del flash cae en sitios distintos: la columna que en un tablero salio
quemada, en el otro esta impecable. Medido tarjeta a tarjeta, hay tres que
en el tablero de Anderson perdieron tanto contraste que no se leen, y las
tres estan sanas en el de Sharid.

COMO
----
Se emparejan con SIFT sobre el gradiente y se ajusta una homografia con
RANSAC. Salen ~2.200 correspondencias con 2,6 px de error medio sobre un
panel de 4.600 px, que es de sobra para recortar por tarjeta.

Se descartaron dos caminos antes de llegar aqui:

  - Detectar las 4 esquinas del panel, como en `1-rectificar.py`. En el
    tablero rosado la cabecera (nombre, documento) es del mismo carton
    blanco y va pegada a la cuadricula, asi que la deteccion se tragaba las
    dos y el panel salia con proporcion 1,49 en vez de 1,79: la cuadricula
    quedaba inclinada y las tarjetas no cuadraban.

  - Usar la reticula de franjas de musculo como puntos de referencia. Al
    ser de distinto color en cada tablero, y llevar el nombre del musculo
    escrito en blanco encima, la deteccion salia incompleta en uno o en
    otro por mucho que se afinara.

Se empareja desde la FOTO ORIGINAL, no desde una rectificacion previa, para
remuestrear una sola vez: encadenar dos remuestreos ablanda justo el trazo
que se intenta conservar.

Salida: `S_alineado.jpg` y `SF_alineado.jpg`, ya en el lienzo de Anderson,
asi que la geometria de recorte medida para el sirve tal cual para los dos.
Ademas `*_cotejo.jpg` para comprobar de un vistazo que la alineacion pega.
"""
import os, json
import numpy as np
import cv2

SRC = r"C:\Users\ander\Downloads\imagenes para la aplicación de ejercicio"
TRABAJO = r"C:\Users\ander\.claude\jobs\a376f2a2\tmp\fichas"

# (foto de Sharid, clave, lienzo de Anderson al que se lleva)
PAREJAS = [("IMG_1289.jpeg", "S", "A"), ("IMG_1291.jpeg", "SF", "AF")]


def leer(ruta):
    """cv2.imread no abre rutas con tildes en Windows; se decodifica a mano."""
    img = cv2.imdecode(np.fromfile(ruta, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError(f"no se pudo leer {ruta}")
    return img


def gradiente(bgr):
    """
    Se empareja sobre el contraste local, no sobre el color.

    Las franjas son azules en un tablero y granates en el otro, y las marcas
    de rotulador tampoco coinciden. Lo unico identico es el trazo del dibujo,
    y es lo que queda cuando se iguala el contraste por zonas.
    """
    gris = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return cv2.createCLAHE(clipLimit=2.5, tileGridSize=(16, 16)).apply(gris)


def emparejar(origen, destino, escala=3):
    """Homografia origen -> destino a partir de puntos SIFT."""
    o = cv2.resize(gradiente(origen), None, fx=1.0 / escala, fy=1.0 / escala,
                   interpolation=cv2.INTER_AREA)
    d = cv2.resize(gradiente(destino), None, fx=1.0 / escala, fy=1.0 / escala,
                   interpolation=cv2.INTER_AREA)

    sift = cv2.SIFT_create(nfeatures=40000)
    ko, do_ = sift.detectAndCompute(o, None)
    kd, dd = sift.detectAndCompute(d, None)
    print(f"  puntos SIFT: origen {len(ko)}, destino {len(kd)}")

    flann = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=64))
    buenas = [m for m, n in flann.knnMatch(do_, dd, k=2)
              if m.distance < 0.72 * n.distance]
    print(f"  parejas que pasan el test de proporcion: {len(buenas)}")
    if len(buenas) < 200:
        raise RuntimeError("muy pocas parejas fiables; revisa que las fotos sean las buenas")

    a = np.float64([ko[m.queryIdx].pt for m in buenas]).reshape(-1, 1, 2) * escala
    b = np.float64([kd[m.trainIdx].pt for m in buenas]).reshape(-1, 1, 2) * escala
    M, inl = cv2.findHomography(a, b, cv2.USAC_MAGSAC, 6.0,
                                maxIters=20000, confidence=0.9995)
    if M is None:
        raise RuntimeError("no se pudo ajustar la homografia")
    inl = inl.ravel().astype(bool)
    err = np.linalg.norm(
        cv2.perspectiveTransform(a[inl], M).reshape(-1, 2) - b[inl].reshape(-1, 2), axis=1)
    print(f"  inliers {inl.sum()}/{len(buenas)}  error medio {err.mean():.2f} px")
    if inl.sum() < 200 or err.mean() > 5.0:
        raise RuntimeError("la alineacion no es de fiar; no se escribe nada")
    return M, int(inl.sum()), float(err.mean())


def main():
    resumen = {}
    for foto, clave, lienzo in PAREJAS:
        print(f"\n=== {foto} ({clave}) -> lienzo de {lienzo} ===")
        origen = leer(os.path.join(SRC, foto))
        destino = leer(os.path.join(TRABAJO, f"{lienzo}_warp.jpg"))
        M, n, err = emparejar(origen, destino)

        alto, ancho = destino.shape[:2]
        alineado = cv2.warpPerspective(origen, M, (ancho, alto),
                                       flags=cv2.INTER_LANCZOS4,
                                       borderMode=cv2.BORDER_REPLICATE)
        cv2.imwrite(os.path.join(TRABAJO, f"{clave}_alineado.jpg"), alineado,
                    [cv2.IMWRITE_JPEG_QUALITY, 95])

        # Comprobacion de un vistazo: franjas verticales alternas de los dos
        # tableros. Si la alineacion es buena, los dibujos y los titulos
        # siguen a la misma altura al cruzar de una franja a la siguiente.
        mezcla = destino.copy()
        paso = ancho // 12
        for i in range(1, 12, 2):
            mezcla[:, i * paso:(i + 1) * paso] = alineado[:, i * paso:(i + 1) * paso]
        cv2.imwrite(os.path.join(TRABAJO, f"{clave}_cotejo.jpg"),
                    cv2.resize(mezcla, (1600, int(1600 * alto / ancho))),
                    [cv2.IMWRITE_JPEG_QUALITY, 90])

        resumen[clave] = {"foto": foto, "hacia": lienzo,
                          "inliers": n, "error_medio": err}

    with open(os.path.join(TRABAJO, "alineacion.json"), "w", encoding="utf-8") as f:
        json.dump(resumen, f, indent=1)
    print("\nEscritos *_alineado.jpg (para recortar) y *_cotejo.jpg (para mirar).")


if __name__ == "__main__":
    main()
