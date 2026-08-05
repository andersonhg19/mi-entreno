# Cómo ponerla en el celular, gratis y sin licencias

## Resumen de la decisión

| Necesidad | Solución elegida |
|-----------|------------------|
| Verla en iPhone **y** en Android | **PWA** (una web que se instala como app) |
| Sin pagar licencias de App Store ni Play | La PWA no pasa por ninguna tienda |
| Que funcione en el gimnasio sin señal | **Service Worker** que descarga todo al instalar |
| Hosting gratis con HTTPS | **GitHub Pages** |
| Sin backend, sin base de datos | Los datos van en archivos `.js`; el avance, en el propio teléfono |

**Por qué no un microservicio de Oh Churus (todavía):** un microservicio necesita
un servidor encendido las 24 horas. Hoy no lo hay, y montar uno gratis
(Render, Railway, Fly) implica que se "duerme" y tarda 30–50 segundos en
despertar — inservible parado frente a una máquina del gimnasio. La PWA estática
no tiene ese problema: abre al instante y funciona sin señal.
En `puntos-futuros.md` está el camino para engancharla a Oh Churus cuando ese
proyecto tenga servidor.

---

## 1. Publicarla en GitHub Pages

GitHub Pages sirve archivos estáticos gratis, con HTTPS (obligatorio para que
funcione el service worker) y sin límite práctico para este tamaño (~7 MB).

### Paso a paso

```bash
cd "C:\Users\ander\Documents\Anderson\Personales\entreno"

git init
git add .
git commit -m "Mi Entreno: rutina Life Gym accesible"

# Crear el repo en GitHub (con gh CLI). Puede ser PÚBLICO:
# el .gitignore deja fuera las fotos con datos personales.
gh repo create mi-entreno --public --source=. --push
```

Luego, en GitHub:

1. Entra al repo → **Settings** → **Pages**
2. En *Source* elige **Deploy from a branch**
3. Branch: **main**, carpeta: **/ (root)** → **Save**
4. Espera 1–2 minutos. La dirección queda:

```
https://<tu-usuario>.github.io/mi-entreno/
```

### Si prefieres que nadie más lo vea

GitHub Pages en repos privados requiere plan de pago. Alternativas gratuitas
con repo privado:

- **Cloudflare Pages** — conecta el repo privado, despliegue gratis, HTTPS.
- **Netlify** — igual, plan gratuito con repos privados.

Cualquiera de las tres sirve: la app es 100 % estática.

---

## 2. Instalarla en el **iPhone**

iOS **sí** permite instalar PWAs desde iOS 16.4 en adelante, y desde iOS 26
cualquier sitio agregado a la pantalla de inicio abre como app. No pide licencia
de desarrollador ni App Store.

1. Abre la dirección **en Safari** (no sirve desde Chrome en iPhone).
2. Toca el botón **Compartir** (el cuadro con la flecha hacia arriba).
3. Baja y toca **Añadir a pantalla de inicio**.
4. Ponle el nombre *Mi Entreno* y toca **Añadir**.

Queda un icono en la pantalla de inicio. Al abrirlo no se ve la barra de Safari:
se comporta como una app normal.

**Importante:** ábrela una vez **con internet** después de instalarla. Ahí el
service worker descarga las 110 fotos y todo el código. A partir de ese momento
funciona sin señal.

> Aviso conocido de iOS: si pasas varias semanas sin abrirla, el sistema puede
> borrar el caché para liberar espacio. Si un día abre lenta o sin fotos, ábrela
> con WiFi y se vuelve a llenar sola.

---

## 3. Instalarla en el **Android**

1. Abre la dirección en **Chrome**.
2. Chrome muestra abajo *"Añadir a la pantalla de inicio"* o *"Instalar app"*.
   Si no aparece: menú **⋮** → **Instalar aplicación** / **Añadir a pantalla de inicio**.
3. Confirma.

Android es más generoso con el almacenamiento: una vez descargada, se queda.

---

## 4. Probarla antes de publicar

Desde el computador:

```bash
cd "C:\Users\ander\Documents\Anderson\Personales\entreno"
node servidor.js
```

Imprime dos direcciones:

- `http://localhost:41317` → para el navegador del computador
- `http://192.168.x.x:41317` → **para el celular**, estando en la misma WiFi

Así puedes probarla en los dos teléfonos sin haber publicado nada.

> El service worker solo se registra sobre `http://localhost` o sobre `https://`.
> Desde la IP de la red WiFi la app funciona, pero **sin** modo sin conexión.
> Eso es normal y es una regla del navegador, no un fallo de la app.

---

## 5. Cuando cambies algo

El service worker guarda una copia de todo. Para que los teléfonos vean los
cambios hay que subir el número de versión:

1. Abre `sw.js`
2. Cambia `var VERSION = "mi-entreno-v1";` por `"mi-entreno-v2"`, `v3`, etc.
3. Sube los cambios.

Si además agregaste o quitaste fotos de ejercicios, hay que regenerar la lista
de precarga del `sw.js` (está documentado en `seguimiento/plan-maestro.md`).

Antes de subir, corre siempre:

```bash
npm test
```

Verifica que ningún día apunte a un ejercicio inexistente, que estén las 110
fotos, que el service worker las precargue todas y que las pantallas rendericen.

---

## 6. Alternativas descartadas y por qué

| Opción | Por qué no |
|--------|-----------|
| App nativa (Swift / Kotlin) | Licencia de Apple 99 USD/año + cuenta de Google Play |
| React Native / Expo compilado | Mismo problema de licencias para instalar en iPhone |
| Google Docs / PDF compartido | No hay temporizador, ni voz, ni control de series, ni tamaño de letra ajustable |
| Backend gratuito (Render, Railway) | El servidor se duerme; 30–50 s de espera parado en el gimnasio |
| Expo Go | Necesita la app de Expo instalada y sesión iniciada; no funciona sin señal |
| Notion / apps de notas | Igual que el PDF: no resuelve el problema de accesibilidad |

---

## Fuentes consultadas

- [Do Progressive Web Apps Work on iOS? (2026)](https://www.mobiloud.com/blog/progressive-web-apps-ios)
- [PWA iOS Limitations and Safari Support (2026)](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [free-exercise-db — dataset de ejercicios de dominio público](https://github.com/yuhonas/free-exercise-db)
- [wger — alternativa de base de datos de ejercicios (CC-BY-SA)](https://github.com/wger-project/wger)
- [WCAG — requisitos de contraste, guía en lenguaje claro](https://medium.com/design-bootcamp/a-plain-language-guide-to-wcag-contrast-requirements-6fe18569d5df)
- [Guía de accesibilidad móvil WCAG 2.2 (2026)](https://corpowid.ai/blog/mobile-application-accessibility-practical-humancentered-guide-android-ios)
