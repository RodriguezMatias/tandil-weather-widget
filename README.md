# Clima Tandil

App de escritorio (Electron) y página web que muestran el clima en vivo de la estación meteorológica de Tandil, Buenos Aires, leyendo `realtime.txt` de [meteotandil.com.ar](https://meteotandil.com.ar/gauges.htm).

- Temperatura, humedad, punto de rocío, viento, lluvia, presión y tendencia.
- Auto-actualización a un intervalo configurable (minutos), con jitter aleatorio para no golpear la fuente en un período fijo.
- Contador en vivo de la próxima actualización.

## Créditos

Todos los datos meteorológicos que muestra este proyecto pertenecen a la estación de **[meteotandil.com.ar](https://meteotandil.com.ar/gauges.htm)** (Tandil, Buenos Aires) y son publicados por sus operadores. Este repositorio solo los lee y los presenta con otro diseño; no genera ni verifica esos datos. Contacto de la estación: `meteotandil@yahoo.com.ar`.

Si sos el operador del sitio y preferís que esto no exista, escribime y lo doy de baja sin problema.

## Versión web (GitHub Pages)

👉 **[rodriguezmatias.github.io/tandil-weather-widget](https://rodriguezmatias.github.io/tandil-weather-widget/)**

GitHub Pages solo sirve archivos estáticos, y el navegador no puede pedirle `realtime.txt` directo a meteotandil.com.ar (el sitio no manda cabeceras CORS, así que el pedido se cae). En vez de meter un proxy de terceros, la solución es no hacer ese pedido desde el navegador de cada visitante:

1. Un **GitHub Action programado** (`.github/workflows/update-weather.yml`) corre `scripts/build-weather-json.js` cada ~15 minutos, trae `realtime.txt` una sola vez y escribe el resultado en `docs/data/weather.json`.
2. Si el archivo cambió, el Action lo commitea y pushea al repo.
3. `docs/index.html` es una página estática que solo lee `data/weather.json` (mismo origen, sin CORS) y lo muestra en la misma tarjeta que la app de escritorio. Cada visitante revisa ese JSON cada tantos minutos (configurable, con jitter) — nadie más que el Action le pega al sitio original.

Para forzar una actualización manual sin esperar al cron: pestaña **Actions** → *Actualizar clima de Tandil* → **Run workflow**.

## Usar el release de escritorio

Descargá el `.exe` de la [última release](../../releases/latest), descomprimí y ejecutá `Clima Tandil.exe`. No necesita instalación ni Node.

## Generarlo vos mismo

Requisitos: [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/RodriguezMatias/tandil-weather-widget.git
cd tandil-weather-widget
npm install
```

**Modo desarrollo** (abre la ventana sin empaquetar):

```bash
npm start
```

**Generar el `.exe` portable** (queda en `dist/Clima Tandil-win32-x64/`):

```bash
npm run dist
```

**Regenerar `docs/data/weather.json` a mano** (lo mismo que corre el Action):

```bash
node scripts/build-weather-json.js
```

## Cómo funciona

- `lib/weather.js` — fetch y parseo de `realtime.txt` (formato Cumulus MX), compartido entre la app y el script del Action.
- `main.js` — proceso principal de Electron: usa `lib/weather.js` directo desde Node (evita CORS) y expone el resultado vía IPC.
- `preload.js` — puente seguro (`contextBridge`) entre la ventana y el proceso principal.
- `public/index.html` — interfaz de la app de escritorio: tarjeta con los datos, control de intervalo y contador de próxima actualización.
- `scripts/build-weather-json.js` — genera `docs/data/weather.json`; lo corre el Action de GitHub.
- `docs/index.html` — interfaz web estática, publicada por GitHub Pages, que lee ese JSON.

El intervalo de actualización de la app de escritorio se guarda en un `config.json` dentro de la carpeta de datos de la app (no se versiona). En la versión web se guarda en `localStorage` del navegador.
