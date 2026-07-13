const fs = require('fs');
const path = require('path');
const { fetchRealtime, parseRealtime } = require('../lib/weather');

async function main() {
  const raw = await fetchRealtime();
  const data = parseRealtime(raw);
  const payload = { data, fetchedAt: new Date().toISOString() };

  const outPath = path.join(__dirname, '..', 'docs', 'data', 'weather.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');

  console.log(`Escrito ${outPath}`);
  console.log(payload);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
