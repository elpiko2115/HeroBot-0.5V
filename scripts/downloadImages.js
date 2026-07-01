const fs = require('fs');
const path = require('path');

const bossesPath = path.join(__dirname, '..', 'data', 'bosses.json');
const assetsDir = path.join(__dirname, '..', 'assets', 'bosses');

function safeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadImage(url, filePath) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} dla ${url}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function main() {
  if (!fs.existsSync(bossesPath)) {
    throw new Error('Nie znaleziono bosses.json');
  }

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const bosses = JSON.parse(fs.readFileSync(bossesPath, 'utf8'));

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const boss of bosses) {
    if (!boss.image) {
      console.log(`⚠️ Brak image: ${boss.name}`);
      continue;
    }

    const fileName = `${safeFileName(boss.name)}.png`;
    const filePath = path.join(assetsDir, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`⏭️ Istnieje: ${fileName}`);
      skipped++;
      continue;
    }

    try {
      console.log(`⬇️ Pobieram: ${boss.name}`);
      await downloadImage(boss.image, filePath);
      downloaded++;
    } catch (err) {
      console.log(`❌ Błąd: ${boss.name} — ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(bossesPath, JSON.stringify(bosses, null, 2), 'utf8');

  console.log('');
  console.log('Gotowe.');
  console.log(`Pobrane: ${downloaded}`);
  console.log(`Pominięte: ${skipped}`);
  console.log(`Błędy: ${failed}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});