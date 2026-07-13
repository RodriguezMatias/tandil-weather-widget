# Clima Tandil

App de escritorio (Electron) que muestra el clima en vivo de la estación meteorológica de Tandil, Buenos Aires, leyendo `realtime.txt` de [meteotandil.com.ar](https://meteotandil.com.ar/gauges.htm).

- Temperatura, humedad, punto de rocío, viento, lluvia, presión y tendencia.
- Auto-actualización a un intervalo configurable (minutos), con jitter aleatorio para no golpear la fuente en un período fijo.
- Contador en vivo de la próxima actualización.

## Usar el release

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

## Cómo funciona

- `main.js` — proceso principal de Electron: pide `realtime.txt` directo desde Node (evita CORS) y expone el resultado vía IPC.
- `preload.js` — puente seguro (`contextBridge`) entre la ventana y el proceso principal.
- `public/index.html` — la interfaz: tarjeta con los datos, control de intervalo y contador de próxima actualización.

El intervalo de actualización y su jitter se guardan en un `config.json` dentro de la carpeta de datos de la app (no se versiona).
