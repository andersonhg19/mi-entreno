# Mi Entreno

La rutina de gimnasio de **Anderson** y **Sharid** (Life Gym, agosto–noviembre
2026), en letra grande, con fotos, pasos escritos y lectura en voz alta.

Es una **PWA**: una web que se instala como app en el iPhone y en el Android,
sin pasar por App Store ni Google Play, y que funciona en el gimnasio aunque no
haya señal.

---

## Abrirla

# → https://andersonhg19.github.io/mi-entreno/

Funciona en cualquier navegador, del computador o del celular.

## Instalarla como app

- **iPhone:** abrir la dirección en **Safari** → botón **Compartir** →
  *Añadir a pantalla de inicio*.
- **Android:** abrir en **Chrome** → menú **⋮** → *Instalar aplicación*.

Después de instalarla, ábrela **una vez con WiFi** y navega medio minuto: ahí
descarga las 110 fotos. A partir de ahí funciona en el gimnasio sin señal.

Guía completa con capturas de cada paso en
**[documentación/despliegue-gratuito.md](documentación/despliegue-gratuito.md)**.

## Probar cambios antes de subirlos

```bash
node servidor.js
```

Imprime una dirección para el computador y otra para el celular en la misma WiFi.

---

## Qué hace

- Elige quién entrena y muestra **el día que corresponde hoy**, ya marcado.
- **Lista completa** de todos tus ejercicios, agrupada por músculo y con
  **filtro por día**: para ver de un vistazo qué te asignaron y cuándo.
- Cada ejercicio trae: dos fotos (inicio y final), cómo reconocer la máquina,
  los pasos numerados, las advertencias y un enlace a video.
- Botón **«Léemelo en voz alta»** que dicta todo el ejercicio.
- Contador de series con **descanso de 1 minuto** que se canta y vibra al acabar.
- Guarda el peso que usaste y lo recuerda la semana siguiente.
- Tamaños de texto **estándar**; **A− / A+** (90 %–180 %) y tres niveles de
  contraste para quien los quiera. La lupa del iPhone funciona encima.

Las decisiones de diseño están explicadas en
**[documentación/accesibilidad-baja-vision.md](documentación/accesibilidad-baja-vision.md)**.

---

## Pruebas

```bash
npm install                        # solo la primera vez
npx playwright install chromium    # solo la primera vez

npm test       # rápido, sin navegador
npm run qa     # completo, abre Chromium de verdad
```

| Prueba | Qué comprueba |
|--------|---------------|
| `validar-datos.js` | Datos, imágenes, referencias y precarga del service worker |
| `prueba-humo.js` | Renderiza las 145 pantallas de ambas rutinas (jsdom) |
| `prueba-visual.js` | Navegador real: qué se ve, desbordes, temas, letra al máximo. Capturas en `pruebas/capturas/` |
| `prueba-pwa.js` | Manifest, **modo sin conexión**, contraste medido, accesibilidad, persistencia, y los 114 ejercicios uno por uno |

---

## Cambiar la rutina

Todo está en dos archivos de texto plano:

- `assets/js/datos-catalogo.js` — los ejercicios y cómo se hacen.
- `assets/js/datos-planes.js` — qué le toca a cada uno cada día.

Después de cambiar algo:

1. `npm run qa` (si tocaste CSS o maquetación, `npm test` **no** basta)
2. Subir el número de `VERSION` en `sw.js` para que los teléfonos se actualicen.
3. `git add -A && git commit && git push` — GitHub Pages se actualiza solo.

---

## Documentación

| Documento | Qué contiene |
|-----------|--------------|
| [enunciado-detallado.md](documentación/enunciado-detallado.md) | Problema, alcance, stack, modelo de datos |
| [extraccion-planillas.md](documentación/extraccion-planillas.md) | Todo lo que se leyó de las hojas físicas, ejercicio por ejercicio |
| [accesibilidad-baja-vision.md](documentación/accesibilidad-baja-vision.md) | Las 12 decisiones de accesibilidad y por qué |
| [despliegue-gratuito.md](documentación/despliegue-gratuito.md) | Cómo publicarla e instalarla, y qué se descartó |
| [puntos-futuros.md](documentación/puntos-futuros.md) | Backlog, incluido cómo integrarla a Oh Churus |
| [seguimiento/plan-maestro.md](seguimiento/plan-maestro.md) | Las 9 fases con entregables |
| [seguimiento/bitacora.md](seguimiento/bitacora.md) | Registro cronológico y decisiones |

---

## Créditos

- Rutinas: **Life Gym — Centro de Entrenamiento Físico**
- Fotos de ejercicios: [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (dominio público)
