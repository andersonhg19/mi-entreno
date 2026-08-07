# Mi Entreno

La rutina de gimnasio de **Anderson** y **Sharid** (Life Gym, agosto–noviembre
2026): la ficha original de cada ejercicio, los pasos escritos y lectura en voz alta.

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
descarga las 165 imágenes. A partir de ahí funciona en el gimnasio sin señal.

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
- Cada ejercicio trae **la ficha original del tablero de Life Gym** (la misma
  que te dieron en papel) y, **solo si corresponden de verdad**, dos fotos más
  en un carrusel. Los nueve de TRX, BOSU y banda se quedan solo con la ficha:
  no existe foto libre que sea ese movimiento, y una que no lo es confunde más
  que ayuda. Además: cómo reconocer la máquina, los pasos numerados, las
  advertencias y un enlace a video.
- Abre siempre en el selector de persona, para que nadie entrene la rutina del otro.
- **Ejercicios alternativos** en cada ficha, para cuando la máquina está
  ocupada. En dos niveles: *cambio directo* (mismo patrón de movimiento, otro
  aparato) y *trabaja el mismo músculo* (movimiento distinto). Se esconden los
  que ya están en tu rutina de ese día.
- La barra de arriba lleva **el color de quien entrena**, para saber de un
  vistazo en qué rutina estás.
- El día se puede **dar por terminado aunque falten ejercicios**; se ve en la
  semana y la cuenta vuelve a cero cada lunes.
- La lista del día separa **lo que te falta** de **lo que ya hiciste**.
- El **descanso entre series** se ajusta desde Ajustes (15 s a 5 minutos).
- **Tabata**: temporizador por intervalos aparte, con preajustes, cuenta atrás
  grande, aviso por voz, pitido y vibración, y la pantalla que no se apaga.
- Botón **«Léemelo en voz alta»** que dicta todo el ejercicio.
- Contador de series con **descanso** que se canta y vibra al acabar (1 minuto por
  defecto, ajustable).
- Guarda el peso que usaste **con historial**: ves las últimas veces con su
  fecha, y cuando llevas tres sesiones con el mismo peso te recuerda la regla
  del entrenador (*subir 10–20 % cuando las 15 repeticiones salgan fáciles*).
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
| `prueba-completitud.js` | Compara la rutina ejercicio a ejercicio contra las planillas; valida imágenes, avisos y arranque |
| `prueba-humo.js` | Renderiza las 146 pantallas de ambas rutinas (jsdom) |
| `prueba-visual.js` | Navegador real: qué se ve, desbordes, carrusel, temporizador, filtros, temas, letra al máximo. Capturas en `pruebas/capturas/` |
| `prueba-regresiones.js` | 19 casos: un bug ya visto cada uno (`hidden`, casillas, carrusel, ids, foco, arranque, 320 px al 180 %) más lo que se añadió después (descanso ajustable, cierre de día con reinicio semanal, pendientes/hechos, alternativas, de qué tablero salió cada ficha) |
| `prueba-pwa.js` | Manifest, **modo sin conexión**, contraste **por barrido** (todo texto, 7 pantallas × 3 temas, AAA), accesibilidad, persistencia, y los 114 ejercicios comprobando que cada imagen es la suya |

---

## Cambiar la rutina

Todo está en dos archivos de texto plano:

- `assets/js/datos-catalogo.js` — los ejercicios y cómo se hacen.
- `assets/js/datos-planes.js` — qué le toca a cada uno cada día.

Después de cambiar algo:

1. `npm run sw` si añadiste o quitaste imágenes.
2. `npm run qa` (si tocaste CSS o maquetación, `npm test` **no** basta).
3. Subir el número de `VERSION` en `sw.js` para que los teléfonos se actualicen.
4. `git add -A && git commit && git push` — GitHub Pages se actualiza solo.

---

## Documentación

| Documento | Qué contiene |
|-----------|--------------|
| [enunciado-detallado.md](documentación/enunciado-detallado.md) | Problema, alcance, stack, modelo de datos |
| [extraccion-planillas.md](documentación/extraccion-planillas.md) | Todo lo que se leyó de las hojas físicas, ejercicio por ejercicio |
| [imagenes-fichas.md](documentación/imagenes-fichas.md) | Cómo se producen las fichas: perspectiva, revelado y superresolución |
| [accesibilidad-baja-vision.md](documentación/accesibilidad-baja-vision.md) | Las 12 decisiones de accesibilidad y por qué |
| [despliegue-gratuito.md](documentación/despliegue-gratuito.md) | Cómo publicarla e instalarla, y qué se descartó |
| [puntos-futuros.md](documentación/puntos-futuros.md) | Backlog, incluido cómo integrarla a Oh Churus |
| [seguimiento/plan-maestro.md](seguimiento/plan-maestro.md) | Las 14 fases con entregables |
| [seguimiento/bitacora.md](seguimiento/bitacora.md) | Registro cronológico y decisiones |

---

## Créditos

- Rutinas: **Life Gym — Centro de Entrenamiento Físico**
- Fichas de los ejercicios: recortadas de los tableros de **Life Gym**
  (perspectiva corregida y restauradas con **Real-ESRGAN** en local; cada
  decisión está **medida** contra una verdad de referencia y cada ficha pasa
  una guardia que comprueba que el modelo no se inventó nada — ver
  `documentación/imagenes-fichas.md` y `herramientas/banco/`)
- Fotos complementarias: [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (dominio público). Las 55 se revisaron una a una al lado de su ficha:
  41 son el ejercicio exacto, 5 van rotuladas «⚠ Foto parecida» y 9 se quedan
  **solo con la ficha** porque no existe foto libre de ese movimiento
