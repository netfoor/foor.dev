#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '../src/translations');

function load(locale) {
  const p = path.join(TRANSLATIONS_DIR, locale, 'admin.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function run() {
  const en = load('en');
  const es = load('es');
  const ja = load('ja');

  const enKeys = new Set(getAllKeys(en));
  const esKeys = new Set(getAllKeys(es));
  const jaKeys = new Set(getAllKeys(ja));

  const miss = (base, target) => [...base].filter(k => !target.has(k));
  const extra = (base, target) => [...target].filter(k => !base.has(k));

  console.log('\n== ES Missing ==');
  console.log(miss(enKeys, esKeys).join('\n'));
  console.log('\n== ES Extra ==');
  console.log(extra(enKeys, esKeys).join('\n'));

  console.log('\n== JA Missing ==');
  console.log(miss(enKeys, jaKeys).join('\n'));
  console.log('\n== JA Extra ==');
  console.log(extra(enKeys, jaKeys).join('\n'));
}

run();
