# Cómo ponerla en el celular, gratis y sin licencias

## YA ESTÁ PUBLICADA

# https://andersonhg19.github.io/mi-entreno/

Repositorio: <https://github.com/andersonhg19/mi-entreno>
Desplegada el 2026-08-04. Verificada en vivo: carga por HTTPS, las fotos se ven,
y con la red apagada sigue funcionando (124 archivos en caché).

> **El repositorio es público.** GitHub Pages gratis lo exige. Por eso los
> apellidos, la edad y las medidas corporales de los dos **no** están ahí: viven
> en `recursos/datos-personales.md`, y toda la carpeta `recursos/` está en
> `.gitignore`. Se publican solo los nombres de pila y la rutina.

---

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

## 1. Verla en el **computador** (lo más rápido)

Abre cualquier navegador (Chrome, Edge, Firefox) y escribe:

```
https://andersonhg19.github.io/mi-entreno/
```

Eso es todo. No hay que instalar nada ni levantar ningún servidor.

> Nota: el Chrome de este equipo no alcanza `localhost` (Docker Desktop tiene
> puertos capturados), pero esta dirección es de internet, no local, así que
> abre sin problema.

Si quieres verla como se verá en el celular: pulsa **F12** y luego el icono de
celular arriba a la izquierda del panel que se abre (o `Ctrl+Shift+M`).

---

## 2. Verla e **instalarla en el iPhone**

iOS permite instalar PWAs desde la versión 16.4, y desde iOS 26 cualquier sitio
añadido a la pantalla de inicio abre como app. No hace falta App Store ni
licencia de desarrollador.

1. Abre **Safari** (tiene que ser Safari; desde Chrome en iPhone no se instala).
2. Escribe: `andersonhg19.github.io/mi-entreno`
3. Ya la estás viendo. Para dejarla como app:
4. Toca el botón **Compartir** — el cuadrado con la flecha hacia arriba,
   abajo en el centro de la pantalla.
5. Desliza hacia abajo en el menú y toca **Añadir a pantalla de inicio**.
6. El nombre ya sale como *Mi Entreno*. Toca **Añadir** arriba a la derecha.

Queda un icono azul con una mancuerna en la pantalla de inicio. Al abrirlo no se
ve la barra de Safari: se comporta como una app normal.

**Paso importante:** con la app ya instalada, ábrela **una vez con WiFi** y
espera medio minuto navegando por ella. Ahí descarga las 110 fotos y todo el
código. A partir de ese momento funciona en el gimnasio aunque no haya señal.

> Aviso conocido de iOS: si pasas varias semanas sin abrirla, el sistema puede
> borrar el caché para liberar espacio. Si un día abre lenta o sin fotos, ábrela
> con WiFi y se vuelve a llenar sola.

---

## 3. Verla e **instalarla en el Android**

1. Abre **Chrome**.
2. Escribe: `andersonhg19.github.io/mi-entreno`
3. Chrome suele mostrar abajo un aviso de *«Añadir a la pantalla de inicio»* o
   *«Instalar app»*. Tócalo.
4. Si no aparece: menú **⋮** (arriba a la derecha) → **Instalar aplicación**
   o **Añadir a pantalla de inicio**.

Igual que en el iPhone: ábrela una vez con WiFi para que se descargue todo.
Android es más generoso con el almacenamiento, así que una vez bajada se queda.

---

## 4. Pasarle la dirección al celular sin escribirla

Tres formas, la que te resulte más cómoda:

- **Mándatela por WhatsApp** a ti mismo y tócala desde el celular.
- **En el computador**, abre la página en Chrome y usa *Compartir → Enviar a
  tus dispositivos* si tienes la sesión de Google iniciada en los dos.
- **Escríbela a mano**: es corta y no lleva guiones raros —
  `andersonhg19.github.io/mi-entreno`

---

## 5. Probar cambios antes de publicarlos

Cuando toques algo del código y quieras verlo antes de subirlo:

```bash
cd "C:\Users\ander\Documents\Anderson\Personales\entreno"
node servidor.js
```

Imprime dos direcciones:

- `http://localhost:41317` → para el navegador del computador
- `http://192.168.40.32:41317` → **para el celular**, estando en la misma WiFi

> El service worker solo se registra sobre `http://localhost` o sobre `https://`.
> Desde la IP de la WiFi la app funciona, pero **sin** modo sin conexión. Es una
> regla del navegador, no un fallo de la app.

---

## 6. Si algún día quieres que nadie más pueda verla

GitHub Pages con repositorio privado exige plan de pago. Alternativas gratuitas
que sí aceptan repositorios privados:

- **Cloudflare Pages** — conectas el repo, despliegue gratis, HTTPS.
- **Netlify** — igual, plan gratuito con repos privados.

Cualquiera sirve: la app es 100 % estática. Si te pasas a una de esas, puedes
devolver los datos personales al código (está explicado en
`recursos/datos-personales.md`).

---

## 7. Cuando cambies algo

El service worker guarda una copia de todo. Para que los teléfonos vean los
cambios hay que subir el número de versión:

1. Abre `sw.js`
2. Cambia `var VERSION = "mi-entreno-v1";` por `"mi-entreno-v2"`, `v3`, etc.
3. Sube los cambios.

Si además agregaste o quitaste fotos de ejercicios, hay que regenerar la lista
de precarga del `sw.js` (está documentado en `seguimiento/plan-maestro.md`).

Antes de subir, corre siempre:

```bash
npm run qa
```

Si solo tocaste datos, `npm test` basta. **Si tocaste CSS o maquetación, no**:
las pruebas rápidas no ven fallos visuales. Ya pasó una vez y el temporizador
acabó tapando toda la app.

Para publicar el cambio:

```bash
git add -A
git commit -m "lo que cambiaste"
git push
```

GitHub Pages se reconstruye solo en un par de minutos.

---

## 8. Alternativas descartadas y por qué

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
