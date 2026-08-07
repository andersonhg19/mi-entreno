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

**Desde la v13 el peso guarda historial** (`{fecha, valor}` por sesión), así
que el dato ya no se pierde y la pantalla se puede construir cuando se quiera.
Antes se sobrescribía: solo quedaba el último valor.

Lo que ya hace la app sin pantalla de progreso: en cada ejercicio enseña las
últimas tres veces con su fecha, y si llevas tres sesiones con el mismo peso
recuerda la regla del entrenador.

Lo que falta para una pantalla de progreso de verdad: una vista por ejercicio
con la evolución, y días entrenados por semana frente a los 5 previstos —eso
último ya se guarda desde la v10—.

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

**Ojo con dar esto por agotado** — ya se hizo una vez y estaba mal. En la v8
este apartado decía que solo quedaba refotografiar, y en la v9 resultó que el
problema no era la cantidad de píxeles sino que venían **sucios**: cambiar a
un modelo generativo (Real-ESRGAN) bajó el grano del papel de 1,98 a 0,30 sin
tocar la foto original.

Lo que sí está medido y descartado (ver `imagenes-fichas.md`):

- Encadenar modelos de superresolución: seis cadenas, ninguna mejora.
- Combinar las dos fotos de cada tarjeta: +0,0045 de SSIM, al borde de lo
  medible, y con riesgo de fantasmear el texto.
- Buscar el dibujo original en internet: la baraja exacta no está publicada.

Volver a fotografiar sigue siendo lo único que aporta **información nueva**.

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

Después, `herramientas/1-rectificar.py` y `3-generar-fichas.py` habría que
adaptarlos para trabajar por cuadrante, pero el resto del proceso es el mismo.

---

## 5. Fotos propias para los que no tienen ninguna

Desde la v11 el campo `fotos` del catálogo tiene tres estados, y hay
**nueve ejercicios en `"solo-ficha"`**: los de TRX, BOSU y banda elástica.
No llevan foto porque **no existe ninguna con licencia libre que sea de
verdad ese movimiento** — se comprobó en free-exercise-db (873 ejercicios) y
en wger (360 imágenes). Poner una que no lo es confunde más que ayuda.

`apertura-trx`, `trx-abductor`, `trx-sentadilla-profunda`, `vuelo-trx`,
`biceps-trx`, `plancha-bosu`, `sentadilla-iso`, `aductor-banda`,
`sentadilla-patada-lateral`.

Otros **cinco** están en `"parecidas"`: mismo movimiento con otro implemento,
y la app lo rotula sin rodeos.

**La solución es una foto propia hecha en Life Gym**, con el TRX y el BOSU de
ahí. Son unas veinte fotos. Basta con dejarlas en
`assets/img/ejercicios/<clave>-0.jpg` y `-1.jpg` y poner `fotos: "exactas"`.

Y de paso, lo que más falta hace para baja visión: **una foto de cada máquina
real del gimnasio**. Hoy el campo `donde` la describe con palabras; una foto
de esa máquina concreta resuelve el «¿cuál de todas es?» mucho mejor.

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

---

## 10. Vectorizar las fichas

La tarjeta es dibujo impreso de color plano y contorno cerrado: material ideal
para un trazador vectorial. Y para quien amplía con la lupa tiene una ventaja
que ninguna imagen de píxeles da: **un vector no se pixela por mucho que se
amplíe**.

Se intentó en la v9 con `vtracer`, y el binding de Python **se cae con Python
3.14** en cuanto se le pasan parámetros de configuración (funciona solo con
los valores por defecto, que dejan las letras deformadas). No es que la idea
no sirva: es que la herramienta no va en esta versión de Python.

Caminos: esperar a que `vtracer` lo arregle, usar su binario de línea de
órdenes en vez del binding, o probar `potrace` por capas de color. Habría que
comprobar con cuidado que el texto no se deforma y cuánto pesa el SVG frente
a los 164 KB del JPEG actual.
