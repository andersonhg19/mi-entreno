# Mi Entreno — Enunciado detallado

## El problema

El 4 de agosto de 2026 Anderson y Sharid se inscribieron en **Life Gym**. El
gimnasio les entregó **una hoja A3 por persona, impresa por lado y lado**, con
unas 150 tarjetas de ejercicio en total. El entrenador marcó con marcador de
color qué ejercicios tocan cada día.

El formato no funciona para Anderson, que tiene **baja visión**:

- La letra de cada tarjeta mide 2–3 mm.
- Los dibujos son pictogramas diminutos de línea fina.
- La rutina está codificada **por color**, y cada persona tiene un código distinto.
- No hay instrucciones: solo el nombre del ejercicio y el dibujo.
- Hay que cargar la hoja al gimnasio y no perderla en tres meses.

## Lo que se necesita

> «Quiero poder ver mi entrenamiento, quiero poder tener una imagen o un video
> donde pueda ver cómo es la máquina y el ejercicio para poder seguirlo.»

Requisitos, en orden de importancia:

1. **Abrirlo desde el celular** de los dos: Anderson usa iPhone, Sharid Android.
2. **Sin pagar licencias** de App Store ni de Google Play.
3. **Legible con baja visión**: letra grande, contraste alto, una cosa a la vez.
4. **Imagen o video** de cada ejercicio y de la máquina.
5. Que funcione **en el gimnasio**, donde puede no haber señal.
6. Web sencilla — HTML, CSS y JS — al estilo de los otros proyectos personales.

## Alcance

### Sí entra

- Las dos rutinas completas, extraídas de las fotos de las planillas.
- Catálogo de los 55 ejercicios con foto de inicio y de fin, pasos escritos,
  descripción de la máquina, advertencias y enlace a video.
- Ajustes de tamaño de letra (85–200 %) y tres niveles de contraste.
- Lectura en voz alta de cada ejercicio.
- Contador de series con temporizador de descanso de 1 minuto, con voz y vibración.
- Registro del peso usado en cada ejercicio, que se recuerda de una semana a otra.
- Marcar ejercicios como hechos; el avance se reinicia cada día.
- Funcionamiento sin conexión.
- Instalable como app en iPhone y en Android.

### No entra (por ahora)

- Cuentas de usuario, login, sincronización entre los dos teléfonos.
- Historial y gráficas de progreso a lo largo de los 3 meses.
- Videos alojados propios (se enlaza a la búsqueda de YouTube).
- Integración con Oh Churus (ver `puntos-futuros.md`).
- Editar la rutina desde la app: los planes se cambian tocando `datos-planes.js`.

## Stack

| Capa | Elección | Motivo |
|------|----------|--------|
| Front | HTML + CSS + JS puro, sin build | Se abre con doble clic, se edita con cualquier editor, no envejece |
| Datos | Archivos `.js` con objetos planos | Sin fetch, sin CORS, funcionan hasta desde `file://` |
| Persistencia | `localStorage` | Todo se queda en el teléfono; no hay servidor ni privacidad que cuidar |
| Offline | Service Worker con precarga completa | El gimnasio puede no tener señal |
| Voz | Web Speech API | Nativa en iOS y Android, sin librerías |
| Empaquetado | PWA con Web App Manifest | Instalable sin tiendas ni licencias |
| Hosting | GitHub Pages | Gratis, HTTPS, estático |
| Fotos | [free-exercise-db](https://github.com/yuhonas/free-exercise-db) | 873 ejercicios, dominio público, 2 fotos por ejercicio |

Cero dependencias en tiempo de ejecución. `jsdom` solo se usa para las pruebas.

## Estructura de carpetas

```
entreno/
├── index.html                  Punto de entrada de la PWA
├── manifest.webmanifest        Metadatos de instalación
├── sw.js                       Service worker (precarga 124 archivos)
├── servidor.js                 Servidor local para probar en el celular
├── package.json                Scripts de prueba
├── assets/
│   ├── css/estilos.css         Temas, escalas, componentes
│   ├── js/
│   │   ├── datos-catalogo.js   Los 55 ejercicios
│   │   ├── datos-planes.js     Las 2 rutinas × 7 días
│   │   ├── almacenamiento.js   localStorage
│   │   ├── voz.js              Lectura en voz alta
│   │   ├── cronometro.js       Temporizador de descanso
│   │   └── app.js              Rutas y vistas
│   ├── img/ejercicios/         110 fotos (55 × inicio/fin)
│   └── iconos/                 Iconos de la app
├── pruebas/
│   ├── validar-datos.js        Integridad de datos e imágenes
│   └── prueba-humo.js          Renderiza todas las pantallas en jsdom
├── documentación/
├── seguimiento/
└── recursos/planillas/         Fotos originales niveladas (no se publican)
```

## Modelo de datos

### Ejercicio (`CATALOGO`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | texto | Como se dice en el gimnasio |
| `grupo` | texto | Músculo principal |
| `equipo` | texto | Máquina o implemento |
| `fotosOk` | booleano | `false` → las fotos reales son de un movimiento parecido; el rótulo lo avisa |
| `donde` | texto | Cómo reconocer la máquina en el gimnasio |
| `pasos` | lista | Una acción por paso, en imperativo |
| `ojo` | texto | Advertencia de seguridad o adaptación personal |
| `buscar` | texto | Término para la búsqueda de video |

Las fotos se resuelven por convención: `assets/img/ejercicios/<clave>-0.jpg`
(inicio) y `-1.jpg` (final).

### Plan (`PLANES`)

```
persona
├── nombre, nombreCompleto, edad, tema
├── medidas { peso, imc, grasa }
├── objetivos[], condiciones[], metodo, notaImportante
└── dias[7]
    ├── n (1–7), dia, color, titulo, resumen
    └── ejercicios[]   → claves del CATALOGO
```

### Sesión guardada

Clave `persona|díaRutina|fechaReal`. Guarda qué ejercicios se marcaron como
hechos y cuántas series lleva cada uno. Se conservan los últimos 60 registros.
El peso usado se guarda aparte, por persona y ejercicio, sin fecha: así se
recuerda de una semana a la siguiente.

## Criterios de aceptación

- [x] Las dos rutinas coinciden ejercicio por ejercicio con las planillas físicas
- [x] Cada uno de los 55 ejercicios tiene 2 fotos, pasos y descripción de la máquina
- [x] Los 14 ejercicios con foto aproximada lo advierten en pantalla
- [x] La letra escala de 85 % a 200 % y la preferencia se guarda
- [x] Tres temas de contraste, todos por encima de 7:1
- [x] Ningún elemento tocable mide menos de 64 px
- [x] Lectura en voz alta de cualquier ejercicio
- [x] Temporizador de 60 s con cuenta hablada y vibración
- [x] Funciona sin conexión tras la primera carga
- [x] Instalable en iPhone (Safari) y Android (Chrome)
- [x] `npm test` en verde: datos íntegros y todas las pantallas renderizan
