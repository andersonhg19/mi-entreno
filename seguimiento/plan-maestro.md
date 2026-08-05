# Mi Entreno — Plan Maestro de Desarrollo

## Estado General: Completado (v3, publicada)
## Fecha inicio: 2026-08-04
## Fecha verificación: 2026-08-04
## Tecnologías: HTML5, CSS3, JavaScript ES5+, PWA (Service Worker, Web App Manifest), Web Speech API
## Pruebas: jsdom (rápidas) + Playwright/Chromium (visual, PWA, offline, contraste)

---

## Resumen de Fases

| Fase | Nombre | Alcance | Estado |
|------|--------|---------|--------|
| 0 | Análisis de las planillas | Lectura ultra-detallada de las 4 fotos, extracción de las 2 rutinas | Completado |
| 1 | Investigación técnica | Hosting gratuito, PWA en iOS, fuentes de imágenes libres, guías de baja visión | Completado |
| 2 | Estructura y datos | Árbol de carpetas, catálogo de 55 ejercicios, planes de las 2 personas | Completado |
| 3 | Material visual | Descarga y optimización de 110 fotos, iconos de la app | Completado |
| 4 | Interfaz accesible | Temas de contraste, escala tipográfica, áreas tocables | Completado |
| 5 | Funciones de entreno | Voz, temporizador, contador de series, registro de peso | Completado |
| 6 | Offline e instalación | Service worker con precarga completa, manifest, iconos | Completado |
| 7 | Pruebas | Validación de datos + prueba de humo sobre todas las pantallas | Completado |
| 8 | Documentación y despliegue | Documentación completa, guía de publicación en GitHub Pages | Completado |
| 9 | v2 — correcciones tras la prueba real | Bug del temporizador, tamaños estándar, lista con filtro, QA con navegador real, privacidad, publicación | Completado |

### Métricas (2026-08-04)

- **Ejercicios en catálogo:** 55 (100 % usados por algún día)
- **Fotos:** 110 (2 por ejercicio) · 5,5 MB optimizados a 720 px
- **Fichas del tablero de Life Gym:** 55 de 55 (exactas por definición)
- **Con fotos reales verificadas:** 35 de 55 · las otras 20 se descartaron por no corresponder
- **Rutina de Anderson:** 59 ejercicios/semana (L 17 · M 8 · X 9 · J 9 · V 16)
- **Rutina de Sharid:** 55 ejercicios/semana (L 13 · M 11 · X 12 · J 10 · V 9)
- **Archivos precargados por el service worker:** 124
- **Dependencias en tiempo de ejecución:** 0
- **Pruebas:** 5 suites en verde — datos, completitud, humo (145 pantallas), visual (Chromium) y PWA/offline
- **Contraste medido:** 20 pares × 3 temas · peor caso 7,68:1 (AAA exige 7:1)
- **Modo sin conexión:** verificado con la red apagada; 124 archivos en caché

---

## FASE 0: Análisis de las planillas

**Objetivo:** Extraer, sin errores, qué ejercicio le toca a cada persona cada día.

### Entregables
- [x] Descarte de imágenes irrelevantes (1 de 13 era una captura de Postman)
- [x] Identificación de los 4 tableros entre las 12 fotos útiles
- [x] Nivelado por rotación de las 4 fotos de máxima resolución
- [x] Recorte fila por fila a resolución nativa (26 recortes)
- [x] Zoom adicional sobre tarjetas con marcador corrido
- [x] Tabla de correspondencia color → día, **distinta para cada persona**
- [x] Documento de evidencia: `documentación/extraccion-planillas.md`

### Hallazgo crítico
Anderson y Sharid tienen **el mismo juego de colores asignado a días distintos**.
Leer el tablero de uno con el código del otro produce la rutina equivocada.

---

## FASE 1: Investigación técnica

### Entregables
- [x] PWA en iOS 2026: instalable desde Safari, service worker sí, quota limitada
- [x] Comparativa de hosting gratuito → GitHub Pages
- [x] Fuentes de imágenes: free-exercise-db (dominio público) vs wger (CC-BY-SA)
- [x] Guías WCAG de contraste y accesibilidad móvil
- [x] Descarte razonado de app nativa, Expo, PDF y backend gratuito

---

## FASE 2: Estructura y datos

### Entregables
- [x] Árbol de carpetas al estilo de Oh Churus (`documentación/`, `seguimiento/`, `recursos/`)
- [x] `assets/js/datos-catalogo.js` — 55 ejercicios con 8 campos cada uno
- [x] `assets/js/datos-planes.js` — 2 personas × 7 días + parámetros de la rutina
- [x] Mapeo español → free-exercise-db validado contra los 873 registros

### Convenciones
- Claves de ejercicio en `kebab-case` y en español: `press-militar-maquina`
- Fotos por convención: `<clave>-0.jpg` (inicio), `<clave>-1.jpg` (final)
- Campo `exacta: false` cuando la foto no es el ejercicio idéntico

---

## FASE 3: Material visual

### Entregables
- [x] 110 fotos descargadas de free-exercise-db
- [x] Redimensionadas a 720 px de ancho, calidad 82 → 6,8 MB a 5,5 MB
- [x] 4 iconos de app generados (180, 192, 512, 512 maskable)
- [x] Tableros originales nivelados en `recursos/planillas/` (excluidos de git)

---

## FASE 4: Interfaz accesible

### Entregables
- [x] Sistema de escala única (`--escala`) - ajustada a 90-180 % en la v2
- [x] Tres temas: Oscuro, Claro, Máximo (amarillo sobre negro, 19,6:1)
- [x] Altura mínima en todo lo tocable - ajustada a 48 px en la v2
- [x] Foco visible, enlace de salto al contenido, HTML semántico
- [x] `prefers-reduced-motion`, safe-area del notch, zoom por pellizco habilitado

---

## FASE 5: Funciones de entreno

### Entregables
- [x] `voz.js` — lectura con selección de voz es-CO → es-MX → es-US → es-419 → es-ES
- [x] `cronometro.js` — cuenta atrás basada en reloj real, no en `setInterval` acumulado
- [x] Cuenta hablada en 10, 3, 2, 1 y aviso al terminar
- [x] Vibración `300-120-300` al terminar el descanso
- [x] Contador de series con +/− y botón «Serie hecha» que arranca el descanso
- [x] Campo de peso usado, recordado entre semanas
- [x] Marcar ejercicio como hecho → salta al siguiente

---

## FASE 6: Offline e instalación

### Entregables
- [x] `sw.js` con precarga de los 124 archivos
- [x] Precarga tolerante a fallos (un archivo caído no rompe la instalación)
- [x] Estrategia *cache first* con red de respaldo
- [x] Peticiones a otros dominios (YouTube) excluidas del caché
- [x] `manifest.webmanifest` con accesos directos a cada rutina
- [x] Metadatos de Apple para pantalla completa en iPhone

### Mantenimiento
Al tocar cualquier archivo hay que subir `VERSION` en `sw.js` para que los
teléfonos se actualicen. Si se agregan fotos, hay que añadirlas a `ARCHIVOS`.

---

## FASE 7: Pruebas

### Entregables
- [x] `pruebas/validar-datos.js` — sin dependencias
  - Sintaxis de los 6 JS y del service worker
  - Los 8 campos obligatorios en los 55 ejercicios
  - Existencia de las 110 fotos
  - Que ningún día apunte a un ejercicio inexistente
  - Que el service worker precargue todo lo que la app usa
  - Que `index.html` no referencie archivos que no existen
  - Que todo `getElementById` de la app tenga su elemento
- [x] `pruebas/prueba-humo.js` — con jsdom
  - Recorre las 145 pantallas de ambas rutinas (inicio, semanas, listas, filtros, días y ejercicios)
  - Verifica nombre, 2 fotos, número de pasos, botones y enlace de video
  - Comprueba el aviso de foto aproximada donde corresponde
  - Ejercita contador de series, temporizador, marcar hecho y ajustes
  - Comprueba que 4 rutas inválidas no dejan la pantalla en blanco

`npm test` corre las dos.

---

## FASE 8: Documentación y despliegue

### Entregables
- [x] `documentación/enunciado-detallado.md`
- [x] `documentación/extraccion-planillas.md`
- [x] `documentación/accesibilidad-baja-vision.md`
- [x] `documentación/despliegue-gratuito.md`
- [x] `documentación/puntos-futuros.md`
- [x] `seguimiento/plan-maestro.md` (este archivo)
- [x] `seguimiento/bitacora.md`
- [x] `CLAUDE.md` y `README.md`
- [x] `servidor.js` para probar desde el celular en la misma WiFi
- [x] Publicación efectiva en GitHub Pages — hecha en la fase 9

---

## FASE 9: v2 - correcciones tras la prueba real

**Objetivo:** Arreglar lo que fallo cuando Anderson abrio la app por primera vez,
y montar un QA que sea capaz de detectar fallos visuales.

### Entregables
- [x] Bug critico: el temporizador tapaba toda la app (`display` pisando a `hidden`)
- [x] Regla global `[hidden] { display: none !important; }` + guardia en las pruebas
- [x] Tamanos de texto estandar: base 17 px, areas tocables 48 px, rango 90-180 %
- [x] Vista de lista completa con filtro por dias (`#/p/:persona/lista/:filtro`)
- [x] Modo consulta de un ejercicio (`#/p/:persona/x/:clave`)
- [x] `pruebas/prueba-visual.js` - Playwright, 16 pantallas capturadas y auditadas
- [x] `pruebas/prueba-pwa.js` - manifest, offline real, contraste medido, a11y, 114 ejercicios
- [x] Zona dudosa de las fotos resuelta (ampliando las tomas alternativas)
- [x] Datos personales fuera del repositorio publico
- [x] Publicacion en GitHub Pages

### Lección
Las pruebas de jsdom validan **estructura y logica**, nunca **presentacion**.
Un elemento puede tener `hidden === true` y pintarse encima de todo. Cualquier
cambio de CSS exige `npm run qa`, que abre Chromium de verdad.

---

## FASE 10: v3 - fichas del gimnasio, carrusel y rediseno

**Objetivo:** Que cada imagen sea la del ejercicio de verdad, y que la app se
vea como una app y no como un prototipo.

### Entregables
- [x] Correccion de perspectiva de los 4 tableros y extraccion de las 55 fichas
- [x] Verificacion de las 165 imagenes con 4 revisiones en paralelo
- [x] 40 fotos descartadas por no corresponder (20 ejercicios) + 2 duplicadas detectadas
- [x] Carrusel accesible con scroll-snap, sin capturar el tactil
- [x] Sistema de diseno: tokens, color por musculo, prescripcion, anillo de progreso
- [x] La app arranca siempre en el selector de persona
- [x] `prueba-completitud.js` y `generar-sw.js`
- [x] `prueba-visual.js` y `prueba-pwa.js` ampliadas

### Leccion
Una foto que no corresponde es peor que ninguna foto. El campo `exacta` se
renombro a `fotosOk` y solo se pone en true despues de mirar las imagenes.