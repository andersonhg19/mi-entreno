# Mi Entreno — Plan Maestro de Desarrollo

## Estado General: Completado (v11, publicada)
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
---

## FASE 11: v5-v7 - fichas afinadas, Tabata y bug del carrusel

**Objetivo:** Cerrar los puntos que fue encontrando el usuario al usarla de
verdad, y anadir el temporizador por intervalos.

### Entregables
- [x] Recorte de la tarjeta ENTERA y lienzo 4:3 identico para las 55 fichas
- [x] Las 40 fotos restauradas, etiquetadas como «parecida» cuando lo son
- [x] Bloque «Tus datos: donde se guardan» con copia y borrado
- [x] La app abre siempre en el selector, tambien al recargar
- [x] Bug del carrusel: `disabled` sobre el boton enfocado cancelaba el scroll
- [x] Puntos numerados fuera; las flechas hacen todo el trabajo
- [x] Superresolucion neuronal EDSR x3 sobre las 55 fichas
- [x] Enlace al video pegado al carrusel, con comprobacion de orden en el DOM
- [x] Tabata: temporizador por intervalos con voz, pitido, vibracion y Wake Lock
- [x] `herramientas/` con los scripts de produccion de imagenes
- [x] `documentación/imagenes-fichas.md` con el proceso y el techo real

### Lecciones
1. **Nunca `disabled` en un boton que pueda tener el foco durante un scroll.**
   Mueve el foco y cancela el desplazamiento. Se usa `aria-disabled`.
2. **Medir antes de optimizar.** El techo de las fichas es la foto (457 px por
   tarjeta): servir mas grande no aportaba nada; revelar y ampliar con red, si.
3. **Las listas escritas a mano en las pruebas se desincronizan.** La de
   scripts ahora se lee del propio `index.html`.

---

## FASE 12: v8 - medir en vez de opinar

**Objetivo:** responder con numeros a dos preguntas de Anderson —si encadenar
modelos de superresolucion mejora, y si las dos fotos de cada tarjeta se pueden
aprovechar— en vez de decidir a ojo. Y cerrar los bugs con pruebas propias.

### Entregables
- [x] `herramientas/banco/` — cuatro bancos de prueba con verdad de referencia
- [x] Encadenar modelos: seis cadenas medidas, **ninguna gana a su primer paso**
- [x] EDSR **x2** en vez de x3 (SSIM 0,9650 frente a 0,9632)
- [x] Enfoque final **1,4 · 55 %** en vez de 1,1 (nitidez 0,95 -> 0,99 del real)
- [x] `2-alinear-sharid.py` — los dos tableros en el mismo lienzo por SIFT
- [x] Tres fichas del tablero de Sharid, elegidas por contraste y verificadas a ojo
- [x] Combinar las dos fotos: medido (+0,0045 SSIM) y **descartado** con motivo
- [x] Boton principal a 58 px; el descanso dice lo que viene despues
- [x] `pruebas/prueba-regresiones.js` — 13 casos, uno por bug ya visto
- [x] Auditoria de contraste por barrido: todo texto, 7 pantallas x 3 temas

### Lecciones
1. **Una medida mal planteada es peor que ninguna.** Comparar «foto A sola»
   contra «A + B» usando A como verdad da siempre ganador a A, por definicion.
   Antes de creerse un numero, hay que preguntarse quien juega en casa.
2. **Las metricas de nitidez mienten donde hay reflejos.** El borde del propio
   reflejo cuenta como detalle: una tarjeta ilegible puntuaba mas alto que la
   buena. La primera lista señalaba 21 tarjetas dañadas; mirandolas una a una
   eran 3. **Mirar sigue haciendo falta.**
3. **Encadenar modelos no añade informacion, amplifica la invencion.** Sonaba
   bien y habia que probarlo; ahora esta medido y documentado para no volver
   a intentarlo.
4. **La regla «toda imagen necesita alt con texto» es falsa.** Una miniatura
   dentro de un boton que ya dice el nombre debe llevar `alt=""`, o el lector
   de pantalla lo repite. Una prueba con la regla facil marca fallos que no lo son.

---

## FASE 13: v9 - quitar el grano con un modelo generativo

**Objetivo:** Anderson corrigio la conclusion de la v8 —«no es solo tamaño, es
la calidad de la imagen»— y tenia razon. Restaurar de verdad las fichas, en
local, midiendo que la mejora existe.

### Entregables
- [x] Diagnostico del defecto: grano sigma 6,6 y 3.381 colores donde hay 8
- [x] **Real-ESRGAN `anime_6B`** en la GPU (`herramientas/restaurador.py`)
- [x] Grano de 1,98 a **0,30**; borde de 0,425 a **0,266**; 39 min -> 28 s
- [x] Lienzo a 1400x1050 (antes 1000x750): se nota al ampliar con el pellizco
- [x] Fuera el enfoque final: sobre esta salida solo devuelve grano
- [x] **Guardia de fidelidad** calibrada con control (0,992 frente a 0,270)
- [x] Las 55 revisadas a ojo desde los dos tableros; de 3 a **6** las de Sharid
- [x] Vectorizar y buscar el original en internet: probados y descartados
- [x] Pruebas al dia (tamaño de lienzo y lista de fichas de Sharid)

### Lecciones
1. **No enunciar una conclusion mas ancha que la medida que la sostiene.**
   «457 px es el techo» valia para los modelos FIELES, que era lo unico
   probado, y se escribio como si valiera para todo. El usuario vio el hueco
   antes que nosotros.
2. **Fiel y generativo no son lo mismo.** Un modelo fiel no puede quitar el
   grano: el grano tambien «es lo que hay» y lo estira igual que al dibujo.
3. **Si el modelo puede inventar, hace falta una guardia, y calibrada.** Un
   parecido de 0,99 no dice nada hasta saber que «contenido distinto» puntua
   0,27. El control es lo que le da sentido al numero.
4. **Mejorar una etapa puede romper una decision de otra.** Al dejar de
   emborronar, el destrozo del flash quedo a la vista y hubo que rehacer de
   que tablero sale cada tarjeta.

---

## FASE 14: v10 - lo que salio de entrenar de verdad

**Objetivo:** las cinco cosas que Anderson trajo despues de usar la app en el
gimnasio. Ninguna se ve programando.

### Entregables
- [x] Las 55 fotos revisadas una a una (`herramientas/revisar-fotos.py`)
- [x] Cuatro fotos cambiadas por no corresponder; dos `fotosOk` corregidos
- [x] El aviso del entrenador va ANTES del carrusel (caso «SIN SALTO»)
- [x] Descanso entre series configurable (15 s a 5 min, de 15 en 15)
- [x] Cerrar un dia aunque falten ejercicios, con reinicio semanal automatico
- [x] La lista del dia partida en «te faltan» y «ya hiciste»
- [x] `datos-alternativas.js` — alternativas para cuando la maquina esta ocupada
- [x] `generar-sw.js` lee los scripts del propio index.html
- [x] 19 casos de regresion (eran 14)

### Lecciones
1. **Hay fallos que solo aparecen usando la cosa.** Ninguna de las cinco sale
   de leer el codigo: salen de estar en el gimnasio con la maquina ocupada y
   17 ejercicios en la lista.
2. **Una foto puede corresponder a la tarjeta y aun asi enseñar lo que no
   debes hacer.** Con `SIN SALTO` la respuesta no era cambiar la foto: era
   poner el aviso donde se lee a tiempo.
3. **Las listas escritas a mano se desincronizan, y esta ya iba por la
   segunda vez.** La de scripts de `generar-sw.js` ahora se lee del HTML.
4. **Una funcionalidad nueva no debe traer datos sin verificar.** Las
   alternativas se limitaron al catalogo existente: cero imagenes nuevas que
   revisar, y cada alternativa ya venia con su ficha comprobada.

---

## FASE 15: v11 - fotos que corresponden de verdad, y alternativas compatibles

**Objetivo:** Anderson revisó la v10 y las fotos «seguían estando pésimo», y
las alternativas necesitaban un criterio real, no «tren superior».

### Entregables
- [x] Se comprobó que NO existe fuente libre con TRX, BOSU ni banda
      (free-exercise-db 873 ejercicios, wger 360 imagenes)
- [x] `fotosOk` (booleano) -> `fotos` con tres estados: 41 exactas,
      5 parecidas, **9 solo-ficha**
- [x] Tres emparejamientos corregidos a su ejercicio EXACTO (leg-curl,
      extension-mancuerna, levantamiento-atras-polea)
- [x] El carrusel admite 1 o 3 laminas; sin flechas cuando solo hay una
- [x] `window.PATRONES` — patron de movimiento de los 55
- [x] Alternativas en DOS niveles: `directas` (mismo patron) y `mismoMusculo`
- [x] La barra toma el color del perfil (idea de Samy), con el nombre al lado
- [x] 22 casos de regresion (eran 19)

### Lecciones
1. **Cambiar un dato malo por otro dato malo no es arreglarlo.** En la v10 se
   sustituyeron cuatro fotos por otras que tampoco eran el ejercicio. El
   usuario lo vio a la primera.
2. **Si el modelo de datos no sabe expresar «no hay», el problema se repite.**
   `fotosOk` era booleano: obligaba a elegir entre una foto mala y otra foto
   mala. Con `solo-ficha` el problema desaparece.
3. **Una etiqueta de advertencia no arregla un dato malo, solo lo documenta.**
   Rotular «parecida» algo que no es el ejercicio es información falsa con
   nota al pie.
4. **Antes de elegir la menos mala, comprobar si existe la buena.** Bastaron
   dos consultas para saber que no hay TRX en ninguna base libre; se llevaban
   dos rondas eligiendo la menos mala.
5. **Clasificar por lo que importa, no por lo que es fácil.** «Tren superior»
   es fácil de calcular y no significa nada. El patron de movimiento cuesta
   escribirlo a mano para 55 ejercicios y es lo que hace que la alternativa
   sirva.
