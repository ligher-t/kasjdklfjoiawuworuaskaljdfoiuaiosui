'use strict';

const path = require('node:path');
const { loadData } = require('./data-values.cjs');

const root = path.resolve(__dirname, '..');
const { data } = loadData(root);
const patterns = [
  /わけではない/,
  /とは限らない/,
  /意味しない/,
  /未確認/,
  /判断は保留/,
  /ゲーム上/,
  /資料上/
];

const rows = [];
function add(id, field, value) {
  if (typeof value === 'string') {
    if (patterns.some(pattern => pattern.test(value))) rows.push({ id, field, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => add(id, field + '[' + index + ']', item));
    return;
  }
  if (value && typeof value === 'object' && typeof value.t === 'string')
    add(id, field + '.t', value.t);
}

for (const event of data.EV || []) {
  add(event.id, 'body', event.t);
  for (let i = 0; i < (event.c || []).length; i++) {
    const choice = event.c[i];
    add(event.id, 'choice[' + i + '].label', choice.l);
    add(event.id, 'choice[' + i + '].why', choice.why);
    for (let j = 0; j < (choice.o || []).length; j++)
      add(event.id, 'choice[' + i + '].outcome[' + j + ']', choice.o[j]?.[1]);
  }
}

if (!rows.length) {
  console.log('Player prose warning candidates: 0');
  process.exit(0);
}

console.log('Player prose warning candidates: ' + rows.length);
for (const row of rows.slice(0, 120))
  console.log('[WARN] ' + row.id + ' ' + row.field + ': ' + row.text.replace(/\s+/g, ' '));
if (rows.length > 120) console.log('[WARN] ... ' + (rows.length - 120) + ' more');
