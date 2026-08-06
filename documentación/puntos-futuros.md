# Puntos futuros

Backlog de lo que se dejó fuera a propósito, con el motivo y el camino para
hacerlo cuando valga la pena.

---

## 1. Engancharlo a Oh Churus como `entreno-service`

**Estado:** pospuesto, no descartado.

La idea original era montar esto como un microservicio más de
`Universidad/Oh Churus`, que ya es un asistente para la vida diaria
(auth, budget, fasting, gateway, discovery). Tiene todo el sentido.

**Por qué no ahora:** Oh Churus necesita un servidor encendido. Las opciones
gratuitas (Render, Railway, Fly) duermen el contenedor tras 15 minutos sin uso
y tardan 30–50 segundos en despertar. Parado frente a una máquina del gimnasio,
eso no sirve. La PWA estática abre al instante y funciona sin señal.

**Cómo se haría el día que Oh Churus tenga servidor:**

1. Crear `backend/entreno-service` siguiendo el patrón de `fasting-service`
   (Spring Boot, puerto 882x, tablas `oc_entreno_*`, registro en Eureka).
2. Entidades: `Rutina`, `DiaRutina`, `Ejercicio`, `SesionEntreno`, `SerieRegistrada`.
3. Migrar `datos-planes.js` y `datos-catalogo.js` a `init-db` como seed.
4. En esta app, cambiar `datos-*.js` por un `fetch` al gateway **con
   caída a los archivos locales** si no hay red. La PWA sigue funcionando
   igual sin conexión; el servidor solo aporta sincronización.
5. Rutas en `gateway-service`: `/oh-churus/entreno/**`.

El diseño actual ya lo facilita: `almacenamiento.js` es la única pieza que toca
la persistencia, y las vistas no saben de dónde salen los datos.

---

## 2. Sincronizar entre los dos teléfonos

Hoy cada teléfono guarda su avance por separado. Sería útil que Sharid vea si
Anderson ya entrenó, o llevar el historial en un solo lado.

Requiere backend (punto 1) o un servicio tipo Firebase / Supabase con capa
gratuita. Se dejó fuera porque introduce cuentas, login y privacidad — mucho
peso para resolver algo que hoy nadie ha pedido.

---

## 3. Historial y progreso de los 3 meses

La rutina va del 4 de agosto al 4 de noviembre de 2026. Sería valioso ver:

- Evolución del peso levantado en cada ejercicio.
- Días entrenados por semana frente a los 5 previstos.
- Aviso de «ya llevas 3 semanas con el mismo peso aquí, súbelo 10 %»,
  que es literalmente el método que anotó el entrenador.

Los datos ya se están guardando (`sesiones` y `pesos` en `localStorage`);
falta la pantalla. Es lo más rentable de esta lista.

---

## 4. Videos propios en vez de enlace a YouTube

Hoy cada ejercicio abre una búsqueda de YouTube. Funciona, pero:

- Necesita señal.
- El primer resultado puede cambiar y no siempre es el mejor.

Opciones:

- Fijar un video concreto por ejercicio (`youtu.be/xxxx`) en vez de la búsqueda.
  Barato, mejora mucho, pero hay que revisar 55 videos a mano.
- Grabar clips propios de 5 segundos **en las máquinas de Life Gym**, con las
  máquinas reales que van a usar. Es lo ideal para baja visión, y de paso
  resuelve el «¿cuál de todas es?». Unos 15 MB en total si se comprimen bien.
- Usar los GIF/videos de [wger](https://github.com/wger-project/wger)
  (CC-BY-SA 4.0, exige atribución y compartir igual).

---

## 0. Volver a fotografiar los tableros, por cuadrantes

**Es la mejora de mayor impacto que queda, y la más barata.**

Las fichas se ven todo lo bien que permite la foto original: cada tarjeta tiene
**457 px reales** de ancho en el tablero de gimnasio (629 en el funcional).
Sobre eso ya se aplica corrección de perspectiva, revelado y superresolución
neuronal (ver `imagenes-fichas.md`), y ahí se acaba lo que se puede sacar.

Con **4 fotos por cara** en vez de 1 —una por cuadrante del tablero, acercándose
a cada una— cada tarjeta pasaría a tener **unos 900-1000 px reales**. Eso es el
doble de detalle de verdad, no reconstruido.

**Lo demás ya está agotado.** Se midió (ver `imagenes-fichas.md`):

- Encadenar modelos de superresolución: seis cadenas, ninguna mejora.
- Combinar las dos fotos de cada tarjeta: +0,0045 de SSIM, al borde de lo
  medible, y con riesgo de fantasmear el texto.
- El modelo, el aumento y el enfoque ya están en su óptimo medido.

Volver a fotografiar es lo único que queda con recorrido de verdad.

Cómo hacerlo bien:
- Luz difusa, sin flash directo (el flash es lo que quemó dos tarjetas).
- Lo más de frente posible; la corrección de perspectiva se encarga del resto.
- Que cada foto solape un poco con la siguiente.
- Las 8 fotos (4 por cara × 2 caras) por persona, o solo de un tablero: los
  dibujos son idénticos en los dos (confirmado; ver `imagenes-fichas.md`).
- **Si solo se rehace un tablero, que sea con luz difusa y sin flash.** La
  ventaja de tener dos tableros hoy es justamente que el reflejo cae en sitios
  distintos y uno tapa lo que el otro quemó. Con una sola tanda de fotos esa
  red de seguridad desaparece.

Después, `herramientas/1-rectificar.py` y `2-generar-fichas.py` habría que
adaptarlos para trabajar por cuadrante, pero el resto del proceso es el mismo.

---

## 5. Fotos exactas para los 20 ejercicios aproximados

20 de los 55 usan una foto de un movimiento parecido, no idéntico. Son casi
todos de TRX, BOSU y banda elástica, que la base de dominio público no cubre:

`sentadilla-mancuerna`, `leg-curl`, `elevacion-talones-hack`,
`extension-mancuerna`, `vuelo-trx`, `predicador-maquina`, `biceps-trx`,
`levantamiento-pierna-piso`, `plancha-bosu`, `levantamiento-atras-polea`,
`sentadilla-patada-lateral`, `trx-sentadilla-profunda`, `trx-abductor`,
`sentadilla-iso`, `elevacion-rodilla`, `aductor-banda`, `sentadilla-dinamica`,
`peso-muerto-saco`, `trx-espalda`, `apertura-trx`.

(La lista sale de `fotosOk: false` en `datos-catalogo.js`; si cambia, esta
lista hay que rehacerla.)

La app los marca en pantalla, así que no engaña. Pero una foto propia tomada en
el gimnasio sería mejor. Basta con reemplazar
`assets/img/ejercicios/<clave>-0.jpg` y `-1.jpg` y poner `exacta: true`.

---

## 6. Verificar contra el papel las zonas con reflejo

En `extraccion-planillas.md`, sección 7, quedan tres puntos donde el flash tapó
parte de la hoja de Anderson (esquina superior izquierda: *Sentadilla Smith*,
*Sentadilla mancuerna*, *Elevación de talones prensa*, *Pantorrilla sentado*).
Se leyeron como no marcados en las tres tomas, pero conviene confirmarlo con la
hoja en la mano.

---

## 7. Editar la rutina desde la propia app

Hoy cambiar un ejercicio implica editar `datos-planes.js`. Cuando el entrenador
cambie la rutina (está prevista para 3 meses), habría que tocar código.

Una pantalla de edición con exportación a JSON evitaría eso. Es útil sobre todo
de cara al segundo trimestre.

---

## 8. Notificaciones de recordatorio

*«Hoy es lunes, te toca funcional.»* iOS soporta push en PWA desde 16.4, pero
requiere que la app esté instalada y no hay background sync. Para un recordatorio
diario a hora fija, una alarma del teléfono resuelve igual y sin complicaciones.

---

## 9. Probar con lector de pantalla real

Las pruebas verifican estructura y atributos ARIA, pero no se ha ejecutado
VoiceOver (iOS) ni TalkBack (Android) sobre la app. Es la única forma de saber
si el recorrido se oye bien de verdad.
