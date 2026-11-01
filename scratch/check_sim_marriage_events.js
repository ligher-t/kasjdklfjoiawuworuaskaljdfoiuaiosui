const fs = require('fs');
const sim = JSON.parse(fs.readFileSync('d:/Downloads/terra-dev-simulation-terra-source-d114d9d3.json', 'utf8'));

// Search all events in simulation that give a spouse or relate to marriage
const marriageEvents = [
  'rel_marriage_proposal',
  'rel_confession',
  'rel_date',
  'choice_marriage',
  'family_marriage',
  'marriage_ceremony',
  'spouse_proposal'
];

for (const cov of sim.eventCoverage) {
  if (/rel_|marriage|spouse|romance|marry/.test(cov.eventId)) {
    console.log(`${cov.eventId}: fired=${cov.fired}, eligible=${cov.eligibleSlots}, candidates=${cov.candidateSlots}`);
  }
}
