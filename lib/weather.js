const https = require('https');

const SOURCE_URL = 'https://meteotandil.com.ar/realtime.txt';

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

module.exports = { SOURCE_URL, fetchRealtime, parseRealtime };
