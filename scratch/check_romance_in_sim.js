const fs = require('fs');

const sim = JSON.parse(fs.readFileSync('d:/Downloads/terra-dev-simulation-terra-source-d114d9d3.json', 'utf8'));

// Check event coverage for romance / marriage events
const events = sim.eventCoverage || [];
const romanceEvents = events.filter(e => /romance|marry|marriage|spouse|恋|結婚|交際|プロポーズ/.test(e.id) || (e.tags || []).some(t => /恋愛|結婚/.test(t)));
console.log('=== ROMANCE / MARRIAGE EVENT COVERAGE (Top 20) ===');
console.log(`Found ${romanceEvents.length} related events.`);
romanceEvents.slice(0, 20).forEach(e => {
  console.log(`  ${e.id}: count=${e.count}`);
});

// Look at choice branches for marriage
const branches = sim.choiceBranches || [];
const romanceBranches = branches.filter(b => /romance|marry|marriage|spouse|恋|結婚/.test(b.eventId));
console.log(`\nFound ${romanceBranches.length} related choice branches.`);
romanceBranches.slice(0, 10).forEach(b => {
  console.log(`  ${b.eventId} [choice ${b.choiceIndex}]: count=${b.count}`);
});
