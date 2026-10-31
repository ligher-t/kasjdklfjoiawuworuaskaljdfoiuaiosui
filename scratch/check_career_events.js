const fs = require('fs');
const c = fs.readFileSync('data/base/career-entry.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id:') || l.includes('"id":')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
