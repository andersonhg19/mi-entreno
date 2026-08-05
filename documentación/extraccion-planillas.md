# Extracción de las planillas físicas

**Fecha de la lectura:** 2026-08-04
**Fuente:** 13 fotos en `C:\Users\ander\Downloads\imagenes para la aplicación de ejercicio`
**Resultado:** `assets/js/datos-planes.js` y `assets/js/datos-catalogo.js`

Este documento es la **evidencia** de lo que se leyó en las hojas del gimnasio.
Sirve para poder contrastar la app contra el papel sin volver a descifrar las fotos.

---

## 1. Qué había en las fotos

De las 13 imágenes, 12 son de las planillas y 1 (`image.png`) es una captura de
Postman de otro proyecto — se descartó.

Las 12 útiles son **4 tableros distintos, fotografiados 3 veces cada uno**:

| Tablero | Persona | Cara | Mejor foto |
|---------|---------|------|------------|
| Azul | Anderson | Frente (gimnasio) | `IMG_1288.jpeg` |
| Azul | Anderson | Reverso (funcionales) | `IMG_1287.jpeg` |
| Fucsia | Sharid | Frente (gimnasio) | `IMG_1289.jpeg` |
| Fucsia | Sharid | Reverso (funcionales) | `IMG_1291.jpeg` |

Las `IMG_*.jpeg` son de 5712 × 4284 px (23 MP). Las de WhatsApp están
recomprimidas a 1600 × 1200 y sirvieron solo para el encuadre general.

### Método de lectura

Las fotos están tomadas en ángulo, así que a ojo desnudo (y a resolución baja) es
imposible saber en cuál de las tres casillas de cada ejercicio está la marca.
El procedimiento fue:

1. **Nivelar** cada foto rotándola (0,8° a 3,15° según la foto) para que la
   cuadrícula quedara horizontal.
2. **Recortar fila por fila** a resolución nativa, en dos mitades, para poder
   leer a la vez el título del ejercicio y el color exacto de cada casilla.
3. Hacer **zoom adicional** en las tarjetas dudosas (donde el marcador se
   corrió y manchaba la casilla de al lado).

Los tableros nivelados quedaron en `recursos/planillas/` — no se publican
porque llevan datos personales.

---

## 2. Datos de cabecera

> Los datos identificativos (nombre completo, edad) y las medidas corporales
> (peso, IMC, % de grasa) **no están en este documento** porque el repositorio
> es público. Están en `recursos/datos-personales.md`, que no se sube a git.

| Dato | Anderson | Sharid |
|------|----------|--------|
| Color del tablero | Azul | Fucsia |
| Fecha inicio | 04 / 08 / 2026 | 04 / 08 / 2026 |
| Fecha final | 04 / 11 / 2026 | 04 / 11 / 2026 |
| Rutina | 5 días por 2 de descanso | 5 días por 2 de descanso |
| Series | 3 a 4 | 3 a 4 |
| Repeticiones | 10 a 15 | 10 a 15 |
| Intervalo | 1 minuto | 1 minuto |
| Incremento de peso | 10 – 20 % | 10 – 20 % |
| Cardio | 15 – 20 minutos | 15 – 20 minutos |
| Método | Cargas progresivas, movilidad articular | Cargas progresivas, movilidad articular |

**Observaciones escritas a mano** (las que afectan a cómo entrenar)

- **Anderson:** bajar de peso o tonificar · rutina fija 3 meses ·
  **deficiencia visual** · **mal equilibrio**
- **Sharid:** bajar de peso y tonificar · rutina fija 3 meses

Las medidas corporales y los datos de documento y teléfono que aparecen en las
hojas **no se pasaron a la app**: no hacen falta para entrenar.

---

## 3. El detalle que casi se pasa por alto: **cada uno tiene su propio código de colores**

Los dos tableros usan los mismos cinco colores, pero **asignados a días distintos**.
Confundirlos significaría entrenar la rutina equivocada.

| Día | Anderson (azul) | Sharid (fucsia) |
|-----|-----------------|-----------------|
| Lunes — Día 1 | **Naranja** | **Naranja** |
| Martes — Día 2 | **Rojo** | **Verde** |
| Miércoles — Día 3 | **Celeste** | **Rosado** |
| Jueves — Día 4 | **Rosado** | **Celeste** |
| Viernes — Día 5 | **Verde** | **Rojo** |
| Sábado / Domingo | Descanso | Descanso |

Cada tarjeta de ejercicio tiene **tres casillas**. Un ejercicio marcado en dos
casillas con dos colores se entrena **dos días distintos** de la semana.

---

## 4. Lo que quedó marcado — Anderson

### Hoja de gimnasio (frente)

| Ejercicio | Grupo | Casilla 1 | Casilla 2 | Día(s) |
|-----------|-------|-----------|-----------|--------|
| Peck deck | Pecho | Rojo | — | Martes |
| Press banca | Pecho | Rojo | — | Martes |
| Press inclinado | Pecho | Rojo | — | Martes |
| Fondo de pecho | Pecho | Rojo | Rosado | Martes y jueves |
| Tríceps copa | Tríceps | Rojo | Rosado | Martes y jueves |
| Push down | Tríceps | Rojo | Rosado | Martes y jueves |
| Extensión con mancuerna | Tríceps | Rojo | Rosado | Martes y jueves |
| Press francés | Tríceps | Rojo | Rosado | Martes y jueves |
| Jalones delante abierto | Espalda | Celeste | — | Miércoles |
| Jalones delante agarre cerrado | Espalda | Celeste | — | Miércoles |
| Remo sentado con polea | Espalda | Celeste | — | Miércoles |
| Dominadas | Espalda | Celeste | — | Miércoles |
| Hiperextensiones | Lumbar | Celeste | — | Miércoles |
| Curl barra | Bíceps | Celeste | — | Miércoles |
| Curl polea | Bíceps | Celeste | — | Miércoles |
| Curl mancuerna alternado | Bíceps | Celeste | — | Miércoles |
| Predicador máquina | Bíceps | Celeste | — | Miércoles |
| Press militar máquina | Hombros | Rosado | — | Jueves |
| Press militar mancuerna | Hombros | Rosado | — | Jueves |
| Laterales | Hombros | Rosado | — | Jueves |
| Frontales | Hombros | Rosado | — | Jueves |
| Elevación de tronco 90° máquina | Abdominales | Verde | — | Viernes |
| Levantamiento de pierna piso | Abdominales | Verde | — | Viernes |

> **Nota:** en la hoja de gimnasio de Anderson **no hay ni una sola marca naranja**
> (lunes) y solo dos verdes (viernes). Todo el lunes y casi todo el viernes están
> en la hoja de funcionales. Es coherente con la observación de «mal equilibrio»:
> el entrenador le cargó el trabajo hacia TRX, banda y BOSU, que dan más apoyo.

### Hoja de funcionales (reverso)

| Ejercicio | Grupo | Colores | Día(s) |
|-----------|-------|---------|--------|
| TRX sentadilla profunda | Pierna | Naranja + Verde | Lunes y viernes |
| TRX abductor | Pierna | Naranja + Verde | Lunes y viernes |
| Sentadilla ISO | Pierna | Naranja + Verde | Lunes y viernes |
| Elevación rodilla | Pierna | Naranja + Verde | Lunes y viernes |
| Aductor banda | Pierna | Naranja + Verde | Lunes y viernes |
| Sentadilla dinámica | Pierna | Naranja + Verde | Lunes y viernes |
| TRX espalda | Espalda | Naranja + Verde | Lunes y viernes |
| Apertura TRX | Pecho | Naranja + Verde | Lunes y viernes |
| Banco tríceps | Tríceps | Naranja | Solo lunes |
| Vuelo TRX | Hombro | Naranja | Solo lunes |
| Lazo hombro | Hombro | Naranja | Solo lunes |
| Plancha con BOSU | Abdomen | Naranja + Verde | Lunes y viernes |
| Abdominales twist ruso | Abdomen | Naranja + Verde | Lunes y viernes |
| Abdominales suelo | Abdomen | Naranja + Verde | Lunes y viernes |
| Bíceps TRX | Bíceps | Naranja + Verde | Lunes y viernes |
| Glúteo pesa rusa | Glúteo | Naranja + Verde | Lunes y viernes |
| Sentadilla patada lateral | Glúteo | Naranja + Verde | Lunes y viernes |

**Anotación a mano:** junto a *Sentadilla dinámica* dice **«Sin salto»**.

---

## 5. Lo que quedó marcado — Sharid

### Hoja de gimnasio (frente)

| Ejercicio | Grupo | Casilla 1 | Casilla 2 | Día(s) |
|-----------|-------|-----------|-----------|--------|
| Sentadilla mancuerna | Pierna | Naranja | — | Lunes |
| Prensa atlética | Pierna | Naranja | — | Lunes |
| Leg extension | Pierna | Naranja | — | Lunes |
| Abductor | Pierna | Naranja | Rosado | Lunes y miércoles |
| Elevación de talones con hack | Pantorrilla | Naranja | — | Lunes |
| Press militar máquina | Hombros | Naranja | — | Lunes |
| Laterales | Hombros | Naranja | — | Lunes |
| Frontales | Hombros | Naranja | — | Lunes |
| Jalones delante abierto | Espalda | Verde | — | Martes |
| Jalones delante agarre cerrado | Espalda | Verde | — | Martes |
| Remo sentado con polea | Espalda | Verde | — | Martes |
| Remo al pecho | Espalda | Verde | — | Martes |
| Hiperextensiones | Lumbar | Verde | — | Martes |
| Curl barra | Bíceps | Verde | — | Martes |
| Curl polea | Bíceps | Verde | — | Martes |
| Curl mancuerna alternado | Bíceps | Verde | — | Martes |
| Predicador máquina | Bíceps | Verde | — | Martes |
| Leg curl | Pierna | Rosado | — | Miércoles |
| Tijeras con barra | Pierna | Rosado | — | Miércoles |
| Pantorrilla sentado | Pantorrilla | Rosado | — | Miércoles |
| Levantamiento atrás polea | Glúteos | Rosado | — | Miércoles |
| Glúteo con polea | Glúteos | Rosado | — | Miércoles |
| Peck deck | Pecho | Celeste | — | Jueves |
| Press mancuerna | Pecho | Celeste | — | Jueves |
| Press inclinado c. mancuerna | Pecho | Celeste | — | Jueves |
| Fondo de pecho | Pecho | Celeste | — | Jueves |
| Tríceps copa | Tríceps | Celeste | — | Jueves |
| Push down | Tríceps | Celeste | — | Jueves |
| Extensión con mancuerna | Tríceps | Celeste | — | Jueves |
| Press francés | Tríceps | Celeste | — | Jueves |
| Elevación de tronco 90° máquina | Abdominales | Rojo | — | Viernes |
| Levantamiento de pierna piso | Abdominales | Rojo | — | Viernes |

### Hoja de funcionales (reverso)

| Ejercicio | Grupo | Colores | Día(s) |
|-----------|-------|---------|--------|
| TRX sentadilla profunda | Pierna | Naranja | Lunes |
| Sentadilla ISO | Pierna | Naranja | Lunes |
| Elevación rodilla | Pierna | Naranja + Rojo | Lunes y viernes |
| Vuelo TRX | Hombro | Naranja + Rojo | Lunes y viernes |
| Lazo hombro | Hombro | Naranja + Rojo | Lunes y viernes |
| TRX espalda | Espalda | Verde + Rojo | Martes y viernes |
| Bíceps TRX | Bíceps | Verde + Rojo | Martes y viernes |
| TRX abductor | Pierna | Rosado | Miércoles |
| Aductor banda | Pierna | Rosado | Miércoles |
| Peso muerto con saco | Pierna | Rosado | Miércoles |
| Salto cajón | Pierna | Rosado | Miércoles |
| Glúteo pesa rusa | Glúteo | Rosado | Miércoles |
| Sentadilla patada lateral | Glúteo | Rosado | Miércoles |
| Apertura TRX | Pecho | Celeste | Jueves |
| Banco tríceps | Tríceps | Celeste | Jueves |
| Plancha con BOSU | Abdomen | Rojo | Viernes |
| Abdominales suelo | Abdomen | Rojo | Viernes |

**Anotación a mano:** junto a *Salto cajón* dice **«Sin salto»**.

---

## 6. Resumen de la semana que quedó en la app

| | Lunes | Martes | Miércoles | Jueves | Viernes |
|---|---|---|---|---|---|
| **Anderson** | Funcional cuerpo completo (17) | Pecho y tríceps (8) | Espalda y bíceps (9) | Hombros y tríceps (9) | Funcional y abdomen (16) |
| **Sharid** | Pierna y hombro (13) | Espalda y bíceps (11) | Pierna y glúteo (12) | Pecho y tríceps (10) | Abdomen y funcional (9) |

Total: **55 ejercicios distintos** entre los dos.

---

## 7. Zonas donde la foto no era concluyente

Se resolvieron con zoom adicional, pero conviene contrastarlas contra el papel
la próxima vez que vayan al gimnasio:

1. **Reflejo del flash en la hoja de Anderson**, esquina superior izquierda:
   tapa parcialmente *Sentadilla Smith*, *Sentadilla mancuerna*, *Elevación de
   talones prensa* y *Pantorrilla sentado*. Se leyeron como **sin marcar** en las
   tres tomas disponibles, pero es la zona con menos certeza de todo el trabajo.
2. **Marcador corrido**: en varias tarjetas de Anderson (Frontales, Press militar
   mancuerna, Laterales, Press militar máquina) el rosado se salió de la casilla
   y mancha la de abajo. Con zoom se confirmó **una sola marca**, no dos.
3. **«Sin salto»** en Anderson quedó escrito entre *Sentadilla dinámica* y
   *Sentadilla fitball*. Se atribuyó a *Sentadilla dinámica* porque es el que sí
   está marcado y el que normalmente lleva salto.
