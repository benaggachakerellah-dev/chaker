import fs from 'node:fs';

const arPath = 'src/locales/ar.json';
const frPath = 'src/locales/fr.json';
const enPath = 'src/locales/en.json';

function updateJson(path, updates) {
  const content = JSON.parse(fs.readFileSync(path, 'utf8'));
  Object.assign(content, updates);
  fs.writeFileSync(path, JSON.stringify(content, null, 2), 'utf8');
  console.log('Updated: ' + path);
}

updateJson(arPath, {
  brand: { name: 'Desert Gold' },
  home: {
    hero: { subtitle: 'تمور فاخرة، جودة موثقة، ومصدر شفاف.' }
  },
  nav: {
    catalog: 'الكتالوج',
    farms: 'المزارع'
  }
});

updateJson(frPath, {
  brand: { name: 'Desert Gold' },
  home: {
    hero: { subtitle: 'Dattes premium, qualité vérifiée et provenance transparente.' }
  },
  nav: {
    catalog: 'Catalogue',
    farms: 'Fermes'
  }
});

updateJson(enPath, {
  brand: { name: 'Desert Gold' },
  home: {
    hero: { subtitle: 'Premium dates, verified quality, transparent provenance.' }
  },
  nav: {
    catalog: 'Catalog',
    farms: 'Farms'
  }
});
