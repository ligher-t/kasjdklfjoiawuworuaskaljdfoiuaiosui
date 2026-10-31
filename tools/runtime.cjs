'use strict';
const fs = require('node:fs');
const path = require('node:path');

// index.html is the single source of truth for runtime order.
function scriptFiles(root) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map(match => {
    const file = match[1];
    if (!/^(?:[\w-]+\/)*[\w-]+\.js$/.test(file)) throw Error('Invalid local script: ' + file);
    return file;
  });
}
function dataFiles(root) {
  return scriptFiles(root).filter(file => file === 'rules.js' || file === 'events.js' || file.startsWith('data/'));
}
function readData(root) {
  return dataFiles(root).map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
}
function readEngine(root) {
  return scriptFiles(root).filter(file => file !== 'rules.js' && file !== 'events.js' && !file.startsWith('data/'))
    .map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('');
}
function publicFiles(root) {
  return ['index.html', 'css/style.css', ...scriptFiles(root), 'debug.js'];
}
module.exports = {scriptFiles, dataFiles, readData, readEngine, publicFiles};
