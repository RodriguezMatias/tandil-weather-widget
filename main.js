const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

const SOURCE_URL = 'https://meteotandil.com.ar/realtime.txt';
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const DEFAULT_CONFIG = { intervalMinutes: 10 };

function loadConfig() {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function fetchRealtime() {
  return new Promise((resolve, reject) => {
    https
      .get(
        SOURCE_URL,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'text/plain,*/*',
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            reject(new Error(`La fuente respondió ${res.statusCode}`));
            return;
          }
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve(body));
        }
      )
      .on('error', reject);
  });
}

// Formato Cumulus MX realtime.txt (separado por espacios). Índices confirmados
// contra la página de gauges: bearing (79°) cae dentro del rango de "E" (compass).
function parseRealtime(raw) {
  const f = raw.trim().replace(/^"|"$/g, '').split(/\s+/);
  return {
    date: f[0],
    time: f[1],
    tempC: parseFloat(f[2]),
    humidity: parseFloat(f[3]),
    dewpointC: parseFloat(f[4]),
    windAvgKmh: parseFloat(f[5]),
    windGustKmh: parseFloat(f[6]),
    windBearing: parseFloat(f[7]),
    windCompass: f[11],
    rainRateMm: parseFloat(f[8]),
    rainTodayMm: parseFloat(f[9]),
    pressureHpa: parseFloat(f[10]),
    pressureTrend: parseFloat(f[18]),
    tempLowC: parseFloat(f[28]),
    tempLowTime: f[29],
  };
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 660,
    resizable: true,
    title: 'Clima Tandil',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
}

ipcMain.handle('weather:get', async () => {
  const raw = await fetchRealtime();
  return { data: parseRealtime(raw), fetchedAt: new Date().toISOString() };
});

ipcMain.handle('settings:get', () => loadConfig());

ipcMain.handle('settings:set', (_event, partial) => {
  const config = { ...loadConfig(), ...partial };
  saveConfig(config);
  return config;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
